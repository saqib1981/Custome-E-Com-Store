import { NextRequest, NextResponse } from 'next/server'
import {
  readRelatedProductsConfig,
  writeRelatedProductsConfig,
} from '@/lib/related-products-settings-server'
import type { RelatedProductsConfig } from '@/lib/related-products'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readRelatedProductsConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Related products settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load related products settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RelatedProductsConfig>
    const saved = await writeRelatedProductsConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save related products settings'
    console.error('Related products settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
