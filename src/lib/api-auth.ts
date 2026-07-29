import { NextRequest, NextResponse } from 'next/server'
import {
  getSessionFromRequest,
  type SessionPayload,
  type SessionRole,
} from '@/lib/session'

export type AuthUser = SessionPayload

export function unauthorized(message = 'Non authentifié') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Accès refusé') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export async function requireAuth(
  req: NextRequest
): Promise<AuthUser | NextResponse> {
  const session = await getSessionFromRequest(req)
  if (!session) return unauthorized()
  return session
}

export async function requireRole(
  req: NextRequest,
  roles: SessionRole[]
): Promise<AuthUser | NextResponse> {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  if (!roles.includes(auth.role)) return forbidden()
  return auth
}

export function isAuthError(
  result: AuthUser | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}

/** Scope Prisma where clauses by role for client-owned resources */
export function clientScopeWhere(auth: AuthUser): Record<string, unknown> | null {
  if (auth.role === 'client') {
    return { clientId: auth.userId }
  }
  return null
}

/** Scope for correspondant — filter by company */
export function companyScopeWhere(
  auth: AuthUser,
  companyField = 'compagnieId'
): Record<string, unknown> | null {
  if (auth.role === 'correspondant') {
    if (!auth.companyId) return { [companyField]: '__none__' }
    return { [companyField]: auth.companyId }
  }
  return null
}

export function mergeWhere(
  base: Record<string, unknown>,
  ...scopes: Array<Record<string, unknown> | null>
): Record<string, unknown> {
  const merged = { ...base }
  for (const scope of scopes) {
    if (scope) Object.assign(merged, scope)
  }
  return merged
}
