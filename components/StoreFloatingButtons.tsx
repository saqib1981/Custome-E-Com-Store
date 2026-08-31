'use client'

import { useEffect, useMemo, useState } from 'react'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton'
import {
  buildWhatsAppChatUrl,
  DEFAULT_FLOATING_BUTTONS,
  type FloatingButtonsConfig,
} from '@/lib/floating-buttons'

type StoreFloatingButtonsProps = {
  pathname?: string
  preview?: boolean
  configOverride?: FloatingButtonsConfig
  pageUrlOverride?: string
}

export default function StoreFloatingButtons({
  pathname,
  preview = false,
  configOverride,
  pageUrlOverride,
}: StoreFloatingButtonsProps) {
  const [fetchedConfig, setFetchedConfig] = useState<FloatingButtonsConfig>(DEFAULT_FLOATING_BUTTONS)
  const [pageUrl, setPageUrl] = useState('')

  const config = configOverride ?? fetchedConfig

  useEffect(() => {
    if (configOverride) return

    let cancelled = false

    const load = () => {
      void fetch('/api/store/floating-buttons', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : DEFAULT_FLOATING_BUTTONS))
        .then((data: FloatingButtonsConfig) => {
          if (!cancelled) setFetchedConfig(data)
        })
        .catch(() => {
          if (!cancelled) setFetchedConfig(DEFAULT_FLOATING_BUTTONS)
        })
    }

    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [configOverride])

  useEffect(() => {
    if (pageUrlOverride) {
      setPageUrl(pageUrlOverride)
      return
    }
    setPageUrl(window.location.href)
  }, [pathname, pageUrlOverride])

  const resolvedPageUrl = pageUrlOverride || pageUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const whatsappHref = useMemo(() => {
    if (!config.whatsappEnabled) return ''
    if (config.whatsappNumber) {
      return buildWhatsAppChatUrl(config.whatsappNumber, resolvedPageUrl)
    }
    if (preview) return '#'
    return ''
  }, [config.whatsappEnabled, config.whatsappNumber, resolvedPageUrl, preview])

  const showBackToTop = config.backToTopEnabled
  const showWhatsApp = Boolean(whatsappHref)

  if (!showBackToTop && !showWhatsApp) return null

  const positionClass = preview ? 'absolute bottom-5 right-5' : 'fixed bottom-5 right-5'

  return (
    <div className={`${positionClass} z-40 flex flex-col-reverse items-center gap-3`}>
      {showWhatsApp ? (
        <WhatsAppFloatingButton href={whatsappHref} preview={preview && whatsappHref === '#'} />
      ) : null}
      {showBackToTop ? (
        <ScrollToTopButton pathname={pathname} embedded preview={preview} enabled />
      ) : null}
    </div>
  )
}
