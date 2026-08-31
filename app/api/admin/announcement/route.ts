import { NextRequest, NextResponse } from 'next/server'
import { readAnnouncementConfig, writeAnnouncementConfig } from '@/lib/announcement-server'
import type { AnnouncementConfig } from '@/lib/announcement'

export async function GET() {
  try {
    const config = await readAnnouncementConfig()
    return NextResponse.json(config)
  } catch (e) {
    console.error('Announcement GET error:', e)
    return NextResponse.json({ error: 'Failed to load announcement settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AnnouncementConfig>
    const saved = await writeAnnouncementConfig(body)
    return NextResponse.json(saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save announcement settings'
    console.error('Announcement PUT error:', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
