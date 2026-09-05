import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  countryNameFromCode,
  type CheckoutCountryOption,
} from '@/lib/shopify-country-names'

type ShopCountriesResponse = {
  shop?: {
    shipsToCountries?: string[] | null
    billingAddress?: {
      countryCodeV2?: string | null
      country?: string | null
    } | null
  } | null
}

type MarketsCountriesResponse = {
  markets?: {
    nodes?: Array<{
      status?: string | null
      regions?: {
        nodes?: Array<{
          code?: string | null
          name?: string | null
        } | null> | null
      } | null
    } | null> | null
  } | null
}

export type CheckoutCountriesResult = {
  countries: CheckoutCountryOption[]
  defaultCountryCode: string
}

function uniqueSortedCountries(codes: string[]): CheckoutCountryOption[] {
  const seen = new Set<string>()
  const out: CheckoutCountryOption[] = []
  for (const raw of codes) {
    const code = String(raw || '')
      .trim()
      .toUpperCase()
    if (!code || seen.has(code)) continue
    seen.add(code)
    out.push({ code, name: countryNameFromCode(code) })
  }
  out.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return out
}

async function fetchFromShipsToCountries(): Promise<{
  codes: string[]
  defaultCode: string
} | null> {
  const data = await shopifyAdminGraphql<ShopCountriesResponse>(`
    query ShopShipsToCountries {
      shop {
        shipsToCountries
        billingAddress {
          countryCodeV2
          country
        }
      }
    }
  `)

  const codes = (data.shop?.shipsToCountries ?? []).map((c) => String(c).toUpperCase())
  const billing =
    data.shop?.billingAddress?.countryCodeV2?.trim().toUpperCase() ||
    ''
  return { codes, defaultCode: billing }
}

async function fetchFromMarkets(): Promise<string[]> {
  try {
    const data = await shopifyAdminGraphql<MarketsCountriesResponse>(`
      query ActiveMarketCountries {
        markets(first: 50) {
          nodes {
            status
            regions(first: 100) {
              nodes {
                ... on MarketRegionCountry {
                  code
                  name
                }
              }
            }
          }
        }
      }
    `)

    const codes: string[] = []
    for (const market of data.markets?.nodes ?? []) {
      if (market?.status && market.status !== 'ACTIVE') continue
      for (const region of market?.regions?.nodes ?? []) {
        const code = region?.code?.trim().toUpperCase()
        if (code) codes.push(code)
      }
    }
    return codes
  } catch {
    // read_markets may be missing — ignore
    return []
  }
}

/**
 * Countries enabled for the shop (shipping / markets), for checkout Country/Region.
 */
export async function fetchCheckoutCountries(): Promise<CheckoutCountriesResult> {
  const fallback: CheckoutCountriesResult = {
    countries: [{ code: 'PK', name: countryNameFromCode('PK') }],
    defaultCountryCode: 'PK',
  }

  if (!isShopifyConfigured()) return fallback

  try {
    let codes: string[] = []
    let defaultCode = 'PK'

    try {
      const shop = await fetchFromShipsToCountries()
      if (shop) {
        codes = shop.codes
        if (shop.defaultCode) defaultCode = shop.defaultCode
      }
    } catch (e) {
      console.error('fetchCheckoutCountries shipsToCountries error:', e)
    }

    if (!codes.length) {
      const marketCodes = await fetchFromMarkets()
      codes = marketCodes
    }

    const countries = uniqueSortedCountries(codes.length ? codes : ['PK'])
    if (!countries.some((c) => c.code === defaultCode)) {
      defaultCode = countries[0]?.code || 'PK'
    }

    return { countries, defaultCountryCode: defaultCode }
  } catch (e) {
    console.error('fetchCheckoutCountries error:', e)
    return fallback
  }
}
