import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import {
  mapShopifyCollectionSortOrder,
  type ShopifyCollectionSummary,
} from '@/lib/shopify-collections'

export type ShopifyCollectionsListResult = {
  collections: ShopifyCollectionSummary[]
  error: string | null
}

type CollectionsListQueryResponse = {
  collections: {
    nodes: CollectionNodeWithProducts[]
  }
}

type CollectionImageFields = {
  url?: string | null
  altText?: string | null
}

type CollectionProductNode = {
  featuredImage?: CollectionImageFields | null
  images?: { nodes: CollectionImageFields[] }
}

type CollectionNodeWithProducts = {
  id: string
  title: string
  handle: string
  image?: CollectionImageFields | null
  sortOrder?: string | null
  productsCount?: { count?: number | null } | null
  products?: { nodes: CollectionProductNode[] }
}

const COLLECTION_PRODUCT_COUNT_FRAGMENT = `
  productsCount {
    count
  }
`

type CollectionDetailResponse = {
  collection: CollectionNodeWithProducts | null
}

type CollectionByHandleResponse = {
  collectionByHandle: CollectionNodeWithProducts | null
}

const COLLECTION_PRODUCTS_FRAGMENT = `
  products(first: 1) {
    nodes {
      featuredImage {
        url
        altText
      }
      images(first: 1) {
        nodes {
          url
          altText
        }
      }
    }
  }
`

function resolveCollectionImage(node: CollectionNodeWithProducts): {
  imageUrl: string
  imageAlt: string
} {
  const collectionUrl = node.image?.url?.trim()
  if (collectionUrl) {
    return {
      imageUrl: collectionUrl,
      imageAlt: node.image?.altText?.trim() || node.title,
    }
  }

  const firstProduct = node.products?.nodes?.[0]
  const featuredUrl = firstProduct?.featuredImage?.url?.trim()
  if (featuredUrl) {
    return {
      imageUrl: featuredUrl,
      imageAlt: firstProduct?.featuredImage?.altText?.trim() || node.title,
    }
  }

  const fallbackImage = firstProduct?.images?.nodes?.[0]
  const fallbackUrl = fallbackImage?.url?.trim()
  if (fallbackUrl) {
    return {
      imageUrl: fallbackUrl,
      imageAlt: fallbackImage?.altText?.trim() || node.title,
    }
  }

  return { imageUrl: '', imageAlt: node.title }
}

function resolveProductCount(node: CollectionNodeWithProducts): number {
  const count = node.productsCount?.count
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 0) return 0
  return count
}

function mapCollectionNode(node: CollectionNodeWithProducts): ShopifyCollectionSummary {
  const { imageUrl, imageAlt } = resolveCollectionImage(node)
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    imageUrl,
    imageAlt,
    productCount: resolveProductCount(node),
    sortOrder: String(node.sortOrder ?? '').trim() || undefined,
  }
}

export async function fetchShopifyCollectionDetail(
  selection: { collectionId?: string; collectionHandle?: string }
): Promise<ShopifyCollectionSummary | null> {
  if (!isShopifyConfigured()) return null

  const access = await ensureProductsReadAccess()
  if (!access.ok) return null

  const id = String(selection.collectionId ?? '').trim()
  const handle = String(selection.collectionHandle ?? '').trim()

  try {
    if (id) {
      const data = await shopifyAdminGraphql<CollectionDetailResponse>(
        `
          query ShopifyCollectionById($id: ID!) {
            collection(id: $id) {
              id
              title
              handle
              image {
                url
                altText
              }
              ${COLLECTION_PRODUCT_COUNT_FRAGMENT}
              ${COLLECTION_PRODUCTS_FRAGMENT}
            }
          }
        `,
        { id }
      )
      return data.collection ? mapCollectionNode(data.collection) : null
    }

    if (handle) {
      const data = await shopifyAdminGraphql<CollectionByHandleResponse>(
        `
          query ShopifyCollectionByHandle($handle: String!) {
            collectionByHandle(handle: $handle) {
              id
              title
              handle
              image {
                url
                altText
              }
              ${COLLECTION_PRODUCT_COUNT_FRAGMENT}
              ${COLLECTION_PRODUCTS_FRAGMENT}
            }
          }
        `,
        { handle }
      )
      return data.collectionByHandle ? mapCollectionNode(data.collectionByHandle) : null
    }

    return null
  } catch (e) {
    console.error('fetchShopifyCollectionDetail error:', e)
    return null
  }
}

async function ensureProductsReadAccess(): Promise<{ ok: true } | { ok: false; message: string | null }> {
  const connection = await getShopifyConnectionStatus()
  if (!connection.connected) {
    return { ok: false, message: connection.message }
  }
  if (connection.missingScopes.some((scope) => scope.handle === 'read_products')) {
    return { ok: false, message: connection.message }
  }
  return { ok: true }
}

