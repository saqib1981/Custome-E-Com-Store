import { formatMoney } from '@/lib/format-money'
import {
  COLLECTION_PRODUCTS_PAGE_SIZE,
  isProductCreatedWithinDays,
  normalizeCollectionProductsSort,
  toCollectionProductCard,
  type CollectionProductsPage,
  type CollectionProductsSort,
} from '@/lib/collection-products'
import {
  fetchShopifyCollectionProductsPage,
  type ShopifyCollectionProduct,
} from '@/lib/shopify-collections-server'
import { readBadgesConfig } from '@/lib/badges-server'

function isOnSale(product: ShopifyCollectionProduct): boolean {
  const price = Number(product.priceAmount)
  const compare = Number(product.compareAtAmount)
  return Number.isFinite(price) && Number.isFinite(compare) && compare > price
}

function hasNewTag(product: ShopifyCollectionProduct): boolean {
  return product.tags.some((tag) => tag.toLowerCase() === 'new')
}

function mapProduct(product: ShopifyCollectionProduct, newBadgeDays: number) {
  const taggedNew = hasNewTag(product)
  return toCollectionProductCard({
    id: product.id,
    title: product.title,
    handle: product.handle,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    price: formatMoney(product.priceAmount, product.priceCurrency),
    compareAtPrice: isOnSale(product)
      ? formatMoney(product.compareAtAmount, product.compareAtCurrency)
      : '',
    onSale: isOnSale(product),
    isNew: taggedNew || isProductCreatedWithinDays(product.createdAt, newBadgeDays),
    createdAt: product.createdAt,
    hasNewTag: taggedNew,
    available: product.available,
  })
}

export async function resolveCollectionProductsPage(options: {
  handle: string
  after?: string | null
  /** Omit or pass `shopify` to use the collection's Shopify Admin sort order. */
  sort?: CollectionProductsSort | string | null
  first?: number
}): Promise<CollectionProductsPage> {
  const handle = String(options.handle ?? '').trim() || 'all'
  const rawSort = String(options.sort ?? '').trim()
  const useShopifySort = !rawSort || rawSort === 'shopify' || rawSort === 'collection-default'
  const first = options.first ?? COLLECTION_PRODUCTS_PAGE_SIZE
  const badges = await readBadgesConfig()
  const newBadgeDays = badges.newBadgeDays

  const page = await fetchShopifyCollectionProductsPage({
    collectionHandle: handle,
    after: options.after,
    sort: useShopifySort ? 'shopify' : rawSort,
    first,
  })

  const collectionSort = normalizeCollectionProductsSort(page.collectionSort)
  const sort = normalizeCollectionProductsSort(page.appliedSort || collectionSort)

  if (!page.collection && !page.products.length) {
    return {
      handle,
      title: handle === 'all' ? 'All products' : handle,
      productCount: 0,
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
      sort,
      collectionSort,
      error: page.error ?? (handle === 'all' ? undefined : 'Collection not found'),
    }
  }

  return {
    handle: page.collection?.handle ?? handle,
    title: page.collection?.title ?? (handle === 'all' ? 'All products' : handle),
    productCount: page.collection?.productCount ?? page.products.length,
    products: page.products.map((product) => mapProduct(product, newBadgeDays)),
    pageInfo: page.pageInfo,
    sort,
    collectionSort,
    error: page.error,
  }
}
