import { NextRequest, NextResponse } from 'next/server'
import {
  readCollectionsListConfig,
  resolveAllCollectionsListCards,
  writeCollectionsListConfig,
} from '@/lib/collections-list-server'
import type { CollectionsListConfig } from '@/lib/collections-list'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCollectionsListConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Collections list GET error:', e)
    return NextResponse.json({ error: 'Failed to load collections list settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CollectionsListConfig>
    const saved = await writeCollectionsListConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save collections list settings'
    console.error('Collections list PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const config = await readCollectionsListConfig()
    const cards = config.enabled ? await resolveAllCollectionsListCards() : []
    return NextResponse.json({ config, cards })
  } catch (e) {
    console.error('Collections list resolve POST error:', e)
    return NextResponse.json({ error: 'Failed to resolve collections list' }, { status: 500 })
  }
}
