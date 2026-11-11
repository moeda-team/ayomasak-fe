import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { DuplicateNotice } from '@/components/shared/duplicate-notice'
import { FormField } from '@/components/shared/form-field'
import { NoticeCard } from '@/components/shared/notice-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SCOPE_OPTIONS, STATUS_OPTIONS } from './unit-config'
import { conversionFormSchema, EMPTY_CONVERSION_FORM, type ConversionFormInput } from './unit-schema'
import type { Conversion, ConversionFormValues, ConversionScope, UnitStatus } from './unit-types'
import { useBahanNames, useDuplicateConversion } from './use-conversions'
import { useUnitRefs } from './use-units'

const FORM_ID = 'conversion-form'

const toFormInput = (conversion: Conversion | undefined): ConversionFormInput =>
  conversion
    ? {
        fromId: conversion.from.id,
        toId: conversion.to.id,
        factor: String(conversion.factor),
        scope: conversion.scope,
        bahanName: conversion.bahanName ?? '',
        status: conversion.status,
      }
    : EMPTY_CONVERSION_FORM

type ConversionFormProps = {
  conversion?: Conversion
  onSubmit: (values: ConversionFormValues) => void
  onViewDuplicate: (conversion: Conversion) => void
}

const ConversionForm = ({ conversion, onSubmit, onViewDuplicate }: ConversionFormProps) => {
  const isEditing = Boolean(conversion)
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ConversionFormInput, unknown, ConversionFormValues>({
    resolver: zodResolver(conversionFormSchema),
    defaultValues: toFormInput(conversion),
  })

  const scope = watch('scope')
  const { data: units = [] } = useUnitRefs()
  const { data: bahanNames = [] } = useBahanNames()
  const { data: duplicate } = useDuplicateConversion({
    fromId: watch('fromId'),
    toId: watch('toId'),
    scope,
    bahanName: watch('bahanName'),
    ignoreId: conversion?.id,
  })

  const unitOptions = units.map((unit) => ({ value: unit.id, label: unit.symbol }))

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField htmlFor="conversion-from" label="From unit" isRequired error={errors.fromId?.message}>
          <Controller
            control={control}
            name="fromId"
            render={({ field }) => (
              <Combobox
                id="conversion-from"
                value={field.value}
                options={unitOptions}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select unit"
                searchPlaceholder="Search unit"
                emptyMessage="No unit found"
                isInvalid={Boolean(errors.fromId)}
                aria-describedby={errors.fromId ? 'conversion-from-error' : undefined}
              />
            )}
          />
        </FormField>
        <FormField htmlFor="conversion-to" label="To unit" isRequired error={errors.toId?.message}>
          <Controller
            control={control}
            name="toId"
            render={({ field }) => (
              <Combobox
                id="conversion-to"
                value={field.value}
                options={unitOptions}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select unit"
                searchPlaceholder="Search unit"
                emptyMessage="No unit found"
                isInvalid={Boolean(errors.toId)}
                aria-describedby={errors.toId ? 'conversion-to-error' : undefined}
              />
            )}
          />
        </FormField>
      </div>

      <FormField
        htmlFor="conversion-factor"
        label="Factor"
        isRequired
        error={errors.factor?.message}
        hint="1 From unit = Factor × To unit. Must be greater than 0."
      >
        <Input
          id="conversion-factor"
          inputMode="decimal"
          placeholder="e.g. 15"
          autoComplete="off"
          className="text-body-sm md:text-body-sm"
          aria-invalid={Boolean(errors.factor)}
          aria-describedby={errors.factor ? 'conversion-factor-error' : 'conversion-factor-hint'}
          {...register('factor')}
        />
      </FormField>

      {duplicate && (
        <DuplicateNotice
          existingName={`${duplicate.conversion.from.symbol} → ${duplicate.conversion.to.symbol}`}
          title="Conversion already exists"
          message={`A conversion from “${duplicate.conversion.from.symbol}” to “${duplicate.conversion.to.symbol}” already exists (× ${duplicate.conversion.factor}). Edit it instead of adding a new one.`}
          viewLabel="View conversion"
          onView={() => onViewDuplicate(duplicate.conversion)}
        />
      )}

      <FormField htmlFor="conversion-scope" label="Scope" isRequired error={errors.scope?.message}>
        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <Combobox
              id="conversion-scope"
              value={field.value as ConversionScope | ''}
              options={SCOPE_OPTIONS}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Select scope"
              searchPlaceholder="Search scope"
              emptyMessage="No scope found"
              isInvalid={Boolean(errors.scope)}
              aria-describedby={errors.scope ? 'conversion-scope-error' : undefined}
            />
          )}
        />
      </FormField>

      {scope === 'per-bahan' && (
        <FormField htmlFor="conversion-bahan" label="Bahan" isRequired error={errors.bahanName?.message}>
          <Controller
            control={control}
            name="bahanName"
            render={({ field }) => (
              <Combobox
                id="conversion-bahan"
                value={field.value}
                options={bahanNames.map((name) => ({ value: name, label: name }))}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select bahan"
                searchPlaceholder="Search bahan"
                emptyMessage="No bahan found"
                isInvalid={Boolean(errors.bahanName)}
                aria-describedby={errors.bahanName ? 'conversion-bahan-error' : undefined}
              />
            )}
          />
        </FormField>
      )}

      {isEditing && (
        <FormField htmlFor="conversion-status" label="Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox<UnitStatus>
                id="conversion-status"
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
      )}

      <NoticeCard tone="info">Per-ingredient conversions override global ones for that ingredient.</NoticeCard>
    </form>
  )
}

type ConversionFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; the form starts from this conversion. */
  conversion?: Conversion
  isPending: boolean
  onSubmit: (values: ConversionFormValues) => void
  onViewDuplicate: (conversion: Conversion) => void
}

/** Add and edit share one drawer; `conversion` switches it to editing. Give it a `key` per conversion so the form never shows stale input. */
export const ConversionFormDrawer = ({
  open,
  onOpenChange,
  conversion,
  isPending,
  onSubmit,
  onViewDuplicate,
}: ConversionFormDrawerProps) => (
  <DetailDrawer
    open={open}
    onOpenChange={(next) => !isPending && onOpenChange(next)}
    title={conversion ? 'Edit Conversion' : 'Add Conversion'}
    description={conversion ? 'Update this conversion.' : 'Add a conversion factor between two units.'}
    footer={
      <>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} disabled={isPending}>
          {isPending ? 'Saving…' : conversion ? 'Save changes' : 'Add Conversion'}
        </Button>
      </>
    }
  >
    <ConversionForm conversion={conversion} onSubmit={onSubmit} onViewDuplicate={onViewDuplicate} />
  </DetailDrawer>
)
