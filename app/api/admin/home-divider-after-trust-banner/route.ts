import { NextRequest, NextResponse } from 'next/server'
import {
  readHomeDividerAfterTrustBannerConfig,
  writeHomeDividerAfterTrustBannerConfig,
} from '@/lib/home-divider-server'
import type { HomeDividerConfig } from '@/lib/home-divider'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readHomeDividerAfterTrustBannerConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Home divider after trust banner GET error:', e)
    return NextResponse.json({ error: 'Failed to load divider settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<HomeDividerConfig>
    const saved = await writeHomeDividerAfterTrustBannerConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save divider settings'
    console.error('Home divider after trust banner PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
