'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import CartLineList from '@/components/cart/CartLineList'
import CartFreeShippingProgress from '@/components/cart/CartFreeShippingProgress'
import {
  DEFAULT_CART,
  cartSubtotalAmount,
  normalizeCartConfig,
  type CartConfig,
} from '@/lib/cart'
import { fetchStoreCartSettings } from '@/lib/cart-client'
import { useCart } from '@/context/CartContext'

const DRAWER_TRANSITION_MS = 320

type CartDrawerProps = {
  configOverride?: CartConfig
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  forceOpen?: boolean
}

export default function CartDrawer({
  configOverride,
  preview = false,
  onPreviewNavigate,
  forceOpen = false,
}: CartDrawerProps) {
  const { lines, drawerOpen, closeDrawer } = useCart()
  const [config, setConfig] = useState<CartConfig>(
    () => configOverride ?? DEFAULT_CART
  )
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  const wantOpen = (forceOpen || drawerOpen) && config.enabled && config.drawerEnabled

  useEffect(() => {
    if (configOverride) {
      setConfig(normalizeCartConfig(configOverride))
      return
    }
    let cancelled = false
    void fetchStoreCartSettings()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_CART)
      })
    return () => {
      cancelled = true
    }
  }, [configOverride])

  useEffect(() => {
    if (wantOpen) {
      setMounted(true)
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true))
      })
      return () => window.cancelAnimationFrame(id)
    }

    setVisible(false)
    const t = window.setTimeout(() => setMounted(false), DRAWER_TRANSITION_MS)
    return () => window.clearTimeout(t)
  }, [wantOpen])

  useEffect(() => {
    if (!wantOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wantOpen, closeDrawer])

  if (!mounted) return null

  const goCartPage = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/cart')
      closeDrawer()
      return
    }
    window.location.href = '/cart'
  }

  const goContinue = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/')
      closeDrawer()
      return
    }
    closeDrawer()
  }

  const handleCheckout = async () => {
    if (!lines.length) return
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed')
      if (preview) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = data.url
      }
    } catch (e) {
      setCheckoutError(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div
      className={
        preview
          ? 'absolute inset-0 z-[70] overflow-hidden'
          : 'fixed inset-0 z-[70] h-[100dvh] max-h-[100dvh] overflow-hidden'
      }
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close cart"
        onClick={closeDrawer}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className={`absolute inset-y-0 right-0 flex h-full max-h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out will-change-transform ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">{config.cartPageTitle}</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length > 0 ? (
          <div className="shrink-0 border-b border-gray-100 px-4 py-3">
            <CartFreeShippingProgress
              subtotal={cartSubtotalAmount(lines)}
              config={config}
            />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-gray-500">{config.emptyCartText}</p>
              <button
                type="button"
                onClick={goContinue}
                className="text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
              >
                {config.continueShoppingLabel}
              </button>
            </div>
          ) : (
            <CartLineList
              lines={lines}
              config={config}
              compact
              preview={preview}
              onPreviewNavigate={onPreviewNavigate}
            />
          )}
        </div>

        {lines.length > 0 ? (
          <div className="shrink-0 space-y-2 border-t border-gray-200 px-4 py-4">
            {checkoutError ? (
              <p className="text-sm text-red-600">{checkoutError}</p>
            ) : null}
            <button
              type="button"
              onClick={() => void handleCheckout()}
              disabled={checkoutLoading}
              className="flex h-11 w-full items-center justify-center rounded-md bg-gray-900 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-300"
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                config.checkoutLabel
              )}
            </button>
            <button
              type="button"
              onClick={goCartPage}
              className="flex h-11 w-full items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-900 transition hover:bg-gray-50"
            >
              View cart
            </button>
            <button
              type="button"
              onClick={goContinue}
              className="w-full py-1 text-center text-sm text-gray-500 transition hover:text-gray-800"
            >
              {config.continueShoppingLabel}
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}
