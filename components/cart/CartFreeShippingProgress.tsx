'use client'

import { Truck } from 'lucide-react'
import {
  formatFreeShippingAmount,
  getFreeShippingProgress,
  type CartConfig,
} from '@/lib/cart'

type CartFreeShippingProgressProps = {
  subtotal: number
  config: CartConfig
  className?: string
}

export default function CartFreeShippingProgress({
  subtotal,
  config,
  className = '',
}: CartFreeShippingProgressProps) {
  if (!config.showFreeShippingProgress || config.freeShippingThreshold <= 0) {
    return null
  }

  const { percent, remaining, unlocked } = getFreeShippingProgress(
    subtotal,
    config.freeShippingThreshold
  )

  return (
    <div className={`rounded-lg bg-gray-50 px-3 py-3 ${className}`}>
      <div className="relative h-2.5 w-full rounded-full bg-gray-200">
        <div
          className="cart-free-ship-fill absolute inset-y-0 left-0 rounded-full bg-red-600 transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
        <span
          className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-red-600 bg-white shadow-sm transition-[left] duration-500 ease-out"
          style={{ left: `${Math.max(percent, 4)}%` }}
          aria-hidden
        >
          <Truck className="h-3.5 w-3.5 text-red-600" strokeWidth={2.25} />
        </span>
      </div>
      <p className="mt-3 text-center text-sm text-gray-700">
        {unlocked ? (
          <span className="font-medium text-red-600">{config.freeShippingUnlockedText}</span>
        ) : (
          <>
            Spend{' '}
            <span className="font-medium text-gray-900">
              {formatFreeShippingAmount(remaining)}
            </span>{' '}
            more to enjoy <span className="font-semibold text-red-600">Free shipping!</span>
          </>
        )}
      </p>
    </div>
  )
}