export async function fetchShopifyCollectionsList(): Promise<ShopifyCollectionsListResult> {
  if (!isShopifyConfigured()) {
    return { collections: [], error: 'Shopify is not configured.' }
  }

  const access = await ensureProductsReadAccess()
  if (!access.ok) {
    return { collections: [], error: access.message }
  }

  try {
    const data = await shopifyAdminGraphql<CollectionsListQueryResponse>(
      `
        query ShopifyCollectionsList {
          collections(first: 100, sortKey: TITLE) {
            nodes {
              id
              title
              handle
              image {
                url
                altText
              }
              ${COLLECTION_PRODUCT_COUNT_FRAGMENT}
              ${COLLECTION_PRODUCTS_FRAGMENT}
            }
          }
        }
      `
    )

    return {
      collections: data.collections.nodes
        .map((collection) => mapCollectionNode(collection))
        .sort((a, b) => a.title.localeCompare(b.title)),
      error: null,
    }
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Failed to load collections'
    console.error('fetchShopifyCollectionsList error:', e)

    if (isShopifyAccessDeniedError(e)) {
      const connection = await getShopifyConnectionStatus()
      return {
        collections: [],
        error:
          connection.message ??
          'Shopify denied collection access. Enable read_products on this store app.',
      }
    }

    return { collections: [], error: detail }
  }
}

export type ShopifyCollectionProduct = {
  id: string
  title: string
  handle: string
  imageUrl: string
  imageAlt: string
  priceAmount: string
  priceCurrency: string
  compareAtAmount: string
  compareAtCurrency: string
  available: boolean
  createdAt: string
  tags: string[]
}

type ShopifyProductCardNode = {
  id: string
  title: string
  handle: string
  createdAt?: string | null
  tags?: string[] | null
  totalInventory?: number | null
  featuredImage?: CollectionImageFields | null
  priceRangeV2?: {
    minVariantPrice?: { amount?: string | null; currencyCode?: string | null } | null
  } | null
  compareAtPriceRange?: {
    minVariantCompareAtPrice?: { amount?: string | null; currencyCode?: string | null } | null
  } | null
}

type CollectionProductsConnection = {
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } | null
  nodes: ShopifyProductCardNode[]
}

type CollectionProductsQueryNode = CollectionNodeWithProducts & {
  products?: CollectionProductsConnection
}

function mapCollectionProduct(node: ShopifyProductCardNode): ShopifyCollectionProduct {
  const inventory = typeof node.totalInventory === 'number' ? node.totalInventory : null
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    imageUrl: node.featuredImage?.url?.trim() ?? '',
    imageAlt: node.featuredImage?.altText?.trim() || node.title,
    priceAmount: node.priceRangeV2?.minVariantPrice?.amount ?? '',
    priceCurrency: node.priceRangeV2?.minVariantPrice?.currencyCode ?? 'USD',
    compareAtAmount: node.compareAtPriceRange?.minVariantCompareAtPrice?.amount ?? '',
    compareAtCurrency:
      node.compareAtPriceRange?.minVariantCompareAtPrice?.currencyCode ??
      node.priceRangeV2?.minVariantPrice?.currencyCode ??
      'USD',
    available: inventory === null ? true : inventory > 0,
    createdAt: String(node.createdAt ?? '').trim(),
    tags: Array.isArray(node.tags)
      ? node.tags.map((tag) => String(tag ?? '').trim()).filter(Boolean)
      : [],
  }
}

const PRODUCT_CARD_FIELDS = `
  id
  title
  handle
  createdAt
  tags
  totalInventory
  featuredImage {
    url
    altText
  }
  priceRangeV2 {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantCompareAtPrice {
      amount
      currencyCode
    }
  }
`

