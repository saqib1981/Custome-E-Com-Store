import { NextRequest, NextResponse } from 'next/server'
import { resolveCollectionProductsPage } from '@/lib/collection-products-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = String(searchParams.get('handle') ?? '').trim() || 'all'
    const after = String(searchParams.get('after') ?? '').trim() || null
    const sortParam = searchParams.get('sort')
    const sort = sortParam && String(sortParam).trim() ? String(sortParam).trim() : 'shopify'
    const firstRaw = Number(searchParams.get('first'))
    const first = Number.isFinite(firstRaw) && firstRaw > 0 ? firstRaw : undefined

    const page = await resolveCollectionProductsPage({ handle, after, sort, first })
    return NextResponse.json(page, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Store collection products GET error:', e)
    return NextResponse.json({ error: 'Failed to load collection products' }, { status: 500 })
  }
}
