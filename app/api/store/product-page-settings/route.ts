import { NextResponse } from 'next/server'
import { readProductPageConfig } from '@/lib/product-page-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readProductPageConfig()
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Store product page settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load product page settings' }, { status: 500 })
  }
}
