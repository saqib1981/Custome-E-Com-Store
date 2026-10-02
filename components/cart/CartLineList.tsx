'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import {
  formatCartOptionSummary,
  type CartConfig,
  type CartLine,
} from '@/lib/cart'
import { useCart } from '@/context/CartContext'

type CartLineListProps = {
  lines: CartLine[]
  config: CartConfig
  compact?: boolean
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}

export default function CartLineList({
  lines,
  config,
  compact = false,
  preview = false,
  onPreviewNavigate,
}: CartLineListProps) {
  const { setLineQuantity, removeLine } = useCart()
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({})

  const goToProduct = (handle: string) => {
    if (!handle) return
    const path = `/products/${encodeURIComponent(handle)}`
    if (preview && onPreviewNavigate) {
      onPreviewNavigate(path)
      return
    }
    window.location.href = path
  }

  if (!lines.length) return null

  return (
    <ul className={`divide-y divide-gray-100 ${compact ? '' : 'rounded-xl border border-gray-200 bg-white'}`}>
      {lines.map((line) => {
        const options = formatCartOptionSummary(line)
        const failed = imageFailed[line.variantId]
        return (
          <li key={line.variantId} className={`flex gap-3 ${compact ? 'py-3' : 'p-3 sm:p-4'}`}>
            {config.showProductImages ? (
              <button
                type="button"
                onClick={() => goToProduct(line.handle)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100"
              >
                {line.imageUrl && !failed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.imageUrl}
                    alt={line.imageAlt || line.title}
                    className="h-full w-full object-cover"
                    onError={() =>
                      setImageFailed((prev) => ({ ...prev, [line.variantId]: true }))
                    }
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-gray-500">
                    {line.imageAlt || line.title}
                  </span>
                )}
              </button>
            ) : null}

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => goToProduct(line.handle)}
                className="store-product-card-title w-full text-left text-sm font-medium text-gray-900 hover:text-primary-600"
                title={line.title}
              >
                {line.title}
              </button>
              {options ? (
                <p className="mt-0.5 text-xs text-gray-500">{options}</p>
              ) : null}
              {config.showPrices && line.price ? (
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {line.price}
                  {line.compareAtPrice ? (
                    <span className="ml-2 text-xs font-normal text-red-600 line-through">
                      {line.compareAtPrice}
                    </span>
                  ) : null}
                </p>
              ) : null}

              <div className="mt-2 flex items-center justify-between gap-2">
                {config.showQuantityControls ? (
                  <div className="inline-flex h-8 items-stretch overflow-hidden rounded-md border border-gray-300">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setLineQuantity(line.variantId, line.quantity - 1)}
                      className="flex w-7 items-center justify-center text-gray-700 hover:bg-gray-50"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="flex min-w-[1.75rem] items-center justify-center text-sm tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setLineQuantity(line.variantId, line.quantity + 1)}
                      className="flex w-7 items-center justify-center text-gray-700 hover:bg-gray-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-600">Qty {line.quantity}</span>
                )}
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => removeLine(line.variantId)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
