'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_ACCOUNT,
  normalizeAccountConfig,
  PREVIEW_ACCOUNT_CUSTOMER,
  type AccountConfig,
  type AccountCustomer,
} from '@/lib/account'
import {
  ACCOUNT_SETTINGS_UPDATED_EVENT,
  fetchStoreAccountSettings,
} from '@/lib/account-client'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'

type AccountViewMode = 'login' | 'account'

type AccountPageViewProps = {
  configOverride?: AccountConfig
  preview?: boolean
  /** Admin preview: show logged-in sample customer instead of login form. */
  previewLoggedIn?: boolean
  onPreviewNavigate?: (path: string) => void
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900'

function formatOrderDate(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return iso || '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(t))
  } catch {
    return iso
  }
}

export default function AccountPageView({
  configOverride,
  preview = false,
  previewLoggedIn = false,
  onPreviewNavigate,
}: AccountPageViewProps) {
  const [config, setConfig] = useState<AccountConfig>(
    () => configOverride ?? DEFAULT_ACCOUNT
  )
  const [mode, setMode] = useState<AccountViewMode>(() =>
    preview && previewLoggedIn ? 'account' : 'login'
  )
  const [customer, setCustomer] = useState<AccountCustomer | null>(() =>
    preview && previewLoggedIn ? PREVIEW_ACCOUNT_CUSTOMER : null
  )
  const [loadingMe, setLoadingMe] = useState(!preview)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (configOverride) {
      setConfig(normalizeAccountConfig(configOverride))
    }
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return
    let cancelled = false
    void fetchStoreAccountSettings()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_ACCOUNT)
      })
    return () => {
      cancelled = true
    }
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<AccountConfig>).detail
      if (detail) setConfig(normalizeAccountConfig(detail))
    }
    window.addEventListener(ACCOUNT_SETTINGS_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(ACCOUNT_SETTINGS_UPDATED_EVENT, onUpdated)
  }, [configOverride])

  useEffect(() => {
    if (preview) {
      setLoadingMe(false)
      if (previewLoggedIn) {
        setCustomer(PREVIEW_ACCOUNT_CUSTOMER)
        setMode('account')
      } else {
        setCustomer(null)
        setMode('login')
      }
      return
    }

    let cancelled = false
    setLoadingMe(true)
    void fetch('/api/store/account/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { customer?: AccountCustomer | null } | null) => {
        if (cancelled) return
        if (data?.customer) {
          setCustomer(data.customer)
          setMode('account')
        } else {
          setCustomer(null)
          setMode('login')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCustomer(null)
          setMode('login')
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMe(false)
      })

    return () => {
      cancelled = true
    }
  }, [preview, previewLoggedIn])

  const goHome = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/')
      return
    }
    window.location.href = '/'
  }

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (preview) {
      setCustomer({
        ...PREVIEW_ACCOUNT_CUSTOMER,
        email: email || PREVIEW_ACCOUNT_CUSTOMER.email,
        displayName: email || PREVIEW_ACCOUNT_CUSTOMER.displayName,
      })
      setMode('account')
      return
    }

    const safeEmail = email.trim()
    if (!safeEmail.includes('@')) {
      setError('Enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/store/account/otp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: safeEmail }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start email login')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start email login')
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (preview) {
      setCustomer(null)
      setMode('login')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/store/account/logout', { method: 'POST' })
      const data = (await res.json()) as { logoutUrl?: string | null }
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl
        return
      }
      setCustomer(null)
      setMode('login')
    } catch {
      setError('Could not log out')
    } finally {
      setSubmitting(false)
    }
  }

  if (!config.enabled) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <p className="py-16 text-center text-sm text-gray-500">Account is disabled</p>
      </section>
    )
  }

  if (loadingMe) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <div className="mx-auto w-full max-w-md animate-pulse space-y-3 py-12">
          <div className="h-7 w-40 rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
          <div className="h-10 w-full rounded bg-gray-200" />
        </div>
      </section>
    )
  }

  if (mode === 'account' && customer) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{config.accountTitle}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Signed in as {customer.displayName || customer.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={submitting}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              {config.logoutButtonLabel}
            </button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Profile
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-900">
                    {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{customer.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-gray-900">{customer.phone || '—'}</dd>
                </div>
              </dl>
            </div>

            {config.showAddresses ? (
              <div className="rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Addresses
                </h2>
                {customer.addresses.length === 0 ? (
                  <p className="mt-3 text-sm text-gray-500">No addresses saved yet.</p>
                ) : (
                  <ul className="mt-3 space-y-4">
                    {customer.addresses.map((addr) => (
                      <li key={addr.id} className="text-sm text-gray-800">
                        <p className="font-medium">{addr.name || customer.displayName}</p>
                        <p>{addr.address1}</p>
                        {addr.address2 ? <p>{addr.address2}</p> : null}
                        <p>
                          {[addr.city, addr.province, addr.zip].filter(Boolean).join(', ')}
                        </p>
                        <p>{addr.country}</p>
                        {addr.phone ? <p className="text-gray-500">{addr.phone}</p> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          {config.showOrders ? (
            <div className="mt-6 rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Order history
              </h2>
              {customer.orders.length === 0 ? (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">You haven&apos;t placed any orders yet.</p>
                  <button
                    type="button"
                    onClick={goHome}
                    className="mt-3 text-sm font-medium text-gray-900 underline"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Order</th>
                        <th className="py-2 pr-4 font-medium">Date</th>
                        <th className="py-2 pr-4 font-medium">Payment</th>
                        <th className="py-2 pr-4 font-medium">Fulfillment</th>
                        <th className="py-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-2.5 pr-4 font-medium text-gray-900">
                            {order.statusUrl && order.statusUrl !== '#' ? (
                              <a
                                href={order.statusUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {order.name}
                              </a>
                            ) : (
                              order.name
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-700">
                            {formatOrderDate(order.processedAt)}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-700">
                            {order.financialStatus || '—'}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-700">
                            {order.fulfillmentStatus || '—'}
                          </td>
                          <td className="py-2.5 text-gray-900">{order.totalPrice || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <div className="mx-auto w-full max-w-md py-8 sm:py-12">
        <h1 className="text-2xl font-semibold text-gray-900">{config.loginTitle}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email. Shopify will send a one-time code to sign you in — no password needed.
        </p>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={(e) => void handleEmailContinue(e)}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? 'Continuing…' : config.loginButtonLabel}
          </button>
        </form>
      </div>
    </section>
  )
}
