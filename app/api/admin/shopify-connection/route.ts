import { NextResponse } from 'next/server'
import { getShopifyConnectionStatus } from '@/lib/shopify-connection-server'
import { SHOPIFY_REQUIRED_SCOPES } from '@/lib/shopify-scopes'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const connection = await getShopifyConnectionStatus()

    return NextResponse.json({
      ...connection,
      requiredScopes: SHOPIFY_REQUIRED_SCOPES,
    })
  } catch (e) {
    console.error('Shopify connection GET error:', e)
    return NextResponse.json({ error: 'Failed to check Shopify connection' }, { status: 500 })
  }
}
