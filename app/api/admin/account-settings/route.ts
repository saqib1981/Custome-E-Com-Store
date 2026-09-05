import { NextRequest, NextResponse } from 'next/server'
import { readAccountConfig, writeAccountConfig } from '@/lib/account-settings-server'
import type { AccountConfig } from '@/lib/account'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readAccountConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Account settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load account settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AccountConfig>
    const saved = await writeAccountConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save account settings'
    console.error('Account settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
