import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import { formatMoney } from '@/lib/format-money'
import {
  isProductPagePreviewPlaceholder,
  type ProductPageData,
  type ProductPageImage,
  type ProductPageVariant,
} from '@/lib/product-page'

type ImageNode = { url?: string | null; altText?: string | null } | null

type VariantNode = {
  id: string
  title: string
  sku?: string | null
  availableForSale?: boolean | null
  inventoryQuantity?: number | null
  selectedOptions?: Array<{ name?: string | null; value?: string | null }> | null
  price?: string | null
  compareAtPrice?: string | null
  image?: ImageNode
}

type ProductNode = {
  id: string
  title: string
  handle: string
  descriptionHtml?: string | null
  tags?: string[] | null
  totalInventory?: number | null
  featuredImage?: ImageNode
  images?: { nodes?: ImageNode[] } | null
  options?: Array<{ name?: string | null; values?: string[] | null }> | null
  variants?: { nodes?: VariantNode[] } | null
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  descriptionHtml
  tags
  totalInventory
  featuredImage {
    url
    altText
  }
  images(first: 20) {
    nodes {
      url
      altText
    }
  }
  options {
    name
    values
  }
  variants(first: 100) {
    nodes {
      id
      title
      sku
      availableForSale
      inventoryQuantity
      selectedOptions {
        name
        value
      }
      price
      compareAtPrice
      image {
        url
        altText
      }
    }
  }
`

function mapImage(node: ImageNode | undefined, fallbackAlt: string): ProductPageImage | null {
  const url = node?.url?.trim() ?? ''
  if (!url) return null
  return { url, alt: node?.altText?.trim() || fallbackAlt }
}

function formatVariantMoney(raw: string | null | undefined, currencyHint: string): string {
  const amount = String(raw ?? '').trim()
  if (!amount) return ''
  // Admin API often returns decimal strings without currency — default PKR-friendly display via Intl.
  return formatMoney(amount, currencyHint || 'PKR')
}

function mapVariant(node: VariantNode, currencyHint: string): ProductPageVariant {
  const priceRaw = String(node.price ?? '').trim()
  const compareRaw = String(node.compareAtPrice ?? '').trim()
  const priceNum = Number(priceRaw)
  const compareNum = Number(compareRaw)
  const onSale =
    Number.isFinite(priceNum) && Number.isFinite(compareNum) && compareNum > priceNum

  return {
    id: node.id,
    title: node.title,
    sku: String(node.sku ?? '').trim(),
    available: Boolean(node.availableForSale),
    inventoryQuantity:
      typeof node.inventoryQuantity === 'number' ? node.inventoryQuantity : null,
    selectedOptions: Array.isArray(node.selectedOptions)
      ? node.selectedOptions.map((opt) => ({
          name: String(opt?.name ?? '').trim(),
          value: String(opt?.value ?? '').trim(),
        }))
      : [],
    price: formatVariantMoney(priceRaw, currencyHint),
    compareAtPrice: onSale ? formatVariantMoney(compareRaw, currencyHint) : '',
    imageUrl: node.image?.url?.trim() ?? '',
  }
}

function mapProduct(node: ProductNode): ProductPageData {
  const title = node.title
  const images: ProductPageImage[] = []
  const featured = mapImage(node.featuredImage, title)
  if (featured) images.push(featured)
  for (const img of node.images?.nodes ?? []) {
    const mapped = mapImage(img, title)
    if (!mapped) continue
    if (images.some((existing) => existing.url === mapped.url)) continue
    images.push(mapped)
  }

  const currencyHint = 'PKR'
  const variants = (node.variants?.nodes ?? []).map((v) => mapVariant(v, currencyHint))

  return {
    id: node.id,
    title,
    handle: node.handle,
    descriptionHtml: String(node.descriptionHtml ?? '').trim(),
    images,
    options: (node.options ?? []).map((opt) => ({
      name: String(opt?.name ?? '').trim(),
      values: Array.isArray(opt?.values) ? opt.values.map((v) => String(v ?? '').trim()) : [],
    })),
    variants,
    tags: Array.isArray(node.tags) ? node.tags.map((t) => String(t ?? '').trim()).filter(Boolean) : [],
    totalInventory: typeof node.totalInventory === 'number' ? node.totalInventory : null,
  }
}

async function fetchFirstProductHandle(): Promise<string | null> {
  type Res = { products?: { nodes?: Array<{ handle?: string | null }> } }
  const data = await shopifyAdminGraphql<Res>(
    `query FirstProductHandle {
      products(first: 1, sortKey: UPDATED_AT, reverse: true) {
        nodes { handle }
      }
    }`
  )
  const handle = data.products?.nodes?.[0]?.handle?.trim()
  return handle || null
}

export async function fetchShopifyProductByHandle(handle: string): Promise<ProductPageData> {
  const requested = String(handle ?? '').trim() || 'example'

  if (!isShopifyConfigured()) {
    return {
      id: '',
      title: 'Product',
      handle: requested,
      descriptionHtml: '',
      images: [],
      options: [],
      variants: [],
      tags: [],
      totalInventory: null,
      error: 'Shopify is not configured',
    }
  }

  try {
    let resolvedHandle = requested
    if (isProductPagePreviewPlaceholder(resolvedHandle)) {
      const first = await fetchFirstProductHandle()
      if (!first) {
        return {
          id: '',
          title: 'No products',
          handle: requested,
          descriptionHtml: '',
          images: [],
          options: [],
          variants: [],
          tags: [],
          totalInventory: null,
          error: 'No products found in Shopify',
        }
      }
      resolvedHandle = first
    }

    type ByHandleRes = { productByHandle: ProductNode | null }
    const data = await shopifyAdminGraphql<ByHandleRes>(
      `query ProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          ${PRODUCT_FIELDS}
        }
      }`,
      { handle: resolvedHandle }
    )

    if (!data.productByHandle) {
      return {
        id: '',
        title: resolvedHandle,
        handle: resolvedHandle,
        descriptionHtml: '',
        images: [],
        options: [],
        variants: [],
        tags: [],
        totalInventory: null,
        error: 'Product not found',
      }
    }

    return mapProduct(data.productByHandle)
  } catch (e) {
    console.error('fetchShopifyProductByHandle error:', e)
    if (isShopifyAccessDeniedError(e)) {
      const status = await getShopifyConnectionStatus()
      return {
        id: '',
        title: 'Product',
        handle: requested,
        descriptionHtml: '',
        images: [],
        options: [],
        variants: [],
        tags: [],
        totalInventory: null,
        error: status.message || 'Shopify access denied',
      }
    }
    return {
      id: '',
      title: 'Product',
      handle: requested,
      descriptionHtml: '',
      images: [],
      options: [],
      variants: [],
      tags: [],
      totalInventory: null,
      error: e instanceof Error ? e.message : 'Failed to load product',
    }
  }
}
