import { NextRequest, NextResponse } from 'next/server'
import {
  exchangeCustomerAuthCode,
  fetchCustomerAccountProfile,
} from '@/lib/shopify-customer-account-auth-server'
import {
  CUSTOMER_CA_ACCESS_TOKEN_COOKIE,
  CUSTOMER_CA_ID_TOKEN_COOKIE,
  CUSTOMER_CA_PKCE_STATE_COOKIE,
  CUSTOMER_CA_PKCE_VERIFIER_COOKIE,
  customerAccessTokenCookieOptions,
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
    const body = (await request.json()) as { code?: string; state?: string }
    const code = String(body.code ?? '').trim()
    const state = String(body.state ?? '').trim()
    if (!code || !state) {
      return NextResponse.json({ error: 'Missing authorization code.' }, { status: 400 })
    }

    const verifier = request.cookies.get(CUSTOMER_CA_PKCE_VERIFIER_COOKIE)?.value?.trim() || ''
    const expectedState = request.cookies.get(CUSTOMER_CA_PKCE_STATE_COOKIE)?.value?.trim() || ''
    if (!verifier || !expectedState || expectedState !== state) {
      return NextResponse.json(
        { error: 'Login session expired. Please enter your email again.' },
        { status: 400 }
      )
    }

    const redirectUri = `${resolveOrigin(request)}/account/callback`
    const tokens = await exchangeCustomerAuthCode({ code, redirectUri, verifier })
    const customer = await fetchCustomerAccountProfile(tokens.accessToken)

    const res = NextResponse.json({ ok: true, customer })
    const cookieOpts = customerAccessTokenCookieOptions(tokens.expiresIn)
    res.cookies.set(CUSTOMER_CA_ACCESS_TOKEN_COOKIE, tokens.accessToken, cookieOpts)
    if (tokens.idToken) {
      res.cookies.set(CUSTOMER_CA_ID_TOKEN_COOKIE, tokens.idToken, cookieOpts)
    }
    res.cookies.set(CUSTOMER_CA_PKCE_VERIFIER_COOKIE, '', { path: '/', maxAge: 0 })
    res.cookies.set(CUSTOMER_CA_PKCE_STATE_COOKIE, '', { path: '/', maxAge: 0 })
    return res
  } catch (e) {
    console.error('Account OTP callback error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not complete email login.' },
      { status: 500 }
    )
  }
}
