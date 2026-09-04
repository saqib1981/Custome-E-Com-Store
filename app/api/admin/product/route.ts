import { NextRequest, NextResponse } from 'next/server'
import { resolveProductPage } from '@/lib/product-page-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = String(searchParams.get('handle') ?? '').trim() || 'example'
    const page = await resolveProductPage(handle)
    return NextResponse.json(page, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Admin product page GET error:', e)
    return NextResponse.json({ error: 'Failed to load product' }, { status: 500 })
  }
}
