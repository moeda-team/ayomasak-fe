import { useFormContext, useWatch } from 'react-hook-form'
import type { RecipeEditorValues } from './recipe-editor-types'

type RowsName = 'ingredients' | 'equipment' | 'steps' | 'photos' | 'videos'
type Row<TName extends RowsName> = RecipeEditorValues[TName][number]

/**
 * The editable list `name` of the recipe form. Rows are replaced as a whole instead of registered one by one,
 * so reordering never mixes up which input belongs to which row.
 */
export const useFormRows = <TName extends RowsName>(name: TName) => {
  const { control, setValue, getValues } = useFormContext<RecipeEditorValues>()
  const rows: Row<TName>[] = useWatch({ control, name })

  // TypeScript cannot resolve the path type for a generic list name, hence the cast; every caller passes a typed list.
  const setRows = (next: Row<TName>[]) => setValue(name, next as never, { shouldDirty: true })
  /** Reads the latest rows, so async work such as a finished upload never overwrites newer edits. */
  const latest = (): Row<TName>[] => getValues(name)

  return {
    rows,
    setRows,
    addRow: (row: Row<TName>) => setRows([...latest(), row]),
    updateRow: (id: string, patch: Partial<Row<TName>>) =>
      setRows(latest().map((row) => (row.id === id ? { ...row, ...patch } : row))),
    removeRow: (id: string) => setRows(latest().filter((row) => row.id !== id)),
  }
}
