import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import { formatMoney } from '@/lib/format-money'
import type { SearchProductHit } from '@/lib/search'

type MoneyNode = { amount?: string | null; currencyCode?: string | null } | null

type ProductNode = {
  id: string
  title: string
  handle: string
  status?: string | null
  featuredImage?: { url?: string | null; altText?: string | null } | null
  priceRangeV2?: { minVariantPrice?: MoneyNode } | null
  compareAtPriceRange?: { minVariantCompareAtPrice?: MoneyNode } | null
}

type SearchResponse = {
  products?: { nodes?: ProductNode[] | null } | null
}

function sanitizeQuery(raw: string): string {
  return String(raw ?? '')
    .trim()
    .replace(/[\\:*()"'{}[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 80)
}

function mapHit(node: ProductNode): SearchProductHit | null {
  if (!node?.handle || !node?.title) return null
  if (node.status && String(node.status).toUpperCase() !== 'ACTIVE') return null

  const min = node.priceRangeV2?.minVariantPrice
  const compare = node.compareAtPriceRange?.minVariantCompareAtPrice
  const currency = String(min?.currencyCode ?? 'PKR')
  const price = formatMoney(String(min?.amount ?? ''), currency)
  const compareAmount = Number(compare?.amount ?? NaN)
  const priceAmount = Number(min?.amount ?? NaN)
  const compareAtPrice =
    Number.isFinite(compareAmount) &&
    Number.isFinite(priceAmount) &&
    compareAmount > priceAmount
      ? formatMoney(String(compare?.amount ?? ''), String(compare?.currencyCode ?? currency))
      : ''

  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    imageUrl: node.featuredImage?.url?.trim() ?? '',
    imageAlt: node.featuredImage?.altText?.trim() || node.title,
    price,
    compareAtPrice,
  }
}

export async function searchShopifyProducts(
  query: string,
  first = 8
): Promise<{ products: SearchProductHit[]; error?: string }> {
  const q = sanitizeQuery(query)
  if (!q) return { products: [] }

  if (!isShopifyConfigured()) {
    return { products: [], error: 'Shopify is not configured' }
  }

  const limit = Math.min(24, Math.max(1, Math.round(first)))

  try {
    const data = await shopifyAdminGraphql<SearchResponse>(
      `
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          nodes {
            id
            title
            handle
            status
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
          }
        }
      }
    `,
      {
        query: `${q} status:active`,
        first: limit,
      }
    )

    const products = (data.products?.nodes ?? [])
      .map(mapHit)
      .filter((hit): hit is SearchProductHit => Boolean(hit))

    return { products }
  } catch (e) {
    if (isShopifyAccessDeniedError(e)) {
      const status = await getShopifyConnectionStatus()
      return {
        products: [],
        error: status.message || 'Shopify access denied',
      }
    }
    console.error('searchShopifyProducts error:', e)
    return {
      products: [],
      error: e instanceof Error ? e.message : 'Search failed',
    }
  }
}
