import type { AppRole } from '@/lib/permissions'

export const FAB_SESSION_COOKIE = 'fab_session'

export interface SessionUser {
  id: string
  name: string
  role: AppRole
}

function isAppRole(value: unknown): value is AppRole {
  return value === 'DG' || value === 'COMMERCIAL' || value === 'ADMIN'
}

/** Décode le payload Base64 UTF-8 (même format que le token client `crm_token`). */
export function decodeTokenPayload(token: string): unknown | null {
  try {
    let b64 = token
    if (b64.includes('-') || b64.includes('_')) {
      b64 = b64.replace(/-/g, '+').replace(/_/g, '/')
    }
    while (b64.length % 4 !== 0) b64 += '='
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const json = new TextDecoder('utf-8').decode(bytes)
    return JSON.parse(json) as unknown
  } catch {
    return null
  }
}

export function parseSessionUserFromToken(token: string): SessionUser | null {
  const decoded = decodeTokenPayload(token)
  if (!decoded || typeof decoded !== 'object') return null
  const o = decoded as Record<string, unknown>
  const id = o.id
  const name = o.name
  const role = o.role
  if (typeof id !== 'string' || typeof name !== 'string' || !isAppRole(role)) return null
  return { id, name, role }
}
