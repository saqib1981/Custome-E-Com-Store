import { NextRequest, NextResponse } from 'next/server'
import { readStoreFooterConfig, writeStoreFooterConfig } from '@/lib/store-footer-server'
import type { StoreFooterConfig } from '@/lib/store-footer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readStoreFooterConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Store footer GET error:', e)
    return NextResponse.json({ error: 'Failed to load store footer settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<StoreFooterConfig>
    const saved = await writeStoreFooterConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save store footer settings'
    console.error('Store footer PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
