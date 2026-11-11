import type { Tone } from '@/components/shared/tone'
import type { ReviewItem, ReviewKind, ReviewSource } from './review-types'

export const KIND_LABEL: Record<ReviewKind, string> = {
  bahan: 'Bahan',
  equipment: 'Equipment',
  unmapped: 'Unmapped',
}

/** Tab names use the longer wording for unmapped input. */
export const KIND_TAB_LABEL: Record<ReviewKind, string> = {
  bahan: 'Bahan',
  equipment: 'Equipment',
  unmapped: 'Unmapped input',
}

export const KIND_TONE: Record<ReviewKind, Tone> = {
  bahan: 'info',
  equipment: 'brand',
  unmapped: 'warning',
}

/** Row label of a source, e.g. "Input user · diketik 8 kali". */
export const sourceLabelOf = (source: ReviewSource) =>
  source.kind === 'input-user' ? `Input user · diketik ${source.typedCount} kali` : `Admin · ${source.adminName}`

/** Filter label of a source: input from users is one group, each admin is their own. */
export const sourceGroupLabelOf = (source: ReviewSource) => (source.kind === 'input-user' ? 'Input user' : `Admin · ${source.adminName}`)

export const sourceKeyOf = (source: ReviewSource) => (source.kind === 'input-user' ? 'input-user' : `admin:${source.adminName}`)

/** Second line under the item name. */
export const itemSubtitleOf = (item: Pick<ReviewItem, 'kind' | 'aliases'>) =>
  item.kind === 'unmapped' ? 'Belum dikenali master data' : item.aliases.length > 0 ? `Alias: ${item.aliases.join(', ')}` : null
