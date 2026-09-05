import {
  countryNameFromCode,
  normalizeCountryCode,
} from '@/lib/shopify-country-names'
import {
  checkoutPaymentMethodsEqual,
  DEFAULT_CHECKOUT_PAYMENT_METHODS,
  normalizeCheckoutPaymentMethods,
  type CheckoutPaymentMethod,
} from '@/lib/checkout-payment-methods'

export const CHECKOUT_SETTING_KEY = 'checkout'

export type { CheckoutPaymentMethod }

export type CheckoutConfig = {
  enabled: boolean
  pageTitle: string
  submitLabel: string
  successTitle: string
  successMessage: string
  emptyCartText: string
  showOrderNotes: boolean
  requirePhone: boolean
  requireEmail: boolean
  requireAddress: boolean
  requireCity: boolean
  /**
   * Manual payment methods shown at checkout (name + instructions).
   * Shopify Admin does not expose these notes via API — edit them here.
   */
  paymentMethods: CheckoutPaymentMethod[]
}

export const DEFAULT_CHECKOUT: CheckoutConfig = {
  enabled: true,
  pageTitle: 'Checkout',
  submitLabel: 'Complete order',
  successTitle: 'Order placed',
  successMessage: 'Thank you! We received your order and will contact you soon.',
  emptyCartText: 'Your cart is empty. Add products before checkout.',
  showOrderNotes: true,
  requirePhone: true,
  requireEmail: true,
  requireAddress: true,
  requireCity: true,
  paymentMethods: DEFAULT_CHECKOUT_PAYMENT_METHODS.map((m) => ({ ...m })),
}

/** Matches Shopify one-page checkout delivery + contact fields. */
export type CheckoutCustomerDetails = {
  email: string
  phone: string
  firstName: string
  lastName: string
  /** ISO country code (e.g. PK) from Shopify market / ships-to countries. */
  country: string
  address: string
  apartment: string
  city: string
  postalCode: string
  notes: string
  /** Selected Shopify payment method display name */
  paymentMethod: string
  /** "Email me with news and offers" — subscribe in Shopify when true */
  emailOffers: boolean
}

export const EMPTY_CHECKOUT_CUSTOMER: CheckoutCustomerDetails = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  country: 'PK',
  address: '',
  apartment: '',
  city: '',
  postalCode: '',
  notes: '',
  paymentMethod: 'Cash on Delivery (COD)',
  emailOffers: false,
}

export function normalizeCheckoutConfig(
  input: Partial<CheckoutConfig> | null | undefined
): CheckoutConfig {
  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_CHECKOUT.enabled),
    pageTitle:
      String(input?.pageTitle ?? DEFAULT_CHECKOUT.pageTitle).trim() ||
      DEFAULT_CHECKOUT.pageTitle,
    submitLabel:
      String(input?.submitLabel ?? DEFAULT_CHECKOUT.submitLabel).trim() ||
      DEFAULT_CHECKOUT.submitLabel,
    successTitle:
      String(input?.successTitle ?? DEFAULT_CHECKOUT.successTitle).trim() ||
      DEFAULT_CHECKOUT.successTitle,
    successMessage:
      String(input?.successMessage ?? DEFAULT_CHECKOUT.successMessage).trim() ||
      DEFAULT_CHECKOUT.successMessage,
    emptyCartText:
      String(input?.emptyCartText ?? DEFAULT_CHECKOUT.emptyCartText).trim() ||
      DEFAULT_CHECKOUT.emptyCartText,
    showOrderNotes: Boolean(input?.showOrderNotes ?? DEFAULT_CHECKOUT.showOrderNotes),
    requirePhone: Boolean(input?.requirePhone ?? DEFAULT_CHECKOUT.requirePhone),
    requireEmail: Boolean(input?.requireEmail ?? DEFAULT_CHECKOUT.requireEmail),
    requireAddress: Boolean(input?.requireAddress ?? DEFAULT_CHECKOUT.requireAddress),
    requireCity: Boolean(input?.requireCity ?? DEFAULT_CHECKOUT.requireCity),
    paymentMethods: normalizeCheckoutPaymentMethods(
      (input as Partial<CheckoutConfig> | null | undefined)?.paymentMethods
    ),
  }
}

export function checkoutConfigsEqual(a: CheckoutConfig, b: CheckoutConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.pageTitle === b.pageTitle &&
    a.submitLabel === b.submitLabel &&
    a.successTitle === b.successTitle &&
    a.successMessage === b.successMessage &&
    a.emptyCartText === b.emptyCartText &&
    a.showOrderNotes === b.showOrderNotes &&
    a.requirePhone === b.requirePhone &&
    a.requireEmail === b.requireEmail &&
    a.requireAddress === b.requireAddress &&
    a.requireCity === b.requireCity &&
    checkoutPaymentMethodsEqual(a.paymentMethods, b.paymentMethods)
  )
}

export function customerDisplayName(customer: CheckoutCustomerDetails): string {
  const first = customer.firstName.trim()
  const last = customer.lastName.trim()
  return [first, last].filter(Boolean).join(' ') || 'Customer'
}

export function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const parts = String(fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return { firstName: 'Customer', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function countryToShopifyCode(country: string): string {
  return normalizeCountryCode(country)
}

export function countryDisplayName(country: string): string {
  return countryNameFromCode(normalizeCountryCode(country))
}
