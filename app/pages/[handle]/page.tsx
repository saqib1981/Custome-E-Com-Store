import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopifyPageView from '@/components/pages/ShopifyPageView'
import {
  fetchShopifyPageByHandle,
  sanitizeShopifyPageHandle,
} from '@/lib/shopify-pages-server'

type PageParams = {
  params: { handle: string }
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const handle = sanitizeShopifyPageHandle(decodeURIComponent(params.handle || ''))
  if (!handle) return { title: 'Page not found' }

  try {
    const page = await fetchShopifyPageByHandle(handle)
    if (!page) return { title: 'Page not found' }
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.bodySummary || undefined,
    }
  } catch {
    return { title: 'Page not found' }
  }
}

export default async function ShopifyOnlineStorePage({ params }: PageParams) {
  const handle = sanitizeShopifyPageHandle(decodeURIComponent(params.handle || ''))
  if (!handle) notFound()

  let page = null
  try {
    page = await fetchShopifyPageByHandle(handle)
  } catch (e) {
    console.error('Shopify page route error:', e)
    notFound()
  }

  if (!page) notFound()

  return <ShopifyPageView page={page} />
}
