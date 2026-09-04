'use client'

import { useEffect, useState } from 'react'

type StoreBrandMarkProps = {
  storeName: string
  logoUrl?: string
  /** Logo width in px — height scales automatically. */
  logoWidth?: number
  size?: 'sm' | 'md'
  className?: string
}

/** Logo image when set; otherwise the Shopify store name as text. */
export default function StoreBrandMark({
  storeName,
  logoUrl = '',
  logoWidth,
  size = 'sm',
  className = '',
}: StoreBrandMarkProps) {
  const cleanLogo = logoUrl.trim()
  const name = storeName.trim()
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [cleanLogo])

  if (cleanLogo && !imageFailed) {
    return (
      <div className={`shrink-0 ${className}`} data-brand-logo>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanLogo}
          alt={name || 'Store logo'}
          className="max-h-12 w-auto object-contain"
          style={logoWidth ? { width: logoWidth, maxHeight: 48 } : undefined}
          onError={() => setImageFailed(true)}
        />
      </div>
    )
  }

  if (!name) return null

  return (
    <span
      className={`truncate font-bold text-gray-900 dark:text-gray-100 ${
        size === 'sm' ? 'text-base' : 'text-lg'
      } ${className}`}
      data-brand-text
    >
      {name}
    </span>
  )
}
