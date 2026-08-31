'use client'

import { useEffect, useState } from 'react'
import HeroBannerView from '@/components/hero/HeroBannerView'
import { DEFAULT_HERO_BANNER, type HeroBannerConfig } from '@/lib/hero-banner'

/** Storefront homepage hero — loads saved settings from admin API. */
export default function HeroBanner() {
  const [config, setConfig] = useState<HeroBannerConfig | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      void fetch('/api/admin/hero-banner', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_HERO_BANNER))
        .then((data: HeroBannerConfig) => {
          if (!cancelled) setConfig(data)
        })
        .catch(() => {
          if (!cancelled) setConfig(DEFAULT_HERO_BANNER)
        })
    }

    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [])

  if (!config) return null

  return <HeroBannerView config={config} />
}
