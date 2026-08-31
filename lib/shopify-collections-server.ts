import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import type { ShopifyCollectionSummary } from '@/lib/shopify-collections'

export type ShopifyCollectionsListResult = {
  collections: ShopifyCollectionSummary[]
  error: string | null
}

type CollectionsListQueryResponse = {
  collections: {
    nodes: Array<{
      id: string
      title: string
      handle: string
      image?: { url?: string | null; altText?: string | null } | null
    }>
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
  products?: { nodes: CollectionProductNode[] }
}

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

function mapCollectionNode(node: CollectionNodeWithProducts): ShopifyCollectionSummary {
  const { imageUrl, imageAlt } = resolveCollectionImage(node)
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    imageUrl,
    imageAlt,
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
