import { fetchBahanList } from '@/features/master-bahan/mock-bahan-api'
import type { Bahan } from '@/features/master-bahan/bahan-types'
import { fetchEquipmentList } from '@/features/master-equipment/mock-equipment-api'
import type { Equipment } from '@/features/master-equipment/equipment-types'
import { failLoadIfMocked } from '@/lib/mock-load-failure'
import { findRecipeSummary, publishRecipeSummary, saveRecipeSummary, setRecipeStatus } from './mock-recipe-api'
import {
  EMPTY_EDITOR_VALUES,
  type EquipmentRow,
  type IngredientRow,
  type RecipeEditorRecord,
  type RecipeEditorValues,
  type StepRow,
} from './recipe-editor-types'
import type { Recipe } from './recipe-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Saving a recipe whose name contains {@link FAILING_NAME_MARKER} fails on purpose, so the error toast can be
 * seen without a broken backend. Publishing a recipe whose name contains {@link REJECTED_NAME_MARKER} fails too. A recipe id that does not exist loads as "not found".
 */
const MOCK_LATENCY_MS = 600
export const FAILING_NAME_MARKER = 'fail'
export const REJECTED_NAME_MARKER = 'reject'
export const STUCK_NAME_MARKER = 'stuck'

const wait = (ms = MOCK_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

export class RecipeNotFoundError extends Error {
  constructor() {
    super('This recipe may have been archived or removed.')
    this.name = 'RecipeNotFoundError'
  }
}

/** Editor content kept per recipe once it has been saved; recipes never opened start from a generated sample. */
const savedRecords = new Map<string, RecipeEditorRecord>()

export const slugOf = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

type IngredientSample = [bahanName: string, quantity: string, unit: string, necessity: IngredientRow['necessity'], note: string]

const INGREDIENT_SAMPLE: IngredientSample[] = [
  ['Nasi Putih', '500', 'gram', 'required', 'Day-old rice works best'],
  ['Bawang Merah', '5', 'siung', 'required', 'Sliced'],
  ['Bawang Putih', '3', 'siung', 'required', 'Minced'],
  ['Kecap Manis', '3', 'sdm', 'required', ''],
  ['Telur Ayam', '2', 'butir', 'optional', 'Fried'],
  ['Terasi Udang', '1', 'sdt', 'optional', ''],
]

const STEP_SAMPLE: [instruction: string, minutes: string][] = [
  ['Haluskan bawang merah, bawang putih, dan cabai.', '5'],
  ['Tumis bumbu halus hingga harum.', '3'],
  ['Masukkan nasi dan kecap manis, aduk hingga rata.', '5'],
]

const EQUIPMENT_SAMPLE = ['Wajan', 'Spatula', 'Ulekan']

const hasContent = (recipe: Recipe) => recipe.status !== 'draft' || recipe.eligibility.matchable !== 'off'

const findByName = <TRecord extends { name: string }>(records: TRecord[], name: string) =>
  records.find((record) => record.name.toLowerCase() === name.toLowerCase())

const buildRecord = async (recipe: Recipe): Promise<RecipeEditorRecord> => {
  const base: RecipeEditorValues = {
    ...EMPTY_EDITOR_VALUES,
    name: recipe.name,
    slug: slugOf(recipe.name),
    category: recipe.category,
    difficulty: recipe.difficulty,
    servings: '4',
    cookTime: '30',
    description: `${recipe.name} made at home with simple, easy-to-find ingredients.`,
  }
  const record = (values: RecipeEditorValues, nutritionEstimated = false): RecipeEditorRecord => ({
    id: recipe.id,
    status: recipe.status,
    version: recipe.status === 'draft' ? 0 : 1,
    savedAt: recipe.updatedAt,
    nutritionEstimated,
    values,
  })
  if (!hasContent(recipe)) return record(base)

  const [bahanResults, equipmentResults] = await Promise.all([
    Promise.all(
      INGREDIENT_SAMPLE.map(([name]) =>
        fetchBahanList({ search: name, categories: [], form: 'all', status: 'all', pantry: 'all', page: 1, pageSize: 5 }),
      ),
    ),
    Promise.all(
      EQUIPMENT_SAMPLE.map((name) =>
        fetchEquipmentList({ search: name, categories: [], status: 'all', alternative: 'any', page: 1, pageSize: 5 }),
      ),
    ),
  ])

  const ingredients = INGREDIENT_SAMPLE.flatMap(([name, quantity, unit, necessity, note], index): IngredientRow[] => {
    const bahan: Bahan | undefined = findByName(bahanResults[index]?.items ?? [], name)
    return bahan ? [{ id: `ing-${index}`, bahanId: bahan.id, quantity, unit, necessity, note }] : []
  })
  const equipment = EQUIPMENT_SAMPLE.flatMap((name, index): EquipmentRow[] => {
    const found: Equipment | undefined = findByName(equipmentResults[index]?.items ?? [], name)
    return found ? [{ id: `eq-${index}`, equipmentId: found.id, quantity: '1', note: '' }] : []
  })
  const steps: StepRow[] = STEP_SAMPLE.map(([instruction, timerMinutes], index) => ({ id: `step-${index}`, instruction, timerMinutes }))
  const hasNutrition = recipe.eligibility.nutrition !== 'off'

  return record(
    {
      ...base,
      ingredients,
      equipment,
      steps,
      nutrition: hasNutrition
        ? { calories: '520', protein: '14', carbs: '68', fat: '20', fiber: '3', sodium: '840' }
        : EMPTY_EDITOR_VALUES.nutrition,
      photos: [
        { id: 'photo-1', name: 'nasi-goreng-cover.jpg', status: 'uploaded', progress: 100 },
        { id: 'photo-2', name: 'nasi-goreng-plating.jpg', status: 'uploaded', progress: 100 },
      ],
      videos: [{ id: 'video-1', name: 'tumis-bumbu.mp4', source: 'file', status: 'uploaded', progress: 100, duration: '0:42' }],
    },
    recipe.eligibility.nutrition === 'warn',
  )
}

export const fetchRecipeRecord = async (id: string): Promise<RecipeEditorRecord> => {
  failLoadIfMocked('fetchRecipeRecord')
  const saved = savedRecords.get(id)
  const [summary] = await Promise.all([findRecipeSummary(id), wait()])
  if (!summary) throw new RecipeNotFoundError()
  // The status can change from the list (archive, restore) while the editor content stays as saved.
  if (saved) return { ...structuredClone(saved), status: summary.status }
  return buildRecord(summary)
}

export type SaveDraftRequest = {
  /** Absent while the recipe has never been saved. */
  id?: string
  values: RecipeEditorValues
  nutritionEstimated: boolean
}

export const saveRecipeDraft = async ({ id, values, nutritionEstimated }: SaveDraftRequest): Promise<RecipeEditorRecord> => {
  await wait()
  if (values.name.toLowerCase().includes(FAILING_NAME_MARKER)) throw new Error('The server rejected this request.')
  const previous = id ? await currentVersionOf(id) : undefined
  const summary = saveRecipeSummary(id, values)
  const record: RecipeEditorRecord = {
    id: summary.id,
    status: summary.status,
    version: previous?.version ?? 0,
    savedAt: summary.updatedAt,
    nutritionEstimated,
    values: structuredClone(values),
  }
  savedRecords.set(record.id, structuredClone(record))
  return record
}

/** Version of a saved recipe: the stored one, or what a never-opened recipe would start with. */
const currentVersionOf = async (id: string) => {
  const saved = savedRecords.get(id)
  if (saved) return { version: saved.version }
  const summary = findRecipeSummary(id)
  return summary && { version: summary.status === 'draft' ? 0 : 1 }
}

/** Saves the latest values and publishes them in one step, so what users see is exactly what is on screen. */
export const publishRecipe = async ({ id, values, nutritionEstimated }: SaveDraftRequest): Promise<RecipeEditorRecord> => {
  await wait()
  if (values.name.toLowerCase().includes(REJECTED_NAME_MARKER)) throw new Error('The server rejected this request.')
  const previous = id ? await currentVersionOf(id) : undefined
  const summary = publishRecipeSummary(id, values)
  const record: RecipeEditorRecord = {
    id: summary.id,
    status: 'published',
    version: (previous?.version ?? 0) + 1,
    savedAt: summary.updatedAt,
    nutritionEstimated,
    values: structuredClone(values),
  }
  savedRecords.set(record.id, structuredClone(record))
  return record
}

/** The record as it is now, saved content or the sample a never-opened recipe starts from. */
const currentRecord = async (id: string): Promise<RecipeEditorRecord> => {
  const summary = findRecipeSummary(id)
  if (!summary) throw new RecipeNotFoundError()
  const saved = savedRecords.get(id)
  return saved ? { ...structuredClone(saved), status: summary.status } : buildRecord(summary)
}

const storeStatus = async (id: string, status: RecipeEditorRecord['status']) => {
  const record = await currentRecord(id)
  const summary = setRecipeStatus(id, status)
  const next: RecipeEditorRecord = { ...record, status, savedAt: summary.updatedAt }
  savedRecords.set(id, structuredClone(next))
  return next
}

/** A copy of the live version to edit; users keep seeing the live version until the revision is published. */
export const createDraftRevision = async (id: string): Promise<RecipeEditorRecord> => {
  await wait()
  return storeStatus(id, 'draft-revision')
}

/** Hides the recipe from users and returns it to draft. */
export const unpublishRecipe = async (id: string): Promise<RecipeEditorRecord> => {
  await wait()
  const record = await currentRecord(id)
  if (record.values.name.toLowerCase().includes(STUCK_NAME_MARKER)) throw new Error('The server rejected this request.')
  return storeStatus(id, 'draft')
}
