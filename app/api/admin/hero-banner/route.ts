import { NextRequest, NextResponse } from 'next/server'
import { readHeroBannerConfig, writeHeroBannerConfig } from '@/lib/hero-banner-server'
import type { HeroBannerConfig } from '@/lib/hero-banner'


export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readHeroBannerConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Hero banner GET error:', e)
    return NextResponse.json({ error: 'Failed to load hero banner settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<HeroBannerConfig>
    const saved = await writeHeroBannerConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save hero banner settings'
    console.error('Hero banner PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
