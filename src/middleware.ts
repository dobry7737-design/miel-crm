import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

const PUBLIC_API = new Set([
  '/api',
  '/api/auth/login',
])

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  if (PUBLIC_API.has(pathname)) {
    return NextResponse.next()
  }

  // Auth endpoints that need cookie read but not necessarily valid for login
  if (pathname === '/api/auth/logout') {
    return NextResponse.next()
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const session = await verifySessionToken(token)
  if (!session) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-user-id', session.userId)
  requestHeaders.set('x-user-role', session.role)
  requestHeaders.set('x-user-email', session.email)
  if (session.companyId) {
    requestHeaders.set('x-user-company-id', session.companyId)
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/api/:path*'],
}
