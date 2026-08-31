import { NextResponse } from 'next/server'
import { readResolvedCollectionTabs } from '@/lib/collection-tabs-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { config, tabs } = await readResolvedCollectionTabs()
    return NextResponse.json(
      { enabled: config.enabled, productsPerTab: config.productsPerTab, tabs },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (e) {
    console.error('Store collection tabs GET error:', e)
    return NextResponse.json({ error: 'Failed to load collection tabs' }, { status: 500 })
  }
}
