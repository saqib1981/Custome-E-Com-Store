import { NextRequest, NextResponse } from 'next/server'
import { customerRecover } from '@/lib/shopify-customer-auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string }
    const result = await customerRecover(String(body.email ?? ''))
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Could not send reset email' }, { status: 400 })
    }
    return NextResponse.json({
      ok: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    })
  } catch (e) {
    console.error('Account recover POST error:', e)
    return NextResponse.json({ error: 'Could not send reset email' }, { status: 500 })
  }
}
