import { NextRequest, NextResponse } from 'next/server'
import {
  fetchShopifyPageByHandle,
  sanitizeShopifyPageHandle,
} from '@/lib/shopify-pages-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const handle = sanitizeShopifyPageHandle(
      String(new URL(request.url).searchParams.get('handle') ?? '')
    )
    if (!handle) {
      return NextResponse.json({ error: 'Missing page handle.' }, { status: 400 })
    }

    const page = await fetchShopifyPageByHandle(handle)
    if (!page) {
      return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
    }

    return NextResponse.json(page, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Store page GET error:', e)
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Failed to load page',
      },
      { status: 500 }
    )
  }
}
