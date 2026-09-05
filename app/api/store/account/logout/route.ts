import { NextRequest, NextResponse } from 'next/server'
import { getCustomerLogoutUrl } from '@/lib/shopify-customer-account-auth-server'
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_CA_ACCESS_TOKEN_COOKIE,
  CUSTOMER_CA_ID_TOKEN_COOKIE,
  readCustomerCaIdTokenFromCookies,
} from '@/lib/customer-session'

export const dynamic = 'force-dynamic'

function resolveOrigin(request: NextRequest): string {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  if (env) return env
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

export async function POST(request: NextRequest) {
  try {
    const idToken = await readCustomerCaIdTokenFromCookies()
    const logoutUrl = idToken
      ? await getCustomerLogoutUrl(idToken, `${resolveOrigin(request)}/account`)
      : null

    const res = NextResponse.json({ ok: true, logoutUrl })
    const clear = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    }
    res.cookies.set(CUSTOMER_CA_ACCESS_TOKEN_COOKIE, '', clear)
    res.cookies.set(CUSTOMER_CA_ID_TOKEN_COOKIE, '', clear)
    res.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, '', clear)
    return res
  } catch (e) {
    console.error('Account logout POST error:', e)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
