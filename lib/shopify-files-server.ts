import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import { isShopifyFilesUrl } from '@/lib/store-media'

type StagedUploadTarget = {
  url: string
  resourceUrl: string
  parameters: { name: string; value: string }[]
}

type StagedUploadsCreateResponse = {
  stagedUploadsCreate: {
    stagedTargets: StagedUploadTarget[]
    userErrors: { field: string[] | null; message: string }[]
  }
}

type FileCreateResponse = {
  fileCreate: {
    files: Array<{
      id: string
      fileStatus: string
      alt: string | null
      url?: string
      image?: { url: string } | null
    }>
    userErrors: { field: string[] | null; message: string }[]
  }
}

function stagedResourceForMime(mimeType: string): 'IMAGE' | 'FILE' {
  if (mimeType.startsWith('image/') && mimeType !== 'image/x-icon' && mimeType !== 'image/vnd.microsoft.icon') {
    return 'IMAGE'
  }
  return 'FILE'
}

function contentTypeForMime(mimeType: string): 'IMAGE' | 'FILE' {
  return stagedResourceForMime(mimeType)
}

async function createStagedUpload(
  fileName: string,
  mimeType: string,
  fileSize: number
): Promise<StagedUploadTarget> {
  const data = await shopifyAdminGraphql<StagedUploadsCreateResponse>(
    `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: [
        {
          filename: fileName,
          mimeType,
          fileSize: String(fileSize),
          resource: stagedResourceForMime(mimeType),
          httpMethod: 'POST',
        },
      ],
    }
  )

  const result = data.stagedUploadsCreate
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }

  const target = result.stagedTargets[0]
  if (!target) {
    throw new Error('Shopify did not return an upload target')
  }

  return target
}

async function postFileToStagedTarget(
  target: StagedUploadTarget,
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<void> {
  const form = new FormData()

  for (const param of target.parameters) {
    form.append(param.name, param.value)
  }

  form.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName)

  const res = await fetch(target.url, { method: 'POST', body: form })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Shopify staged upload failed (${res.status}): ${text.slice(0, 200)}`)
  }
}

async function waitForShopifyFileUrl(fileId: string, attempts = 12): Promise<string | null> {
  for (let i = 0; i < attempts; i += 1) {
    const data = await shopifyAdminGraphql<{
      node: {
        fileStatus?: string
        url?: string | null
        image?: { url: string | null } | null
      } | null
    }>(
      `
        query ShopifyFileUrl($id: ID!) {
          node(id: $id) {
            ... on MediaImage {
              fileStatus
              image {
                url
              }
            }
            ... on GenericFile {
              fileStatus
              url
            }
          }
        }
      `,
      { id: fileId }
    )

    const url = data.node?.image?.url || data.node?.url || null
    if (url && isShopifyFilesUrl(url)) return url

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  return null
}

async function registerShopifyFile(
  resourceUrl: string,
  alt: string,
  mimeType: string
): Promise<string> {
  const data = await shopifyAdminGraphql<FileCreateResponse>(
    `
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            alt
            ... on MediaImage {
              image {
                url
              }
            }
            ... on GenericFile {
              url
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      files: [
        {
          alt,
          contentType: contentTypeForMime(mimeType),
          originalSource: resourceUrl,
        },
      ],
    }
  )

  const result = data.fileCreate
  if (result.userErrors.length) {
    throw new Error(result.userErrors.map((e) => e.message).join('; '))
  }

  const file = result.files[0]
  if (!file) {
    throw new Error('Shopify did not return a created file')
  }

  const immediateUrl = file.image?.url || file.url
  if (immediateUrl && isShopifyFilesUrl(immediateUrl)) return immediateUrl

  const polledUrl = await waitForShopifyFileUrl(file.id)
  if (polledUrl) return polledUrl

  throw new Error('Shopify file upload did not return a CDN URL — try again in a moment')
}

const ALT_LABELS: Record<'favicon' | 'logo' | 'logo-transparent' | 'hero', string> = {
  favicon: 'Store favicon',
  logo: 'Store logo',
  'logo-transparent': 'Store logo on transparent header',
  hero: 'Homepage hero slider',
}

export type StoreAssetFolder = 'favicon' | 'logo' | 'logo-transparent' | 'hero'

/** Upload bytes to Shopify Files (CDN). Used by admin uploads and seed scripts. */
export async function uploadBufferToShopify(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: StoreAssetFolder
): Promise<{ url: string; fileName: string }> {
  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify is not configured. Add SHOPIFY_STORE_URL and client credentials (or SHOPIFY_ADMIN_ACCESS_TOKEN) to .env.local'
    )
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const staged = await createStagedUpload(safeName, mimeType, buffer.byteLength)
  await postFileToStagedTarget(staged, buffer, safeName, mimeType)
  const url = await registerShopifyFile(staged.resourceUrl, ALT_LABELS[folder], mimeType)

  return { url, fileName: safeName }
}

/** Upload theme asset to Shopify Files (CDN). */
export async function uploadStoreAssetToShopify(
  file: File,
  folder: StoreAssetFolder
): Promise<{ url: string; fileName: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const mimeType = file.type || 'application/octet-stream'
  const buffer = Buffer.from(await file.arrayBuffer())

  return uploadBufferToShopify(buffer, safeName, mimeType, folder)
}
