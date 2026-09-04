/** Format a Shopify money amount for storefront display. */
export function formatMoney(amount: string, currencyCode: string): string {
  const value = Number(amount)
  if (!Number.isFinite(value)) return ''
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(value)
  } catch {
    return `${currencyCode} ${amount}`
  }
}
