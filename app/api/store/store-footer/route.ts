import { NextResponse } from 'next/server'
import { readStoreFooterConfig } from '@/lib/store-footer-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readStoreFooterConfig()
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Store footer GET error:', e)
    return NextResponse.json({ error: 'Failed to load store footer' }, { status: 500 })
  }
}
