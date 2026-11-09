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
import { CATEGORY_LABEL, FORM_OPTIONS, STATUS_OPTIONS, UNIT_OPTIONS } from './bahan-config'
import { bahanFormSchema, EMPTY_BAHAN_FORM, type BahanFormInput } from './bahan-schema'
import { BAHAN_CATEGORIES, type Bahan, type BahanCategory, type BahanForm, type BahanFormValues, type BahanStatus } from './bahan-types'
import { useDuplicateBahan } from './use-bahan'

const FORM_ID = 'bahan-form'

const CATEGORY_OPTIONS = BAHAN_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABEL[value] }))

const toFormInput = (bahan: Bahan | undefined): BahanFormInput =>
  bahan
    ? {
        name: bahan.name,
        aliases: bahan.aliases,
        category: bahan.category,
        form: bahan.form,
        defaultUnit: bahan.defaultUnit,
        isPantry: bahan.isPantry,
        status: bahan.status,
      }
    : EMPTY_BAHAN_FORM

type BahanFormProps = {
  bahan?: Bahan
  onSubmit: (values: BahanFormValues) => void
  onViewDuplicate: (bahan: Bahan) => void
}

const BahanForm = ({ bahan, onSubmit, onViewDuplicate }: BahanFormProps) => {
  const isEditing = Boolean(bahan)
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<BahanFormInput, unknown, BahanFormValues>({
    resolver: zodResolver(bahanFormSchema),
    defaultValues: toFormInput(bahan),
  })

  const { data: duplicate } = useDuplicateBahan(watch('name'), bahan?.id)

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        htmlFor="bahan-name"
        label="Canonical name"
        isRequired
        error={errors.name?.message}
        hint="Shown to users and used for matching. Must be unique."
      >
        <Input
          id="bahan-name"
          placeholder="e.g. Kemiri"
          autoComplete="off"
          className="text-body-sm md:text-body-sm"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'bahan-name-error' : 'bahan-name-hint'}
          {...register('name')}
        />
      </FormField>

      {duplicate && (
        <DuplicateNotice
          existingName={duplicate.bahan.name}
          matchedAlias={duplicate.matchedAlias}
          onView={() => onViewDuplicate(duplicate.bahan)}
        />
      )}

      <FormField htmlFor="bahan-aliases" label="Aliases" hint="Other names or spellings users may type.">
        <Controller
          control={control}
          name="aliases"
          render={({ field }) => (
            <TagInput
              id="bahan-aliases"
              value={field.value}
              onChange={field.onChange}
              placeholder="Type an alias, then press Enter"
              removeLabel={(tag) => `Remove alias ${tag}`}
              aria-describedby="bahan-aliases-hint"
            />
          )}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-x-4">
        <FormField htmlFor="bahan-category" label="Category" isRequired error={errors.category?.message}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Combobox
                id="bahan-category"
                value={field.value as BahanCategory | ''}
                options={CATEGORY_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select category"
                searchPlaceholder="Search category"
                emptyMessage="No category found"
                isInvalid={Boolean(errors.category)}
                aria-describedby={errors.category ? 'bahan-category-error' : undefined}
              />
            )}
          />
        </FormField>
        <FormField htmlFor="bahan-form-type" label="Form" isRequired error={errors.form?.message}>
          <Controller
            control={control}
            name="form"
            render={({ field }) => (
              <Combobox
                id="bahan-form-type"
                value={field.value as BahanForm | ''}
                options={FORM_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select form"
                searchPlaceholder="Search form"
                emptyMessage="No form found"
                isInvalid={Boolean(errors.form)}
                aria-describedby={errors.form ? 'bahan-form-type-error' : undefined}
              />
            )}
          />
        </FormField>
      </div>

      <FormField htmlFor="bahan-unit" label="Default unit" isRequired error={errors.defaultUnit?.message}>
        <Controller
          control={control}
          name="defaultUnit"
          render={({ field }) => (
            <Combobox
              id="bahan-unit"
              value={field.value}
              options={UNIT_OPTIONS}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Select unit"
              searchPlaceholder="Search unit"
              emptyMessage="No unit found"
              isInvalid={Boolean(errors.defaultUnit)}
              aria-describedby={errors.defaultUnit ? 'bahan-unit-error' : undefined}
            />
          )}
        />
      </FormField>

      <Controller
        control={control}
        name="isPantry"
        render={({ field }) => (
          <ToggleRow
            id="bahan-pantry"
            label="Pantry item"
            description="Assumed to be available in a typical kitchen, so matching does not require it."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />

      {isEditing ? (
        <FormField htmlFor="bahan-status" label="Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Combobox<BahanStatus>
                id="bahan-status"
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
      ) : (
        <NoticeCard tone="info">
          New ingredients are added as Pending review and appear in the Review Queue until a reviewer verifies them.
        </NoticeCard>
      )}
    </form>
  )
}

type BahanFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; the form starts from this bahan. */
  bahan?: Bahan
  isPending: boolean
  onSubmit: (values: BahanFormValues) => void
  onViewDuplicate: (bahan: Bahan) => void
}

/** Add and edit share one drawer; `bahan` switches it to editing. Give it a `key` per bahan so the form never shows stale input. */
export const BahanFormDrawer = ({ open, onOpenChange, bahan, isPending, onSubmit, onViewDuplicate }: BahanFormDrawerProps) => (
  <DetailDrawer
    open={open}
    onOpenChange={(next) => !isPending && onOpenChange(next)}
    title={bahan ? 'Edit Bahan' : 'Add Bahan'}
    description={bahan ? 'Update this ingredient’s details.' : 'Add a new canonical ingredient.'}
    footer={
      <>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID} disabled={isPending}>
          {isPending ? 'Saving…' : bahan ? 'Save changes' : 'Add Bahan'}
        </Button>
      </>
    }
  >
    <BahanForm bahan={bahan} onSubmit={onSubmit} onViewDuplicate={onViewDuplicate} />
  </DetailDrawer>
)
