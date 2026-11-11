import { PlusIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DIALOG_EXIT_MS, DRAWER_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { ConversionFormDrawer } from './conversion-form-drawer'
import { ConversionsPanel } from './conversions-panel'
import type { Conversion, ConversionFormValues, Unit, UnitFormValues } from './unit-types'
import { UnitFormDrawer } from './unit-form-drawer'
import { UnitsPanel } from './units-panel'
import { useCreateConversion, useDeleteConversion, useUpdateConversion } from './use-conversions'
import { useCreateUnit, useDeactivateUnit, useUnitCounts, useUpdateUnit } from './use-units'

type TabId = 'units' | 'conversions'

const TAB_COPY: Record<TabId, { description: string; addLabel: string }> = {
  units: {
    description: 'Manage measurement units, aliases, and status used in recipes and ingredient quantities.',
    addLabel: 'Add Unit',
  },
  conversions: {
    description: 'Manage conversion factors between units, globally or per ingredient.',
    addLabel: 'Add Conversion',
  },
}

type UnitFormState = { kind: 'create' } | { kind: 'edit'; unit: Unit }
type ConversionFormState = { kind: 'create' } | { kind: 'edit'; conversion: Conversion }

export const MasterUnitPage = () => {
  const [tab, setTab] = useState<TabId>('units')
  const [unitForm, setUnitForm] = useState<UnitFormState | null>(null)
  const [conversionForm, setConversionForm] = useState<ConversionFormState | null>(null)
  const [deactivating, setDeactivating] = useState<Unit | null>(null)
  const [deleting, setDeleting] = useState<Conversion | null>(null)

  const { data: counts } = useUnitCounts()
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const deactivateUnit = useDeactivateUnit()
  const createConversion = useCreateConversion()
  const updateConversion = useUpdateConversion()
  const deleteConversion = useDeleteConversion()

  const closeUnitForm = () => setUnitForm(null)
  const closeConversionForm = () => setConversionForm(null)
  const closeDeactivate = () => setDeactivating(null)
  const closeDelete = () => setDeleting(null)

  const handleUnitSubmit = (values: UnitFormValues) => {
    if (unitForm?.kind === 'edit') updateUnit.mutate({ id: unitForm.unit.id, values }, { onSuccess: closeUnitForm })
    else createUnit.mutate(values, { onSuccess: closeUnitForm })
  }

  const handleConversionSubmit = (values: ConversionFormValues) => {
    if (conversionForm?.kind === 'edit') {
      updateConversion.mutate({ id: conversionForm.conversion.id, values }, { onSuccess: closeConversionForm })
    } else createConversion.mutate(values, { onSuccess: closeConversionForm })
  }

  /** What the drawers and dialogs show; each outlives its state for the length of its exit animation. */
  const shownUnitForm = useRetainedValue(unitForm, DRAWER_EXIT_MS)
  const shownConversionForm = useRetainedValue(conversionForm, DRAWER_EXIT_MS)
  const shownDeactivating = useRetainedValue(deactivating, DIALOG_EXIT_MS)
  const shownDeleting = useRetainedValue(deleting, DIALOG_EXIT_MS)

  const addOnThisTab = () => (tab === 'units' ? setUnitForm({ kind: 'create' }) : setConversionForm({ kind: 'create' }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Master Data', 'Master Unit']}
        title="Master Unit"
        description={TAB_COPY[tab].description}
        action={
          <Button onClick={addOnThisTab}>
            <PlusIcon aria-hidden />
            {TAB_COPY[tab].addLabel}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(next) => setTab(next as TabId)}>
        <TabsList aria-label="Master Unit sections">
          <TabsTrigger value="units">Units{counts ? ` (${counts.units})` : ''}</TabsTrigger>
          <TabsTrigger value="conversions">Conversions{counts ? ` (${counts.conversions})` : ''}</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <UnitsPanel
            onAdd={() => setUnitForm({ kind: 'create' })}
            onEdit={(unit) => setUnitForm({ kind: 'edit', unit })}
            onDeactivate={setDeactivating}
          />
        </TabsContent>
        <TabsContent value="conversions">
          <ConversionsPanel
            onAdd={() => setConversionForm({ kind: 'create' })}
            onEdit={(conversion) => setConversionForm({ kind: 'edit', conversion })}
            onDelete={setDeleting}
          />
        </TabsContent>
      </Tabs>

      <UnitFormDrawer
        key={shownUnitForm?.kind === 'edit' ? shownUnitForm.unit.id : 'create-unit'}
        open={unitForm !== null}
        onOpenChange={(open) => !open && closeUnitForm()}
        unit={shownUnitForm?.kind === 'edit' ? shownUnitForm.unit : undefined}
        isPending={createUnit.isPending || updateUnit.isPending}
        onSubmit={handleUnitSubmit}
        onViewDuplicate={(unit) => setUnitForm({ kind: 'edit', unit })}
      />

      <ConversionFormDrawer
        key={shownConversionForm?.kind === 'edit' ? shownConversionForm.conversion.id : 'create-conversion'}
        open={conversionForm !== null}
        onOpenChange={(open) => !open && closeConversionForm()}
        conversion={shownConversionForm?.kind === 'edit' ? shownConversionForm.conversion : undefined}
        isPending={createConversion.isPending || updateConversion.isPending}
        onSubmit={handleConversionSubmit}
        onViewDuplicate={(conversion) => setConversionForm({ kind: 'edit', conversion })}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && closeDeactivate()}
        title={shownDeactivating ? `Deactivate ${shownDeactivating.name}?` : ''}
        description={
          shownDeactivating
            ? `Used in ${shownDeactivating.recipeCount} recipes. It will no longer be selectable for new recipes; existing recipes that use it stay valid.`
            : ''
        }
        confirmLabel="Deactivate"
        pendingLabel="Deactivating…"
        isPending={deactivateUnit.isPending}
        onConfirm={() => deactivating && deactivateUnit.mutate(deactivating, { onSettled: closeDeactivate })}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && closeDelete()}
        title="Delete conversion?"
        description={
          shownDeleting
            ? `${shownDeleting.from.name} → ${shownDeleting.to.name} (× ${shownDeleting.factor}) will be removed. Recipes using ${shownDeleting.from.symbol} will fall back to the default conversion.`
            : ''
        }
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isPending={deleteConversion.isPending}
        onConfirm={() => deleting && deleteConversion.mutate(deleting, { onSettled: closeDelete })}
      />
    </div>
  )
}
