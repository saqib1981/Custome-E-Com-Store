import { NextResponse } from 'next/server'
import { readRelatedProductsConfig } from '@/lib/related-products-settings-server'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readRelatedProductsConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Store related products settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load related products settings' }, { status: 500 })
  }
}
