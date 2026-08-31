import { NextRequest, NextResponse } from 'next/server'
import { uploadStoreAsset } from '@/lib/store-assets-server'

const ALLOWED_FOLDERS = new Set(['favicon', 'logo', 'logo-transparent'])

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    const folder = String(form.get('folder') ?? '')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: 'Invalid upload folder' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    const maxBytes = folder === 'favicon' ? 512 * 1024 : 2 * 1024 * 1024
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'File is too large' }, { status: 400 })
    }

    const result = await uploadStoreAsset(
      file,
      folder as 'favicon' | 'logo' | 'logo-transparent'
    )

    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed'
    console.error('Upload POST error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
