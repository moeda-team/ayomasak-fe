export type PageItem = number | 'ellipsis'

/** Page numbers with gaps collapsed: 1 2 3 … 67 68. Always shows the first two, last two and the neighbours of `current`. */
export const toPageItems = (current: number, pageCount: number): PageItem[] => {
  const wanted = new Set([1, 2, pageCount - 1, pageCount, current - 1, current, current + 1])
  const pages = [...wanted].filter((page) => page >= 1 && page <= pageCount).sort((a, b) => a - b)
  return pages.flatMap<PageItem>((page, index) => {
    const previous = pages[index - 1]
    return previous !== undefined && page - previous > 1 ? ['ellipsis', page] : [page]
  })
}
