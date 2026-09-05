import { NextResponse } from 'next/server'
import { readCartConfig } from '@/lib/cart-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCartConfig()
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (e) {
    console.error('Store cart settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load cart settings' }, { status: 500 })
  }
}
