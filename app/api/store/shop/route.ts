import { NextResponse } from 'next/server'
import { fetchShopifyShopName } from '@/lib/shopify-shop-server'

export const revalidate = 300

export async function GET() {
  try {
    const name = await fetchShopifyShopName()
    return NextResponse.json(
      { name },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (e) {
    console.error('Store shop GET error:', e)
    return NextResponse.json({ error: 'Failed to load shop name' }, { status: 500 })
  }
}
