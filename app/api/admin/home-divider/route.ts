import { NextRequest, NextResponse } from 'next/server'
import { readHomeDividerConfig, writeHomeDividerConfig } from '@/lib/home-divider-server'
import type { HomeDividerConfig } from '@/lib/home-divider'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readHomeDividerConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Home divider GET error:', e)
    return NextResponse.json({ error: 'Failed to load home divider settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<HomeDividerConfig>
    const saved = await writeHomeDividerConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save home divider settings'
    console.error('Home divider PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
