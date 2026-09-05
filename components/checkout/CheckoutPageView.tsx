'use client'

import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Loader2, Lock } from 'lucide-react'
import {
  DEFAULT_CHECKOUT,
  EMPTY_CHECKOUT_CUSTOMER,
  normalizeCheckoutConfig,
  type CheckoutConfig,
  type CheckoutCustomerDetails,
} from '@/lib/checkout'
import { fetchStoreCheckoutSettings } from '@/lib/checkout-client'
import {
  cartSubtotalAmount,
  formatCartOptionSummary,
  formatFreeShippingAmount,
  type CartLine,
} from '@/lib/cart'
import { useCart } from '@/context/CartContext'
import {
  DEFAULT_CART,
  normalizeCartConfig,
  type CartConfig,
} from '@/lib/cart'
import { fetchStoreCartSettings } from '@/lib/cart-client'
import { useStoreTheme } from '@/context/StoreThemeContext'
import StoreBrandMark from '@/components/StoreBrandMark'
import type { CheckoutCountryOption } from '@/lib/shopify-country-names'
import {
  dialCodeForCountry,
  formatE164,
  looksLikeEmailInput,
  looksLikePhoneInput,
  normalizeNationalPhone,
  phoneLengthForCountry,
  validateNationalPhone,
  COUNTRY_DIAL_CODES,
} from '@/lib/phone-dial-codes'

type CheckoutPageViewProps = {
  configOverride?: CheckoutConfig
  cartConfigOverride?: CartConfig
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}

/** Shopify-style floating field — soft radius, tall hit area, label floats on focus/value. */
function ShopifyField({
  id,
  label,
  required,
  value,
  onChange,
  type = 'text',
  autoComplete,
  className = '',
  showHelp,
  as = 'input',
  rows = 3,
}: {
  id?: string
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  className?: string
  showHelp?: boolean
  as?: 'input' | 'textarea'
  rows?: number
}) {
  const autoId = useId()
  const fieldId = id || autoId
  const filled = value.trim().length > 0
  const [focused, setFocused] = useState(false)
  const float = focused || filled

  const controlClass = [
    'w-full rounded-lg border border-[#c9cccf] bg-white text-[14px] leading-5 text-[#333333]',
    'outline-none transition-[border-color,box-shadow] duration-150',
    'hover:border-[#999999]',
    'focus:border-[#1773b0] focus:shadow-[0_0_0_1px_#1773b0]',
    as === 'textarea'
      ? 'min-h-[5.5rem] resize-y px-3 pb-2 pt-5'
      : 'h-[52px] px-3 pb-[6px] pt-[18px]',
    showHelp ? 'pr-10' : '',
  ].join(' ')

  return (
    <div className={`relative ${className}`}>
      {as === 'textarea' ? (
        <textarea
          id={fieldId}
          required={required}
          rows={rows}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={controlClass}
          aria-label={label}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          required={required}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={controlClass}
          aria-label={label}
        />
      )}
      <label
        htmlFor={fieldId}
        className={[
          'pointer-events-none absolute left-3 text-[#737373] transition-all duration-150',
          float
            ? 'top-[6px] text-[11px] leading-none'
            : as === 'textarea'
              ? 'top-3.5 text-[14px] leading-5'
              : 'top-1/2 -translate-y-1/2 text-[14px] leading-5',
        ].join(' ')}
      >
        {label}
      </label>
      {showHelp ? (
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]"
          title="We'll use this to send you updates"
          aria-hidden
        >
          <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      ) : null}
    </div>
  )
}

function ShopifySelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] w-full appearance-none rounded-lg border border-[#c9cccf] bg-white px-3 pb-[6px] pt-[18px] text-[14px] leading-5 text-[#333333] outline-none transition-[border-color,box-shadow] duration-150 hover:border-[#999999] focus:border-[#1773b0] focus:shadow-[0_0_0_1px_#1773b0]"
        aria-label={label}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute left-3 top-[6px] text-[11px] leading-none text-[#737373]">
        {label}
      </span>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]"
        aria-hidden
      />
    </div>
  )
}

