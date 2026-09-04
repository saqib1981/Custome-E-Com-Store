import { NextResponse } from 'next/server'
import { readSearchConfig } from '@/lib/search-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readSearchConfig()
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (e) {
    console.error('Store search settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load search settings' }, { status: 500 })
  }
}
