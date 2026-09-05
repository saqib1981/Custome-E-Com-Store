import { createHash, randomBytes } from 'crypto'
import { getShopifyConfig } from '@/lib/shopify-config'
import { formatMoney } from '@/lib/format-money'
import type { AccountAddress, AccountCustomer, AccountOrder } from '@/lib/account'

const STOREFRONT_DOMAIN_ENV = ['SHOPIFY_STOREFRONT_DOMAIN', 'Shopify_Storefront_Domain'] as const

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

function base64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function createPkcePair(): { verifier: string; challenge: string; state: string } {
  const verifier = base64Url(randomBytes(32))
  const challenge = base64Url(createHash('sha256').update(verifier).digest())
  const state = base64Url(randomBytes(16))
  return { verifier, challenge, state }
}

export function getCustomerAccountShopDomain(): string {
  const config = getShopifyConfig()
  const override = readEnv(...STOREFRONT_DOMAIN_ENV)
  if (override) {
    return override
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
  }
  if (!config?.shop) {
    throw new Error('Shopify store URL is not configured.')
  }
  return config.shop
}

export function getCustomerAccountClientId(): string {
  // Headless Customer Account API client — must NOT reuse Admin API Client ID
  const id = readEnv(
    'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID',
    'Shopify_Customer_Account_Client_ID'
  )
  if (!id) {
    throw new Error(
      'Shopify Customer Account Client ID is not configured (Shopify_Customer_Account_Client_ID).'
    )
  }
  return id
}

type OpenIdConfig = {
  authorization_endpoint?: string
  token_endpoint?: string
  end_session_endpoint?: string
}

type CustomerAccountApiConfig = {
  graphql_api?: string
}

let openIdCache: { shop: string; config: OpenIdConfig; at: number } | null = null
let caApiCache: { shop: string; config: CustomerAccountApiConfig; at: number } | null = null

async function discoverOpenId(): Promise<OpenIdConfig> {
  const shop = getCustomerAccountShopDomain()
  if (openIdCache && openIdCache.shop === shop && Date.now() - openIdCache.at < 60 * 60 * 1000) {
    return openIdCache.config
  }
  const res = await fetch(`https://${shop}/.well-known/openid-configuration`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(
      `Could not load Shopify login config (${res.status}). Enable New customer accounts on the store.`
    )
  }
  const config = (await res.json()) as OpenIdConfig
  openIdCache = { shop, config, at: Date.now() }
  return config
}

async function discoverCustomerAccountApi(): Promise<CustomerAccountApiConfig> {
  const shop = getCustomerAccountShopDomain()
  if (caApiCache && caApiCache.shop === shop && Date.now() - caApiCache.at < 60 * 60 * 1000) {
    return caApiCache.config
  }
  const res = await fetch(`https://${shop}/.well-known/customer-account-api`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(
      `Could not load Customer Account API (${res.status}). Enable New customer accounts + Headless / Customer Account API credentials.`
    )
  }
  const config = (await res.json()) as CustomerAccountApiConfig
  caApiCache = { shop, config, at: Date.now() }
  return config
}

export async function buildCustomerOtpAuthorizeUrl(options: {
  email: string
  redirectUri: string
  challenge: string
  state: string
}): Promise<string> {
  const openId = await discoverOpenId()
  const endpoint = String(openId.authorization_endpoint ?? '').trim()
  if (!endpoint) {
    throw new Error('Shopify authorization endpoint missing.')
  }

  const email = String(options.email ?? '').trim()
  if (!email) throw new Error('Email is required.')

  const url = new URL(endpoint)
  url.searchParams.set('client_id', getCustomerAccountClientId())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', options.redirectUri)
  url.searchParams.set('scope', 'openid email customer-account-api:full')
  url.searchParams.set('state', options.state)
  url.searchParams.set('code_challenge', options.challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('login_hint', email)
  return url.toString()
}

export async function exchangeCustomerAuthCode(options: {
  code: string
  redirectUri: string
  verifier: string
}): Promise<{ accessToken: string; expiresIn: number; idToken?: string }> {
  const openId = await discoverOpenId()
  const tokenEndpoint = String(openId.token_endpoint ?? '').trim()
  if (!tokenEndpoint) throw new Error('Shopify token endpoint missing.')

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: getCustomerAccountClientId(),
      redirect_uri: options.redirectUri,
      code: options.code,
      code_verifier: options.verifier,
    }),
    cache: 'no-store',
  })

  const body = (await res.json()) as {
    access_token?: string
    expires_in?: number
    id_token?: string
    error?: string
    error_description?: string
  }

  if (!res.ok || !body.access_token) {
    throw new Error(
      body.error_description || body.error || `Token exchange failed (${res.status})`
    )
  }

  return {
    accessToken: formatCustomerAccountAccessToken(body.access_token),
    expiresIn: Number(body.expires_in) || 60 * 60,
    idToken: body.id_token,
  }
}

