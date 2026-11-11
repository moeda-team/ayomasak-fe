import { createFileRoute } from '@tanstack/react-router'
import { MediaLibraryPage } from '@/features/media-library/media-library-page'

export const Route = createFileRoute('/_app/media-library')({
  component: MediaLibraryPage,
})