function ShopifyCheck({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-0.5">
      <span className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={[
            'flex h-[18px] w-[18px] items-center justify-center rounded-full border transition',
            checked
              ? 'border-[#1773b0] bg-[#1773b0]'
              : 'border-[#8a8a8a] bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#1773b0]/40',
          ].join(' ')}
          aria-hidden
        >
          {checked ? (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none">
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </span>
      <span className="text-[14px] leading-5 text-[#333333]">{children}</span>
    </label>
  )
}

function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[1.125rem] font-semibold tracking-tight text-[#333333]">{children}</h2>
      {aside}
    </div>
  )
}

type ContactMode = 'empty' | 'email' | 'phone'

function useDialOptions(countries: CheckoutCountryOption[]) {
  return useMemo(() => {
    const codes = countries.length
      ? countries.map((c) => ({
          country: c.code,
          dial: dialCodeForCountry(c.code),
          name: c.name,
        }))
      : Object.entries(COUNTRY_DIAL_CODES).map(([country, dial]) => ({
          country,
          dial,
          name: country,
        }))
    const seen = new Set<string>()
    return codes.filter((o) => {
      const key = `${o.country}:${o.dial}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [countries])
}

/** Delivery phone: always dial code + national number, length-checked per country. */
function PhoneWithDialCode({
  id,
  countryCode,
  countries,
  value,
  required,
  onChange,
  onCountryChange,
  showError,
}: {
  id?: string
  countryCode: string
  countries: CheckoutCountryOption[]
  value: string
  required?: boolean
  onChange: (e164: string) => void
  onCountryChange?: (countryCode: string) => void
  showError?: boolean
}) {
  const fieldId = useId()
  const inputId = id || fieldId
  const [focused, setFocused] = useState(false)
  const dialCode = dialCodeForCountry(countryCode)
  const dialOptions = useDialOptions(countries)
  const rule = phoneLengthForCountry(countryCode)
  const national = normalizeNationalPhone(value, dialCode)
  const float = focused || national.length > 0
  const error = national
    ? validateNationalPhone(countryCode, national)
    : required
      ? 'Enter a phone number'
      : null
  const showErr = Boolean(showError && error)

  const commit = (nextDial: string, nextNational: string, nextCountry?: string) => {
    const capped = nextNational.replace(/\D/g, '').slice(0, rule.max)
    if (nextCountry && nextCountry !== countryCode) {
      onCountryChange?.(nextCountry)
    }
    onChange(formatE164(nextDial, capped))
  }

  const onDialChange = (nextDial: string) => {
    const matched = dialOptions.find((o) => o.dial === nextDial)
    const nextCountry = matched?.country
    const nextRule = phoneLengthForCountry(nextCountry || countryCode)
    const capped = national.replace(/\D/g, '').slice(0, nextRule.max)
    if (nextCountry && nextCountry !== countryCode) {
      onCountryChange?.(nextCountry)
    }
    onChange(formatE164(nextDial, capped))
  }

  return (
    <div>
      <div
        className={[
          'flex h-[52px] overflow-hidden rounded-lg border bg-white transition-[border-color,box-shadow] duration-150',
          showErr
            ? 'border-red-500 shadow-[0_0_0_1px_#ef4444]'
            : focused
              ? 'border-[#1773b0] shadow-[0_0_0_1px_#1773b0]'
              : 'border-[#c9cccf] hover:border-[#999999]',
        ].join(' ')}
      >
        <label className="relative flex h-full w-[5.75rem] shrink-0 items-stretch border-r border-[#c9cccf] bg-[#fafafa]">
          <select
            aria-label="Country calling code"
            value={dialCode}
            onChange={(e) => onDialChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-full w-full cursor-pointer appearance-none bg-transparent py-0 pl-2.5 pr-6 text-[14px] font-medium text-[#333333] outline-none"
          >
            {dialOptions.map((o) => (
              <option key={`${o.country}-${o.dial}`} value={o.dial}>
                {o.dial}
              </option>
            ))}
            {!dialOptions.some((o) => o.dial === dialCode) ? (
              <option value={dialCode}>{dialCode}</option>
            ) : null}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]"
            aria-hidden
          />
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id={inputId}
            type="tel"
            inputMode="numeric"
            required={required}
            value={national}
            autoComplete="tel-national"
            maxLength={rule.max}
            onChange={(e) => commit(dialCode, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-full w-full bg-transparent px-3 pb-[6px] pt-[18px] pr-10 text-[14px] leading-5 text-[#333333] outline-none"
            aria-label="Phone"
            aria-invalid={showErr || undefined}
          />
          <span
            className={[
              'pointer-events-none absolute left-3 text-[#737373] transition-all duration-150',
              float
                ? 'top-[6px] text-[11px] leading-none'
                : 'top-1/2 -translate-y-1/2 text-[14px] leading-5',
            ].join(' ')}
          >
            Phone
          </span>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
            <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
        </div>
      </div>
      {showErr ? (
        <p className="mt-1.5 text-[12px] text-red-600">{error}</p>
      ) : (
        <p className="mt-1.5 text-[12px] text-[#717171]">
          {dialCode} · {rule.min === rule.max ? `${rule.min} digits` : `${rule.min}–${rule.max} digits`}
          {rule.example ? ` · e.g. ${rule.example}` : ''}
        </p>
      )}
    </div>
  )
}

/** Shopify Contact: email OR phone — phone mode shows country dial code. */
function ContactEmailOrPhone({
  countryCode,
  countries,
  required,
  onEmailChange,
  onPhoneChange,
}: {
  countryCode: string
  countries: CheckoutCountryOption[]
  required?: boolean
  onEmailChange: (email: string) => void
  onPhoneChange: (phone: string, dialCode: string, national: string) => void
}) {
  const fieldId = useId()
  const [focused, setFocused] = useState(false)
  const [dialCode, setDialCode] = useState(() => dialCodeForCountry(countryCode))
  const [draft, setDraft] = useState('')
  const dialOptions = useDialOptions(countries)
  const rule = phoneLengthForCountry(countryCode)

  useEffect(() => {
    setDialCode(dialCodeForCountry(countryCode))
  }, [countryCode])

  const mode: ContactMode = looksLikePhoneInput(draft)
    ? 'phone'
    : looksLikeEmailInput(draft)
      ? 'email'
      : 'empty'

  const isPhone = mode === 'phone'
  const national = isPhone ? normalizeNationalPhone(draft, dialCode).slice(0, rule.max) : ''
  const displayValue = isPhone ? national : draft
  const float = focused || displayValue.trim().length > 0
  const label = isPhone ? 'Phone' : 'Email or mobile phone number'
  const phoneError =
    isPhone && national ? validateNationalPhone(countryCode, national) : null

  const applyDraft = (next: string) => {
    if (!next.trim()) {
      setDraft('')
      onEmailChange('')
      return
    }
    if (looksLikePhoneInput(next)) {
      const nat = normalizeNationalPhone(next, dialCode).slice(0, rule.max)
      setDraft(nat)
      onPhoneChange(formatE164(dialCode, nat), dialCode, nat)
      onEmailChange('')
      return
    }
    setDraft(next)
    onEmailChange(next.trim())
  }

  const onDialChange = (nextDial: string) => {
    setDialCode(nextDial)
    if (isPhone || looksLikePhoneInput(draft)) {
      const nat = normalizeNationalPhone(draft, nextDial).slice(0, rule.max)
      setDraft(nat)
      onPhoneChange(formatE164(nextDial, nat), nextDial, nat)
      onEmailChange('')
    }
  }

  if (isPhone) {
    return (
      <div>
        <div
          className={[
            'flex h-[52px] overflow-hidden rounded-lg border bg-white transition-[border-color,box-shadow] duration-150',
            phoneError && national.length >= rule.min
              ? 'border-red-500'
              : focused
                ? 'border-[#1773b0] shadow-[0_0_0_1px_#1773b0]'
                : 'border-[#c9cccf] hover:border-[#999999]',
          ].join(' ')}
        >
          <label className="relative flex h-full w-[5.75rem] shrink-0 items-stretch border-r border-[#c9cccf] bg-[#fafafa]">
            <select
              aria-label="Country calling code"
              value={dialCode}
              onChange={(e) => onDialChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="h-full w-full cursor-pointer appearance-none bg-transparent py-0 pl-2.5 pr-6 text-[14px] font-medium text-[#333333] outline-none"
            >
              {dialOptions.map((o) => (
                <option key={`${o.country}-${o.dial}`} value={o.dial}>
                  {o.dial}
                </option>
              ))}
              {!dialOptions.some((o) => o.dial === dialCode) ? (
                <option value={dialCode}>{dialCode}</option>
              ) : null}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]"
              aria-hidden
            />
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              id={fieldId}
              type="tel"
              inputMode="numeric"
              required={required}
              value={displayValue}
              autoComplete="tel-national"
              maxLength={rule.max}
              onChange={(e) => applyDraft(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="h-full w-full bg-transparent px-3 pb-[6px] pt-[18px] pr-10 text-[14px] leading-5 text-[#333333] outline-none"
              aria-label="Phone"
            />
            <span
              className={[
                'pointer-events-none absolute left-3 text-[#737373] transition-all duration-150',
                float
                  ? 'top-[6px] text-[11px] leading-none'
                  : 'top-1/2 -translate-y-1/2 text-[14px] leading-5',
              ].join(' ')}
            >
              {label}
            </span>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
              <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
          </div>
        </div>
        {phoneError && national.length > 0 ? (
          <p className="mt-1.5 text-[12px] text-red-600">{phoneError}</p>
        ) : (
          <p className="mt-1.5 text-[12px] text-[#717171]">
            {dialCode} · {rule.min === rule.max ? `${rule.min} digits` : `${rule.min}–${rule.max} digits`}
            {rule.example ? ` · e.g. ${rule.example}` : ''}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        id={fieldId}
        type={mode === 'email' ? 'email' : 'text'}
        inputMode={mode === 'email' ? 'email' : 'text'}
        required={required}
        value={displayValue}
        autoComplete="email"
        onChange={(e) => applyDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          'h-[52px] w-full rounded-lg border border-[#c9cccf] bg-white px-3 pb-[6px] pt-[18px] pr-10',
          'text-[14px] leading-5 text-[#333333] outline-none transition-[border-color,box-shadow] duration-150',
          'hover:border-[#999999] focus:border-[#1773b0] focus:shadow-[0_0_0_1px_#1773b0]',
        ].join(' ')}
        aria-label={label}
      />
      <label
        htmlFor={fieldId}
        className={[
          'pointer-events-none absolute left-3 text-[#737373] transition-all duration-150',
          float
            ? 'top-[6px] text-[11px] leading-none'
            : 'top-1/2 -translate-y-1/2 text-[14px] leading-5',
        ].join(' ')}
      >
        {label}
      </label>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">
        <HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
    </div>
  )
}

const STANDARD_SHIPPING_PKR = 200

function OrderSummaryBlock({
  lines,
  cartConfig,
  subtotal,
  shippingAmount,
  shippingLabel,
}: {
  lines: CartLine[]
  cartConfig: CartConfig
  subtotal: number
  shippingAmount: number
  shippingLabel: string
}) {
  const total = subtotal + shippingAmount

  return (
    <div className="space-y-5">
      <ul className="space-y-4">
        {lines.map((line) => {
          const options = formatCartOptionSummary(line)
          return (
            <li key={line.variantId} className="flex items-start gap-3.5">
              <span className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-lg border border-[#dedede] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
                {line.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.imageUrl}
                    alt={line.imageAlt || line.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#f0f0f0] text-[10px] text-[#888]">
                    No image
                  </span>
                )}
                <span className="absolute -right-2 -top-2 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#666666] px-1.5 text-[12px] font-medium text-white">
                  {line.quantity}
                </span>
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-[14px] font-medium leading-snug text-[#333333]">
                  {line.title}
                </span>
                {options ? (
                  <span className="mt-0.5 block text-[12px] text-[#717171]">{options}</span>
                ) : null}
              </span>
              {cartConfig.showPrices && line.price ? (
                <span className="shrink-0 pt-0.5 text-[14px] text-[#333333]">{line.price}</span>
              ) : null}
            </li>
          )
        })}
      </ul>

      <div className="space-y-2.5 border-t border-[#e6e6e6] pt-4 text-[14px]">
        <div className="flex items-center justify-between text-[#545454]">
          <span>Subtotal</span>
          <span className="text-[#333333]">{formatFreeShippingAmount(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[#545454]">
          <span>Shipping</span>
          <span className="text-[#333333]">{shippingLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#e6e6e6] pt-3.5">
          <span className="text-[16px] font-semibold text-[#333333]">Total</span>
          <span className="flex items-baseline gap-1.5">
            <span className="text-[12px] font-normal text-[#717171]">PKR</span>
            <span className="text-[18px] font-semibold text-[#333333]">
              {formatFreeShippingAmount(total)}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPageView({
  configOverride,
  cartConfigOverride,
  preview = false,
  onPreviewNavigate,
}: CheckoutPageViewProps) {
  const { lines, clearCart, closeDrawer } = useCart()
  const { storeName, logoFavicon } = useStoreTheme()
  const [config, setConfig] = useState<CheckoutConfig>(
    () => configOverride ?? DEFAULT_CHECKOUT
  )
  const [cartConfig, setCartConfig] = useState<CartConfig>(
    () => cartConfigOverride ?? DEFAULT_CART
  )
  const [customer, setCustomer] = useState<CheckoutCustomerDetails>(EMPTY_CHECKOUT_CUSTOMER)
  const [countries, setCountries] = useState<CheckoutCountryOption[]>([
    { code: 'PK', name: 'Pakistan' },
  ])
  const [emailOffers, setEmailOffers] = useState(false)
  const [saveInfo, setSaveInfo] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [placed, setPlaced] = useState<{
    orderName?: string
    statusPageUrl?: string
  } | null>(null)

  useEffect(() => {
    closeDrawer()
  }, [closeDrawer])

  useEffect(() => {
    if (configOverride) {
      setConfig(normalizeCheckoutConfig(configOverride))
      return
    }
    let cancelled = false
    void fetchStoreCheckoutSettings()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_CHECKOUT)
      })
    return () => {
      cancelled = true
    }
  }, [configOverride])

  useEffect(() => {
    if (cartConfigOverride) {
      setCartConfig(normalizeCartConfig(cartConfigOverride))
      return
    }
    let cancelled = false
    void fetchStoreCartSettings()
      .then((data) => {
        if (!cancelled) setCartConfig(data)
      })
      .catch(() => {
        if (!cancelled) setCartConfig(DEFAULT_CART)
      })
    return () => {
      cancelled = true
    }
  }, [cartConfigOverride])

  useEffect(() => {
    let cancelled = false
    void fetch('/api/store/checkout/countries', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (data: { countries?: CheckoutCountryOption[]; defaultCountryCode?: string } | null) => {
          if (cancelled || !data) return
          const list = Array.isArray(data.countries) ? data.countries : []
          if (list.length) setCountries(list)
          const defaultCode = String(data.defaultCountryCode || list[0]?.code || 'PK')
            .trim()
            .toUpperCase()
          setCustomer((prev) => {
            const stillValid = list.some((c) => c.code === prev.country)
            if (stillValid && prev.country) return prev
            return { ...prev, country: defaultCode }
          })
        }
      )
      .catch(() => {
        /* keep PK fallback */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const subtotal = useMemo(() => cartSubtotalAmount(lines), [lines])
  const previewLines: CartLine[] = lines

  const shippingFree =
    cartConfig.showFreeShippingProgress &&
    cartConfig.freeShippingThreshold > 0 &&
    subtotal >= cartConfig.freeShippingThreshold
  const shippingAmount = shippingFree ? 0 : STANDARD_SHIPPING_PKR
  const shippingLabel = shippingFree ? 'Free' : formatFreeShippingAmount(STANDARD_SHIPPING_PKR)
  const orderTotal = subtotal + shippingAmount

  const patchCustomer = (patch: Partial<CheckoutCustomerDetails>) => {
    setCustomer((prev) => ({ ...prev, ...patch }))
    setError(null)
  }

  const goHome = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/')
      return
    }
    window.location.href = '/'
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!previewLines.length || submitting) return
    setPhoneTouched(true)

    if (config.requirePhone || customer.phone.trim()) {
      const phoneErr = validateNationalPhone(
        customer.country,
        normalizeNationalPhone(customer.phone, dialCodeForCountry(customer.country))
      )
      if (phoneErr) {
        setError(phoneErr)
        return
      }
    }

    setSubmitting(true)
    setError(null)
    try {
      const notesExtra = [
        customer.notes.trim(),
        emailOffers ? 'Marketing emails: yes' : '',
        saveInfo ? 'Save info for next time: yes' : '',
      ]
        .filter(Boolean)
        .join('\n')

      const res = await fetch('/api/store/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: previewLines,
          customer: { ...customer, notes: notesExtra },
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        orderName?: string
        statusPageUrl?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to place order')
      }
      clearCart()
      setPlaced({ orderName: data.orderName, statusPageUrl: data.statusPageUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const brand = (
    <button
      type="button"
      onClick={goHome}
      className="inline-flex max-w-full items-center text-left"
      aria-label="Back to store"
    >
      <StoreBrandMark
        storeName={storeName || 'Store'}
        logoUrl={logoFavicon.logoUrl}
        logoWidth={logoFavicon.logoWidthDesktop}
        size="md"
      />
    </button>
  )

  if (!config.enabled) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white px-4 py-16">
        <p className="text-sm text-[#717171]">Checkout is disabled</p>
      </div>
    )
  }

  if (placed) {
    return (
      <div className="min-h-[70vh] bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          {brand}
          <h1 className="mt-8 text-2xl font-semibold text-[#333]">{config.successTitle}</h1>
          <p className="mt-3 text-sm text-[#545454]">{config.successMessage}</p>
          {placed.orderName ? (
            <p className="mt-2 text-sm font-medium text-[#333]">Order {placed.orderName}</p>
          ) : null}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {placed.statusPageUrl ? (
              <a
                href={placed.statusPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#1773b0] px-5 text-sm font-semibold text-white hover:bg-[#0f5f94]"
              >
                View order status
              </a>
            ) : null}
            <button
              type="button"
              onClick={goHome}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[#c9cccf] px-5 text-sm font-medium text-[#333] hover:bg-[#fafafa]"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!previewLines.length) {
    return (
      <div className="min-h-[70vh] bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          {brand}
          <h1 className="mt-8 text-2xl font-semibold text-[#333]">{config.pageTitle}</h1>
          <p className="mt-3 text-sm text-[#717171]">{config.emptyCartText}</p>
          <button
            type="button"
            onClick={goHome}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-[#1773b0] px-5 text-sm font-semibold text-white hover:bg-[#0f5f94]"
          >
            Continue shopping
          </button>
        </div>
      </div>
    )
  }

  const summary = (
    <OrderSummaryBlock
      lines={previewLines}
      cartConfig={cartConfig}
      subtotal={subtotal}
      shippingAmount={shippingAmount}
      shippingLabel={shippingLabel}
    />
  )

  return (
    <div className="checkout-shopify min-h-full w-full bg-white text-[#333333] antialiased">
      {/* Full-width checkout header — logo spans whole page */}
      <header className="w-full border-b border-[#e6e6e6] bg-white">
        <div className="mx-auto flex w-full max-w-[1100px] items-center px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
          {brand}
        </div>
      </header>

      <div className="border-b border-[#e6e6e6] bg-[#f5f5f5] lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-4 sm:px-6"
          onClick={() => setSummaryOpen((v) => !v)}
          aria-expanded={summaryOpen}
        >
          <span className="inline-flex items-center gap-2 text-[14px] font-medium text-[#1773b0]">
            {summaryOpen ? 'Hide order summary' : 'Show order summary'}
            {summaryOpen ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </span>
          <span className="text-[16px] font-semibold">
            {formatFreeShippingAmount(orderTotal)}
          </span>
        </button>
        {summaryOpen ? (
          <div className="border-t border-[#e6e6e6] px-4 py-4 sm:px-6">{summary}</div>
        ) : null}
      </div>

      <div className="mx-auto grid w-full max-w-[1100px] lg:grid-cols-[minmax(0,58%)_minmax(0,42%)]">
        <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <form className="space-y-8" onSubmit={(e) => void handleSubmit(e)} noValidate>
            <section>
              <SectionTitle>Contact</SectionTitle>
              <div className="space-y-3">
                <ContactEmailOrPhone
                  countryCode={customer.country}
                  countries={countries}
                  required={config.requireEmail || config.requirePhone}
                  onEmailChange={(email) => patchCustomer({ email })}
                  onPhoneChange={(phone) => patchCustomer({ phone, email: '' })}
                />
                <ShopifyCheck checked={emailOffers} onChange={setEmailOffers}>
                  Email me with news and offers
                </ShopifyCheck>
              </div>
            </section>

            <section>
              <SectionTitle>Delivery</SectionTitle>
              <div className="space-y-3">
                <ShopifySelect
                  id="checkout-country"
                  label="Country/Region"
                  value={customer.country}
                  onChange={(v) => patchCustomer({ country: v })}
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </ShopifySelect>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ShopifyField
                    id="checkout-first-name"
                    label="First name"
                    required
                    value={customer.firstName}
                    onChange={(v) => patchCustomer({ firstName: v })}
                    autoComplete="given-name"
                  />
                  <ShopifyField
                    id="checkout-last-name"
                    label="Last name"
                    value={customer.lastName}
                    onChange={(v) => patchCustomer({ lastName: v })}
                    autoComplete="family-name"
                  />
                </div>

                <ShopifyField
                  id="checkout-address"
                  label="Address"
                  required={config.requireAddress}
                  value={customer.address}
                  onChange={(v) => patchCustomer({ address: v })}
                  autoComplete="street-address"
                />

                <ShopifyField
                  id="checkout-apartment"
                  label="Apartment, suite, etc. (optional)"
                  value={customer.apartment}
                  onChange={(v) => patchCustomer({ apartment: v })}
                  autoComplete="address-line2"
                />

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
                  <ShopifyField
                    id="checkout-city"
                    label="City"
                    required={config.requireCity}
                    value={customer.city}
                    onChange={(v) => patchCustomer({ city: v })}
                    autoComplete="address-level2"
                  />
                  <ShopifyField
                    id="checkout-postal"
                    label="Postal code (optional)"
                    value={customer.postalCode}
                    onChange={(v) => patchCustomer({ postalCode: v })}
                    autoComplete="postal-code"
                  />
                </div>

                <PhoneWithDialCode
                  id="checkout-phone"
                  countryCode={customer.country}
                  countries={countries}
                  value={customer.phone}
                  required={config.requirePhone}
                  showError={phoneTouched}
                  onChange={(phone) => {
                    setPhoneTouched(true)
                    patchCustomer({ phone })
                  }}
                  onCountryChange={(country) => patchCustomer({ country })}
                />

                <ShopifyCheck checked={saveInfo} onChange={setSaveInfo}>
                  Save this information for next time
                </ShopifyCheck>
              </div>
            </section>

            <section>
              <SectionTitle>Shipping method</SectionTitle>
              <div className="overflow-hidden rounded-lg border border-[#1773b0] bg-[#f0f5ff]">
                <div className="flex items-center justify-between gap-3 px-3.5 py-3.5">
                  <span className="flex items-center gap-3">
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-[5px] border-[#1773b0] bg-white" />
                    <span className="text-[14px] text-[#333333]">Standard</span>
                  </span>
                  <span className="text-[14px] font-medium text-[#333333]">{shippingLabel}</span>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle>Payment</SectionTitle>
              <p className="-mt-1 mb-3 text-[13px] text-[#717171]">
                All transactions are secure and encrypted.
              </p>
              <div className="overflow-hidden rounded-lg border border-[#1773b0]">
                <div className="flex items-center gap-3 bg-[#f0f5ff] px-3.5 py-3.5">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-[5px] border-[#1773b0] bg-white" />
                  <span className="text-[14px] text-[#333333]">Cash on Delivery (COD)</span>
                </div>
                <div className="bg-[#fafafa] px-3.5 py-6 text-center text-[13px] text-[#545454]">
                  Pay with cash when your order is delivered.
                </div>
              </div>
            </section>

            {config.showOrderNotes ? (
              <section>
                <SectionTitle>Order notes</SectionTitle>
                <ShopifyField
                  id="checkout-notes"
                  label="Notes (optional)"
                  value={customer.notes}
                  onChange={(v) => patchCustomer({ notes: v })}
                  as="textarea"
                  rows={3}
                />
              </section>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[56px] w-full items-center justify-center rounded-lg bg-[#1773b0] text-[16px] font-semibold text-white transition hover:bg-[#0f5f94] disabled:bg-[#8fbad6]"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                config.submitLabel
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 pb-4 text-[12px] text-[#717171]">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Secure checkout
            </p>
          </form>
        </div>

        <aside className="hidden min-w-0 border-l border-[#e6e6e6] bg-[#f5f5f5] px-8 py-10 lg:block lg:px-10">
          <div className="sticky top-8">{summary}</div>
        </aside>
      </div>
    </div>
  )
}
