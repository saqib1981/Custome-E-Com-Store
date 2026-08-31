import { NextResponse } from 'next/server'
import { fetchShopifyMainMenu } from '@/lib/shopify-menu-server'

export const revalidate = 300

export async function GET() {
  try {
    const items = await fetchShopifyMainMenu()
    return NextResponse.json({ items })
  } catch (e) {
    console.error('Store menu GET error:', e)
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 })
  }
}