export type ShopifyCollectionProductsPageResult = {
  collection: ShopifyCollectionSummary | null
  products: ShopifyCollectionProduct[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
  /** Sort value for the Sort by dropdown (from request or Shopify collection). */
  appliedSort: string
  /** Merchant-configured collection sort mapped to storefront sort ids. */
  collectionSort: string
  error?: string
}

type CollectionSortGraphql = {
  sortKey: string
  reverse: boolean
}

/** Map storefront sort ids to Admin API ProductCollectionSortKeys / ProductSortKeys. */
export function resolveShopifyCollectionSort(sort: string): CollectionSortGraphql {
  switch (sort) {
    case 'shopify':
    case 'collection-default':
      return { sortKey: 'COLLECTION_DEFAULT', reverse: false }
    case 'best-selling':
      return { sortKey: 'BEST_SELLING', reverse: false }
    case 'title-asc':
      return { sortKey: 'TITLE', reverse: false }
    case 'title-desc':
      return { sortKey: 'TITLE', reverse: true }
    case 'price-asc':
      return { sortKey: 'PRICE', reverse: false }
    case 'price-desc':
      return { sortKey: 'PRICE', reverse: true }
    case 'created-asc':
      return { sortKey: 'CREATED', reverse: false }
    case 'created-desc':
      return { sortKey: 'CREATED', reverse: true }
    case 'manual':
    default:
      return { sortKey: 'MANUAL', reverse: false }
  }
}

/**
 * Admin API `ProductSortKeys` (Shop.products) — no BEST_SELLING / PRICE / MANUAL.
 * @see https://shopify.dev/docs/api/admin-graphql/latest/enums/ProductSortKeys
 */
function resolveAllProductsSort(sort: string): CollectionSortGraphql {
  switch (sort) {
    case 'title-asc':
      return { sortKey: 'TITLE', reverse: false }
    case 'title-desc':
      return { sortKey: 'TITLE', reverse: true }
    case 'created-asc':
      return { sortKey: 'CREATED_AT', reverse: false }
    case 'created-desc':
    case 'best-selling':
    case 'manual':
    case 'price-asc':
    case 'price-desc':
    case 'shopify':
    case 'collection-default':
    default:
      // Closest safe defaults when Admin ProductSortKeys has no price/best-selling.
      return { sortKey: 'CREATED_AT', reverse: true }
  }
}

export async function fetchShopifyCollectionProductsPage(options: {
  collectionId?: string
  collectionHandle?: string
  first?: number
  after?: string | null
  /** Storefront sort id, or `shopify` / omit to use the collection's Shopify sortOrder. */
  sort?: string | null
}): Promise<ShopifyCollectionProductsPageResult> {
  const empty: ShopifyCollectionProductsPageResult = {
    collection: null,
    products: [],
    pageInfo: { hasNextPage: false, endCursor: null },
    appliedSort: 'manual',
    collectionSort: 'manual',
  }

  if (!isShopifyConfigured()) {
    return { ...empty, error: 'Shopify is not configured' }
  }

  const access = await ensureProductsReadAccess()
  if (!access.ok) {
    return {
      ...empty,
      error:
        access.message ??
        'Shopify denied collection access. Enable read_products on this store app.',
    }
  }

  const first = Math.min(Math.max(options.first ?? 24, 1), 50)
  const after = String(options.after ?? '').trim() || null
  const id = String(options.collectionId ?? '').trim()
  const handle = String(options.collectionHandle ?? '').trim()
  const isAll = handle.toLowerCase() === 'all' && !id
  const rawSort = String(options.sort ?? '').trim()
  const useShopifyCollectionSort =
    !rawSort || rawSort === 'shopify' || rawSort === 'collection-default'

  try {
    if (isAll) {
      const appliedSort = useShopifyCollectionSort ? 'created-desc' : rawSort
      const { sortKey, reverse } = resolveAllProductsSort(appliedSort)
      const data = await shopifyAdminGraphql<{
        products: CollectionProductsConnection | null
      }>(
        `
          query ShopifyAllProductsPage($first: Int!, $after: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
            products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                ${PRODUCT_CARD_FIELDS}
              }
            }
          }
        `,
        { first, after, sortKey, reverse }
      )

      const products = data.products?.nodes?.map(mapCollectionProduct) ?? []
      const hasNextPage = Boolean(data.products?.pageInfo?.hasNextPage)
      return {
        collection: {
          id: 'all',
          title: 'All products',
          handle: 'all',
          productCount: 0,
        },
        products,
        pageInfo: {
          hasNextPage,
          endCursor: data.products?.pageInfo?.endCursor ?? null,
        },
        appliedSort,
        collectionSort: 'created-desc',
      }
    }

    const { sortKey, reverse } = useShopifyCollectionSort
      ? resolveShopifyCollectionSort('shopify')
      : resolveShopifyCollectionSort(rawSort)

    if (id) {
      const data = await shopifyAdminGraphql<{ collection: CollectionProductsQueryNode | null }>(
        `
          query ShopifyCollectionProductsPageById(
            $id: ID!
            $first: Int!
            $after: String
            $sortKey: ProductCollectionSortKeys!
            $reverse: Boolean!
          ) {
            collection(id: $id) {
              id
              title
              handle
              sortOrder
              image {
                url
                altText
              }
              ${COLLECTION_PRODUCT_COUNT_FRAGMENT}
              products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  ${PRODUCT_CARD_FIELDS}
                }
              }
            }
          }
        `,
        { id, first, after, sortKey, reverse }
      )

      const collection = data.collection ? mapCollectionNode(data.collection) : null
      const collectionSort = mapShopifyCollectionSortOrder(data.collection?.sortOrder)
      const products = data.collection?.products?.nodes?.map(mapCollectionProduct) ?? []
      return {
        collection,
        products,
        pageInfo: {
          hasNextPage: Boolean(data.collection?.products?.pageInfo?.hasNextPage),
          endCursor: data.collection?.products?.pageInfo?.endCursor ?? null,
        },
        appliedSort: useShopifyCollectionSort ? collectionSort : rawSort,
        collectionSort,
      }
    }

    if (handle) {
      const data = await shopifyAdminGraphql<{
        collectionByHandle: CollectionProductsQueryNode | null
      }>(
        `
          query ShopifyCollectionProductsPageByHandle(
            $handle: String!
            $first: Int!
            $after: String
            $sortKey: ProductCollectionSortKeys!
            $reverse: Boolean!
          ) {
            collectionByHandle(handle: $handle) {
              id
              title
              handle
              sortOrder
              image {
                url
                altText
              }
              ${COLLECTION_PRODUCT_COUNT_FRAGMENT}
              products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  ${PRODUCT_CARD_FIELDS}
                }
              }
            }
          }
        `,
        { handle, first, after, sortKey, reverse }
      )

      const collection = data.collectionByHandle
        ? mapCollectionNode(data.collectionByHandle)
        : null
      const collectionSort = mapShopifyCollectionSortOrder(data.collectionByHandle?.sortOrder)
      const products = data.collectionByHandle?.products?.nodes?.map(mapCollectionProduct) ?? []
      return {
        collection,
        products,
        pageInfo: {
          hasNextPage: Boolean(data.collectionByHandle?.products?.pageInfo?.hasNextPage),
          endCursor: data.collectionByHandle?.products?.pageInfo?.endCursor ?? null,
        },
        appliedSort: useShopifyCollectionSort ? collectionSort : rawSort,
        collectionSort,
      }
    }

    return empty
  } catch (e) {
    console.error('fetchShopifyCollectionProductsPage error:', e)
    return {
      ...empty,
      error: e instanceof Error ? e.message : 'Failed to load collection products',
    }
  }
}

export async function fetchShopifyCollectionWithProducts(
  selection: { collectionId?: string; collectionHandle?: string },
  productCount = 8
): Promise<{ collection: ShopifyCollectionSummary | null; products: ShopifyCollectionProduct[] }> {
  const limit = Math.min(Math.max(productCount, 1), 24)
  const page = await fetchShopifyCollectionProductsPage({
    collectionId: selection.collectionId,
    collectionHandle: selection.collectionHandle,
    first: limit,
    sort: 'shopify',
  })
  return { collection: page.collection, products: page.products }
}

/** Fetch product cards by handle, preserving request order. Missing handles are skipped. */
export async function fetchShopifyProductsByHandles(
  handles: string[]
): Promise<{ products: ShopifyCollectionProduct[]; error?: string }> {
  if (!isShopifyConfigured()) {
    return { products: [], error: 'Shopify is not configured' }
  }

  const access = await ensureProductsReadAccess()
  if (!access.ok) {
    return {
      products: [],
      error:
        access.message ??
        'Shopify denied product access. Enable read_products on this store app.',
    }
  }

  const seen = new Set<string>()
  const unique: string[] = []
  for (const raw of handles) {
    const handle = String(raw ?? '').trim()
    if (!handle) continue
    const key = handle.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(handle)
    if (unique.length >= 24) break
  }

  if (!unique.length) return { products: [] }

  const varDecls = unique.map((_, i) => `$h${i}: String!`).join(', ')
  const selections = unique
    .map(
      (_, i) => `
      p${i}: productByHandle(handle: $h${i}) {
        ${PRODUCT_CARD_FIELDS}
      }`
    )
    .join('\n')
  const variables: Record<string, string> = {}
  unique.forEach((handle, i) => {
    variables[`h${i}`] = handle
  })

  try {
    const data = await shopifyAdminGraphql<Record<string, ShopifyProductCardNode | null>>(
      `
        query ProductsByHandles(${varDecls}) {
          ${selections}
        }
      `,
      variables
    )

    const products: ShopifyCollectionProduct[] = []
    for (let i = 0; i < unique.length; i++) {
      const node = data[`p${i}`]
      if (!node?.id || !node.handle) continue
      products.push(mapCollectionProduct(node))
    }
    return { products }
  } catch (e) {
    console.error('fetchShopifyProductsByHandles error:', e)
    return {
      products: [],
      error: e instanceof Error ? e.message : 'Failed to load products by handle',
    }
  }
}
