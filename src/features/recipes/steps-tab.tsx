import { PlusIcon } from '@phosphor-icons/react'
import { useFormContext } from 'react-hook-form'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EditorRowList } from './editor-row-list'
import { EditorSection } from './editor-section'
import { newRowId } from './recipe-editor-config'
import type { RecipeEditorValues } from './recipe-editor-types'
import { useFormRows } from './use-form-rows'

export const StepsTab = () => {
  const { rows, setRows, addRow, updateRow, removeRow } = useFormRows('steps')
  const { formState } = useFormContext<RecipeEditorValues>()
  const showErrors = formState.submitCount > 0

  const addStep = () => addRow({ id: newRowId(), instruction: '', timerMinutes: '' })

  const addButton = (
    <Button type="button" variant="outline" onClick={addStep}>
      Add step
    </Button>
  )

  return (
    <EditorSection
      title="Steps"
      description={rows.length === 0 ? '0 steps.' : `${rows.length} ${rows.length === 1 ? 'step' : 'steps'}. Drag to reorder.`}
      action={rows.length > 0 ? addButton : undefined}
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No steps yet"
          description="Add at least one step with an instruction. A recipe can’t be published without steps."
          action={
            <Button type="button" onClick={addStep}>
              <PlusIcon aria-hidden />
              Add step
            </Button>
          }
        />
      ) : (
        <>
          <EditorRowList
            items={rows}
            onReorder={setRows}
            label="Steps"
            removeLabel={(_row, index) => `Remove step ${index + 1}`}
            onRemove={(row) => removeRow(row.id)}
            renderLeading={(_row, index) => (
              <span
                aria-hidden
                className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-brand-subtle text-caption text-text-brand"
              >
                {index + 1}
              </span>
            )}
            renderRow={(row, index) => {
              const isEmpty = showErrors && row.instruction.trim() === ''
              return (
                <>
                  <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                    <Input
                      aria-label={`Instruction for step ${index + 1}`}
                      placeholder="Instruction"
                      value={row.instruction}
                      onChange={(event) => updateRow(row.id, { instruction: event.target.value })}
                      aria-invalid={isEmpty}
                      aria-describedby={isEmpty ? `step-${row.id}-error` : undefined}
                      className="text-body-sm md:text-body-sm"
                    />
                    {isEmpty && (
                      <p id={`step-${row.id}-error`} role="alert" className="text-caption text-text-danger">
                        Instruction is required to publish.
                      </p>
                    )}
                  </div>
                  <div className="relative w-28 shrink-0">
                    <Input
                      aria-label={`Timer in minutes for step ${index + 1}`}
                      inputMode="numeric"
                      placeholder="Timer"
                      value={row.timerMinutes}
                      onChange={(event) => updateRow(row.id, { timerMinutes: event.target.value.replace(/\D/g, '') })}
                      className="pr-11 text-body-sm md:text-body-sm"
                    />
                    <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-body-sm text-text-secondary">
                      min
                    </span>
                  </div>
                </>
              )
            }}
          />
          <p className="text-caption text-text-secondary">Each step needs an instruction. Timer is optional.</p>
        </>
      )}
    </EditorSection>
  )
}