function mapCaAddress(node: {
  id?: string
  firstName?: string | null
  lastName?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  zoneCode?: string | null
  territoryCode?: string | null
  zip?: string | null
  phoneNumber?: string | null
  formatted?: string[] | null
} | null): AccountAddress | null {
  if (!node?.id) return null
  const name = [node.firstName, node.lastName].filter(Boolean).join(' ').trim()
  return {
    id: node.id,
    name,
    address1: String(node.address1 ?? '').trim() || String(node.formatted?.[0] ?? '').trim(),
    address2: String(node.address2 ?? '').trim() || String(node.formatted?.[1] ?? '').trim(),
    city: String(node.city ?? '').trim(),
    province: String(node.zoneCode ?? '').trim(),
    country: String(node.territoryCode ?? '').trim(),
    zip: String(node.zip ?? '').trim(),
    phone: String(node.phoneNumber ?? '').trim(),
  }
}

/** Customer Account GraphQL expects raw `shcat_…` — never `Bearer …`. */
function formatCustomerAccountAccessToken(accessToken: string): string {
  let token = String(accessToken ?? '').trim()
  if (token.toLowerCase().startsWith('bearer ')) {
    token = token.slice(7).trim()
  }
  if (!token) return ''
  return token.startsWith('shcat_') ? token : `shcat_${token}`
}

export async function fetchCustomerAccountProfile(
  accessToken: string
): Promise<AccountCustomer | null> {
  const api = await discoverCustomerAccountApi()
  const endpoint = String(api.graphql_api ?? '').trim()
  if (!endpoint) throw new Error('Customer Account GraphQL endpoint missing.')

  const authToken = formatCustomerAccountAccessToken(accessToken)
  if (!authToken) throw new Error('Missing Customer Account access token.')

  const query = `
    query CustomerAccountProfile {
      customer {
        id
        firstName
        lastName
        displayName
        emailAddress { emailAddress }
        phoneNumber { phoneNumber }
        defaultAddress {
          id
          firstName
          lastName
          address1
          address2
          city
          zoneCode
          territoryCode
          zip
          phoneNumber
          formatted
        }
        addresses(first: 10) {
          nodes {
            id
            firstName
            lastName
            address1
            address2
            city
            zoneCode
            territoryCode
            zip
            phoneNumber
            formatted
          }
        }
        orders(first: 20) {
          nodes {
            id
            name
            processedAt
            financialStatus
            fulfillmentStatus
            statusPageUrl
            totalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  `

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Official CA API: Authorization is the access token itself (no Bearer).
      Authorization: authToken,
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  })

  const json = (await res.json()) as {
    data?: {
      customer?: {
        id?: string
        firstName?: string | null
        lastName?: string | null
        displayName?: string | null
        emailAddress?: { emailAddress?: string | null } | null
        phoneNumber?: { phoneNumber?: string | null } | null
        defaultAddress?: Parameters<typeof mapCaAddress>[0]
        addresses?: { nodes?: Array<Parameters<typeof mapCaAddress>[0]> | null } | null
        orders?: {
          nodes?: Array<{
            id?: string
            name?: string | null
            processedAt?: string | null
            financialStatus?: string | null
            fulfillmentStatus?: string | null
            statusPageUrl?: string | null
            totalPrice?: { amount?: string | null; currencyCode?: string | null } | null
          } | null> | null
        } | null
      } | null
    }
    errors?: Array<{ message?: string }>
  }

  if (!res.ok || json.errors?.length) {
    const msg =
      json.errors?.map((e) => e.message).filter(Boolean).join('; ') ||
      `Customer Account API HTTP ${res.status}`
    throw new Error(msg)
  }

  const node = json.data?.customer
  if (!node?.id) return null

  const firstName = String(node.firstName ?? '').trim()
  const lastName = String(node.lastName ?? '').trim()
  const email = String(node.emailAddress?.emailAddress ?? '').trim()
  const phone = String(node.phoneNumber?.phoneNumber ?? '').trim()
  const displayName =
    String(node.displayName ?? '').trim() ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    email

  const addresses = (node.addresses?.nodes ?? [])
    .map((a) => mapCaAddress(a))
    .filter((a): a is AccountAddress => Boolean(a))
  if (!addresses.length) {
    const fallback = mapCaAddress(node.defaultAddress ?? null)
    if (fallback) addresses.push(fallback)
  }

  const orders: AccountOrder[] = (node.orders?.nodes ?? [])
    .map((o) => {
      if (!o?.id) return null
      return {
        id: o.id,
        name: String(o.name ?? '').trim() || o.id,
        processedAt: String(o.processedAt ?? '').trim(),
        financialStatus: String(o.financialStatus ?? '').trim(),
        fulfillmentStatus: String(o.fulfillmentStatus ?? '').trim(),
        totalPrice: formatMoney(
          String(o.totalPrice?.amount ?? ''),
          String(o.totalPrice?.currencyCode ?? 'PKR')
        ),
        statusUrl: String(o.statusPageUrl ?? '').trim(),
      } satisfies AccountOrder
    })
    .filter((o): o is AccountOrder => Boolean(o))

  return {
    id: node.id,
    firstName,
    lastName,
    email,
    phone,
    displayName,
    addresses,
    orders,
  }
}

export async function getCustomerLogoutUrl(idToken: string, postLogoutRedirectUri: string): Promise<string | null> {
  try {
    const openId = await discoverOpenId()
    const endpoint = String(openId.end_session_endpoint ?? '').trim()
    if (!endpoint || !idToken) return null
    const url = new URL(endpoint)
    url.searchParams.set('id_token_hint', idToken)
    url.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri)
    return url.toString()
  } catch {
    return null
  }
}
