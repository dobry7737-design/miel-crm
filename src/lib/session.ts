import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const SESSION_COOKIE = 'aam-session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type SessionRole =
  | 'admin'
  | 'agent'
  | 'client'
  | 'gestionnaire'
  | 'correspondant'

export interface SessionPayload {
  userId: string
  email: string
  role: SessionRole
  companyId?: string | null
}

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    'aam-secret-key-production-jwt-auth-32chars-fallback'
  return new TextEncoder().encode(secret)
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    companyId: payload.companyId ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret())
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const userId = payload.sub
    const email = payload.email
    const role = payload.role
    if (
      typeof userId !== 'string' ||
      typeof email !== 'string' ||
      typeof role !== 'string'
    ) {
      return null
    }
    return {
      userId,
      email,
      role: role as SessionRole,
      companyId:
        typeof payload.companyId === 'string' ? payload.companyId : null,
    }
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0))
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
