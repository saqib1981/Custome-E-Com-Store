import { NextRequest, NextResponse } from 'next/server'
import {
  readRecentProductsConfig,
  writeRecentProductsConfig,
} from '@/lib/recent-products-settings-server'
import type { RecentProductsConfig } from '@/lib/recent-products'

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
    console.error('Recent products settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load recent products settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RecentProductsConfig>
    const saved = await writeRecentProductsConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save recent products settings'
    console.error('Recent products settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
