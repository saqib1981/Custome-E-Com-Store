import { NextResponse } from 'next/server'
import { readAccountConfig } from '@/lib/account-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readAccountConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Store account settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load account settings' }, { status: 500 })
  }
}
