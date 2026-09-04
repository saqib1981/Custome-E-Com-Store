import { NextResponse } from 'next/server'
import { readCollectionProductsConfig } from '@/lib/collection-products-settings-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const config = await readCollectionProductsConfig()
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Store collection products settings GET error:', e)
    return NextResponse.json(
      { error: 'Failed to load collection products settings' },
      { status: 500 }
    )
  }
}
