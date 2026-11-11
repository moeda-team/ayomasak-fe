import { useRef, useState } from 'react'
import { FormField } from '@/components/shared/form-field'
import { SegmentedControl } from '@/components/shared/segmented-control'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DIALOG_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { isSupportedVideoLink, labelOfVideoLink, MAX_VIDEO_BYTES, VIDEO_ACCEPT } from './mock-media-upload'

type VideoSource = 'link' | 'file'

const SOURCE_OPTIONS = [
  { value: 'link', label: 'Paste link' },
  { value: 'file', label: 'Upload file' },
] as const satisfies readonly { value: VideoSource; label: string }[]

export type NewVideo = { source: 'link'; name: string } | { source: 'file'; file: File }

type AddVideoFormProps = {
  onSubmit: (video: NewVideo) => void
  onCancel: () => void
}

const AddVideoForm = ({ onSubmit, onCancel }: AddVideoFormProps) => {
  const [source, setSource] = useState<VideoSource>('link')
  const [link, setLink] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)

  const changeSource = (next: VideoSource) => {
    setSource(next)
    setError(undefined)
  }

  const submit = () => {
    if (source === 'link') {
      if (link.trim() === '') return setError('Paste a video link.')
      if (!isSupportedVideoLink(link)) return setError('This link is not supported. Use a YouTube or Vimeo link.')
      return onSubmit({ source: 'link', name: title.trim() || labelOfVideoLink(link) })
    }
    if (!file) return setError('Choose an MP4 file.')
    if (file.type !== 'video/mp4') return setError('Only MP4 files are supported.')
    if (file.size > MAX_VIDEO_BYTES) return setError('This file is over 100 MB.')
    onSubmit({ source: 'file', file })
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        // The dialog is portaled but still inside the editor form in the React tree; without this the editor saves too.
        event.stopPropagation()
        submit()
      }}
      className="flex flex-col gap-5 px-6 pb-2"
    >
      <div className="flex flex-col gap-2">
        <span className="text-body-sm">Source</span>
        <SegmentedControl label="Video source" value={source} options={[...SOURCE_OPTIONS]} onChange={changeSource} className="self-start" />
      </div>

      {source === 'link' ? (
        <>
          <FormField htmlFor="video-link" label="Video link" error={error} hint="Supports YouTube and Vimeo links.">
            <Input
              id="video-link"
              placeholder="https://youtube.com/watch?v=…"
              autoComplete="off"
              value={link}
              onChange={(event) => {
                setLink(event.target.value)
                setError(undefined)
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'video-link-error' : 'video-link-hint'}
              className="text-body-sm md:text-body-sm"
            />
          </FormField>
          <FormField htmlFor="video-title" label="Title (optional)">
            <Input
              id="video-title"
              placeholder="e.g. Tumis bumbu step"
              autoComplete="off"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="text-body-sm md:text-body-sm"
            />
          </FormField>
        </>
      ) : (
        <FormField htmlFor="video-file" label="Video file" error={error} hint="MP4, up to 100 MB.">
          <input
            ref={fileInput}
            id="video-file"
            type="file"
            accept={VIDEO_ACCEPT}
            className="sr-only"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setError(undefined)
            }}
          />
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()} className="justify-start">
            {file ? file.name : 'Choose file'}
          </Button>
        </FormField>
      )}

      <DialogFooter className="flex-row justify-end gap-3 pt-1 pb-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add video</Button>
      </DialogFooter>
    </form>
  )
}

type AddVideoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (video: NewVideo) => void
}

export const AddVideoDialog = ({ open, onOpenChange, onSubmit }: AddVideoDialogProps) => {
  // Keeps the form on screen while the dialog fades out; once it is gone the next opening starts empty.
  const isFormShown = useRetainedValue(open ? true : null, DIALOG_EXIT_MS) === true
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="gap-1 p-6 pb-4 text-left">
          <DialogTitle className="text-heading-3">Add video</DialogTitle>
          <DialogDescription className="text-body text-text-secondary">
            Upload a video file or paste a link. Videos show on the recipe detail page.
          </DialogDescription>
        </DialogHeader>
        {isFormShown && <AddVideoForm onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
