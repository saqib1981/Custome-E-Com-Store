import { NextResponse } from 'next/server'
import { fetchShopifyMainMenu } from '@/lib/shopify-menu-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await fetchShopifyMainMenu()
    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (e) {
    console.error('Store menu GET error:', e)
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
  }
}
