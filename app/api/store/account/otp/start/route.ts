import { NextRequest, NextResponse } from 'next/server'
import {
  buildCustomerOtpAuthorizeUrl,
  createPkcePair,
} from '@/lib/shopify-customer-account-auth-server'
import {
  CUSTOMER_CA_PKCE_STATE_COOKIE,
  CUSTOMER_CA_PKCE_VERIFIER_COOKIE,
  pkceCookieOptions,
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
    const body = (await request.json()) as { email?: string }
    const email = String(body.email ?? '').trim()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const { verifier, challenge, state } = createPkcePair()
    const origin = resolveOrigin(request)
    const redirectUri = `${origin}/account/callback`
    const url = await buildCustomerOtpAuthorizeUrl({
      email,
      redirectUri,
      challenge,
      state,
    })

    const res = NextResponse.json({ ok: true, url, redirectUri })
    const cookieOpts = pkceCookieOptions()
    res.cookies.set(CUSTOMER_CA_PKCE_VERIFIER_COOKIE, verifier, cookieOpts)
    res.cookies.set(CUSTOMER_CA_PKCE_STATE_COOKIE, state, cookieOpts)
    return res
  } catch (e) {
    console.error('Account OTP start error:', e)
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'Could not start email login. Enable New customer accounts and register the callback URL.',
      },
      { status: 500 }
    )
  }
}
