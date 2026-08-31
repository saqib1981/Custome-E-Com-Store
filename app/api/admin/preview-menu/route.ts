import { NextRequest, NextResponse } from 'next/server'
import { fetchShopifyMenuSelection } from '@/lib/shopify-menu-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const menuId = request.nextUrl.searchParams.get('menuId') ?? ''
    const menuHandle = request.nextUrl.searchParams.get('menuHandle') ?? ''

    const items = await fetchShopifyMenuSelection({ menuId, menuHandle })

    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (e) {
    console.error('Preview menu GET error:', e)
    return NextResponse.json({ error: 'Failed to load preview menu' }, { status: 500 })
  }
}
