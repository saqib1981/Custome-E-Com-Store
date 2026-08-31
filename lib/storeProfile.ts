export type StoreProfile = {
  storeName: string
  logoUrl: string
}

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  storeName: 'Custom E-Com Store',
  logoUrl: '',
}

/** Acronym from store name (e.g. "My Store" → "MS"). */
export function getStoreNameInitials(name: string): string {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    const word = parts[0]
    return (word.length >= 3 ? word.slice(0, 3) : word).toUpperCase()
  }
  return parts
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 4)
    .toUpperCase()
}
