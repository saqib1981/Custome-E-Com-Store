import { NextRequest, NextResponse } from 'next/server'
import {
  readHeaderNavSettingsConfig,
  writeHeaderNavSettingsConfig,
} from '@/lib/header-settings-server'
import type { HeaderNavSettingsConfig } from '@/lib/header-settings'

export async function GET() {
  try {
    const config = await readHeaderNavSettingsConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Header settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load header settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<HeaderNavSettingsConfig>
    const saved = await writeHeaderNavSettingsConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save header settings'
    console.error('Header settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
