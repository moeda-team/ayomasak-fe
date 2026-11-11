import { PlusIcon } from '@phosphor-icons/react'
import { useRef } from 'react'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { STATUS_LABEL, TYPE_LABEL } from './media-config'
import { MediaFilters } from './media-filters'
import { MediaGrid } from './media-grid'
import { NO_RECIPE } from './media-types'
import { useMediaList, useUploadMedia } from './use-media'
import { PAGE_SIZE_OPTIONS, useMediaListParams } from './use-media-list-params'

const ACCEPT = 'image/jpeg,image/png,video/mp4'

export const MediaLibraryPage = () => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useMediaListParams()
  const { data, error, isLoading, isPlaceholderData, refetch } = useMediaList(params)
  const uploadMedia = useUploadMedia()
  const fileInput = useRef<HTMLInputElement>(null)

  const chooseFiles = () => fileInput.current?.click()

  const chips: FilterChip[] = [
    ...(params.type !== 'all'
      ? [{ key: 'type', label: `Type: ${TYPE_LABEL[params.type]}`, onRemove: () => changeFilters({ type: 'all' }) }]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
    ...(params.recipe !== 'all'
      ? [
          {
            key: 'recipe',
            label: `Recipe: ${params.recipe === NO_RECIPE ? 'No recipe linked' : params.recipe}`,
            onRemove: () => changeFilters({ recipe: 'all' }),
          },
        ]
      : []),
  ]

  const uploadButton = (
    <Button onClick={chooseFiles} disabled={uploadMedia.isPending}>
      <PlusIcon aria-hidden />
      {uploadMedia.isPending ? 'Uploading…' : 'Upload media'}
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Media Library']}
        title="Media Library"
        description="Browse, reuse and clean up photos and videos uploaded across all recipes."
        action={uploadButton}
      />
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={ACCEPT}
        aria-label="Choose photos or videos to upload"
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [], ({ name, type, size }) => ({ name, type, size }))
          event.target.value = ''
          if (files.length > 0) uploadMedia.mutate(files)
        }}
      />

      <div className="flex flex-col gap-3">
        <MediaFilters searchInput={searchInput} onSearchInputChange={setSearchInput} params={params} onChange={changeFilters} />
        {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <MediaGrid
        items={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={reset}
        uploadAction={uploadButton}
        skeletonCount={params.pageSize}
      />

      {data && data.total > 0 && (
        <DataTablePagination
          page={params.page}
          pageSize={params.pageSize}
          total={data.total}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={goToPage}
          onPageSizeChange={(pageSize) => changeFilters({ pageSize })}
        />
      )}
    </div>
  )
}
