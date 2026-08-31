import { isShopifyConfigured } from '@/lib/shopify-config'
import { uploadStoreAssetToShopify, type StoreAssetFolder } from '@/lib/shopify-files-server'

export async function uploadStoreAsset(
  file: File,
  folder: StoreAssetFolder
): Promise<{ url: string; fileName: string }> {
  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify is not configured for uploads. Add credentials to .env.local (see .env.example).'
    )
  }

  return uploadStoreAssetToShopify(file, folder)
}
