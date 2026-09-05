import { NextRequest, NextResponse } from 'next/server'
import { buildShopifyCartPermalinkLines, normalizeCartLines, type CartLine } from '@/lib/cart'
import { getShopifyConfig } from '@/lib/shopify-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { lines?: CartLine[] }
    const lines = normalizeCartLines(body.lines)
    if (!lines.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const config = getShopifyConfig()
    if (!config?.shop) {
      return NextResponse.json({ error: 'Shopify is not configured' }, { status: 500 })
    }

    const segment = buildShopifyCartPermalinkLines(lines)
    if (!segment) {
      return NextResponse.json({ error: 'No valid variants in cart' }, { status: 400 })
    }

    const url = `https://${config.shop}/cart/${segment}`
    return NextResponse.json({ url })
  } catch (e) {
    console.error('Cart checkout URL error:', e)
    return NextResponse.json({ error: 'Failed to build checkout URL' }, { status: 500 })
  }
}
