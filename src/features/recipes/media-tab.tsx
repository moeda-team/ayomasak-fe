import { CloudArrowUpIcon, ImageIcon, PlusIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useRef, useState, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormField } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DIALOG_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { cn } from '@/lib/utils'
import { AddVideoDialog, type NewVideo } from './add-video-dialog'
import { EditorSection } from './editor-section'
import { PHOTO_ACCEPT, photoWillFail, simulateUpload, videoWillFail } from './mock-media-upload'
import { newRowId } from './recipe-editor-config'
import { MAX_PHOTOS, MAX_VIDEOS, type PhotoItem, type RecipeEditorValues, type VideoItem } from './recipe-editor-types'
import { useFormRows } from './use-form-rows'

const TILE_CLASS = 'group relative flex h-34 w-42 flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center'

type TileProps = {
  tone?: 'default' | 'danger' | 'active'
  icon: ReactNode
  name: string
  children: ReactNode
  /** Delete button label; omit for a tile that cannot be deleted yet. */
  deleteLabel?: string
  onDelete?: () => void
}

const MediaTile = ({ tone = 'default', icon, name, children, deleteLabel, onDelete }: TileProps) => (
  <li
    className={cn(
      TILE_CLASS,
      tone === 'default' && 'border-border-default bg-surface-subtle',
      tone === 'danger' && 'border-status-danger bg-status-danger-subtle',
      tone === 'active' && 'border-border-focus bg-surface-brand-subtle',
    )}
  >
    {icon}
    <p className="w-full truncate text-caption text-text-secondary">{name}</p>
    <div className="flex flex-col items-center gap-1 text-caption">{children}</div>
    {onDelete && deleteLabel && (
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={deleteLabel}
        onClick={onDelete}
        className="absolute top-1.5 right-1.5 size-7 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        <TrashIcon aria-hidden />
      </Button>
    )}
  </li>
)

