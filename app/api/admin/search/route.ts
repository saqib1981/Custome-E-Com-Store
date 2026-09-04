import { NextRequest, NextResponse } from 'next/server'
import { readSearchConfig } from '@/lib/search-settings-server'
import { searchShopifyProducts } from '@/lib/shopify-search-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') ?? ''
    const config = await readSearchConfig()
    const trimmed = q.trim()
    if (trimmed.length < config.minQueryLength) {
      return NextResponse.json({ products: [] })
    }

    const result = await searchShopifyProducts(trimmed, config.maxResults)
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (e) {
    console.error('Admin search GET error:', e)
    return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 })
  }
}
