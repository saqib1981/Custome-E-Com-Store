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
    nodes: ShopifyCollectionSummary[]
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
            }
          }
        }
      `
    )

    return {
      collections: data.collections.nodes
        .map((collection) => ({
          id: collection.id,
          title: collection.title,
          handle: collection.handle,
        }))
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
