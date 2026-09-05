import { NextResponse } from 'next/server'
import { readBadgesConfig } from '@/lib/badges-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readBadgesConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Store badges GET error:', e)
    return NextResponse.json({ error: 'Failed to load badge settings' }, { status: 500 })
  }
}
