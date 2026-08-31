'use client'

import { getStoreNameInitials } from '@/lib/storeProfile'

type StoreBrandMarkProps = {
  storeName: string
  logoUrl?: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: { logo: 'w-8 h-8', initials: 'w-8 h-8 text-xs' },
  md: { logo: 'w-12 h-12', initials: 'w-12 h-12 text-sm' },
} as const

/** Logo image, or initials circle when no logo is set. */
export default function StoreBrandMark({
  storeName,
  logoUrl = '',
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
          className={`${s.logo} rounded object-cover border border-gray-200 dark:border-gray-600`}
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
