import { NextRequest, NextResponse } from 'next/server'
import { customerLogin } from '@/lib/shopify-customer-auth-server'
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  customerAccessTokenCookieOptions,
} from '@/lib/customer-session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const result = await customerLogin(String(body.email ?? ''), String(body.password ?? ''))
    if (!result.ok || !result.accessToken) {
      return NextResponse.json({ error: result.error || 'Login failed' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true, customer: result.customer })
    res.cookies.set(
      CUSTOMER_ACCESS_TOKEN_COOKIE,
      result.accessToken,
      customerAccessTokenCookieOptions(result.expiresAt)
    )
    return res
  } catch (e) {
    console.error('Account login POST error:', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
