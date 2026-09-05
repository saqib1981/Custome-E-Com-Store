import { NextRequest, NextResponse } from 'next/server'
import { readCartConfig, writeCartConfig } from '@/lib/cart-settings-server'
import type { CartConfig } from '@/lib/cart'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readCartConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Cart settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load cart settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CartConfig>
    const saved = await writeCartConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save cart settings'
    console.error('Cart settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
