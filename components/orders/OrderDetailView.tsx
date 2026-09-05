'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import {
  normalizeOrderName,
  readOrderAccess,
  writeOrderAccess,
  type PublicOrder,
} from '@/lib/orders'

type OrderDetailViewProps = {
  orderNameParam: string
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}

export default function OrderDetailView({
  orderNameParam,
  preview = false,
  onPreviewNavigate,
}: OrderDetailViewProps) {
  const orderName = normalizeOrderName(orderNameParam)
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const goOrders = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/orders')
      return
    }
    window.location.href = '/orders'
  }

  const fetchOrder = async (contact: { email: string; phone: string }) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/store/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderName,
          email: contact.email,
          phone: contact.phone,
        }),
      })
      const data = (await res.json()) as { order?: PublicOrder; error?: string }
      if (!res.ok || !data.order) {
        if (res.status === 403 || res.status === 404) {
          setNeedsAuth(true)
          setOrder(null)
          throw new Error(data.error || 'Confirm email or phone to view this order')
        }
        throw new Error(data.error || 'Failed to load order')
      }
      writeOrderAccess({
        orderName: data.order.name,
        email: contact.email,
        phone: contact.phone,
      })
      setOrder(data.order)
      setNeedsAuth(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const access = readOrderAccess()
    if (access?.email) setEmail(access.email)
    if (access?.phone) setPhone(access.phone)

    const sameOrder =
      access &&
      normalizeOrderName(access.orderName) === orderName &&
      (access.email || access.phone)

    if (sameOrder) {
      void fetchOrder({ email: access!.email, phone: access!.phone })
      return
    }

    setLoading(false)
    setNeedsAuth(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderName])

  const onUnlock = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() && !phone.trim()) {
      setError('Enter the email or phone used at checkout')
      return
    }
    setSubmitting(true)
    await fetchOrder({ email, phone })
    setSubmitting(false)
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900'

  if (loading) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" aria-hidden />
        </div>
      </section>
    )
  }

  if (needsAuth && !order) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900">Order {orderName || ''}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Confirm the email or phone you used at checkout to view this order on our store.
          </p>
          <form className="mt-6 space-y-3" onSubmit={(e) => void onUnlock(e)}>
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
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                'View order'
              )}
            </button>
            <button
              type="button"
              onClick={goOrders}
              className="w-full py-2 text-sm text-gray-600 underline-offset-2 hover:underline"
            >
              Look up another order
            </button>
          </form>
        </div>
      </section>
    )
  }

  if (!order) {
    return (
      <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
        <div className="mx-auto max-w-md py-12 text-center">
          <p className="text-sm text-gray-600">{error || 'Order not found'}</p>
          <button
            type="button"
            onClick={goOrders}
            className="mt-4 text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
          >
            Back to orders
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">Order</p>
            <h1 className="text-2xl font-semibold text-gray-900">{order.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-medium text-gray-900">{order.financialStatus}</p>
            <p className="text-gray-600">{order.fulfillmentStatus}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="text-base font-semibold text-gray-900">Items</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {order.lines.map((line, i) => (
                <li key={`${line.title}-${i}`} className="flex gap-3 py-3">
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.imageAlt || line.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900">{line.title}</span>
                    {line.variantTitle ? (
                      <span className="mt-0.5 block text-xs text-gray-500">{line.variantTitle}</span>
                    ) : null}
                    <span className="mt-1 block text-xs text-gray-600">Qty {line.quantity}</span>
                  </span>
                  {line.price ? (
                    <span className="shrink-0 text-sm font-medium text-gray-900">{line.price}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.totalShipping}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900">Delivery</h2>
              {order.shippingAddress ? (
                <div className="mt-2 space-y-0.5 text-sm text-gray-700">
                  {order.shippingAddress.name ? <p>{order.shippingAddress.name}</p> : null}
                  {order.shippingAddress.address1 ? <p>{order.shippingAddress.address1}</p> : null}
                  {order.shippingAddress.address2 ? <p>{order.shippingAddress.address2}</p> : null}
                  <p>
                    {[order.shippingAddress.city, order.shippingAddress.zip]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                  {order.shippingAddress.country ? <p>{order.shippingAddress.country}</p> : null}
                  {order.shippingAddress.phone ? <p>{order.shippingAddress.phone}</p> : null}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No shipping address</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold text-gray-900">Payment</h2>
              <p className="mt-2 text-sm text-gray-700">
                {order.paymentGatewayNames.length
                  ? order.paymentGatewayNames.join(', ')
                  : 'Payment pending'}
              </p>
              <p className="mt-1 text-sm text-gray-600">{order.financialStatus}</p>
            </div>

            {order.note ? (
              <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                <h2 className="text-base font-semibold text-gray-900">Notes</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{order.note}</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={goOrders}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              All orders
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
