import { normalizeHexColor } from '@/lib/announcement'

export type FooterSocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'whatsapp'

export type FooterSocialLink = {
  id: string
  platform: FooterSocialPlatform
  url: string
  enabled: boolean
}

export type FooterMenuLink = {
  id: string
  label: string
  href: string
}

export type StoreFooterConfig = {
  enabled: boolean
  backgroundColor: string
  textColor: string
  headingColor: string
  borderColor: string
  infoHeading: string
  logoUrl: string
  logoFileName: string
  description: string
  city: string
  phone: string
  email: string
  socialLinks: FooterSocialLink[]
  helpHeading: string
  menuLinks: FooterMenuLink[]
  newsletterEnabled: boolean
  newsletterHeading: string
  newsletterPlaceholder: string
  newsletterButtonText: string
  newsletterDisclaimer: string
  copyrightText: string
}

export const STORE_FOOTER_SETTING_KEY = 'store-footer'

const FOOTER_SOCIAL_PLATFORMS: FooterSocialPlatform[] = [
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'whatsapp',
]

const DEFAULT_SOCIAL_LINKS: FooterSocialLink[] = [
  {
    id: 'footer-social-facebook',
    platform: 'facebook',
    url: 'https://www.facebook.com/people/At-One-Spot/61567300170154',
    enabled: true,
  },
  {
    id: 'footer-social-instagram',
    platform: 'instagram',
    url: 'https://www.instagram.com/atonespot.pk/',
    enabled: true,
  },
  {
    id: 'footer-social-tiktok',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@at.one.spot',
    enabled: true,
  },
  {
    id: 'footer-social-youtube',
    platform: 'youtube',
    url: 'https://www.youtube.com/@atOneSpot-Pk',
    enabled: true,
  },
  {
    id: 'footer-social-whatsapp',
    platform: 'whatsapp',
    url: 'https://whatsapp.com/channel/0029Vas68WyH5JLq1zVcQ02r',
    enabled: true,
  },
]

const DEFAULT_MENU_LINKS: FooterMenuLink[] = [
  { id: 'footer-link-search', label: 'Search', href: '/search' },
  { id: 'footer-link-about', label: 'About Us', href: '/pages/about-us' },
  { id: 'footer-link-privacy', label: 'Privacy Policy', href: '/pages/privacy-policy' },
  {
    id: 'footer-link-shipping',
    label: 'Shipping & Payments',
    href: '/pages/shipping-payments',
  },
  {
    id: 'footer-link-returns',
    label: 'Exchange, Return & Refund Policy',
    href: '/pages/exchange-return-refund-policy',
  },
  {
    id: 'footer-link-terms',
    label: 'Terms and Conditions',
    href: '/pages/terms-and-conditions',
  },
  { id: 'footer-link-faq', label: 'FAQ', href: '/pages/faq' },
]

export const DEFAULT_STORE_FOOTER: StoreFooterConfig = {
  enabled: true,
  backgroundColor: '#ffffff',
  textColor: '#374151',
  headingColor: '#111827',
  borderColor: '#e5e7eb',
  infoHeading: 'Information',
  logoUrl: '',
  logoFileName: '',
  description:
    'at One Spot an online Shopping Market Place. Shop Online at One Spot and Delivery on Your Door Step. 😍',
  city: 'Gujranwala',
  phone: '+92 311 1668976',
  email: 'info@atonespot.pk',
  socialLinks: DEFAULT_SOCIAL_LINKS,
  helpHeading: 'Help Customer',
  menuLinks: DEFAULT_MENU_LINKS,
  newsletterEnabled: true,
  newsletterHeading: 'Sign Up to Newsletter',
  newsletterPlaceholder: 'Enter your email...',
  newsletterButtonText: 'Sign Up',
  newsletterDisclaimer:
    '***By entering the e-mail you accept the terms and conditions and the privacy policy.',
  copyrightText: '© {year}, {storeName} - All rights reserved.',
}

const COPYRIGHT_TEMPLATE_PREFIX = '© {year}, {storeName}'

/** Builds the stored copyright template from an editable suffix (after the store name). */
export function buildCopyrightTemplate(suffix: string): string {
  const cleaned = suffix.trim() || '- All rights reserved.'
  const normalizedSuffix = cleaned.startsWith('-') ? cleaned : `- ${cleaned}`
  return `${COPYRIGHT_TEMPLATE_PREFIX} ${normalizedSuffix}`
}

/** Returns the editable suffix portion of a copyright template. */
export function extractCopyrightSuffix(template: string): string {
  const normalized = normalizeCopyrightText(template)
  const match = normalized.match(/\{storeName\}\s*(.*)$/i)
  if (match?.[1]?.trim()) return match[1].trim()
  return '- All rights reserved.'
}

