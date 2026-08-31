import { normalizeHexColor } from '@/lib/announcement'

export const TRUST_BANNER_ITEM_COUNT = 3

export type TrustBannerIcon = 'shipping' | 'returns' | 'support'

export type TrustBannerItem = {
  id: string
  icon: TrustBannerIcon
  title: string
  description: string
}

export type TrustBannerConfig = {
  enabled: boolean
  backgroundColor: string
  textColor: string
  items: TrustBannerItem[]
}

export const TRUST_BANNER_SETTING_KEY = 'trust-banner'

const DEFAULT_TRUST_BANNER_ITEMS: TrustBannerItem[] = [
  {
    id: 'trust-shipping',
    icon: 'shipping',
    title: 'Free Shipping',
    description: 'Free shipping on orders above PKR 3500 in Pakistan',
  },
  {
    id: 'trust-returns',
    icon: 'returns',
    title: 'Free Returns',
    description:
      'Free returns within 07 days, please make sure the items are in undamaged condition.',
  },
  {
    id: 'trust-support',
    icon: 'support',
    title: 'Support Online',
    description: 'We support customers 24/7, send questions we will solve for you immediately.',
  },
]

export const DEFAULT_TRUST_BANNER: TrustBannerConfig = {
  enabled: true,
  backgroundColor: '#1f1f1f',
  textColor: '#ffffff',
  items: DEFAULT_TRUST_BANNER_ITEMS,
}

const TRUST_BANNER_ICONS: TrustBannerIcon[] = ['shipping', 'returns', 'support']

function createTrustBannerItemId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `trust-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeTrustBannerIcon(value: unknown, fallback: TrustBannerIcon): TrustBannerIcon {
  return TRUST_BANNER_ICONS.includes(value as TrustBannerIcon) ? (value as TrustBannerIcon) : fallback
}

export function createTrustBannerItem(
  patch: Partial<TrustBannerItem> = {},
  fallbackIcon: TrustBannerIcon = 'shipping'
): TrustBannerItem {
  return {
    id: String(patch.id ?? createTrustBannerItemId()),
    icon: normalizeTrustBannerIcon(patch.icon, fallbackIcon),
    title: String(patch.title ?? '').trim(),
    description: String(patch.description ?? '').trim(),
  }
}

export function normalizeTrustBannerConfig(
  input: Partial<TrustBannerConfig> | null | undefined
): TrustBannerConfig {
  const raw = Array.isArray(input?.items) ? input.items : []
  const items: TrustBannerItem[] = []

  for (let i = 0; i < TRUST_BANNER_ITEM_COUNT; i += 1) {
    const slot = raw[i] as Partial<TrustBannerItem> | undefined
    const fallback = DEFAULT_TRUST_BANNER_ITEMS[i]
    items.push(
      createTrustBannerItem(
        {
          id: slot?.id ?? fallback.id,
          icon: slot?.icon ?? fallback.icon,
          title: slot?.title ?? fallback.title,
          description: slot?.description ?? fallback.description,
        },
        fallback.icon
      )
    )
  }

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_TRUST_BANNER.enabled),
    backgroundColor: normalizeHexColor(input?.backgroundColor, DEFAULT_TRUST_BANNER.backgroundColor),
    textColor: normalizeHexColor(input?.textColor, DEFAULT_TRUST_BANNER.textColor),
    items,
  }
}

export function trustBannerConfigsEqual(a: TrustBannerConfig, b: TrustBannerConfig): boolean {
  if (
    a.enabled !== b.enabled ||
    a.backgroundColor !== b.backgroundColor ||
    a.textColor !== b.textColor ||
    a.items.length !== b.items.length
  ) {
    return false
  }
  return a.items.every(
    (item, index) =>
      item.id === b.items[index]?.id &&
      item.icon === b.items[index]?.icon &&
      item.title === b.items[index]?.title &&
      item.description === b.items[index]?.description
  )
}
