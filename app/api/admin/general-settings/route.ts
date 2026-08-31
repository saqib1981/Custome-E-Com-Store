import { NextRequest, NextResponse } from 'next/server'
import {
  readGeneralSettingsConfig,
  writeGeneralSettingsConfig,
} from '@/lib/general-settings-server'
import type { GeneralSettingsConfig } from '@/lib/general-settings'

export async function GET() {
  try {
    const config = await readGeneralSettingsConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('General settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load general settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<GeneralSettingsConfig>
    const saved = await writeGeneralSettingsConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save general settings'
    console.error('General settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
