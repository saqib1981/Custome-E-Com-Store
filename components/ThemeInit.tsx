'use client'

import { useLayoutEffect } from 'react'
import { readStoredTheme, getDefaultTheme } from '@/lib/theme'

/** Applies `dark` on `<html>` before paint so first load matches saved preference. */
export default function ThemeInit() {
  useLayoutEffect(() => {
    const t = readStoredTheme() ?? getDefaultTheme()
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])

  return null
}
