import { NextRequest, NextResponse } from 'next/server'
import { resolveRecentProducts } from '@/lib/recent-products-server'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

function parseHandles(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const handle = String(request.nextUrl.searchParams.get('handle') ?? '').trim()
    const limitRaw = request.nextUrl.searchParams.get('limit')
    const limit = limitRaw ? Number(limitRaw) : undefined
    const viewedHandles = parseHandles(request.nextUrl.searchParams.get('handles'))
    const page = await resolveRecentProducts(handle || 'example', { limit, viewedHandles })
    return NextResponse.json(page, { headers: NO_STORE })
  } catch (e) {
    console.error('Admin recent products GET error:', e)
    return NextResponse.json({ error: 'Failed to load recent products' }, { status: 500 })
  }
}
