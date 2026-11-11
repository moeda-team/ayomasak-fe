import { PlusIcon } from '@phosphor-icons/react'
import { useFormContext } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EditorRowList } from './editor-row-list'
import { EditorSection } from './editor-section'
import { newRowId, NECESSITY_OPTIONS, UNIT_OPTIONS } from './recipe-editor-config'
import type { IngredientRow, RecipeEditorValues } from './recipe-editor-types'
import { useBahanOptions } from './use-recipe-editor'
import { useFormRows } from './use-form-rows'

const isBlank = (text: string) => text.trim() === ''

export const IngredientsTab = () => {
  const { rows, setRows, addRow, updateRow, removeRow } = useFormRows('ingredients')
  const { data: bahanList = [] } = useBahanOptions()
  const { formState } = useFormContext<RecipeEditorValues>()
  const showErrors = formState.submitCount > 0

  const addIngredient = () => addRow({ id: newRowId(), bahanId: '', quantity: '', unit: 'gram', necessity: 'required', note: '' })

  /** Inactive ingredients can't be added to new rows, but a row that already has one still shows it. */
  const optionsFor = (row: IngredientRow) =>
    bahanList
      .filter((bahan) => bahan.status !== 'inactive' || bahan.id === row.bahanId)
      .map((bahan) => ({ value: bahan.id, label: bahan.status === 'inactive' ? `${bahan.name} (inactive)` : bahan.name }))

  const addButton = (
    <Button type="button" variant="outline" onClick={addIngredient}>
      Add ingredient
    </Button>
  )

  return (
    <EditorSection
      title="Ingredients"
      description={rows.length === 0 ? '0 items.' : `${rows.length} ${rows.length === 1 ? 'item' : 'items'}. Drag to reorder.`}
      action={rows.length > 0 ? addButton : undefined}
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No ingredients yet"
          description="Add at least one ingredient from Master Bahan. A recipe can’t be published without ingredients."
          action={
            <Button type="button" onClick={addIngredient}>
              <PlusIcon aria-hidden />
              Add ingredient
            </Button>
          }
        />
      ) : (
        <>
          <EditorRowList
            items={rows}
            onReorder={setRows}
            label="Ingredients"
            removeLabel={(_row, index) => `Remove ingredient ${index + 1}`}
            onRemove={(row) => removeRow(row.id)}
            renderRow={(row, index) => {
              const quantityInvalid = showErrors && isBlank(row.quantity)
              const bahanInvalid = showErrors && row.bahanId === ''
              return (
                <>
                  <Combobox
                    aria-label={`Ingredient ${index + 1}`}
                    value={row.bahanId}
                    options={optionsFor(row)}
                    onChange={(bahanId) => updateRow(row.id, { bahanId })}
                    placeholder="Select ingredient"
                    searchPlaceholder="Search ingredient"
                    emptyMessage="No ingredient found"
                    isInvalid={bahanInvalid}
                    className="w-44"
                  />
                  <Input
                    aria-label={`Quantity for ingredient ${index + 1}`}
                    inputMode="decimal"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(event) => updateRow(row.id, { quantity: event.target.value })}
                    aria-invalid={quantityInvalid}
                    className="w-20 text-body-sm md:text-body-sm"
                  />
                  <Combobox
                    aria-label={`Unit for ingredient ${index + 1}`}
                    value={row.unit}
                    options={UNIT_OPTIONS}
                    onChange={(unit) => updateRow(row.id, { unit })}
                    placeholder="Unit"
                    searchPlaceholder="Search unit"
                    className="w-24"
                  />
                  <Combobox
                    aria-label={`Necessity for ingredient ${index + 1}`}
                    value={row.necessity}
                    options={NECESSITY_OPTIONS}
                    onChange={(necessity) => updateRow(row.id, { necessity })}
                    placeholder="Required"
                    className="w-32"
                  />
                  <Input
                    aria-label={`Prep note for ingredient ${index + 1}`}
                    placeholder="Prep note (optional)"
                    value={row.note}
                    onChange={(event) => updateRow(row.id, { note: event.target.value })}
                    className="min-w-32 flex-1 text-body-sm md:text-body-sm"
                  />
                </>
              )
            }}
          />
          <p className="text-caption text-text-secondary">
            Quantities are for the whole recipe. Inactive ingredients can’t be added to new recipes.
          </p>
        </>
      )}
    </EditorSection>
  )
}
