import { NextRequest, NextResponse } from 'next/server'
import {
  readProductPageConfig,
  writeProductPageConfig,
} from '@/lib/product-page-settings-server'
import type { ProductPageConfig } from '@/lib/product-page'

export const dynamic = 'force-dynamic'

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const

export async function GET() {
  try {
    const config = await readProductPageConfig()
    return NextResponse.json(config, { headers: NO_STORE })
  } catch (e) {
    console.error('Product page settings GET error:', e)
    return NextResponse.json({ error: 'Failed to load product page settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ProductPageConfig>
    const saved = await writeProductPageConfig(body)
    return NextResponse.json(saved, { headers: NO_STORE })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save product page settings'
    console.error('Product page settings PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
