'use client'

import { useEffect, useState } from 'react'
import {
  applyBadgesConfig,
  DEFAULT_BADGES,
  normalizeBadgesConfig,
  type BadgesConfig,
} from '@/lib/badges'
import {
  BADGES_UPDATED_EVENT,
  fetchBadgesSettings,
  readCachedBadges,
} from '@/lib/badges-client'

/** Live global badge settings (override wins for admin preview drafts). */
export function useBadgesConfig(override?: BadgesConfig): BadgesConfig {
  const [badges, setBadges] = useState<BadgesConfig>(
    () => override ?? readCachedBadges()
  )

  useEffect(() => {
    if (override) setBadges(normalizeBadgesConfig(override))
  }, [override])

  useEffect(() => {
    if (override) return

    let cancelled = false
    setBadges(readCachedBadges())
    void fetchBadgesSettings()
      .then((data) => {
        if (!cancelled) setBadges(data)
      })
      .catch(() => {
        if (!cancelled) setBadges(DEFAULT_BADGES)
      })

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<BadgesConfig>).detail
      if (!detail) return
      setBadges(normalizeBadgesConfig(detail))
    }
    window.addEventListener(BADGES_UPDATED_EVENT, onUpdated)
    return () => {
      cancelled = true
      window.removeEventListener(BADGES_UPDATED_EVENT, onUpdated)
    }
  }, [override])

  return badges
}

export function useConfigWithBadges<T extends object>(
  config: T,
  badgesOverride?: BadgesConfig
): T & BadgesConfig {
  const badges = useBadgesConfig(badgesOverride)
  return applyBadgesConfig(config, badges)
}
