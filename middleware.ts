import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/** Admin-only GETs that must not be public (Shopify / editor tooling). */
const PROTECTED_ADMIN_GET_PREFIXES = [
  '/api/admin/upload',
  '/api/admin/shopify-connection',
  '/api/admin/shopify-menus',
  '/api/admin/shopify-collections',
  '/api/admin/preview-menu',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()

  const { response, user } = await updateSession(request)

  const isAdminPage = pathname.startsWith('/myadmin')
  const isLoginPage = pathname === '/myadmin/login' || pathname.startsWith('/myadmin/login/')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isAuthApi =
    pathname.startsWith('/api/admin/auth/') || pathname === '/api/admin/auth'

  if (isAdminPage && !isLoginPage && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/myadmin/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoginPage && user) {
    const next = request.nextUrl.searchParams.get('next') || '/myadmin'
    const dest = request.nextUrl.clone()
    dest.pathname = next.startsWith('/myadmin') ? next : '/myadmin'
    dest.search = ''
    return NextResponse.redirect(dest)
  }

  if (isAdminApi && !isAuthApi) {
    const needsAuth =
      WRITE_METHODS.has(method) ||
      (method === 'GET' &&
        PROTECTED_ADMIN_GET_PREFIXES.some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
        ))

    if (needsAuth && !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in at /myadmin/login.' },
        { status: 401 }
      )
    }
  }

  return response
}

export const config = {
  matcher: ['/myadmin', '/myadmin/:path*', '/api/admin/:path*'],
}
