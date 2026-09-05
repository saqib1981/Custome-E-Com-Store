import { NextResponse } from 'next/server'
import { readCheckoutConfig } from '@/lib/checkout-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCheckoutConfig()
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (e) {
    console.error('Store checkout settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load checkout settings' }, { status: 500 })
  }
}
