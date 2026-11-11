import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { fetchMediaList, fetchMediaRecipes, PROCESSING_MS, uploadMedia, type UploadFile } from './mock-media-api'
import type { MediaListParams } from './media-types'

export const MEDIA_KEY = ['media-library'] as const

export const useMediaList = (params: MediaListParams) =>
  useQuery({
    queryKey: [...MEDIA_KEY, 'list', params],
    queryFn: () => fetchMediaList(params),
    placeholderData: keepPreviousData,
  })

/** Recipes shown in the Recipe filter. */
export const useMediaRecipes = () => useQuery({ queryKey: [...MEDIA_KEY, 'recipes'], queryFn: fetchMediaRecipes })

export const useUploadMedia = () => {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
  return useMutation({
    mutationFn: (files: UploadFile[]) => uploadMedia(files),
    onSuccess: (added) => {
      notify.success({
        title: 'Media uploaded',
        description: `${added.length === 1 ? added[0]?.name : `${added.length} files`} added to the library. It is unused until a recipe uses it.`,
      })
      void refresh()
      // Processing finishes a moment later; look again so the card changes from "Processing".
      setTimeout(() => void refresh(), PROCESSING_MS + 200)
    },
    onError: () =>
      notify.error({
        title: 'Couldn’t upload media',
        description: 'Nothing was added. Use JPG or PNG photos up to 5 MB, or MP4 videos up to 100 MB, and try again.',
      }),
  })
}
