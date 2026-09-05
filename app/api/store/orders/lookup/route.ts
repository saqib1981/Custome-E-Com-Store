import { NextRequest, NextResponse } from 'next/server'
import {
  fetchShopifyOrderByName,
  lookupOrdersByContact,
  orderContactMatches,
} from '@/lib/shopify-orders-server'
import { normalizeOrderName } from '@/lib/orders'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      orderName?: string
      email?: string
      phone?: string
      history?: boolean
    }

    const email = String(body.email ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Enter the email or phone used at checkout' },
        { status: 400 }
      )
    }

    const orderName = normalizeOrderName(String(body.orderName ?? ''))

    // Single order lookup
    if (orderName && !body.history) {
      const order = await fetchShopifyOrderByName(orderName)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      if (!orderContactMatches(order, email, phone)) {
        return NextResponse.json(
          { error: 'Email or phone does not match this order' },
          { status: 403 }
        )
      }
      return NextResponse.json({ order })
    }

    // History by contact
    const orders = await lookupOrdersByContact({ email, phone })
    return NextResponse.json({ orders })
  } catch (e) {
    console.error('Order lookup error:', e)
    const message = e instanceof Error ? e.message : 'Failed to look up order'
    if (/access denied|denied/i.test(message)) {
      return NextResponse.json(
        {
          error:
            'Missing Shopify scope read_orders. Enable it on your app, then reinstall.',
        },
        { status: 403 }
      )
    }
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 })
  }
}
