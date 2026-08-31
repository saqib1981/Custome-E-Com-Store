'use client'

import { getStoreNameInitials } from '@/lib/storeProfile'

type StoreBrandMarkProps = {
  storeName: string
  logoUrl?: string
  /** Logo width in px — height scales automatically. */
  logoWidth?: number
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: { initials: 'w-8 h-8 text-xs' },
  md: { initials: 'w-12 h-12 text-sm' },
} as const

/** Logo image, or initials circle when no logo is set. */
export default function StoreBrandMark({
  storeName,
  logoUrl = '',
  logoWidth,
  size = 'sm',
  className = '',
}: StoreBrandMarkProps) {
  const initials = getStoreNameInitials(storeName)
  const s = sizeClasses[size]
  const cleanLogo = logoUrl.trim()

  if (cleanLogo) {
    return (
      <div className={`shrink-0 ${className}`} data-brand-logo>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanLogo}
          alt={storeName}
          className="max-h-12 w-auto object-contain"
          style={logoWidth ? { width: logoWidth, maxHeight: 48 } : undefined}
        />
      </div>
    )
  }

  return (
    <div className={`shrink-0 ${className}`} data-brand-logo>
      <span
        className={`flex items-center justify-center rounded font-semibold bg-primary-600 text-white ${s.initials}`}
        title={storeName}
      >
        {initials}
      </span>
    </div>
  )
}
