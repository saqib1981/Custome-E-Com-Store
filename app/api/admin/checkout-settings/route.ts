import { NextRequest, NextResponse } from 'next/server'
import { readCheckoutConfig, writeCheckoutConfig } from '@/lib/checkout-settings-server'
import type { CheckoutConfig } from '@/lib/checkout'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readCheckoutConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Checkout settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load checkout settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CheckoutConfig>
    const saved = await writeCheckoutConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save checkout settings'
    console.error('Checkout settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
