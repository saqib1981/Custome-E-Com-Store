import { NextRequest, NextResponse } from 'next/server'
import { uploadStoreAsset } from '@/lib/store-assets-server'
import { requireShopifyCdnUploadUrl, type StoreAssetFolder } from '@/lib/store-media'

const ALLOWED_FOLDERS = new Set<StoreAssetFolder>(['favicon', 'logo', 'logo-transparent', 'hero'])

function isAllowedMime(folder: StoreAssetFolder, mime: string): boolean {
  if (mime.startsWith('image/')) return true
  if (folder === 'hero' && mime.startsWith('video/')) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    const folder = String(form.get('folder') ?? '') as StoreAssetFolder

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 })
    }

    if (!isAllowedMime(folder, file.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed (hero also accepts video/*)' },
        { status: 400 }
      )
    }

    const maxBytes =
      folder === 'favicon' ? 512 * 1024 : folder === 'hero' ? 20 * 1024 * 1024 : 4 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File is too large' }, { status: 400 })
    }

    const result = await uploadStoreAsset(file, folder)
    const url = requireShopifyCdnUploadUrl(result.url, 'Shopify Files')

    return NextResponse.json({ url, fileName: result.fileName })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    console.error('Upload POST error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
