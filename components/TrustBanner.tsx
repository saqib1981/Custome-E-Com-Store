'use client'

import { useEffect, useState } from 'react'
import TrustBannerView from '@/components/home/TrustBannerView'
import { DEFAULT_TRUST_BANNER, type TrustBannerConfig } from '@/lib/trust-banner'

type TrustBannerProps = {
  configOverride?: TrustBannerConfig
}

export default function TrustBanner({ configOverride }: TrustBannerProps) {
  const [config, setConfig] = useState<TrustBannerConfig>(configOverride ?? DEFAULT_TRUST_BANNER)

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
    }
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return

    let cancelled = false

    const load = () => {
      void fetch('/api/store/trust-banner', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_TRUST_BANNER))
        .then((data: TrustBannerConfig) => {
          if (!cancelled) setConfig(data)
        })
        .catch(() => {
          if (!cancelled) setConfig(DEFAULT_TRUST_BANNER)
        })
    }

    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [configOverride])

  return <TrustBannerView config={config} />
}
