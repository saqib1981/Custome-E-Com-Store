import { NextResponse } from 'next/server'
import { fetchCheckoutCountries } from '@/lib/shopify-market-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await fetchCheckoutCountries()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (e) {
    console.error('Checkout countries GET error:', e)
    return NextResponse.json(
      { countries: [{ code: 'PK', name: 'Pakistan' }], defaultCountryCode: 'PK' },
      { status: 200 }
    )
  }
}
