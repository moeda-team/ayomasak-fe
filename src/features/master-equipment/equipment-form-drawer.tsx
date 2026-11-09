import { zodResolver } from '@hookform/resolvers/zod'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { DuplicateNotice } from '@/components/shared/duplicate-notice'
import { FormField } from '@/components/shared/form-field'
import { NoticeCard } from '@/components/shared/notice-card'
import { RemovableChip } from '@/components/shared/removable-chip'
import { TagInput } from '@/components/shared/tag-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MASTER_STATUS_OPTIONS, type MasterStatus } from '@/features/master-data/master-status'
import { CATEGORY_OPTIONS } from './equipment-config'
import { equipmentFormSchema, EMPTY_EQUIPMENT_FORM, type EquipmentFormInput } from './equipment-schema'
import type { Equipment, EquipmentCategory, EquipmentFormValues } from './equipment-types'
import { useDuplicateEquipment, useEquipmentRefs } from './use-equipment'

const FORM_ID = 'equipment-form'

const toFormInput = (equipment: Equipment | undefined): EquipmentFormInput =>
  equipment
    ? {
        name: equipment.name,
        aliases: equipment.aliases,
        category: equipment.category,
        alternativeIds: equipment.alternatives.map((alternative) => alternative.id),
        status: equipment.status,
      }
    : EMPTY_EQUIPMENT_FORM

type EquipmentFormProps = {
  equipment?: Equipment
  onSubmit: (values: EquipmentFormValues) => void
  onViewDuplicate: (equipment: Equipment) => void
}

const EquipmentForm = ({ equipment, onSubmit, onViewDuplicate }: EquipmentFormProps) => {
  const isEditing = Boolean(equipment)
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipmentFormInput, unknown, EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: toFormInput(equipment),
  })

  const { data: duplicate } = useDuplicateEquipment(watch('name'), equipment?.id)
  const { data: refs = [] } = useEquipmentRefs(equipment?.id)

  /** Names of the chosen alternatives; the equipment's own list covers them until the options have loaded. */
  const nameOf = (id: string) =>
    refs.find((ref) => ref.id === id)?.name ?? equipment?.alternatives.find((alternative) => alternative.id === id)?.name ?? id

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        htmlFor="equipment-name"
        label="Canonical name"
        isRequired
        error={errors.name?.message}
        hint="Shown to users and used for matching. Must be unique."
      >
        <Input
          id="equipment-name"
          placeholder="e.g. Wajan"
          autoComplete="off"
          className="text-body-sm md:text-body-sm"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'equipment-name-error' : 'equipment-name-hint'}
          {...register('name')}
        />
      </FormField>

      {duplicate && (
        <DuplicateNotice
          existingName={duplicate.equipment.name}
          matchedAlias={duplicate.matchedAlias}
          onView={() => onViewDuplicate(duplicate.equipment)}
        />
      )}

      <FormField htmlFor="equipment-aliases" label="Aliases" hint="Other names or spellings users may type.">
        <Controller
          control={control}
          name="aliases"
          render={({ field }) => (
            <TagInput
              id="equipment-aliases"
              value={field.value}
              onChange={field.onChange}
              placeholder="Type an alias, then press Enter"
              removeLabel={(tag) => `Remove alias ${tag}`}
              aria-describedby="equipment-aliases-hint"
            />
          )}
        />
      </FormField>

      <FormField htmlFor="equipment-category" label="Category" isRequired error={errors.category?.message}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Combobox
              id="equipment-category"
              value={field.value as EquipmentCategory | ''}
              options={CATEGORY_OPTIONS}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Select category"
              searchPlaceholder="Search category"
              emptyMessage="No category found"
              isInvalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'equipment-category-error' : undefined}
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor="equipment-alternatives"
        label="Alternative equipment"
        hint="Used when this tool isn’t available. Applies to all recipes."
      >
        <Controller
          control={control}
          name="alternativeIds"
          render={({ field }) => (
            <>
              {/* Picking an option adds it as a chip, so the box itself always stays on its placeholder. */}
              <Combobox
                id="equipment-alternatives"
                value=""
                icon={MagnifyingGlassIcon}
                options={refs.filter((ref) => !field.value.includes(ref.id)).map((ref) => ({ value: ref.id, label: ref.name }))}
                onChange={(id) => field.onChange([...field.value, id])}
                placeholder="Search equipment to add"
                searchPlaceholder="Search equipment"
                emptyMessage="No equipment found"
                aria-describedby="equipment-alternatives-hint"
              />
              {field.value.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {field.value.map((id) => (
                    <li key={id}>
                      <RemovableChip
                        label={nameOf(id)}
                        removeLabel={`Remove alternative ${nameOf(id)}`}
                        onRemove={() => field.onChange(field.value.filter((chosen) => chosen !== id))}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        />
      </FormField>

      {isEditing ? (
        <FormField htmlFor="equipment-status" label="Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox<MasterStatus>
                id="equipment-status"
                value={field.value}
                options={MASTER_STATUS_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select status"
                searchPlaceholder="Search status"
              />
            )}
          />
        </FormField>
      ) : (
        <NoticeCard tone="info">
          New equipment is added as Pending review and appears in the Review Queue until a reviewer verifies it.
        </NoticeCard>
      )}
    </form>
  )
}

type EquipmentFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; the form starts from this equipment. */
  equipment?: Equipment
  isPending: boolean
  onSubmit: (values: EquipmentFormValues) => void
  onViewDuplicate: (equipment: Equipment) => void
}

/** Add and edit share one drawer; `equipment` switches it to editing. Give it a `key` per equipment so the form never shows stale input. */
export const EquipmentFormDrawer = ({
  open,
  onOpenChange,
  equipment,
  isPending,
  onSubmit,
  onViewDuplicate,
}: EquipmentFormDrawerProps) => (
  <DetailDrawer
    open={open}
    onOpenChange={(next) => !isPending && onOpenChange(next)}
    title={equipment ? 'Edit Equipment' : 'Add Equipment'}
    description={equipment ? 'Update this tool’s details.' : 'Add a new canonical cooking tool.'}
    footer={
      <>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} disabled={isPending}>
          {isPending ? 'Saving…' : equipment ? 'Save changes' : 'Add Equipment'}
        </Button>
      </>
    }
  >
    <EquipmentForm equipment={equipment} onSubmit={onSubmit} onViewDuplicate={onViewDuplicate} />
  </DetailDrawer>
)
