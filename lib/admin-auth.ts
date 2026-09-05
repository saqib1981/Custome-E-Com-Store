import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function getAdminUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user ?? null
  } catch {
    return null
  }
}

/** Returns 401 JSON when the request has no Supabase Auth session. */
export async function requireAdminUser(): Promise<
  { user: User; error?: undefined } | { user?: undefined; error: NextResponse }
> {
  const user = await getAdminUser()
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized. Sign in at /myadmin/login.' }, { status: 401 }),
    }
  }
  return { user }
}
