import { NextRequest, NextResponse } from 'next/server'
import { resolveRelatedProducts } from '@/lib/related-products-server'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET(request: NextRequest) {
  try {
    const handle = String(request.nextUrl.searchParams.get('handle') ?? '').trim()
    const limitRaw = request.nextUrl.searchParams.get('limit')
    const limit = limitRaw ? Number(limitRaw) : undefined
    const page = await resolveRelatedProducts(handle || 'example', { limit })
    return NextResponse.json(page, { headers: NO_STORE })
  } catch (e) {
    console.error('Store related products GET error:', e)
    return NextResponse.json({ error: 'Failed to load related products' }, { status: 500 })
  }
}
