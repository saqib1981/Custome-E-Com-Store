export type AnnouncementConfig = {
  enabled: boolean
  /** Scrolling message shown in the top bar. */
  message: string
  /** Marquee loop duration, e.g. "15s". */
  speed: string
  /** Gap between repeated messages. */
  gap: string
  /** Bar background — hex color, e.g. "#0369a1". */
  backgroundColor: string
  /** Message text — hex color, e.g. "#ffffff". */
  textColor: string
  /** Bar height, e.g. "36px". */
  height: string
}

const HEX_3 = /^#[0-9a-fA-F]{3}$/
const HEX_6 = /^#[0-9a-fA-F]{6}$/

/** Normalize user input to a lowercase #rrggbb hex string. */
export function normalizeHexColor(input: string | undefined, fallback: string): string {
  const raw = String(input ?? fallback).trim()
  if (HEX_3.test(raw)) {
    const [, r, g, b] = raw
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  if (HEX_6.test(raw)) return raw.toLowerCase()
  return fallback
}

const HEIGHT_PX = /^(\d+)px$/

/** Normalize bar height to a px string within min–max bounds. */
export function normalizeHeight(input: string | undefined, fallback: string, min = 24, max = 80): string {
  const raw = String(input ?? fallback).trim()
  const match = raw.match(HEIGHT_PX)
  const px = match ? Number(match[1]) : Number(fallback.replace('px', ''))
  const clamped = Math.min(max, Math.max(min, Number.isFinite(px) ? px : 36))
  return `${clamped}px`
}

/** Row key in Supabase `store_settings` for the announcement bar. */
export const ANNOUNCEMENT_SETTING_KEY = 'announcement'

export const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  enabled: true,
  message: 'Free shipping on orders above PKR 3500 in Pakistan',
  speed: '15s',
  gap: '3rem',
  backgroundColor: '#0369a1',
  textColor: '#ffffff',
  height: '36px',
}
