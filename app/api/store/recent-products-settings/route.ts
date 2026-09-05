import { NextResponse } from 'next/server'
import { readRecentProductsConfig } from '@/lib/recent-products-settings-server'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readRecentProductsConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Store recent products settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load recent products settings' }, { status: 500 })
  }
}
