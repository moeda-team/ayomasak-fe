import { ImageIcon, PlayIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DIFFICULTY_LABEL } from './recipe-config'
import type { RecipeEditorValues } from './recipe-editor-types'

type PreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  values: RecipeEditorValues
  /** Names for the ids the ingredient and equipment rows hold. */
  bahanNames: Map<string, string>
  equipmentNames: Map<string, string>
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-1 flex-col items-center rounded-lg bg-surface-brand-subtle px-2 py-2">
    <span className="text-body-sm text-text-brand">{value}</span>
    <span className="text-caption text-text-secondary">{label}</span>
  </div>
)

const PreviewSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-2">
    <h3 className="text-heading-3">{title}</h3>
    {children}
  </section>
)

const hasNutrition = (nutrition: RecipeEditorValues['nutrition']) => Object.values(nutrition).some((text) => text.trim() !== '')

/** The recipe as users would see it in the app, built from what is in the form right now (saved or not). */
export const RecipePreviewDialog = ({ open, onOpenChange, values, bahanNames, equipmentNames }: PreviewDialogProps) => {
  const coverPhoto = values.photos.find((photo) => photo.status === 'uploaded')
  const firstVideo = values.videos.find((video) => video.status === 'uploaded')
  const { nutrition } = values

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(52rem,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[30rem]">
        <DialogHeader className="gap-0.5 border-b border-border-default p-5 pr-14 text-left">
          <DialogTitle className="text-heading-3">Recipe preview</DialogTitle>
          <DialogDescription className="text-caption text-text-secondary">How users will see this recipe in the app</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle p-5" onWheel={(event) => event.stopPropagation()}>
          <article className="overflow-hidden rounded-2xl bg-surface-default">
            <p className="bg-status-warning-subtle px-4 py-2 text-center text-caption text-status-warning">Preview · Draft — not visible to users yet</p>

            {coverPhoto ? (
              <div className="flex h-48 flex-col items-center justify-center gap-1 bg-surface-subtle text-text-secondary">
                <ImageIcon aria-hidden className="size-8" />
                <span className="text-caption">{coverPhoto.name}</span>
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center bg-surface-subtle text-caption text-text-secondary">No photo yet</div>
            )}

            <div className="flex flex-col gap-5 p-5">
              <header className="flex flex-col gap-2">
                <h2 className="text-heading-2">{values.name.trim() || 'Untitled recipe'}</h2>
                {values.description.trim() && <p className="text-body text-text-secondary">{values.description}</p>}
              </header>

              <div className="flex gap-2">
                <Stat value={values.cookTime.trim() ? `${values.cookTime} min` : '—'} label="Total time" />
                <Stat value={values.servings.trim() ? `${values.servings} servings` : '—'} label="Yield" />
                <Stat value={values.difficulty ? DIFFICULTY_LABEL[values.difficulty] : '—'} label="Difficulty" />
              </div>

              {firstVideo && (
                <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white">
                  <PlayIcon aria-hidden weight="fill" className="size-9" />
                  <span className="text-body-sm">
                    Watch: {firstVideo.name}
                    {firstVideo.duration ? ` · ${firstVideo.duration}` : ''}
                  </span>
                </div>
              )}

              {hasNutrition(nutrition) && (
                <div className="flex flex-col gap-1.5 rounded-xl border border-border-default p-4">
                  <h3 className="text-body-strong">Nutrition per serving</h3>
                  <p className="text-body-sm text-text-secondary">
                    {[
                      nutrition.calories.trim() && `${nutrition.calories} kcal`,
                      nutrition.protein.trim() && `Protein ${nutrition.protein} g`,
                      nutrition.carbs.trim() && `Carbs ${nutrition.carbs} g`,
                      nutrition.fat.trim() && `Fat ${nutrition.fat} g`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              )}

              {values.ingredients.length > 0 && (
                <PreviewSection title="Ingredients">
                  <ul className="flex flex-col gap-1 text-body-sm">
                    {values.ingredients.map((row) => (
                      <li key={row.id}>
                        • {[row.quantity, row.unit].filter((part) => part.trim()).join(' ')} {bahanNames.get(row.bahanId) ?? 'Unnamed ingredient'}
                        {row.note.trim() && ` (${row.note})`}
                        {row.necessity === 'optional' && ' — optional'}
                      </li>
                    ))}
                  </ul>
                </PreviewSection>
              )}

              {values.equipment.length > 0 && (
                <PreviewSection title="Equipment">
                  <ul className="flex flex-col gap-1 text-body-sm">
                    {values.equipment.map((row) => (
                      <li key={row.id}>
                        • {row.quantity.trim() && row.quantity !== '1' ? `${row.quantity} × ` : ''}
                        {equipmentNames.get(row.equipmentId) ?? 'Unnamed equipment'}
                      </li>
                    ))}
                  </ul>
                </PreviewSection>
              )}

              {values.steps.length > 0 && (
                <PreviewSection title="Steps">
                  <ol className="flex flex-col gap-2 text-body-sm">
                    {values.steps.map((step, index) => (
                      <li key={step.id} className="flex gap-2">
                        <span className="font-medium">{index + 1}.</span>
                        <span>
                          {step.instruction.trim() || '—'}
                          {step.timerMinutes.trim() && <span className="text-text-secondary"> ({step.timerMinutes} min)</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </PreviewSection>
              )}
            </div>
          </article>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-3 border-t border-border-default px-5 py-3 sm:justify-between">
          <p className="text-caption text-text-secondary">Preview only · changes you save appear here instantly</p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
