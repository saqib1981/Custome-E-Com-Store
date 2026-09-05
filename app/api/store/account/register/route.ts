import { NextRequest, NextResponse } from 'next/server'
import { customerRegister } from '@/lib/shopify-customer-auth-server'
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  customerAccessTokenCookieOptions,
} from '@/lib/customer-session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      phone?: string
      acceptsMarketing?: boolean
    }
    const result = await customerRegister({
      email: String(body.email ?? ''),
      password: String(body.password ?? ''),
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      acceptsMarketing: body.acceptsMarketing,
    })
    if (!result.ok || !result.accessToken) {
      return NextResponse.json({ error: result.error || 'Registration failed' }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true, customer: result.customer })
    res.cookies.set(
      CUSTOMER_ACCESS_TOKEN_COOKIE,
      result.accessToken,
      customerAccessTokenCookieOptions(result.expiresAt)
    )
    return res
  } catch (e) {
    console.error('Account register POST error:', e)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
