export type LogoFaviconConfig = {
  faviconUrl: string
  faviconFileName: string
  logoUrl: string
  logoFileName: string
  logoTransparentUrl: string
  logoTransparentFileName: string
  logoWidthDesktop: number
  logoWidthMobile: number
}

export const LOGO_FAVICON_SETTING_KEY = 'logo-favicon'

export const DEFAULT_LOGO_FAVICON: LogoFaviconConfig = {
  faviconUrl: '',
  faviconFileName: '',
  logoUrl: '',
  logoFileName: '',
  logoTransparentUrl: '',
  logoTransparentFileName: '',
  logoWidthDesktop: 200,
  logoWidthMobile: 150,
}

export function clampLogoWidth(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(400, Math.max(40, Math.round(value)))
}

export function normalizeLogoFaviconConfig(
  input: Partial<LogoFaviconConfig> | null | undefined
): LogoFaviconConfig {
  return {
    faviconUrl: String(input?.faviconUrl ?? '').trim(),
    faviconFileName: String(input?.faviconFileName ?? '').trim(),
    logoUrl: String(input?.logoUrl ?? '').trim(),
    logoFileName: String(input?.logoFileName ?? '').trim(),
    logoTransparentUrl: String(input?.logoTransparentUrl ?? '').trim(),
    logoTransparentFileName: String(input?.logoTransparentFileName ?? '').trim(),
    logoWidthDesktop: clampLogoWidth(
      Number(input?.logoWidthDesktop),
      DEFAULT_LOGO_FAVICON.logoWidthDesktop
    ),
    logoWidthMobile: clampLogoWidth(
      Number(input?.logoWidthMobile),
      DEFAULT_LOGO_FAVICON.logoWidthMobile
    ),
  }
}
