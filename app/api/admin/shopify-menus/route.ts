import { NextResponse } from 'next/server'
import { getShopifyConnectionStatus } from '@/lib/shopify-connection-server'
import { readHeaderNavSettingsConfig } from '@/lib/header-settings-server'
import { resolveMainMenuHandle } from '@/lib/shopify-menu'
import { fetchShopifyMenusList } from '@/lib/shopify-menu-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [menusResult, settings, connection] = await Promise.all([
      fetchShopifyMenusList(),
      readHeaderNavSettingsConfig(),
      getShopifyConnectionStatus(),
    ])

    return NextResponse.json({
      menus: menusResult.menus,
      currentHandle: resolveMainMenuHandle(settings.menuHandle),
      currentMenuId: settings.menuId,
      connection,
      error: menusResult.error,
    })
  } catch (e) {
    console.error('Shopify menus GET error:', e)
    return NextResponse.json({ error: 'Failed to load Shopify menus' }, { status: 500 })
  }
}
