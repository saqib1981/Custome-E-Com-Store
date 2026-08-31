import { normalizeHeight } from '@/lib/announcement'
import { assertShopifyFilesUrl } from '@/lib/store-media'

export type HeroSlide = {
  id: string
  imageUrl: string
  imageFileName: string
  imageUrlMobile: string
  imageFileNameMobile: string
  /** Optional click-through link for the whole slide. */
  linkUrl: string
  alt: string
}

export type HeroBannerConfig = {
  enabled: boolean
  slides: HeroSlide[]
  autoplay: boolean
  /** Seconds between slides when autoplay is on. */
  autoplaySeconds: number
  heightDesktop: string
  heightMobile: string
}

export const HERO_BANNER_SETTING_KEY = 'hero-banner'

export const HERO_BANNER_IMAGE_SIZE_HINT = {
  desktop: '1920 × 800 px',
  mobile: '600 × 480 px',
} as const

/** Design widths used to derive responsive aspect ratio from admin height settings. */
export const HERO_BANNER_DESIGN_WIDTH = {
  desktop: 1920,
  mobile: 600,
} as const

export function parseHeroHeightPx(value: string, fallback: number): number {
  const match = String(value ?? '').match(/^(\d+)px$/)
  return match ? Number(match[1]) : fallback
}

/** CSS aspect-ratio value (e.g. `1920 / 800`) that scales height with viewport width. */
export function heroBannerAspectRatio(
  designWidth: number,
  heightSetting: string,
  fallbackHeight: number
): string {
  const heightPx = parseHeroHeightPx(heightSetting, fallbackHeight)
  return `${designWidth} / ${heightPx}`
}

export const DEFAULT_HERO_BANNER: HeroBannerConfig = {
  enabled: true,
  slides: [],
  autoplay: true,
  autoplaySeconds: 6,
  heightDesktop: '800px',
  heightMobile: '480px',
}

function createSlideId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createHeroSlide(patch: Partial<HeroSlide> = {}): HeroSlide {
  return {
    id: String(patch.id ?? createSlideId()),
    imageUrl: String(patch.imageUrl ?? '').trim(),
    imageFileName: String(patch.imageFileName ?? '').trim(),
    imageUrlMobile: String(patch.imageUrlMobile ?? '').trim(),
    imageFileNameMobile: String(patch.imageFileNameMobile ?? '').trim(),
    linkUrl: normalizeSlideLink(patch.linkUrl),
    alt: String(patch.alt ?? 'Hero slide').trim().slice(0, 120) || 'Hero slide',
  }
}

function normalizeSlideLink(value: unknown): string {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (raw.startsWith('/') || raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `/${raw.replace(/^\/+/, '')}`
}

export function normalizeHeroSlide(input: Partial<HeroSlide> | null | undefined): HeroSlide {
  return {
    id: String(input?.id ?? createSlideId()),
    imageUrl: assertShopifyFilesUrl(String(input?.imageUrl ?? '').trim(), 'Desktop slide image'),
    imageFileName: String(input?.imageFileName ?? '').trim(),
    imageUrlMobile: assertShopifyFilesUrl(String(input?.imageUrlMobile ?? '').trim(), 'Mobile slide image'),
    imageFileNameMobile: String(input?.imageFileNameMobile ?? '').trim(),
    linkUrl: normalizeSlideLink(input?.linkUrl),
    alt: String(input?.alt ?? 'Hero slide').trim().slice(0, 120) || 'Hero slide',
  }
}

type LegacyHeroInput = Partial<HeroBannerConfig> & {
  heading?: string
  subheading?: string
  buttonUrl?: string
  imageUrl?: string
  imageFileName?: string
  imageUrlMobile?: string
  imageFileNameMobile?: string
}

function migrateLegacyHeroInput(input: LegacyHeroInput | null | undefined): Partial<HeroBannerConfig> {
  if (!input || Array.isArray(input.slides)) return input ?? {}

  const legacyDesktop = String(input.imageUrl ?? '').trim()
  if (!legacyDesktop) {
    return { ...input, slides: [] }
  }

  return {
    enabled: input.enabled,
    autoplay: input.autoplay,
    autoplaySeconds: input.autoplaySeconds,
    heightDesktop: input.heightDesktop,
    heightMobile: input.heightMobile,
    slides: [
      {
        id: createSlideId(),
        imageUrl: legacyDesktop,
        imageFileName: String(input.imageFileName ?? '').trim(),
        imageUrlMobile: String(input.imageUrlMobile ?? '').trim(),
        imageFileNameMobile: String(input.imageFileNameMobile ?? '').trim(),
        linkUrl: normalizeSlideLink(input.buttonUrl),
        alt: String(input.heading ?? 'Hero slide').trim() || 'Hero slide',
      },
    ],
  }
}

export function normalizeHeroBannerConfig(
  input: LegacyHeroInput | null | undefined
): HeroBannerConfig {
  const migrated = migrateLegacyHeroInput(input)
  const rawSlides = Array.isArray(migrated.slides) ? migrated.slides : []
  const autoplayRaw = Number(migrated.autoplaySeconds ?? DEFAULT_HERO_BANNER.autoplaySeconds)

  return {
    enabled: Boolean(migrated.enabled ?? DEFAULT_HERO_BANNER.enabled),
    slides: rawSlides
      .map((slide) => normalizeHeroSlide(slide as Partial<HeroSlide>))
      .filter((slide) => slide.imageUrl || slide.imageUrlMobile),
    autoplay: Boolean(migrated.autoplay ?? DEFAULT_HERO_BANNER.autoplay),
    autoplaySeconds: Math.min(30, Math.max(3, Number.isFinite(autoplayRaw) ? autoplayRaw : 6)),
    heightDesktop: normalizeHeight(migrated.heightDesktop, DEFAULT_HERO_BANNER.heightDesktop, 280, 900),
    heightMobile: normalizeHeight(migrated.heightMobile, DEFAULT_HERO_BANNER.heightMobile, 200, 640),
  }
}

export function heroSlidesEqual(a: HeroSlide[], b: HeroSlide[]): boolean {
  if (a.length !== b.length) return false
  return a.every((slide, index) => {
    const other = b[index]
    return (
      slide.id === other.id &&
      slide.imageUrl === other.imageUrl &&
      slide.imageFileName === other.imageFileName &&
      slide.imageUrlMobile === other.imageUrlMobile &&
      slide.imageFileNameMobile === other.imageFileNameMobile &&
      slide.linkUrl === other.linkUrl &&
      slide.alt === other.alt
    )
  })
}

export function heroBannerConfigsEqual(a: HeroBannerConfig, b: HeroBannerConfig): boolean {
  return (
    a.enabled === b.enabled &&
    heroSlidesEqual(a.slides, b.slides) &&
    a.autoplay === b.autoplay &&
    a.autoplaySeconds === b.autoplaySeconds &&
    a.heightDesktop === b.heightDesktop &&
    a.heightMobile === b.heightMobile
  )
}
