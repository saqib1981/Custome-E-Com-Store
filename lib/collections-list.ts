import type { CollectionCardTitlePosition } from '@/lib/collection-cards'

export type CollectionsListColumnsDesktop = 2 | 3 | 4
export type CollectionsListPaginationMode = 'pagination' | 'load-more'

export const COLLECTIONS_LIST_PAGE_SIZE = 24
export const COLLECTIONS_LIST_EDGE_PADDING_CLASS = 'p-[10px]'

export type CollectionsListConfig = {
  enabled: boolean
  titlePosition: CollectionCardTitlePosition
  pageTitle: string
  columnsDesktop: CollectionsListColumnsDesktop
  pageSize: number
  paginationMode: CollectionsListPaginationMode
}

export const COLLECTIONS_LIST_SETTING_KEY = 'collections-list'

export const DEFAULT_COLLECTIONS_LIST: CollectionsListConfig = {
  enabled: true,
  titlePosition: 'overlay',
  pageTitle: 'Collections',
  columnsDesktop: 4,
  pageSize: COLLECTIONS_LIST_PAGE_SIZE,
  paginationMode: 'pagination',
}

function normalizePageSize(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return COLLECTIONS_LIST_PAGE_SIZE
  return Math.min(48, Math.max(1, Math.round(parsed)))
}

export function normalizeCollectionsListConfig(
  input: Partial<CollectionsListConfig> | null | undefined
): CollectionsListConfig {
  const columns = input?.columnsDesktop
  const columnsDesktop: CollectionsListColumnsDesktop =
    columns === 2 || columns === 3 || columns === 4 ? columns : DEFAULT_COLLECTIONS_LIST.columnsDesktop

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_COLLECTIONS_LIST.enabled),
    titlePosition: input?.titlePosition === 'below' ? 'below' : 'overlay',
    pageTitle: String(input?.pageTitle ?? DEFAULT_COLLECTIONS_LIST.pageTitle).trim(),
    columnsDesktop,
    pageSize: normalizePageSize(input?.pageSize),
    paginationMode: input?.paginationMode === 'load-more' ? 'load-more' : 'pagination',
  }
}

export function collectionsListConfigsEqual(a: CollectionsListConfig, b: CollectionsListConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.titlePosition === b.titlePosition &&
    a.pageTitle === b.pageTitle &&
    a.columnsDesktop === b.columnsDesktop &&
    a.pageSize === b.pageSize &&
    a.paginationMode === b.paginationMode
  )
}

export function collectionsListPageCount(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1
  return Math.ceil(totalItems / pageSize)
}

export function sliceCollectionsListPage<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function collectionsListGridClass(columnsDesktop: CollectionsListColumnsDesktop): string {
  switch (columnsDesktop) {
    case 2:
      return 'grid-cols-2'
    case 3:
      return 'grid-cols-2 sm:grid-cols-3'
    case 4:
    default:
      return 'grid-cols-2 sm:grid-cols-4'
  }
}

/** Bootstrap row classes for responsive collection cards on the /collections page. */
export function collectionsListBootstrapRowClass(columnsDesktop: CollectionsListColumnsDesktop): string {
  switch (columnsDesktop) {
    case 2:
      return 'row row-cols-2 g-2'
    case 3:
      return 'row row-cols-2 row-cols-sm-3 g-2'
    case 4:
    default:
      return 'row row-cols-2 row-cols-sm-4 g-2'
  }
}
