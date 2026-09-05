import { NextRequest, NextResponse } from 'next/server'
import { readBadgesConfig, writeBadgesConfig } from '@/lib/badges-server'
import type { BadgesConfig } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readBadgesConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Badges GET error:', e)
    return NextResponse.json({ error: 'Failed to load badge settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BadgesConfig>
    const saved = await writeBadgesConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save badge settings'
    console.error('Badges PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
