import { NextRequest, NextResponse } from 'next/server'
import {
  readCollectionTabsConfig,
  resolveCollectionTabs,
  writeCollectionTabsConfig,
} from '@/lib/collection-tabs-server'
import type { CollectionTabsConfig } from '@/lib/collection-tabs'
import { normalizeCollectionTabsConfig } from '@/lib/collection-tabs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCollectionTabsConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Collection tabs GET error:', e)
    return NextResponse.json({ error: 'Failed to load collection tabs settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CollectionTabsConfig>
    const saved = await writeCollectionTabsConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save collection tabs settings'
    console.error('Collection tabs PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CollectionTabsConfig>
    const config = normalizeCollectionTabsConfig(body)
    const configuredTabs = config.tabs.filter((tab) => tab.collectionId || tab.collectionHandle)
    const tabs = await resolveCollectionTabs(configuredTabs, config.productsPerTab)
    return NextResponse.json({ config, tabs })
  } catch (e) {
    console.error('Collection tabs resolve POST error:', e)
    return NextResponse.json({ error: 'Failed to resolve collection tabs' }, { status: 500 })
  }
}
