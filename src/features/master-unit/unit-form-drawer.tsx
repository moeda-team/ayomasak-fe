import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { DuplicateNotice } from '@/components/shared/duplicate-notice'
import { FormField } from '@/components/shared/form-field'
import { NoticeCard } from '@/components/shared/notice-card'
import { TagInput } from '@/components/shared/tag-input'
import { ToggleRow } from '@/components/shared/toggle-row'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { STATUS_OPTIONS, TYPE_OPTIONS } from './unit-config'
import { EMPTY_UNIT_FORM, unitFormSchema, type UnitFormInput } from './unit-schema'
import type { Unit, UnitFormValues, UnitStatus, UnitType } from './unit-types'
import { useBaseUnits, useDuplicateUnitSymbol } from './use-units'

const FORM_ID = 'unit-form'

const toFormInput = (unit: Unit | undefined): UnitFormInput =>
  unit
    ? {
        name: unit.name,
        aliases: unit.aliases,
        type: unit.type,
        symbol: unit.symbol,
        isBase: unit.isBase,
        baseUnitId: unit.baseUnitId ?? '',
        status: unit.status,
      }
    : EMPTY_UNIT_FORM

type UnitFormProps = {
  unit?: Unit
  onSubmit: (values: UnitFormValues) => void
  onViewDuplicate: (unit: Unit) => void
}

const UnitForm = ({ unit, onSubmit, onViewDuplicate }: UnitFormProps) => {
  const isEditing = Boolean(unit)
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<UnitFormInput, unknown, UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: toFormInput(unit),
  })

  const type = watch('type')
  const isBase = watch('isBase')
  const { data: duplicate } = useDuplicateUnitSymbol(watch('symbol'), unit?.id)
  const { data: baseUnits = [] } = useBaseUnits(unit?.id)

  const baseUnitOptions = baseUnits
    .filter((base) => base.type === type)
    .map((base) => ({ value: base.id, label: `${base.name} (${base.symbol})` }))

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        htmlFor="unit-name"
        label="Unit name"
        isRequired
        error={errors.name?.message}
        hint="Shown in recipes and ingredient forms. Must be unique."
      >
        <Input
          id="unit-name"
          placeholder="e.g. Sendok Makan"
          autoComplete="off"
          className="text-body-sm md:text-body-sm"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'unit-name-error' : 'unit-name-hint'}
          {...register('name')}
        />
      </FormField>

      {duplicate && (
        <DuplicateNotice
          existingName={duplicate.unit.name}
          title="Symbol already in use"
          message={`The symbol “${duplicate.unit.symbol}” is already used by “${duplicate.unit.name}”. Use a different symbol or edit the existing unit.`}
          onView={() => onViewDuplicate(duplicate.unit)}
        />
      )}

      <FormField htmlFor="unit-aliases" label="Aliases" hint="Spellings users may type, e.g. sdm, tablespoon.">
        <Controller
          control={control}
          name="aliases"
          render={({ field }) => (
            <TagInput
              id="unit-aliases"
              value={field.value}
              onChange={field.onChange}
              placeholder="Type an alias, then press Enter"
              removeLabel={(tag) => `Remove alias ${tag}`}
              aria-describedby="unit-aliases-hint"
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField htmlFor="unit-type" label="Type" isRequired error={errors.type?.message}>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Combobox
                id="unit-type"
                value={field.value as UnitType | ''}
                options={TYPE_OPTIONS}
                onChange={(next) => {
                  field.onChange(next)
                  setValue('baseUnitId', '')
                }}
                onBlur={field.onBlur}
                placeholder="Select type"
                searchPlaceholder="Search type"
                emptyMessage="No type found"
                isInvalid={Boolean(errors.type)}
                aria-describedby={errors.type ? 'unit-type-error' : undefined}
              />
            )}
          />
        </FormField>
        <FormField htmlFor="unit-symbol" label="Symbol" isRequired error={errors.symbol?.message}>
          <Input
            id="unit-symbol"
            placeholder="e.g. tbsp"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            aria-invalid={Boolean(errors.symbol)}
            aria-describedby={errors.symbol ? 'unit-symbol-error' : undefined}
            {...register('symbol')}
          />
        </FormField>
      </div>

      <FormField htmlFor="unit-base-unit" label="Converts to" isRequired={!isBase} error={errors.baseUnitId?.message}>
        <Controller
          control={control}
          name="baseUnitId"
          render={({ field }) => (
            <Combobox
              id="unit-base-unit"
              value={field.value}
              options={baseUnitOptions}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={type === '' ? 'Select type first' : 'Select base unit'}
              searchPlaceholder="Search base unit"
              emptyMessage="No base unit for this type"
              disabled={isBase}
              isInvalid={Boolean(errors.baseUnitId)}
              aria-describedby={errors.baseUnitId ? 'unit-base-unit-error' : undefined}
            />
          )}
        />
      </FormField>

      <Controller
        control={control}
        name="isBase"
        render={({ field }) => (
          <ToggleRow
            id="unit-is-base"
            label="Base unit"
            description="Reference unit for its type. Other units convert to it."
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked)
              if (checked) setValue('baseUnitId', '')
            }}
          />
        )}
      />

      {isEditing ? (
        <FormField htmlFor="unit-status" label="Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox<UnitStatus>
                id="unit-status"
                value={field.value}
                options={STATUS_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select status"
                searchPlaceholder="Search status"
              />
            )}
          />
        </FormField>
      ) : null}

      <NoticeCard tone="info">Units used in recipes cannot be deleted. Deactivate them to hide from new recipes.</NoticeCard>
    </form>
  )
}

type UnitFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; the form starts from this unit. */
  unit?: Unit
  isPending: boolean
  onSubmit: (values: UnitFormValues) => void
  onViewDuplicate: (unit: Unit) => void
}

/** Add and edit share one drawer; `unit` switches it to editing. Give it a `key` per unit so the form never shows stale input. */
export const UnitFormDrawer = ({ open, onOpenChange, unit, isPending, onSubmit, onViewDuplicate }: UnitFormDrawerProps) => (
  <DetailDrawer
    open={open}
    onOpenChange={(next) => !isPending && onOpenChange(next)}
    title={unit ? 'Edit Unit' : 'Add Unit'}
    description={unit ? 'Update this unit’s details.' : 'Add a new measurement unit.'}
    footer={
      <>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} disabled={isPending}>
          {isPending ? 'Saving…' : unit ? 'Save changes' : 'Add Unit'}
        </Button>
      </>
    }
  >
    <UnitForm unit={unit} onSubmit={onSubmit} onViewDuplicate={onViewDuplicate} />
  </DetailDrawer>
)
