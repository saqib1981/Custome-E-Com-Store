'use client'

/**
 * Supabase Realtime sync for `store_settings`.
 * On postgres_changes → clear browser caches + dispatch section refresh events (no full reload).
 */

import { useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { clearStoreSettingsBrowserCaches } from '@/lib/store-settings-cache'
import { dispatchStoreThemeRefresh } from '@/lib/store-theme-client'
import { ACCOUNT_SETTINGS_UPDATED_EVENT } from '@/lib/account-client'
import { CART_SETTINGS_UPDATED_EVENT } from '@/lib/cart-client'
import { BADGES_UPDATED_EVENT } from '@/lib/badges-client'
import { FLOATING_BUTTONS_UPDATED_EVENT } from '@/lib/floating-buttons-client'
import { SEARCH_UPDATED_EVENT } from '@/lib/search-client'
import { PRODUCT_PAGE_UPDATED_EVENT } from '@/lib/product-page-client'
import { COLLECTION_PRODUCTS_UPDATED_EVENT } from '@/lib/collection-products-client'
import { RELATED_PRODUCTS_UPDATED_EVENT } from '@/lib/related-products-client'
import { RECENT_PRODUCTS_UPDATED_EVENT } from '@/lib/recent-products-client'
import { CHECKOUT_SETTINGS_UPDATED_EVENT } from '@/lib/checkout-client'

export const STORE_SETTINGS_REALTIME_EVENT = 'store-settings-realtime'

export type StoreSettingsRealtimeDetail = {
  key: string
  value: Record<string, unknown> | null
}

function dispatchWindowEvent(name: string, detail?: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

/** Fan out a setting key change to existing storefront listeners. */
export function emitStoreSettingKeyChange(
  key: string,
  value: Record<string, unknown> | null
): void {
  clearStoreSettingsBrowserCaches()

  dispatchWindowEvent(STORE_SETTINGS_REALTIME_EVENT, { key, value } satisfies StoreSettingsRealtimeDetail)

  switch (key) {
    case 'logo-favicon':
      dispatchStoreThemeRefresh({ keys: ['logo-favicon'] })
      break
    case 'general':
      dispatchStoreThemeRefresh({ keys: ['general'] })
      break
    case 'header-nav':
      dispatchStoreThemeRefresh({ keys: ['header-nav'] })
      break
    case 'floating-buttons':
      if (value) dispatchWindowEvent(FLOATING_BUTTONS_UPDATED_EVENT, value)
      break
    case 'badges':
      if (value) dispatchWindowEvent(BADGES_UPDATED_EVENT, value)
      break
    case 'search':
      if (value) dispatchWindowEvent(SEARCH_UPDATED_EVENT, value)
      break
    case 'cart':
      if (value) dispatchWindowEvent(CART_SETTINGS_UPDATED_EVENT, value)
      break
    case 'account':
      if (value) dispatchWindowEvent(ACCOUNT_SETTINGS_UPDATED_EVENT, value)
      break
    case 'checkout':
      if (value) dispatchWindowEvent(CHECKOUT_SETTINGS_UPDATED_EVENT, value)
      break
    case 'product-page':
      if (value) dispatchWindowEvent(PRODUCT_PAGE_UPDATED_EVENT, value)
      break
    case 'collection-products':
      if (value) dispatchWindowEvent(COLLECTION_PRODUCTS_UPDATED_EVENT, value)
      break
    case 'related-products':
      if (value) dispatchWindowEvent(RELATED_PRODUCTS_UPDATED_EVENT, value)
      break
    case 'recent-products':
      if (value) dispatchWindowEvent(RECENT_PRODUCTS_UPDATED_EVENT, value)
      break
    default:
      // STORE_SETTINGS_REALTIME_EVENT covers announcement/hero/checkout/etc.
      break
  }
}

/**
 * Mount once (root or admin layout). Subscribes to `store_settings` realtime.
 * Requires `store_settings` in supabase_realtime publication (see database SQL).
 */
export function useStoreSettingsRealtime(enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return
    }

    let disposed = false
    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null

    try {
      supabase = createSupabaseBrowserClient()
    } catch {
      return
    }

    const channel = supabase
      .channel('store-settings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (disposed) return
          const row = (payload.new ?? payload.old) as
            | { key?: string; value?: Record<string, unknown> }
            | null
          const key = String(row?.key ?? '').trim()
          if (!key) return
          const value =
            payload.eventType === 'DELETE'
              ? null
              : ((row?.value as Record<string, unknown> | undefined) ?? null)
          emitStoreSettingKeyChange(key, value)
        }
      )
      .subscribe()

    return () => {
      disposed = true
      void supabase?.removeChannel(channel)
    }
  }, [enabled])
}

/** Drop-in provider component for layouts. */
export function StoreSettingsRealtimeBridge({
  enabled = true,
}: {
  enabled?: boolean
}): null {
  useStoreSettingsRealtime(enabled)
  return null
}
