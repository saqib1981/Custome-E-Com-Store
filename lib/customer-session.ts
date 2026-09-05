import { cookies } from 'next/headers'

/** Customer Account API access token (email OTP / New customer accounts). */
export const CUSTOMER_CA_ACCESS_TOKEN_COOKIE = 'store_customer_ca_access_token'
export const CUSTOMER_CA_ID_TOKEN_COOKIE = 'store_customer_ca_id_token'
export const CUSTOMER_CA_PKCE_VERIFIER_COOKIE = 'store_customer_ca_pkce_verifier'
export const CUSTOMER_CA_PKCE_STATE_COOKIE = 'store_customer_ca_pkce_state'

/** Legacy Storefront password-login cookie (kept for logout cleanup). */
export const CUSTOMER_ACCESS_TOKEN_COOKIE = 'store_customer_access_token'

export async function readCustomerCaAccessTokenFromCookies(): Promise<string> {
  const jar = await cookies()
  return String(jar.get(CUSTOMER_CA_ACCESS_TOKEN_COOKIE)?.value ?? '').trim()
}

export async function readCustomerCaIdTokenFromCookies(): Promise<string> {
  const jar = await cookies()
  return String(jar.get(CUSTOMER_CA_ID_TOKEN_COOKIE)?.value ?? '').trim()
}

/** @deprecated password login — prefer Customer Account OTP cookies */
export async function readCustomerAccessTokenFromCookies(): Promise<string> {
  const jar = await cookies()
  return (
    String(jar.get(CUSTOMER_CA_ACCESS_TOKEN_COOKIE)?.value ?? '').trim() ||
    String(jar.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value ?? '').trim()
  )
}

export function customerAccessTokenCookieOptions(expiresAt?: string | number) {
  let maxAge = 60 * 60 * 24 * 28
  let expires: Date | undefined
  if (typeof expiresAt === 'number' && Number.isFinite(expiresAt)) {
    maxAge = Math.max(60, Math.floor(expiresAt))
    expires = new Date(Date.now() + maxAge * 1000)
  } else if (typeof expiresAt === 'string' && expiresAt) {
    const d = new Date(expiresAt)
    if (Number.isFinite(d.getTime())) {
      expires = d
      maxAge = Math.max(60, Math.floor((d.getTime() - Date.now()) / 1000))
    }
  }

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    ...(expires ? { expires } : {}),
  }
}

export function pkceCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 15,
  }
}
