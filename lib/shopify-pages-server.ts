import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import {
  sanitizeShopifyPageHandle,
  type ShopifyOnlinePage,
} from '@/lib/shopify-pages'
import { shopifyStorefrontGraphql } from '@/lib/shopify-storefront'

export type { ShopifyOnlinePage } from '@/lib/shopify-pages'
export {
  parseShopifyPageHandleFromPath,
  sanitizeShopifyPageHandle,
} from '@/lib/shopify-pages'

type AdminPageNode = {
  id?: string
  title?: string | null
  handle?: string | null
  body?: string | null
  bodySummary?: string | null
  isPublished?: boolean | null
}

type StorefrontPageNode = {
  id?: string
  title?: string | null
  handle?: string | null
  body?: string | null
  bodySummary?: string | null
  seo?: { title?: string | null; description?: string | null } | null
}

function mapPage(node: {
  id?: string
  title?: string | null
  handle?: string | null
  body?: string | null
  bodySummary?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}): ShopifyOnlinePage | null {
  const id = String(node.id ?? '').trim()
  const handle = sanitizeShopifyPageHandle(String(node.handle ?? ''))
  const title = String(node.title ?? '').trim()
  if (!id || !handle) return null
  return {
    id,
    title: title || handle,
    handle,
    bodyHtml: String(node.body ?? '').trim(),
    bodySummary: String(node.bodySummary ?? '').trim(),
    seoTitle: String(node.seoTitle ?? '').trim(),
    seoDescription: String(node.seoDescription ?? '').trim(),
  }
}

async function fetchPageViaStorefront(handle: string): Promise<ShopifyOnlinePage | null> {
  type Res = { page: StorefrontPageNode | null }
  const data = await shopifyStorefrontGraphql<Res>(
    `
      query StorefrontPageByHandle($handle: String!) {
        page(handle: $handle) {
          id
          title
          handle
          body
          bodySummary
          seo {
            title
            description
          }
        }
      }
    `,
    { handle }
  )

  const node = data.page
  if (!node) return null
  return mapPage({
    id: node.id,
    title: node.title,
    handle: node.handle,
    body: node.body,
    bodySummary: node.bodySummary,
    seoTitle: node.seo?.title,
    seoDescription: node.seo?.description,
  })
}

async function fetchPageViaAdmin(handle: string): Promise<ShopifyOnlinePage | null> {
  type Res = { pages?: { nodes?: AdminPageNode[] | null } | null }
  const data = await shopifyAdminGraphql<Res>(
    `
      query AdminPageByHandle($query: String!) {
        pages(first: 1, query: $query) {
          nodes {
            id
            title
            handle
            body
            bodySummary
            isPublished
          }
        }
      }
    `,
    { query: `handle:${handle} published_status:published` }
  )

  const node = data.pages?.nodes?.[0]
  if (!node || node.isPublished === false) return null
  return mapPage({
    id: node.id,
    title: node.title,
    handle: node.handle,
    body: node.body,
    bodySummary: node.bodySummary,
  })
}

/**
 * Load a published Online Store page by handle (e.g. `about-us` for `/pages/about-us`).
 * Tries Storefront API first, then Admin GraphQL (`read_content` / `read_online_store_pages`).
 */
export async function fetchShopifyPageByHandle(
  handle: string
): Promise<ShopifyOnlinePage | null> {
  const sanitized = sanitizeShopifyPageHandle(handle)
  if (!sanitized) return null

  if (!isShopifyConfigured()) {
    throw new Error('Shopify is not configured.')
  }

  try {
    const fromStorefront = await fetchPageViaStorefront(sanitized)
    if (fromStorefront) return fromStorefront
  } catch (e) {
    console.warn('Storefront page fetch failed, trying Admin API:', e)
  }

  try {
    return await fetchPageViaAdmin(sanitized)
  } catch (e) {
    console.error('fetchShopifyPageByHandle error:', e)
    if (isShopifyAccessDeniedError(e)) {
      const status = await getShopifyConnectionStatus()
      throw new Error(
        status.message ||
          'Shopify denied page access. Enable read_content (or read_online_store_pages) on the app, release, and reinstall.'
      )
    }
    throw e
  }
}
