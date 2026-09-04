import { fetchShopifyProductByHandle } from '@/lib/shopify-product-server'
import { readProductPageConfig } from '@/lib/product-page-settings-server'
import type { ProductPageConfig, ProductPageData } from '@/lib/product-page'

export type ResolvedProductPage = {
  config: ProductPageConfig
  product: ProductPageData
}

export async function resolveProductPage(handle: string): Promise<ResolvedProductPage> {
  const [config, product] = await Promise.all([
    readProductPageConfig(),
    fetchShopifyProductByHandle(handle),
  ])
  return { config, product }
}
