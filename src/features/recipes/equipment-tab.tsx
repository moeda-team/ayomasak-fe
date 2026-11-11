import { PlusIcon } from '@phosphor-icons/react'
import { Combobox } from '@/components/shared/combobox'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EditorRowList } from './editor-row-list'
import { EditorSection } from './editor-section'
import { newRowId } from './recipe-editor-config'
import type { EquipmentRow } from './recipe-editor-types'
import { useFormRows } from './use-form-rows'
import { useEquipmentOptions } from './use-recipe-editor'

export const EquipmentTab = () => {
  const { rows, setRows, addRow, updateRow, removeRow } = useFormRows('equipment')
  const { data: equipmentList = [] } = useEquipmentOptions()

  const addEquipment = () => addRow({ id: newRowId(), equipmentId: '', quantity: '1', note: '' })

  /** Inactive equipment can't be added to new rows, but a row that already has one still shows it. */
  const optionsFor = (row: EquipmentRow) =>
    equipmentList
      .filter((item) => item.status !== 'inactive' || item.id === row.equipmentId)
      .map((item) => ({ value: item.id, label: item.status === 'inactive' ? `${item.name} (inactive)` : item.name }))

  const addButton = (
    <Button type="button" variant="outline" onClick={addEquipment}>
      Add equipment
    </Button>
  )

  return (
    <EditorSection
      title="Equipment"
      description={rows.length === 0 ? '0 items. Optional.' : `${rows.length} ${rows.length === 1 ? 'item' : 'items'}. Used for equipment filtering.`}
      action={rows.length > 0 ? addButton : undefined}
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No equipment yet"
          description="Equipment is optional, but it helps match this recipe to what users own."
          action={
            <Button type="button" onClick={addEquipment}>
              <PlusIcon aria-hidden />
              Add equipment
            </Button>
          }
        />
      ) : (
        <>
          <EditorRowList
            items={rows}
            onReorder={setRows}
            label="Equipment"
            removeLabel={(_row, index) => `Remove equipment ${index + 1}`}
            onRemove={(row) => removeRow(row.id)}
            renderRow={(row, index) => (
              <>
                <Combobox
                  aria-label={`Equipment ${index + 1}`}
                  value={row.equipmentId}
                  options={optionsFor(row)}
                  onChange={(equipmentId) => updateRow(row.id, { equipmentId })}
                  placeholder="Select equipment"
                  searchPlaceholder="Search equipment"
                  emptyMessage="No equipment found"
                  className="w-44"
                />
                <Input
                  aria-label={`Quantity for equipment ${index + 1}`}
                  inputMode="numeric"
                  placeholder="Qty"
                  value={row.quantity}
                  onChange={(event) => updateRow(row.id, { quantity: event.target.value })}
                  className="w-20 text-body-sm md:text-body-sm"
                />
                <Input
                  aria-label={`Note for equipment ${index + 1}`}
                  placeholder="Note (optional)"
                  value={row.note}
                  onChange={(event) => updateRow(row.id, { note: event.target.value })}
                  className="min-w-32 flex-1 text-body-sm md:text-body-sm"
                />
              </>
            )}
          />
          <p className="text-caption text-text-secondary">Equipment is used when matching recipes to what the user owns.</p>
        </>
      )}
    </EditorSection>
  )
}
