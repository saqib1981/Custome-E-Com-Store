import { NextRequest, NextResponse } from 'next/server'
import {
  readCollectionCardsConfig,
  resolveCollectionCards,
  writeCollectionCardsConfig,
} from '@/lib/collection-cards-server'
import type { CollectionCardsConfig } from '@/lib/collection-cards'
import { normalizeCollectionCardsConfig } from '@/lib/collection-cards'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCollectionCardsConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Collection cards GET error:', e)
    return NextResponse.json({ error: 'Failed to load collection cards settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CollectionCardsConfig>
    const saved = await writeCollectionCardsConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save collection cards settings'
    console.error('Collection cards PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CollectionCardsConfig>
    const config = normalizeCollectionCardsConfig(body)
    const cards = await resolveCollectionCards(config.cards)
    return NextResponse.json({ config, cards })
  } catch (e) {
    console.error('Collection cards resolve POST error:', e)
    return NextResponse.json({ error: 'Failed to resolve collection cards' }, { status: 500 })
  }
}