const AddTile = ({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) => (
  <li className="list-none">
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-34 w-42 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-default text-caption text-text-brand outline-none transition-colors hover:bg-surface-brand-subtle focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <PlusIcon aria-hidden className="size-6" />
      {label}
    </button>
  </li>
)

const ProgressBar = ({ percent }: { percent: number }) => (
  <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-1 w-24 overflow-hidden rounded-full bg-border-default">
    <div className="h-full rounded-full bg-text-brand transition-[width] duration-150 ease-out" style={{ width: `${percent}%` }} />
  </div>
)

type PendingDelete = { kind: 'photo' | 'video'; id: string; name: string; isCover: boolean }

export const MediaTab = () => {
  const photoRows = useFormRows('photos')
  const videoRows = useFormRows('videos')
  const { register } = useFormContext<RecipeEditorValues>()
  const photoInput = useRef<HTMLInputElement>(null)
  const [isAddingVideo, setIsAddingVideo] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)
  const shownDelete = useRetainedValue(pendingDelete, DIALOG_EXIT_MS)

  const { rows: photos } = photoRows
  const { rows: videos } = videoRows
  const hasFailedPhoto = photos.some((photo) => photo.status === 'failed')

  const runPhotoUpload = (id: string, shouldFail: boolean) =>
    simulateUpload(shouldFail, {
      onProgress: (progress) => photoRows.updateRow(id, { progress }),
      onDone: () => photoRows.updateRow(id, { status: 'uploaded', progress: 100 }),
      onFail: () => photoRows.updateRow(id, { status: 'failed', progress: 0 }),
    })

  const runVideoUpload = (id: string, shouldFail: boolean) =>
    simulateUpload(shouldFail, {
      onProgress: (progress) => videoRows.updateRow(id, { progress }),
      onDone: () => videoRows.updateRow(id, { status: 'uploaded', progress: 100, duration: '0:42' }),
      onFail: () => videoRows.updateRow(id, { status: 'broken', progress: 0 }),
    })

  const addPhotos = (files: FileList | null) => {
    const room = MAX_PHOTOS - photos.length
    Array.from(files ?? [])
      .slice(0, room)
      .forEach((file) => {
        const photo: PhotoItem = { id: newRowId(), name: file.name, status: 'uploading', progress: 0 }
        photoRows.addRow(photo)
        runPhotoUpload(photo.id, photoWillFail(file))
      })
  }

  const retryPhoto = (photo: PhotoItem) => {
    photoRows.updateRow(photo.id, { status: 'uploading', progress: 0 })
    runPhotoUpload(photo.id, false)
  }

  const makeCover = (photo: PhotoItem) => photoRows.setRows([photo, ...photos.filter((other) => other.id !== photo.id)])

  const addVideo = (video: NewVideo) => {
    setIsAddingVideo(false)
    if (video.source === 'link') {
      videoRows.addRow({ id: newRowId(), name: video.name, source: 'link', status: 'uploaded', progress: 100 })
      return
    }
    const item: VideoItem = { id: newRowId(), name: video.file.name, source: 'file', status: 'uploading', progress: 0 }
    videoRows.addRow(item)
    runVideoUpload(item.id, videoWillFail(video.file))
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    if (pendingDelete.kind === 'photo') photoRows.removeRow(pendingDelete.id)
    else videoRows.removeRow(pendingDelete.id)
    setPendingDelete(null)
  }

  const footnote = `${photos.length} of ${MAX_PHOTOS} photos, ${videos.length} of ${MAX_VIDEOS} videos. Photos: JPG or PNG, up to 5 MB. Videos: MP4 up to 100 MB, or a YouTube link.`

  return (
    <>
      <EditorSection title="Media" description="Photos and videos shown to users. The first photo is the cover.">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="media-photos" className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 id="media-photos" className="text-body-strong">
                  Photos
                </h3>
                <p className="text-caption text-text-secondary">The first photo is the cover shown in recipe lists.</p>
              </div>
              <Button type="button" variant="outline" disabled={photos.length >= MAX_PHOTOS} onClick={() => photoInput.current?.click()}>
                Upload photos
              </Button>
            </div>
            <input
              ref={photoInput}
              type="file"
              accept={PHOTO_ACCEPT}
              multiple
              aria-label="Choose photos to upload"
              className="sr-only"
              onChange={(event) => {
                addPhotos(event.target.files)
                event.target.value = ''
              }}
            />
            <ul className="flex flex-wrap gap-4">
              {photos.map((photo, index) => {
                const deletion = { deleteLabel: `Delete ${photo.name}`, onDelete: () => setPendingDelete({ kind: 'photo', id: photo.id, name: photo.name, isCover: index === 0 }) }
                if (photo.status === 'uploading') {
                  return (
                    <MediaTile key={photo.id} icon={<CloudArrowUpIcon aria-hidden className="size-6 text-text-brand" />} name={photo.name}>
                      <span className="text-text-brand">Uploading {photo.progress}%</span>
                      <ProgressBar percent={photo.progress} />
                    </MediaTile>
                  )
                }
                if (photo.status === 'failed') {
                  return (
                    <MediaTile
                      key={photo.id}
                      tone="danger"
                      icon={<WarningCircleIcon aria-hidden className="size-6 text-status-danger" />}
                      name={photo.name}
                      {...deletion}
                    >
                      <span className="text-text-danger">
                        Upload failed.{' '}
                        <button type="button" onClick={() => retryPhoto(photo)} className="underline underline-offset-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                          Retry
                        </button>
                      </span>
                    </MediaTile>
                  )
                }
                return (
                  <MediaTile key={photo.id} icon={<ImageIcon aria-hidden className="size-6 text-text-secondary" />} name={photo.name} {...deletion}>
                    {index === 0 ? (
                      <span className="text-text-brand">Cover photo</span>
                    ) : (
                      <>
                        <span className="text-text-secondary group-focus-within:hidden group-hover:hidden">Photo</span>
                        <button
                          type="button"
                          onClick={() => makeCover(photo)}
                          className="hidden text-text-brand underline underline-offset-2 outline-none group-focus-within:inline group-hover:inline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          Make cover
                        </button>
                      </>
                    )}
                  </MediaTile>
                )
              })}
              <AddTile label="Add photo" disabled={photos.length >= MAX_PHOTOS} onClick={() => photoInput.current?.click()} />
            </ul>
            {hasFailedPhoto && (
              <>
                <div role="alert" className="flex items-center gap-3 rounded-lg border border-status-danger bg-status-danger-subtle px-4 py-3 text-body-sm text-text-danger">
                  <WarningCircleIcon aria-hidden className="size-5 shrink-0" />
                  {photos.filter((photo) => photo.status === 'failed').length} photo failed to upload. Retry, or paste an image URL instead.
                </div>
                <FormField htmlFor="recipe-image-url" label="Image URL (fallback)" hint="The image is fetched when you save.">
                  <Input id="recipe-image-url" placeholder="https://" autoComplete="off" className="text-body-sm md:text-body-sm" {...register('imageUrl')} />
                </FormField>
              </>
            )}
          </section>

          <section aria-labelledby="media-videos" className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h3 id="media-videos" className="text-body-strong">
                  Videos
                </h3>
                <p className="text-caption text-text-secondary">Tutorial clips shown on the recipe detail page. Upload a file or paste a link.</p>
              </div>
              <Button type="button" variant="outline" disabled={videos.length >= MAX_VIDEOS} onClick={() => setIsAddingVideo(true)}>
                Add video
              </Button>
            </div>
            <ul className="flex flex-wrap gap-4">
              {videos.map((video) => {
                const deletion = { deleteLabel: `Delete ${video.name}`, onDelete: () => setPendingDelete({ kind: 'video', id: video.id, name: video.name, isCover: false }) }
                if (video.status === 'uploading') {
                  return (
                    <MediaTile key={video.id} tone="active" icon={<CloudArrowUpIcon aria-hidden className="size-6 text-text-brand" />} name={video.name}>
                      <span className="text-text-brand">Uploading… {video.progress}%</span>
                      <ProgressBar percent={video.progress} />
                    </MediaTile>
                  )
                }
                if (video.status === 'broken') {
                  return (
                    <MediaTile key={video.id} tone="danger" icon={<WarningCircleIcon aria-hidden className="size-6 text-status-danger" />} name={video.name} {...deletion}>
                      <span className="text-text-danger">Video unavailable · Link broken</span>
                    </MediaTile>
                  )
                }
                return (
                  <MediaTile key={video.id} icon={<ImageIcon aria-hidden className="size-6 text-text-secondary" />} name={video.name} {...deletion}>
                    <span className="text-text-secondary">
                      {video.source === 'link' ? 'Video · External link' : `Video · ${video.duration ?? '0:00'} · Uploaded`}
                    </span>
                  </MediaTile>
                )
              })}
              <AddTile label="Add video" disabled={videos.length >= MAX_VIDEOS} onClick={() => setIsAddingVideo(true)} />
            </ul>
          </section>

          <p className="text-caption text-text-secondary">
            {photos.length === 0 ? 'No photos yet. Recipes with a cover photo get more views. ' : ''}
            {footnote}
          </p>
        </div>
      </EditorSection>

      <AddVideoDialog open={isAddingVideo} onOpenChange={setIsAddingVideo} onSubmit={addVideo} />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={shownDelete?.kind === 'video' ? 'Delete this video?' : 'Delete this photo?'}
        description={
          shownDelete
            ? `${shownDelete.name} will be removed from this recipe.${shownDelete.isCover ? ' The next photo becomes the cover.' : ''}`
            : ''
        }
        confirmLabel={shownDelete?.kind === 'video' ? 'Delete video' : 'Delete photo'}
        pendingLabel="Deleting…"
        isPending={false}
        onConfirm={confirmDelete}
      />
    </>
  )
}
