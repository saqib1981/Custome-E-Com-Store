import { NextRequest, NextResponse } from 'next/server'
import { readLogoFaviconConfig, writeLogoFaviconConfig } from '@/lib/logo-favicon-server'
import type { LogoFaviconConfig } from '@/lib/logo-favicon'

export async function GET() {
  try {
    const config = await readLogoFaviconConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Logo favicon GET error:', e)
    return NextResponse.json({ error: 'Failed to load logo and favicon settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LogoFaviconConfig>
    const saved = await writeLogoFaviconConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save logo and favicon settings'
    console.error('Logo favicon PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
