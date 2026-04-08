import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FAB_SESSION_COOKIE, parseSessionUserFromToken } from '@/lib/crm-session'

const MAX_AGE = 60 * 60 * 24 * 7

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const token =
    typeof body === 'object' &&
    body !== null &&
    'token' in body &&
    typeof (body as { token: unknown }).token === 'string'
      ? (body as { token: string }).token
      : null
  if (!token || !parseSessionUserFromToken(token)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const jar = await cookies()
  jar.set(FAB_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete(FAB_SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const jar = await cookies()
  const t = jar.get(FAB_SESSION_COOKIE)?.value
  const user = t ? parseSessionUserFromToken(t) : null
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user })
}
