import { normalizeHexColor } from '@/lib/announcement'

export type HeaderMenuItemHighlight = {
  id: string
  /** Exact level-1 menu title (case-sensitive). */
  menuTitle: string
  linkColor: string
  linkHoverColor: string
  linkActiveColor: string
  linkActiveUnderlineColor: string
  /** Badge text, e.g. Sale. Empty hides the badge. */
  badgeLabel: string
  badgeBackgroundColor: string
  badgeTextColor: string
  openInNewTab: boolean
}

export type HeaderNavSettingsConfig = {
  /** Default menu title color. */
  linkColor: string
  /** Menu title color on hover. */
  linkHoverColor: string
  /** Active page menu title color. */
  linkActiveColor: string
  /** Active page underline color. */
  linkActiveUnderlineColor: string
  /** Top and bottom border color of the menu bar. */
  navBorderColor: string
  /** Per-menu-item styling blocks matched by title. */
  menuHighlights: HeaderMenuItemHighlight[]
}

export const HEADER_NAV_SETTINGS_KEY = 'header-nav'

export const MENU_BADGE_PRESETS = [
  { value: '', label: 'None' },
  { value: 'Sale', label: 'Sale' },
  { value: 'New', label: 'New' },
  { value: 'Hot', label: 'Hot' },
] as const

export const DEFAULT_MENU_ITEM_HIGHLIGHT: Omit<HeaderMenuItemHighlight, 'id'> = {
  menuTitle: '',
  linkColor: '#b91c1c',
  linkHoverColor: '#991b1b',
  linkActiveColor: '#b91c1c',
  linkActiveUnderlineColor: '#b91c1c',
  badgeLabel: 'Sale',
  badgeBackgroundColor: '#b91c1c',
  badgeTextColor: '#ffffff',
  openInNewTab: false,
}

export const DEFAULT_HEADER_NAV_SETTINGS: HeaderNavSettingsConfig = {
  linkColor: '#1f2937',
  linkHoverColor: '#0284c7',
  linkActiveColor: '#0284c7',
  linkActiveUnderlineColor: '#0284c7',
  navBorderColor: '#e5e7eb',
  menuHighlights: [],
}

function createHighlightId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `highlight-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createMenuItemHighlight(
  patch: Partial<HeaderMenuItemHighlight> = {}
): HeaderMenuItemHighlight {
  return normalizeMenuItemHighlight({ id: createHighlightId(), ...patch })
}

export function normalizeMenuItemHighlight(
  input: Partial<HeaderMenuItemHighlight> | null | undefined
): HeaderMenuItemHighlight {
  return {
    id: String(input?.id ?? createHighlightId()),
    menuTitle: String(input?.menuTitle ?? '').trim(),
    linkColor: normalizeHexColor(input?.linkColor, DEFAULT_MENU_ITEM_HIGHLIGHT.linkColor),
    linkHoverColor: normalizeHexColor(
      input?.linkHoverColor,
      DEFAULT_MENU_ITEM_HIGHLIGHT.linkHoverColor
    ),
    linkActiveColor: normalizeHexColor(
      input?.linkActiveColor,
      DEFAULT_MENU_ITEM_HIGHLIGHT.linkActiveColor
    ),
    linkActiveUnderlineColor: normalizeHexColor(
      input?.linkActiveUnderlineColor,
      DEFAULT_MENU_ITEM_HIGHLIGHT.linkActiveUnderlineColor
    ),
    badgeLabel: String(input?.badgeLabel ?? '').trim(),
    badgeBackgroundColor: normalizeHexColor(
      input?.badgeBackgroundColor,
      DEFAULT_MENU_ITEM_HIGHLIGHT.badgeBackgroundColor
    ),
    badgeTextColor: normalizeHexColor(
      input?.badgeTextColor,
      DEFAULT_MENU_ITEM_HIGHLIGHT.badgeTextColor
    ),
    openInNewTab: Boolean(input?.openInNewTab),
  }
}

export function normalizeHeaderNavSettingsConfig(
  input: Partial<HeaderNavSettingsConfig> | null | undefined
): HeaderNavSettingsConfig {
  const rawHighlights = Array.isArray(input?.menuHighlights) ? input.menuHighlights : []

  return {
    linkColor: normalizeHexColor(input?.linkColor, DEFAULT_HEADER_NAV_SETTINGS.linkColor),
    linkHoverColor: normalizeHexColor(
      input?.linkHoverColor,
      DEFAULT_HEADER_NAV_SETTINGS.linkHoverColor
    ),
    linkActiveColor: normalizeHexColor(
      input?.linkActiveColor,
      DEFAULT_HEADER_NAV_SETTINGS.linkActiveColor
    ),
    linkActiveUnderlineColor: normalizeHexColor(
      input?.linkActiveUnderlineColor,
      DEFAULT_HEADER_NAV_SETTINGS.linkActiveUnderlineColor
    ),
    navBorderColor: normalizeHexColor(
      input?.navBorderColor,
      DEFAULT_HEADER_NAV_SETTINGS.navBorderColor
    ),
    menuHighlights: rawHighlights
      .map((item) => normalizeMenuItemHighlight(item as Partial<HeaderMenuItemHighlight>)),
  }
}

export function findMenuHighlight(
  title: string,
  highlights: HeaderMenuItemHighlight[]
): HeaderMenuItemHighlight | undefined {
  if (!title) return undefined
  return highlights.find((item) => item.menuTitle === title)
}

export function menuHighlightsEqual(
  a: HeaderMenuItemHighlight[],
  b: HeaderMenuItemHighlight[]
): boolean {
  if (a.length !== b.length) return false
  return a.every((item, index) => {
    const other = b[index]
    return (
      item.id === other.id &&
      item.menuTitle === other.menuTitle &&
      item.linkColor === other.linkColor &&
      item.linkHoverColor === other.linkHoverColor &&
      item.linkActiveColor === other.linkActiveColor &&
      item.linkActiveUnderlineColor === other.linkActiveUnderlineColor &&
      item.badgeLabel === other.badgeLabel &&
      item.badgeBackgroundColor === other.badgeBackgroundColor &&
      item.badgeTextColor === other.badgeTextColor &&
      item.openInNewTab === other.openInNewTab
    )
  })
}

export function headerNavSettingsToCssVars(
  config: HeaderNavSettingsConfig
): Record<string, string> {
  return {
    '--store-nav-link-color': config.linkColor,
    '--store-nav-link-hover-color': config.linkHoverColor,
    '--store-nav-link-active-color': config.linkActiveColor,
    '--store-nav-link-active-underline-color': config.linkActiveUnderlineColor,
    '--store-nav-border-color': config.navBorderColor,
  }
}

export function menuHighlightToCssVars(
  highlight: HeaderMenuItemHighlight
): Record<string, string> {
  return {
    '--item-link-color': highlight.linkColor,
    '--item-link-hover-color': highlight.linkHoverColor,
    '--item-link-active-color': highlight.linkActiveColor,
    '--item-underline-color': highlight.linkActiveUnderlineColor,
  }
}
