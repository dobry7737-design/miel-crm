import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { FAB_SESSION_COOKIE, parseSessionUserFromToken } from '@/lib/crm-session'
import { canAccessCrmView, viewFromPathname } from '@/lib/crm-routes'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login') {
    const t = request.cookies.get(FAB_SESSION_COOKIE)?.value
    if (t && parseSessionUserFromToken(t)) {
      return NextResponse.redirect(new URL('/crm/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/crm')) {
    const t = request.cookies.get(FAB_SESSION_COOKIE)?.value
    const user = t ? parseSessionUserFromToken(t) : null
    if (!user) {
      const login = new URL('/login', request.url)
      login.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(login)
    }
    const view = viewFromPathname(pathname)
    if (!canAccessCrmView(user.role, view)) {
      const dash = new URL('/crm/dashboard', request.url)
      dash.searchParams.set('error', 'forbidden')
      return NextResponse.redirect(dash)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/crm/:path*', '/login'],
}
