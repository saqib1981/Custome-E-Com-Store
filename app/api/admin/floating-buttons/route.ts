import { NextRequest, NextResponse } from 'next/server'
import { readFloatingButtonsConfig, writeFloatingButtonsConfig } from '@/lib/floating-buttons-server'
import type { FloatingButtonsConfig } from '@/lib/floating-buttons'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readFloatingButtonsConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Floating buttons GET error:', e)
    return NextResponse.json({ error: 'Failed to load floating buttons settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FloatingButtonsConfig>
    const saved = await writeFloatingButtonsConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save floating buttons settings'
    console.error('Floating buttons PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
