/**
 * Admin theme media upload — always validates permanent Shopify CDN before returning.
 * Safe for client components (does not import server Shopify SDK).
 */
import {
  requireShopifyCdnUploadUrl,
  type StoreAssetFolder,
} from '@/lib/store-media'

export type AdminStoreUploadResult = {
  url: string
  fileName: string
}

export async function uploadAdminStoreAsset(
  file: File,
  folder: StoreAssetFolder
): Promise<AdminStoreUploadResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)

  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const data = (await res.json().catch(() => null)) as
    | { url?: string; fileName?: string; error?: string }
    | null

  if (!res.ok) {
    throw new Error(data?.error || 'Upload failed')
  }

  const url = requireShopifyCdnUploadUrl(data?.url, 'Upload')
  const fileName = String(data?.fileName ?? '').trim()
  if (!fileName) {
    throw new Error('Upload did not return a file name — try again')
  }

  return { url, fileName }
}
