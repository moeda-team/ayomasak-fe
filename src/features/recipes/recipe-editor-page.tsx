import { zodResolver } from '@hookform/resolvers/zod'
import { useBlocker, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm, type FieldErrors, type Resolver } from 'react-hook-form'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { hasDashboardPermission } from '@/features/dashboard/dashboard-access'
import { EquipmentTab } from './equipment-tab'
import { IngredientsTab } from './ingredients-tab'
import { InfoTab } from './info-tab'
import { MediaTab } from './media-tab'
import { NutritionTab } from './nutrition-tab'
import { PublishReadinessCard } from './publish-readiness-card'
import { RecipeEditorActions } from './recipe-editor-actions'
import { STATUS_LABEL } from './recipe-config'
import { recipeEditorSchema, slugify } from './recipe-editor-schema'
import { EMPTY_EDITOR_VALUES, type RecipeEditorRecord, type RecipeEditorValues } from './recipe-editor-types'
import { RecipeLifecycleDialogs, type LifecycleDialog } from './recipe-lifecycle-dialogs'
import { RecipePreviewDialog } from './recipe-preview-dialog'
import { checkReadiness, nutritionStateOf } from './recipe-readiness'
import type { RecipeStatus } from './recipe-types'
import { StepsTab } from './steps-tab'
import { useCreateDraftRevision, useUnpublishRecipe } from './use-recipe-lifecycle'
import { isRecipeNotFound, useBahanOptions, useEquipmentOptions, usePublishRecipe, useRecipeRecord, useSaveRecipeDraft } from './use-recipe-editor'
import { useArchiveRecipe, useRestoreRecipe } from './use-recipes'
import { VersionHistoryDrawer } from './version-history-drawer'

const EDITOR_TABS = [
  { value: 'info', label: 'Info' },
  { value: 'ingredients', label: 'Ingredients' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'steps', label: 'Steps' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'media', label: 'Media' },
] as const

type EditorTab = (typeof EDITOR_TABS)[number]['value']

/** Which tab holds the first field that failed validation, so the error is never hidden behind another tab. */
const tabWithError = (errors: FieldErrors<RecipeEditorValues>): EditorTab =>
  errors.name || errors.category || errors.difficulty || errors.servings || errors.cookTime ? 'info' : 'nutrition'

type SubtitleInput = {
  isNew: boolean
  isSaving: boolean
  isDirty: boolean
  /** What the last action left behind, e.g. "Draft · Saved just now"; shown until the next edit. */
  note: string | null
  status: RecipeStatus
  version: number
  savedAt: string | undefined
  canPublish: boolean
  blockerCount: number
}

const subtitleOf = ({ isNew, isSaving, isDirty, note, status, version, savedAt, canPublish, blockerCount }: SubtitleInput) => {
  if (isSaving) return `${STATUS_LABEL[status]} · Saving changes…`
  if (isDirty) return `${STATUS_LABEL[status]} · Not saved yet. Not visible to users until it is published.`
  if (note) return note
  if (status === 'published') return `Published · v${version} · Visible to users · Read-only`
  if (status === 'draft-revision') return `Draft revision · based on v${version} · Users still see v${version}`
  if (status === 'archived') return 'Archived · Hidden from users'
  if (isNew || !savedAt) return 'Draft recipe. Not visible to users until it is published.'
  if (!canPublish) return 'Draft · You can edit, but only reviewers can publish'
  if (blockerCount > 0) return `Draft · ${blockerCount} ${blockerCount === 1 ? 'blocker' : 'blockers'} to resolve before publishing`
  return 'Draft · Ready to publish'
}

type RecipeEditorProps = {
  /** Null for a recipe that has never been saved. */
  record: RecipeEditorRecord | null
}

