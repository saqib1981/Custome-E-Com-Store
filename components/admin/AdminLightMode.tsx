'use client'

import { useLayoutEffect } from 'react'
import { readStoredTheme } from '@/lib/theme'

/** Theme editor always runs in light mode so the preview matches the live storefront. */
export default function AdminLightMode() {
  useLayoutEffect(() => {
    const stored = readStoredTheme()
    document.documentElement.classList.remove('dark')

    return () => {
      if (stored === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
  }, [])

  return null
}
