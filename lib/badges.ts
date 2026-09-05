export const BADGES_SETTING_KEY = 'badges'

export type BadgesConfig = {
  showSaleBadge: boolean
  showNewBadge: boolean
  /** Products created within this many days show the New badge (or Shopify tag `new`). */
  newBadgeDays: number
}

export const DEFAULT_BADGES: BadgesConfig = {
  showSaleBadge: true,
  showNewBadge: true,
  newBadgeDays: 30,
}

function normalizeNewBadgeDays(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_BADGES.newBadgeDays
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

export function normalizeBadgesConfig(
  input: Partial<BadgesConfig> | null | undefined
): BadgesConfig {
  return {
    showSaleBadge: Boolean(input?.showSaleBadge ?? DEFAULT_BADGES.showSaleBadge),
    showNewBadge: Boolean(input?.showNewBadge ?? DEFAULT_BADGES.showNewBadge),
    newBadgeDays: normalizeNewBadgeDays(input?.newBadgeDays ?? DEFAULT_BADGES.newBadgeDays),
  }
}

export function badgesConfigsEqual(a: BadgesConfig, b: BadgesConfig): boolean {
  return (
    a.showSaleBadge === b.showSaleBadge &&
    a.showNewBadge === b.showNewBadge &&
    a.newBadgeDays === b.newBadgeDays
  )
}

/** Overlay global badge settings onto section/product configs used for display. */
export function applyBadgesConfig<T extends object>(
  config: T,
  badges: BadgesConfig
): T & BadgesConfig {
  return {
    ...config,
    showSaleBadge: badges.showSaleBadge,
    showNewBadge: badges.showNewBadge,
    newBadgeDays: badges.newBadgeDays,
  }
}
