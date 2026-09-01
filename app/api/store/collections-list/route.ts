import { NextResponse } from 'next/server'
import { readResolvedCollectionsList } from '@/lib/collections-list-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { config, cards } = await readResolvedCollectionsList()
    return NextResponse.json(
      {
        enabled: config.enabled,
        titlePosition: config.titlePosition,
        pageTitle: config.pageTitle,
        columnsDesktop: config.columnsDesktop,
        pageSize: config.pageSize,
        paginationMode: config.paginationMode,
        cards,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (e) {
    console.error('Store collections list GET error:', e)
    return NextResponse.json({ error: 'Failed to load collections list' }, { status: 500 })
  }
}