function normalizeCopyrightText(input: unknown): string {
  const raw = String(input ?? DEFAULT_STORE_FOOTER.copyrightText).trim()
  if (raw.includes('{year}') && raw.includes('{storeName}')) {
    return raw
  }

  const legacyMatch = raw.match(/^©\s*\d{4},\s*.+?(\s*-\s*.+)$/i)
  if (legacyMatch) {
    return buildCopyrightTemplate(legacyMatch[1].trim())
  }

  if (raw.includes('{year}') && !raw.includes('{storeName}')) {
    return raw.replace(/,\s*[^,{]+/, ', {storeName}')
  }

  return DEFAULT_STORE_FOOTER.copyrightText
}

/** Renders copyright with the current year and Shopify store name. */
export function formatFooterCopyright(text: string, storeName = ''): string {
  const year = String(new Date().getFullYear())
  const brand = storeName.trim() || 'Store'

  return normalizeCopyrightText(text)
    .replace(/\{year\}/g, year)
    .replace(/\{storeName\}/g, brand)
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeSocialPlatform(value: unknown, fallback: FooterSocialPlatform): FooterSocialPlatform {
  return FOOTER_SOCIAL_PLATFORMS.includes(value as FooterSocialPlatform)
    ? (value as FooterSocialPlatform)
    : fallback
}

function normalizeSocialLinks(input: unknown): FooterSocialLink[] {
  if (!Array.isArray(input) || !input.length) return DEFAULT_SOCIAL_LINKS.map((link) => ({ ...link }))

  return input.map((raw, index) => {
    const slot = raw as Partial<FooterSocialLink>
    const fallback = DEFAULT_SOCIAL_LINKS[index] ?? DEFAULT_SOCIAL_LINKS[0]
    return {
      id: String(slot.id ?? fallback.id ?? createId('footer-social')),
      platform: normalizeSocialPlatform(slot.platform, fallback.platform),
      url: String(slot.url ?? fallback.url ?? '').trim(),
      enabled: Boolean(slot.enabled ?? true),
    }
  })
}

function normalizeMenuLinks(input: unknown): FooterMenuLink[] {
  if (!Array.isArray(input) || !input.length) return DEFAULT_MENU_LINKS.map((link) => ({ ...link }))

  return input
    .map((raw) => {
      const slot = raw as Partial<FooterMenuLink>
      const label = String(slot.label ?? '').trim()
      const href = String(slot.href ?? '').trim()
      if (!label) return null
      return {
        id: String(slot.id ?? createId('footer-link')),
        label,
        href: href || '#',
      }
    })
    .filter((link): link is FooterMenuLink => link !== null)
}

export function normalizeStoreFooterConfig(
  input: Partial<StoreFooterConfig> | null | undefined
): StoreFooterConfig {
  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_STORE_FOOTER.enabled),
    backgroundColor: normalizeHexColor(input?.backgroundColor, DEFAULT_STORE_FOOTER.backgroundColor),
    textColor: normalizeHexColor(input?.textColor, DEFAULT_STORE_FOOTER.textColor),
    headingColor: normalizeHexColor(input?.headingColor, DEFAULT_STORE_FOOTER.headingColor),
    borderColor: normalizeHexColor(input?.borderColor, DEFAULT_STORE_FOOTER.borderColor),
    infoHeading: String(input?.infoHeading ?? DEFAULT_STORE_FOOTER.infoHeading).trim(),
    logoUrl: String(input?.logoUrl ?? DEFAULT_STORE_FOOTER.logoUrl).trim(),
    logoFileName: String(input?.logoFileName ?? DEFAULT_STORE_FOOTER.logoFileName).trim(),
    description: String(input?.description ?? DEFAULT_STORE_FOOTER.description).trim(),
    city: String(input?.city ?? DEFAULT_STORE_FOOTER.city).trim(),
    phone: String(input?.phone ?? DEFAULT_STORE_FOOTER.phone).trim(),
    email: String(input?.email ?? DEFAULT_STORE_FOOTER.email).trim(),
    socialLinks: normalizeSocialLinks(input?.socialLinks),
    helpHeading: String(input?.helpHeading ?? DEFAULT_STORE_FOOTER.helpHeading).trim(),
    menuLinks: normalizeMenuLinks(input?.menuLinks),
    newsletterEnabled: Boolean(input?.newsletterEnabled ?? DEFAULT_STORE_FOOTER.newsletterEnabled),
    newsletterHeading: String(input?.newsletterHeading ?? DEFAULT_STORE_FOOTER.newsletterHeading).trim(),
    newsletterPlaceholder: String(
      input?.newsletterPlaceholder ?? DEFAULT_STORE_FOOTER.newsletterPlaceholder
    ).trim(),
    newsletterButtonText: String(
      input?.newsletterButtonText ?? DEFAULT_STORE_FOOTER.newsletterButtonText
    ).trim(),
    newsletterDisclaimer: String(
      input?.newsletterDisclaimer ?? DEFAULT_STORE_FOOTER.newsletterDisclaimer
    ).trim(),
    copyrightText: normalizeCopyrightText(input?.copyrightText),
  }
}

export function storeFooterConfigsEqual(a: StoreFooterConfig, b: StoreFooterConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
