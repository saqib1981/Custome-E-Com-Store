import { normalizeHexColor, normalizeHeight } from '@/lib/announcement'

export type HomeDividerConfig = {
  enabled: boolean
  lineColor: string
  gapTop: string
  gapBottom: string
}

export const HOME_DIVIDER_SETTING_KEY = 'home-divider'
export const HOME_DIVIDER_AFTER_CARDS_SETTING_KEY = 'home-divider-after-cards'
export const HOME_DIVIDER_AFTER_TABS_SETTING_KEY = 'home-divider-after-tabs'

export const DEFAULT_HOME_DIVIDER: HomeDividerConfig = {
  enabled: true,
  lineColor: '#e5e7eb',
  gapTop: '15px',
  gapBottom: '15px',
}

export function normalizeHomeDividerConfig(
  input: Partial<HomeDividerConfig> | null | undefined
): HomeDividerConfig {
  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_HOME_DIVIDER.enabled),
    lineColor: normalizeHexColor(input?.lineColor, DEFAULT_HOME_DIVIDER.lineColor),
    gapTop: normalizeHeight(input?.gapTop, DEFAULT_HOME_DIVIDER.gapTop, 0, 120),
    gapBottom: normalizeHeight(input?.gapBottom, DEFAULT_HOME_DIVIDER.gapBottom, 0, 120),
  }
}

export function homeDividerConfigsEqual(a: HomeDividerConfig, b: HomeDividerConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.lineColor === b.lineColor &&
    a.gapTop === b.gapTop &&
    a.gapBottom === b.gapBottom
  )
}

export function parseHomeDividerGapPx(value: string, fallback: number): number {
  const match = String(value ?? '').match(/^(\d+)px$/)
  return match ? Number(match[1]) : fallback
}
