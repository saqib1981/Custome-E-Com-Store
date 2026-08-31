import { NextResponse } from 'next/server'
import { readFloatingButtonsConfig } from '@/lib/floating-buttons-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readFloatingButtonsConfig()
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    console.error('Store floating buttons GET error:', e)
    return NextResponse.json({ error: 'Failed to load floating buttons' }, { status: 500 })
  }
}
