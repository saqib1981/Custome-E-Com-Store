import { getShopifyConfig } from '@/lib/shopify-config'

type TokenCache = {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

async function fetchClientCredentialsToken(): Promise<string> {
  const config = getShopifyConfig()
  if (!config) {
    throw new Error('Shopify is not configured')
  }

  if (config.adminAccessToken) {
    return config.adminAccessToken
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token
  }

  const res = await fetch(`https://${config.shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  const body = (await res.json()) as {
    access_token?: string
    expires_in?: number
    error?: string
    error_description?: string
  }

  if (!res.ok || !body.access_token) {
    const detail = body.error_description || body.error || res.statusText
    throw new Error(`Shopify auth failed: ${detail}`)
  }

  tokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 86_400) * 1000,
  }

  return body.access_token
}

export async function shopifyAdminGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const config = getShopifyConfig()
  if (!config) {
    throw new Error('Shopify is not configured')
  }

  const accessToken = await fetchClientCredentialsToken()

  const res = await fetch(`https://${config.shop}/admin/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = (await res.json()) as {
    data?: T
    errors?: { message: string }[]
  }

  if (!res.ok || json.errors?.length) {
    const message = json.errors?.map((e) => e.message).join('; ') || res.statusText
    throw new Error(`Shopify GraphQL error: ${message}`)
  }

  if (!json.data) {
    throw new Error('Shopify GraphQL returned no data')
  }

  return json.data
}
