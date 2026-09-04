import { NextRequest, NextResponse } from 'next/server'
import {
  readCollectionProductsConfig,
  writeCollectionProductsConfig,
} from '@/lib/collection-products-settings-server'
import type { CollectionProductsConfig } from '@/lib/collection-products'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCollectionProductsConfig()
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (e) {
    console.error('Collection products settings GET error:', e)
    return NextResponse.json(
      { error: 'Failed to load collection products settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CollectionProductsConfig>
    const saved = await writeCollectionProductsConfig(body)
    return NextResponse.json(saved, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Failed to save collection products settings'
    console.error('Collection products settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
