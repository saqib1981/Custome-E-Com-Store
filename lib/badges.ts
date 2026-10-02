export const BADGES_SETTING_KEY = 'badges'

export type BadgesConfig = {
  showSaleBadge: boolean
  showNewBadge: boolean
  /** Products created within this many days show the New badge (or Shopify tag `new`). */
  newBadgeDays: number
  /** Show Shopify metafield `custom.bunndle_offer_tags` on product cards. */
  showCustomBadge: boolean
  customBadgeBackgroundColor: string
  customBadgeTextColor: string
}

export const DEFAULT_BADGES: BadgesConfig = {
  showSaleBadge: true,
  showNewBadge: true,
  newBadgeDays: 30,
  showCustomBadge: true,
  customBadgeBackgroundColor: '#dc2626',
  customBadgeTextColor: '#ffffff',
}

function normalizeNewBadgeDays(value: unknown): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_BADGES.newBadgeDays
  return Math.min(365, Math.max(1, Math.round(parsed)))
}

function normalizeHex(value: unknown, fallback: string): string {
  const raw = String(value ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const [, a, b, c] = raw
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase()
  }
  return fallback
}

export function normalizeBadgesConfig(
  input: Partial<BadgesConfig> | null | undefined
): BadgesConfig {
  return {
    showSaleBadge: Boolean(input?.showSaleBadge ?? DEFAULT_BADGES.showSaleBadge),
    showNewBadge: Boolean(input?.showNewBadge ?? DEFAULT_BADGES.showNewBadge),
    newBadgeDays: normalizeNewBadgeDays(input?.newBadgeDays ?? DEFAULT_BADGES.newBadgeDays),
    showCustomBadge: Boolean(input?.showCustomBadge ?? DEFAULT_BADGES.showCustomBadge),
    customBadgeBackgroundColor: normalizeHex(
      input?.customBadgeBackgroundColor,
      DEFAULT_BADGES.customBadgeBackgroundColor
    ),
    customBadgeTextColor: normalizeHex(
      input?.customBadgeTextColor,
      DEFAULT_BADGES.customBadgeTextColor
    ),
  }
}

export function badgesConfigsEqual(a: BadgesConfig, b: BadgesConfig): boolean {
  return (
    a.showSaleBadge === b.showSaleBadge &&
    a.showNewBadge === b.showNewBadge &&
    a.newBadgeDays === b.newBadgeDays &&
    a.showCustomBadge === b.showCustomBadge &&
    a.customBadgeBackgroundColor === b.customBadgeBackgroundColor &&
    a.customBadgeTextColor === b.customBadgeTextColor
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
    showCustomBadge: badges.showCustomBadge,
    customBadgeBackgroundColor: badges.customBadgeBackgroundColor,
    customBadgeTextColor: badges.customBadgeTextColor,
  }
}
