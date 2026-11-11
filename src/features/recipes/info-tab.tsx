import { Controller, useFormContext } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { FormField } from '@/components/shared/form-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EditorSection } from './editor-section'
import { CATEGORY_OPTIONS, DIFFICULTY_OPTIONS } from './recipe-editor-config'
import type { RecipeEditorValues } from './recipe-editor-types'

const describedBy = (hasError: boolean, id: string) => (hasError ? `${id}-error` : undefined)

export const InfoTab = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RecipeEditorValues>()

  return (
    <EditorSection title="Basic information">
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-6">
        <FormField htmlFor="recipe-name" label="Recipe name" isRequired error={errors.name?.message} className="sm:col-span-6">
          <Input
            id="recipe-name"
            placeholder="e.g. Nasi Goreng Kampung"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy(Boolean(errors.name), 'recipe-name')}
            {...register('name')}
          />
        </FormField>

        <FormField htmlFor="recipe-slug" label="Slug" className="sm:col-span-3">
          <Input
            id="recipe-slug"
            placeholder="auto-generated from name"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            {...register('slug')}
          />
        </FormField>

        <FormField htmlFor="recipe-category" label="Category" isRequired error={errors.category?.message} className="sm:col-span-3">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Combobox
                id="recipe-category"
                value={field.value}
                options={CATEGORY_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select category"
                searchPlaceholder="Search category"
                emptyMessage="No category found"
                isInvalid={Boolean(errors.category)}
                aria-describedby={describedBy(Boolean(errors.category), 'recipe-category')}
              />
            )}
          />
        </FormField>

        <FormField htmlFor="recipe-difficulty" label="Difficulty" isRequired error={errors.difficulty?.message} className="sm:col-span-2">
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <Combobox
                id="recipe-difficulty"
                value={field.value}
                options={DIFFICULTY_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select difficulty"
                searchPlaceholder="Search difficulty"
                isInvalid={Boolean(errors.difficulty)}
                aria-describedby={describedBy(Boolean(errors.difficulty), 'recipe-difficulty')}
              />
            )}
          />
        </FormField>

        <FormField htmlFor="recipe-servings" label="Servings" isRequired error={errors.servings?.message} className="sm:col-span-2">
          <Input
            id="recipe-servings"
            inputMode="numeric"
            placeholder="e.g. 4"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            aria-invalid={Boolean(errors.servings)}
            aria-describedby={describedBy(Boolean(errors.servings), 'recipe-servings')}
            {...register('servings')}
          />
        </FormField>

        <FormField htmlFor="recipe-cook-time" label="Cook time (min)" error={errors.cookTime?.message} className="sm:col-span-2">
          <Input
            id="recipe-cook-time"
            inputMode="numeric"
            placeholder="e.g. 30"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            aria-invalid={Boolean(errors.cookTime)}
            aria-describedby={describedBy(Boolean(errors.cookTime), 'recipe-cook-time')}
            {...register('cookTime')}
          />
        </FormField>

        <FormField htmlFor="recipe-description" label="Description" className="sm:col-span-6">
          <Textarea
            id="recipe-description"
            rows={2}
            placeholder="Short description shown to users"
            className="min-h-9 text-body-sm md:text-body-sm"
            {...register('description')}
          />
        </FormField>
      </div>
    </EditorSection>
  )
}
