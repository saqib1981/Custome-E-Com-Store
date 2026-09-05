import { NextResponse } from 'next/server'
import { fetchCustomerAccountProfile } from '@/lib/shopify-customer-account-auth-server'
import {
  CUSTOMER_CA_ACCESS_TOKEN_COOKIE,
  readCustomerCaAccessTokenFromCookies,
} from '@/lib/customer-session'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = await readCustomerCaAccessTokenFromCookies()
    if (!token) {
      return NextResponse.json({ customer: null })
    }

    try {
      const customer = await fetchCustomerAccountProfile(token)
      if (!customer) {
        const res = NextResponse.json({ customer: null })
        res.cookies.set(CUSTOMER_CA_ACCESS_TOKEN_COOKIE, '', {
          httpOnly: true,
          path: '/',
          maxAge: 0,
        })
        return res
      }
      return NextResponse.json({ customer })
    } catch {
      const res = NextResponse.json({ customer: null })
      res.cookies.set(CUSTOMER_CA_ACCESS_TOKEN_COOKIE, '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      })
      return res
    }
  } catch (e) {
    console.error('Account me GET error:', e)
    return NextResponse.json({ customer: null, error: 'Could not load account' }, { status: 500 })
  }
}
