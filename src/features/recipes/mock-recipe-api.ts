import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import {
  RECIPE_CATEGORIES,
  type EligibilityState,
  type Recipe,
  type RecipeCategory,
  type RecipeCategoryCount,
  type RecipeDifficulty,
  type RecipeListParams,
  type RecipeListResult,
  type RecipeStatus,
} from './recipe-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Archiving {@link FAILING_ARCHIVE_NAME} fails on purpose, as in the design, so the error toast can be seen
 * without a broken backend. Duplicating a recipe whose name contains "fail" fails too.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_ARCHIVE_NAME = 'Nasi Goreng Kampung'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

type RecipeSeed = [
  name: string,
  aliases: string[],
  category: RecipeCategory,
  updatedAt: string,
  difficulty: RecipeDifficulty,
  status: RecipeStatus,
  eligibility: [viewable: EligibilityState, matchable: EligibilityState, nutrition: EligibilityState],
]

const SEED: RecipeSeed[] = [
  ['Nasi Goreng Kampung', ['nasgor kampung', 'fried rice'], 'Nasi', '2026-11-02', 'easy', 'published', ['ok', 'ok', 'ok']],
  ['Rendang Daging Sapi', ['rendang padang'], 'Lauk', '2026-11-05', 'hard', 'published', ['ok', 'ok', 'warn']],
  ['Soto Ayam Lamongan', ['soto ayam', 'soto lamongan'], 'Sup', '2026-11-08', 'medium', 'draft-revision', ['ok', 'ok', 'off']],
  ['Tumis Kangkung Terasi', ['kangkung belacan'], 'Sayur', '2026-11-09', 'easy', 'draft', ['off', 'off', 'off']],
  ['Gado-Gado Jakarta', ['lotek', 'vegetable salad'], 'Sayur', '2026-11-03', 'medium', 'published', ['ok', 'ok', 'ok']],
  ['Pepes Ikan Mas', ['pepes ikan', 'steamed fish'], 'Ikan', '2026-10-28', 'medium', 'archived', ['off', 'off', 'off']],
  ['Sambal Terasi', ['shrimp paste sambal'], 'Saus', '2026-11-01', 'easy', 'published', ['ok', 'ok', 'ok']],
  ['Ayam Bakar Taliwang', ['taliwang chicken'], 'Lauk', '2026-10-30', 'medium', 'published', ['ok', 'warn', 'ok']],
  ['Sayur Asem', ['asem vegetable soup'], 'Sup', '2026-10-27', 'easy', 'published', ['ok', 'ok', 'ok']],
  ['Ikan Bakar Jimbaran', ['jimbaran grilled fish'], 'Ikan', '2026-11-07', 'medium', 'draft', ['off', 'warn', 'off']],
  ['Nasi Kuning', ['yellow rice', 'tumpeng rice'], 'Nasi', '2026-10-25', 'medium', 'published', ['ok', 'ok', 'warn']],
  ['Bubur Ayam', ['chicken porridge'], 'Nasi', '2026-10-20', 'easy', 'archived', ['off', 'off', 'off']],
  ['Sup Buntut', ['oxtail soup'], 'Sup', '2026-11-06', 'hard', 'draft-revision', ['ok', 'ok', 'ok']],
  ['Cumi Saus Padang', ['squid padang sauce'], 'Ikan', '2026-10-22', 'hard', 'published', ['ok', 'ok', 'ok']],
]

const recipeDb: Recipe[] = SEED.map(([name, aliases, category, updatedAt, difficulty, status, [viewable, matchable, nutrition]], index) => ({
  id: `recipe-${index + 1}`,
  name,
  aliases,
  category,
  updatedAt: `${updatedAt}T09:00:00+07:00`,
  difficulty,
  status,
  eligibility: { viewable, matchable, nutrition },
}))

const normalize = (text: string) => text.trim().toLowerCase()

const visibleRecipes = () => (isMockMode('empty') ? [] : recipeDb)

const matchesRecipe = (recipe: Recipe, params: RecipeListParams) => {
  const needle = normalize(params.search)
  return (
    (needle === '' || [recipe.name, ...recipe.aliases].some((text) => normalize(text).includes(needle))) &&
    (params.categories.length === 0 || params.categories.includes(recipe.category)) &&
    (params.status === 'all' || recipe.status === params.status) &&
    (params.difficulty === 'all' || recipe.difficulty === params.difficulty) &&
    (params.eligibility === 'all' ||
      (params.eligibility === 'viewable' && recipe.eligibility.viewable === 'ok') ||
      (params.eligibility === 'not-viewable' && recipe.eligibility.viewable !== 'ok') ||
      (params.eligibility === 'missing-nutrition' && recipe.eligibility.nutrition !== 'ok'))
  )
}

export const fetchRecipeList = async (params: RecipeListParams): Promise<RecipeListResult> => {
  failLoadIfMocked('fetchRecipeList')
  await wait()
  const filtered = visibleRecipes().filter((recipe) => matchesRecipe(recipe, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map((recipe) => ({ ...recipe })), total: filtered.length }
}

export const fetchRecipeCategoryCounts = async (): Promise<RecipeCategoryCount[]> => {
  await wait()
  const recipes = visibleRecipes()
  return RECIPE_CATEGORIES.map((category) => ({ category, count: recipes.filter((recipe) => recipe.category === category).length }))
}

const requireRecipe = (id: string) => {
  const recipe = recipeDb.find((candidate) => candidate.id === id)
  if (!recipe) throw new Error('This recipe no longer exists.')
  return recipe
}

const unavailable = (): Recipe['eligibility'] => ({ viewable: 'off', matchable: 'off', nutrition: 'off' })

/** A copy starts as a draft at the top of the list; nothing about it is visible to users yet. */
export const duplicateRecipe = async (id: string): Promise<Recipe> => {
  await wait()
  const source = requireRecipe(id)
  if (normalize(source.name).includes('fail')) throw new Error('The server rejected this request.')
  const copy: Recipe = {
    ...source,
    id: `recipe-${crypto.randomUUID()}`,
    name: `${source.name} (copy)`,
    aliases: [...source.aliases],
    updatedAt: new Date().toISOString(),
    status: 'draft',
    eligibility: { ...unavailable(), matchable: source.eligibility.matchable === 'ok' ? 'warn' : 'off' },
  }
  recipeDb.unshift(copy)
  return { ...copy }
}

export const archiveRecipe = async (id: string): Promise<Recipe> => {
  await wait()
  const recipe = requireRecipe(id)
  if (recipe.name === FAILING_ARCHIVE_NAME) throw new Error('The server rejected this request.')
  Object.assign(recipe, { status: 'archived', eligibility: unavailable(), updatedAt: new Date().toISOString() })
  return { ...recipe }
}

export const restoreRecipe = async (id: string): Promise<Recipe> => {
  await wait()
  const recipe = requireRecipe(id)
  Object.assign(recipe, { status: 'draft', updatedAt: new Date().toISOString() })
  return { ...recipe }
}
