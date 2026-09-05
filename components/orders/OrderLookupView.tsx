'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Package } from 'lucide-react'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import {
  normalizeOrderName,
  orderNameToPathSegment,
  writeOrderAccess,
  type PublicOrder,
} from '@/lib/orders'

type OrderLookupViewProps = {
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  initialEmail?: string
  initialPhone?: string
}

export default function OrderLookupView({
  preview = false,
  onPreviewNavigate,
  initialEmail = '',
  initialPhone = '',
}: OrderLookupViewProps) {
  const [orderName, setOrderName] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<PublicOrder[]>([])

  const goOrder = (name: string) => {
    const segment = orderNameToPathSegment(name)
    writeOrderAccess({ orderName: name, email, phone })
    const path = `/orders/${segment}`
    if (preview && onPreviewNavigate) {
      onPreviewNavigate(path)
      return
    }
    window.location.href = path
  }

  const lookupOne = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const name = normalizeOrderName(orderName)
    if (!name) {
      setError('Enter your order number')
      return
    }
    if (!email.trim() && !phone.trim()) {
      setError('Enter the email or phone used at checkout')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/store/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderName: name, email, phone }),
      })
      const data = (await res.json()) as { order?: PublicOrder; error?: string }
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Order not found')
      }
      goOrder(data.order.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async (e?: FormEvent) => {
    e?.preventDefault()
    setError(null)
    if (!email.trim() && !phone.trim()) {
      setError('Enter email or phone to see order history')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/store/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, history: true }),
      })
      const data = (await res.json()) as { orders?: PublicOrder[]; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to load orders')
      setHistory(data.orders ?? [])
      if (!(data.orders ?? []).length) {
        setError('No orders found for this email or phone')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialEmail || initialPhone) {
      void loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-gray-700" aria-hidden />
          <h1 className="text-2xl font-semibold text-gray-900">Your orders</h1>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Look up an order with your order number and the email or phone you used at checkout.
          Or load your full order history with email / phone only.
        </p>

        <form className="mt-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5" onSubmit={(e) => void lookupOne(e)}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800">Order number</span>
            <input
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="#1001"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </label>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadHistory()}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
            >
              View order history
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Find order'}
            </button>
          </div>
        </form>

        {history.length > 0 ? (
          <ul className="mt-8 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {history.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  onClick={() => goOrder(order.name)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50"
                >
                  <span>
                    <span className="block text-sm font-semibold text-gray-900">{order.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : '—'}{' '}
                      · {order.financialStatus}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-gray-900">{order.total}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
