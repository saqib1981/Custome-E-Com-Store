import { NextResponse } from 'next/server'
import { readTrustBannerConfig } from '@/lib/trust-banner-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readTrustBannerConfig()
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    console.error('Store trust banner GET error:', e)
    return NextResponse.json({ error: 'Failed to load trust banner' }, { status: 500 })
  }
}
