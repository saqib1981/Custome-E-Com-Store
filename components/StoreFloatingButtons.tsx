'use client'

import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import ScrollToTopButton from '@/components/ScrollToTopButton'
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton'
import {
  buildWhatsAppChatUrl,
  DEFAULT_FLOATING_BUTTONS,
  type FloatingButtonsConfig,
} from '@/lib/floating-buttons'
import {
  FLOATING_BUTTONS_CACHE_KEY,
  FLOATING_BUTTONS_UPDATED_EVENT,
  fetchFloatingButtons,
  readCachedFloatingButtons,
} from '@/lib/floating-buttons-client'

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

  useLayoutEffect(() => {
    if (configOverride) return
    setFetchedConfig(readCachedFloatingButtons())
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return

    let cancelled = false

    const apply = (data: FloatingButtonsConfig) => {
      if (!cancelled) setFetchedConfig(data)
    }

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<FloatingButtonsConfig>).detail
      if (detail) {
        apply(detail)
        return
      }
      void fetchFloatingButtons().then(apply).catch(() => {})
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== FLOATING_BUTTONS_CACHE_KEY) return
      apply(readCachedFloatingButtons())
    }

    void fetchFloatingButtons().then(apply).catch(() => {
      if (!cancelled) setFetchedConfig(readCachedFloatingButtons())
    })

    window.addEventListener(FLOATING_BUTTONS_UPDATED_EVENT, onUpdated)
    window.addEventListener('storage', onStorage)

    return () => {
      cancelled = true
      window.removeEventListener(FLOATING_BUTTONS_UPDATED_EVENT, onUpdated)
      window.removeEventListener('storage', onStorage)
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
