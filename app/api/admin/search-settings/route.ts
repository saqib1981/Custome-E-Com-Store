import { NextRequest, NextResponse } from 'next/server'
import { readSearchConfig, writeSearchConfig } from '@/lib/search-settings-server'
import type { SearchConfig } from '@/lib/search'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readSearchConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Search settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load search settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SearchConfig>
    const saved = await writeSearchConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save search settings'
    console.error('Search settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
