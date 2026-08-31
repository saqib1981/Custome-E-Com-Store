import { NextRequest, NextResponse } from 'next/server'
import { readTrustBannerConfig, writeTrustBannerConfig } from '@/lib/trust-banner-server'
import type { TrustBannerConfig } from '@/lib/trust-banner'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readTrustBannerConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Trust banner GET error:', e)
    return NextResponse.json({ error: 'Failed to load trust banner settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<TrustBannerConfig>
    const saved = await writeTrustBannerConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save trust banner settings'
    console.error('Trust banner PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
