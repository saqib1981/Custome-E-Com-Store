import { NextRequest, NextResponse } from 'next/server'
import {
  readHeaderNavSettingsConfig,
  writeHeaderNavSettingsConfig,
} from '@/lib/header-settings-server'
import type { HeaderNavSettingsConfig } from '@/lib/header-settings'


export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readHeaderNavSettingsConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Header settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load header settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<HeaderNavSettingsConfig>
    const saved = await writeHeaderNavSettingsConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save header settings'
    console.error('Header settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
