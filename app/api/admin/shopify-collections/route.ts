import { NextResponse } from 'next/server'
import { getShopifyConnectionStatus } from '@/lib/shopify-connection-server'
import { fetchShopifyCollectionsList } from '@/lib/shopify-collections-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [collectionsResult, connection] = await Promise.all([
      fetchShopifyCollectionsList(),
      getShopifyConnectionStatus(),
    ])

    return NextResponse.json({
      collections: collectionsResult.collections,
      connection,
      error: collectionsResult.error,
    })
  } catch (e) {
    console.error('Shopify collections GET error:', e)
    return NextResponse.json({ error: 'Failed to load Shopify collections' }, { status: 500 })
  }
}
