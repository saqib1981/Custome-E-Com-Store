import { getShopifyConfig, isShopifyConfigured } from '@/lib/shopify-config'
import { shopifyAdminGraphql } from '@/lib/shopify-admin'

const STOREFRONT_TOKEN_TITLE = 'Custome-E-Com-Store'

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

/** Optional override — if unset, Admin API creates/reuses a Storefront token automatically. */
export function getShopifyStorefrontAccessTokenFromEnv(): string {
  return readEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'Shopify_Storefront_Access_Token')
}

let cachedStorefrontToken: string | null = null
let storefrontTokenInflight: Promise<string> | null = null

/**
 * Resolve a Storefront API token.
 * Dev Dashboard apps do NOT show this token in the UI — we create it via Admin GraphQL
 * using the same Client ID / Secret already in .env.local.
 */
export async function resolveShopifyStorefrontAccessToken(): Promise<string> {
  const fromEnv = getShopifyStorefrontAccessTokenFromEnv()
  if (fromEnv) return fromEnv

  if (cachedStorefrontToken) return cachedStorefrontToken
  if (storefrontTokenInflight) return storefrontTokenInflight

  storefrontTokenInflight = (async () => {
    if (!isShopifyConfigured()) {
      throw new Error('Shopify is not configured (need store URL + Client ID/Secret).')
    }

    type ListRes = {
      shop: {
        storefrontAccessTokens?: {
          nodes?: Array<{ title?: string | null; accessToken?: string | null } | null> | null
        } | null
      } | null
    }

    const listed = await shopifyAdminGraphql<ListRes>(
      `
        query StorefrontAccessTokens {
          shop {
            storefrontAccessTokens(first: 50) {
              nodes {
                title
                accessToken
              }
            }
          }
        }
      `
    )

    const existing = listed.shop?.storefrontAccessTokens?.nodes?.find(
      (node) =>
        node?.accessToken &&
        (node.title === STOREFRONT_TOKEN_TITLE || Boolean(node.accessToken))
    )
    const preferred = listed.shop?.storefrontAccessTokens?.nodes?.find(
      (node) => node?.title === STOREFRONT_TOKEN_TITLE && node.accessToken
    )
    const reuse = preferred?.accessToken || existing?.accessToken
    if (reuse) {
      cachedStorefrontToken = reuse
      return reuse
    }

    type CreateRes = {
      storefrontAccessTokenCreate: {
        storefrontAccessToken: { accessToken?: string | null; title?: string | null } | null
        userErrors: Array<{ message?: string | null } | null>
      }
    }

    const created = await shopifyAdminGraphql<CreateRes>(
      `
        mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
          storefrontAccessTokenCreate(input: $input) {
            storefrontAccessToken {
              accessToken
              title
            }
            userErrors {
              message
            }
          }
        }
      `,
      { input: { title: STOREFRONT_TOKEN_TITLE } }
    )

    const err = created.storefrontAccessTokenCreate.userErrors
      .map((e) => String(e?.message ?? '').trim())
      .find(Boolean)
    const token = created.storefrontAccessTokenCreate.storefrontAccessToken?.accessToken?.trim()
    if (err || !token) {
      throw new Error(
        err ||
          'Could not create Storefront access token. In Dev Dashboard → your app → Access, enable Storefront API / unauthenticated scopes, release a new version, reinstall the app, then retry.'
      )
    }

    cachedStorefrontToken = token
    return token
  })()

  try {
    return await storefrontTokenInflight
  } finally {
    storefrontTokenInflight = null
  }
}

/** @deprecated Prefer resolveShopifyStorefrontAccessToken() — sync env-only helper. */
export function getShopifyStorefrontAccessToken(): string {
  return getShopifyStorefrontAccessTokenFromEnv()
}

export function isShopifyStorefrontConfigured(): boolean {
  // Client credentials alone are enough — token is minted via Admin API when needed.
  return isShopifyConfigured()
}

export async function shopifyStorefrontGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const config = getShopifyConfig()
  if (!config?.shop) {
    throw new Error('Shopify is not configured.')
  }

  const token = await resolveShopifyStorefrontAccessToken()

  const res = await fetch(`https://${config.shop}/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  const json = (await res.json()) as {
    data?: T
    errors?: Array<{ message?: string }>
  }

  if (!res.ok) {
    throw new Error(`Storefront API HTTP ${res.status}`)
  }

  if (json.errors?.length) {
    throw new Error(
      json.errors.map((e) => e.message).filter(Boolean).join('; ') || 'Storefront GraphQL error'
    )
  }

  if (!json.data) {
    throw new Error('Storefront API returned no data')
  }

  return json.data
}
