import { NextResponse } from 'next/server'
import { readResolvedCollectionCards } from '@/lib/collection-cards-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { config, cards } = await readResolvedCollectionCards()
    return NextResponse.json(
      { enabled: config.enabled, titlePosition: config.titlePosition, cards },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (e) {
    console.error('Store collection cards GET error:', e)
    return NextResponse.json({ error: 'Failed to load collection cards' }, { status: 500 })
  }
}
