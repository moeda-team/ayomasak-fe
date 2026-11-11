import type { Bahan } from '@/features/master-bahan/bahan-types'
import type { RecipeEditorValues } from './recipe-editor-types'

export type ReadinessTone = 'success' | 'danger' | 'warning'

export type ReadinessCheck = {
  key: 'required' | 'ingredients' | 'steps' | 'nutrition' | 'media'
  tone: ReadinessTone
  title: string
  description: string
  /** Publishing is not possible until this is resolved. Recommendations (such as a cover photo) do not block. */
  blocks: boolean
}

export type NutritionState = 'missing' | 'invalid' | 'estimated' | 'complete'

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

const isBlank = (text: string) => text.trim() === ''

const isInvalidNumber = (text: string) => !isBlank(text) && (Number.isNaN(Number(text)) || Number(text) < 0)

export const nutritionStateOf = (values: RecipeEditorValues['nutrition'], isEstimated: boolean): NutritionState => {
  const all = Object.values(values)
  if (all.some(isInvalidNumber)) return 'invalid'
  if (all.some(isBlank)) return 'missing'
  return isEstimated ? 'estimated' : 'complete'
}

const requiredFieldsComplete = (values: RecipeEditorValues) =>
  !isBlank(values.name) && values.category !== '' && values.difficulty !== '' && Number(values.servings) >= 1

/** What is still missing before this recipe can be published, in the order the editor tabs appear. */
export const checkReadiness = (
  values: RecipeEditorValues,
  { isNutritionEstimated, bahanById }: { isNutritionEstimated: boolean; bahanById: Map<string, Bahan> },
): ReadinessCheck[] => {
  const checks: ReadinessCheck[] = []

  checks.push(
    requiredFieldsComplete(values)
      ? { key: 'required', tone: 'success', blocks: false, title: 'Required fields complete', description: 'Name, category, servings and difficulty are set.' }
      : { key: 'required', tone: 'danger', blocks: true, title: 'Required fields missing', description: 'Add name, category, servings and difficulty.' },
  )

  const { ingredients } = values
  const needQuantity = ingredients.filter((row) => isBlank(row.quantity) || Number(row.quantity) <= 0).length
  const inactive = ingredients.filter((row) => bahanById.get(row.bahanId)?.status === 'inactive').length
  const unpicked = ingredients.filter((row) => row.bahanId === '').length
  if (ingredients.length === 0) {
    checks.push({ key: 'ingredients', tone: 'danger', blocks: true, title: 'Ingredients missing', description: 'Add at least 1 ingredient.' })
  } else if (unpicked > 0) {
    checks.push({
      key: 'ingredients',
      tone: 'danger', blocks: true,
      title: `${plural(unpicked, 'ingredient')} not chosen`,
      description: 'Pick an ingredient for every row.',
    })
  } else if (needQuantity > 0) {
    checks.push({
      key: 'ingredients',
      tone: 'danger', blocks: true,
      title: `${plural(needQuantity, 'ingredient')} ${needQuantity === 1 ? 'needs' : 'need'} a quantity`,
      description: 'Quantity is required to publish.',
    })
  } else if (inactive > 0) {
    checks.push({
      key: 'ingredients',
      tone: 'warning',
      blocks: true,
      title: `${plural(inactive, 'ingredient')} ${inactive === 1 ? 'is' : 'are'} inactive`,
      description: 'Replace it before publishing.',
    })
  } else {
    checks.push({ key: 'ingredients', tone: 'success', blocks: false, title: 'Ingredients added', description: `${plural(ingredients.length, 'ingredient')}.` })
  }

  const { steps } = values
  const emptySteps = steps.filter((step) => isBlank(step.instruction)).length
  if (steps.length === 0) {
    checks.push({ key: 'steps', tone: 'danger', blocks: true, title: 'Steps missing', description: 'Add at least 1 step.' })
  } else if (emptySteps > 0) {
    checks.push({
      key: 'steps',
      tone: 'danger', blocks: true,
      title: `${plural(emptySteps, 'step')} ${emptySteps === 1 ? 'has' : 'have'} no instruction`,
      description: 'Instruction is required to publish.',
    })
  } else {
    checks.push({ key: 'steps', tone: 'success', blocks: false, title: 'Steps added', description: `${plural(steps.length, 'step')}.` })
  }

  const nutrition = nutritionStateOf(values.nutrition, isNutritionEstimated)
  const invalidCount = Object.values(values.nutrition).filter(isInvalidNumber).length
  if (nutrition === 'missing') {
    checks.push({ key: 'nutrition', tone: 'danger', blocks: true, title: 'Nutrition missing', description: 'Add nutrition per serving.' })
  } else if (nutrition === 'invalid') {
    checks.push({
      key: 'nutrition',
      tone: 'danger', blocks: true,
      title: `${invalidCount} nutrition ${invalidCount === 1 ? 'value is' : 'values are'} invalid`,
      description: 'Fix them to publish.',
    })
  } else if (nutrition === 'estimated') {
    checks.push({ key: 'nutrition', tone: 'warning', blocks: false, title: 'Nutrition is estimated', description: 'Review values before publishing.' })
  } else {
    checks.push({ key: 'nutrition', tone: 'success', blocks: false, title: 'Nutrition complete', description: '6 values per serving.' })
  }

  const uploading = values.photos.filter((photo) => photo.status === 'uploading').length
  const failed = values.photos.filter((photo) => photo.status === 'failed').length
  const uploaded = values.photos.filter((photo) => photo.status === 'uploaded').length
  if (failed > 0) {
    checks.push({ key: 'media', tone: 'danger', blocks: true, title: `${failed} upload failed`, description: 'Retry or remove the failed file.' })
  } else if (uploading > 0) {
    checks.push({ key: 'media', tone: 'warning', blocks: true, title: 'Upload in progress', description: `Wait for ${plural(uploading, 'photo')} to finish.` })
  } else if (uploaded > 0) {
    checks.push({ key: 'media', tone: 'success', blocks: false, title: 'Cover photo set', description: `${plural(uploaded, 'photo')} uploaded.` })
  } else {
    checks.push({ key: 'media', tone: 'warning', blocks: false, title: 'Media not added', description: 'A cover photo is recommended.' })
  }

  return checks
}
