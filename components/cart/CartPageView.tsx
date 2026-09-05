'use client'

import { useEffect, useState } from 'react'
import CartLineList from '@/components/cart/CartLineList'
import CartFreeShippingProgress from '@/components/cart/CartFreeShippingProgress'
import {
  DEFAULT_CART,
  cartSubtotalAmount,
  normalizeCartConfig,
  type CartConfig,
} from '@/lib/cart'
import { fetchStoreCartSettings } from '@/lib/cart-client'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import { useCart } from '@/context/CartContext'

type CartPageViewProps = {
  configOverride?: CartConfig
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}

export default function CartPageView({
  configOverride,
  preview = false,
  onPreviewNavigate,
}: CartPageViewProps) {
  const { lines } = useCart()
  const [config, setConfig] = useState<CartConfig>(
    () => configOverride ?? DEFAULT_CART
  )

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

  const goContinue = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/')
      return
    }
    window.location.href = '/'
  }

  const goCheckout = () => {
    if (!lines.length) return
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/checkout')
      return
    }
    window.location.href = '/checkout'
  }

  if (!config.enabled) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <p className="py-16 text-center text-sm text-gray-500">Cart is disabled</p>
      </section>
    )
  }

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900">{config.cartPageTitle}</h1>

        {lines.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-gray-500">{config.emptyCartText}</p>
            <button
              type="button"
              onClick={goContinue}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              {config.continueShoppingLabel}
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <CartFreeShippingProgress
              subtotal={cartSubtotalAmount(lines)}
              config={config}
            />
            <CartLineList
              lines={lines}
              config={config}
              preview={preview}
              onPreviewNavigate={onPreviewNavigate}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={goContinue}
                className="h-11 rounded-md border border-gray-300 bg-white px-5 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                {config.continueShoppingLabel}
              </button>
              <button
                type="button"
                onClick={goCheckout}
                className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-md bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                {config.checkoutLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
