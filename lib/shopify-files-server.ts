import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { getShopifyConfig, isShopifyConfigured } from '@/lib/shopify-config'

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

  const url = file.image?.url || file.url
  if (url) return url

  // Fallback while Shopify processes the file
  return resourceUrl
}

const ALT_LABELS: Record<'favicon' | 'logo' | 'logo-transparent', string> = {
  favicon: 'Store favicon',
  logo: 'Store logo',
  'logo-transparent': 'Store logo on transparent header',
}

/** Upload theme asset to Shopify Files (CDN). */
export async function uploadStoreAssetToShopify(
  file: File,
  folder: 'favicon' | 'logo' | 'logo-transparent'
): Promise<{ url: string; fileName: string }> {
  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify is not configured. Add SHOPIFY_STORE_URL and client credentials (or SHOPIFY_ADMIN_ACCESS_TOKEN) to .env.local'
    )
  }

  const config = getShopifyConfig()
  if (!config) {
    throw new Error('Shopify configuration is invalid')
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  const mimeType = file.type || 'application/octet-stream'
  const buffer = Buffer.from(await file.arrayBuffer())

  const staged = await createStagedUpload(safeName, mimeType, buffer.byteLength)
  await postFileToStagedTarget(staged, buffer, safeName, mimeType)
  const url = await registerShopifyFile(staged.resourceUrl, ALT_LABELS[folder], mimeType)

  return { url, fileName: safeName }
}