const RecipeEditor = ({ record }: RecipeEditorProps) => {
  const navigate = useNavigate()
  const [savedRecord, setSavedRecord] = useState(record)
  const [tab, setTab] = useState<EditorTab>('info')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [dialog, setDialog] = useState<LifecycleDialog | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const saveDraft = useSaveRecipeDraft()
  const publish = usePublishRecipe()
  const createRevision = useCreateDraftRevision()
  const unpublish = useUnpublishRecipe()
  const archive = useArchiveRecipe()
  const restore = useRestoreRecipe()
  const canPublish = hasDashboardPermission('recipes.publish')
  const { data: bahanList = [] } = useBahanOptions()
  const { data: equipmentList = [] } = useEquipmentOptions()

  const form = useForm<RecipeEditorValues>({
    // The schema only checks the fields that block saving, so its input type is narrower than the whole form.
    resolver: zodResolver(recipeEditorSchema) as unknown as Resolver<RecipeEditorValues>,
    defaultValues: record?.values ?? EMPTY_EDITOR_VALUES,
  })
  const {
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { isDirty },
  } = form
  const values = watch()

  // The slug follows the name until someone edits it by hand.
  const previousName = useRef(values.name)
  useEffect(() => {
    const currentSlug = getValues('slug')
    if (currentSlug === '' || currentSlug === slugify(previousName.current)) setValue('slug', slugify(values.name))
    previousName.current = values.name
  }, [values.name, getValues, setValue])

  // Estimated nutrition stops being "estimated" as soon as someone changes a value.
  const isNutritionEstimated =
    savedRecord?.nutritionEstimated === true &&
    JSON.stringify(values.nutrition) === JSON.stringify(savedRecord.values.nutrition)

  const bahanById = useMemo(() => new Map(bahanList.map((bahan) => [bahan.id, bahan])), [bahanList])
  const bahanNames = useMemo(() => new Map(bahanList.map((bahan) => [bahan.id, bahan.name])), [bahanList])
  const equipmentNames = useMemo(() => new Map(equipmentList.map((item) => [item.id, item.name])), [equipmentList])

  const checks = checkReadiness(values, { isNutritionEstimated, bahanById })
  const nutritionState = nutritionStateOf(values.nutrition, isNutritionEstimated)
  const blockerCount = checks.filter((check) => check.blocks).length

  // Leaving with unsaved changes asks first. A just-saved new recipe moves to its own URL, which must not ask.
  const isDirtyRef = useRef(false)
  isDirtyRef.current = isDirty
  const skipBlockRef = useRef(false)
  const blocker = useBlocker({
    shouldBlockFn: () => isDirtyRef.current && !skipBlockRef.current,
    enableBeforeUnload: () => isDirtyRef.current,
    withResolver: true,
  })

  const title = values.name.trim() || 'New recipe'
  const status = savedRecord?.status ?? 'draft'
  const version = savedRecord?.version ?? 0
  const isReadOnly = status === 'published' || status === 'archived'

  /** Saving and publishing end the same way: the saved values become the baseline, and a new recipe gets its own URL. */
  const adoptSaved = (saved: RecipeEditorRecord) => {
    const isFirstSave = savedRecord === null
    setSavedRecord(saved)
    reset(saved.values, { keepDirtyValues: true })
    if (isFirstSave) {
      skipBlockRef.current = true
      void navigate({ to: '/recipes/$recipeId/edit', params: { recipeId: saved.id }, replace: true })
    }
  }

  const onValid = () =>
    saveDraft.mutate(
      { id: savedRecord?.id, values: getValues(), nutritionEstimated: isNutritionEstimated },
      {
        onSuccess: (saved) => {
          setNote(`${STATUS_LABEL[saved.status]} · Saved just now`)
          adoptSaved(saved)
        },
      },
    )

  const onInvalid = (errors: FieldErrors<RecipeEditorValues>) => setTab(tabWithError(errors))

  const closeDialog = () => setDialog(null)
  const ref = { id: savedRecord?.id ?? '', name: title, version }

  const confirmLifecycle = (confirmed: LifecycleDialog) => {
    const done = { onSettled: closeDialog }
    if (confirmed === 'publish') {
      publish.mutate(
        { id: savedRecord?.id, values: getValues(), nutritionEstimated: isNutritionEstimated },
        {
          onSuccess: (saved) => {
            setNote(`Published · v${saved.version} · just now`)
            adoptSaved(saved)
          },
          ...done,
        },
      )
    } else if (confirmed === 'revision') {
      createRevision.mutate(ref, {
        onSuccess: (updated) => {
          setNote(null)
          setSavedRecord(updated)
        },
        ...done,
      })
    } else if (confirmed === 'unpublish') {
      unpublish.mutate(ref, {
        onSuccess: (updated) => {
          setNote('Draft · Unpublished just now · Hidden from users')
          setSavedRecord(updated)
        },
        ...done,
      })
    } else if (confirmed === 'archive') {
      archive.mutate(
        { id: ref.id, name: title, status },
        {
          onSuccess: () => {
            setNote(null)
            setSavedRecord((current) => current && { ...current, status: 'archived' })
          },
          ...done,
        },
      )
    } else {
      restore.mutate(
        { id: ref.id, name: title, status },
        {
          onSuccess: () => {
            setNote('Draft · Restored just now · Review before publishing')
            setSavedRecord((current) => current && { ...current, status: 'draft' })
          },
          ...done,
        },
      )
    }
  }

  const isLifecyclePending = publish.isPending || createRevision.isPending || unpublish.isPending || archive.isPending || restore.isPending
  const isBusy = saveDraft.isPending || isLifecyclePending

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          setNote(null)
          void handleSubmit(onValid, onInvalid)(event)
        }}
        className="flex flex-col gap-6"
      >
        <PageHeader
          breadcrumb={['Recipes', title]}
          title={title}
          description={subtitleOf({
            isNew: savedRecord === null,
            isSaving: saveDraft.isPending,
            isDirty,
            note,
            status,
            version,
            savedAt: savedRecord?.savedAt,
            canPublish,
            blockerCount,
          })}
          action={
            <RecipeEditorActions
              status={status}
              isSaved={savedRecord !== null}
              canPublish={canPublish}
              blockerCount={blockerCount}
              isSaving={saveDraft.isPending}
              isBusy={isBusy}
              onPreview={() => setIsPreviewOpen(true)}
              onPublish={() => setDialog('publish')}
              onCreateRevision={() => setDialog('revision')}
              onUnpublish={() => setDialog('unpublish')}
              onRestore={() => setDialog('restore')}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onArchive={() => setDialog('archive')}
            />
          }
        />

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <Tabs value={tab} onValueChange={(next) => setTab(next as EditorTab)}>
            <TabsList aria-label="Recipe sections">
              {EDITOR_TABS.map(({ value, label }) => (
                <TabsTrigger key={value} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={tab}>
              {/* A published or archived recipe is read-only: a disabled fieldset switches off every field inside it. */}
              <fieldset disabled={isReadOnly} className="m-0 min-w-0 border-0 p-0">
                {tab === 'info' && <InfoTab />}
                {tab === 'ingredients' && <IngredientsTab />}
                {tab === 'equipment' && <EquipmentTab />}
                {tab === 'steps' && <StepsTab />}
                {tab === 'nutrition' && <NutritionTab state={nutritionState} />}
                {tab === 'media' && <MediaTab />}
              </fieldset>
            </TabsContent>
          </Tabs>
          <div className="lg:pt-[3.25rem]">
            <PublishReadinessCard status={status === 'draft-revision' ? 'published' : status} checks={checks} />
          </div>
        </div>
      </form>

      <RecipePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        values={values}
        bahanNames={bahanNames}
        equipmentNames={equipmentNames}
      />

      {savedRecord && (
        <VersionHistoryDrawer open={isHistoryOpen} onOpenChange={setIsHistoryOpen} record={savedRecord} recipeName={title} />
      )}

      <RecipeLifecycleDialogs
        open={dialog}
        onClose={closeDialog}
        name={title}
        version={version}
        isRevision={status === 'draft-revision'}
        isPending={isLifecyclePending}
        onConfirm={confirmLifecycle}
      />

      <ConfirmDialog
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => !open && blocker.status === 'blocked' && blocker.reset()}
        title="Discard unsaved changes?"
        description="You have unsaved changes on this recipe. If you leave now, they will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        pendingLabel="Discarding…"
        isPending={false}
        onConfirm={() => blocker.status === 'blocked' && blocker.proceed()}
      />
    </FormProvider>
  )
}

const EditorSkeleton = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading recipe">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-56" />
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <Skeleton className="h-96" />
      <Skeleton className="h-64" />
    </div>
  </div>
)

type RecipeEditorPageProps = {
  /** Absent on "New Recipe". */
  recipeId?: string
}

export const RecipeEditorPage = ({ recipeId }: RecipeEditorPageProps) => {
  const { data: record, error, isLoading, refetch } = useRecipeRecord(recipeId)

  if (recipeId === undefined) return <RecipeEditor key="new" record={null} />

  if (isRecipeNotFound(error)) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader breadcrumb={['Recipes', 'Not found']} title="Recipe not found" description="This recipe may have been archived or removed." />
        <EmptyState
          title="Recipe not found"
          description="This recipe may have been archived or removed. Go back to the list to find another one."
          action={
            <Button asChild>
              <Link to="/recipes">Back to recipes</Link>
            </Button>
          }
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader breadcrumb={['Recipes', 'Recipe']} title="Recipe" description="Couldn’t load this recipe." />
        <ErrorState
          title="Couldn’t load recipe"
          description="Something went wrong while loading this recipe. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  if (isLoading || !record) return <EditorSkeleton />

  return <RecipeEditor key={record.id} record={record} />
}
