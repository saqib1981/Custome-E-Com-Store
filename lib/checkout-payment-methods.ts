export type CheckoutPaymentMethod = {
  id: string
  name: string
  /** Shown under the selected method (paste Shopify payment instructions here). */
  description: string
  /** Manual / offline (COD, bank deposit) — safe for custom checkout. */
  manual: boolean
}

/** Matches Shopify Settings → Payments → Manual payment methods (default fallback). */
export const DEFAULT_CHECKOUT_PAYMENT_METHODS: CheckoutPaymentMethod[] = [
  {
    id: 'bank-deposit',
    name: 'Bank Deposit',
    description:
      'Pay via bank deposit / transfer. We will share account details after you place the order.',
    manual: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery (COD)',
    description: 'Pay with cash when your order is delivered.',
    manual: true,
  },
]

export function normalizeCheckoutPaymentMethods(
  input: Partial<CheckoutPaymentMethod>[] | null | undefined
): CheckoutPaymentMethod[] {
  const list = Array.isArray(input) ? input : []
  const normalized = list
    .map((raw, index) => {
      const name = String(raw?.name ?? '').trim()
      if (!name) return null
      const id =
        String(raw?.id ?? '')
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || `payment-${index + 1}`
      return {
        id,
        name,
        description: String(raw?.description ?? '').trim(),
        manual: raw?.manual !== false,
      } satisfies CheckoutPaymentMethod
    })
    .filter((m): m is CheckoutPaymentMethod => Boolean(m))

  return normalized.length ? normalized : DEFAULT_CHECKOUT_PAYMENT_METHODS.map((m) => ({ ...m }))
}

export function checkoutPaymentMethodsEqual(
  a: CheckoutPaymentMethod[],
  b: CheckoutPaymentMethod[]
): boolean {
  if (a.length !== b.length) return false
  return a.every(
    (method, i) =>
      method.id === b[i]?.id &&
      method.name === b[i]?.name &&
      method.description === b[i]?.description &&
      method.manual === b[i]?.manual
  )
}
