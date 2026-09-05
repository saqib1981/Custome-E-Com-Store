import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Admin logout error:', e)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
