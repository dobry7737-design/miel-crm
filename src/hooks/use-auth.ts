"use client"

import { useEffect, useCallback } from "react"
import { useAuthStore } from "@/store/auth-store"
import type { User } from "@/store/auth-store"
import { isAppRole, type AppRole } from "@/lib/permissions"
import { findDemoUser } from "@/lib/demo-users"

const CRM_MOCK_ROLE_KEY = "crm_mock_role"

/** Base64 du JSON en UTF-8 (btoa seul échoue sur accents ex. « Système »). */
export function encodeCrmTokenPayload(payload: { id: string; name: string; role: AppRole }): string {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

function decodeTokenRaw(token: string): unknown | null {
  try {
    let b64 = token
    if (b64.includes("-") || b64.includes("_")) b64 = b64.replace(/-/g, "+").replace(/_/g, "/")
    while (b64.length % 4 !== 0) b64 += "="
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const json = new TextDecoder("utf-8").decode(bytes)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function parseCrmTokenUser(token: string): User | null {
  const decoded = decodeTokenRaw(token)
  if (!decoded || typeof decoded !== 'object') return null
  const o = decoded as Record<string, unknown>
  const id = o.id
  const name = o.name
  const role = o.role
  if (typeof id !== 'string' || typeof name !== 'string' || !isAppRole(role)) return null
  return { id, name, role }
}

async function postSessionCookie(token: string): Promise<void> {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  })
}

/** À appeler avant une navigation serveur (ex. après auth) pour éviter une boucle avec le middleware. */
export async function syncCrmSessionCookieFromStorage(): Promise<void> {
  const t = localStorage.getItem("crm_token")
  if (!t) return
  await postSessionCookie(t)
}

async function deleteSessionCookie(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE", credentials: "include" })
}

export function useAuth() {
  const { user, token, isLoading, setAuth, logout, setLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const t = localStorage.getItem("crm_token")
        if (t) {
          const parsed = parseCrmTokenUser(t)
          if (parsed) {
            if (!cancelled) {
              if (parsed.role === "COMMERCIAL") {
                localStorage.removeItem(CRM_MOCK_ROLE_KEY)
              }
              setAuth(parsed, t)
              void postSessionCookie(t)
            }
            return
          }
          localStorage.removeItem("crm_token")
        }
        const res = await fetch("/api/auth/session", { credentials: "include" })
        if (res.ok) {
          const data = (await res.json()) as { user: User | null }
          const u = data.user
          if (
            u &&
            typeof u.id === "string" &&
            typeof u.name === "string" &&
            isAppRole(u.role)
          ) {
            const tok = encodeCrmTokenPayload({
              id: u.id,
              name: u.name,
              role: u.role,
            })
            if (!cancelled) {
              if (u.role === "COMMERCIAL") {
                localStorage.removeItem(CRM_MOCK_ROLE_KEY)
              }
              localStorage.setItem("crm_token", tok)
              setAuth({ id: u.id, name: u.name, role: u.role }, tok)
            }
            return
          }
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [setAuth, setLoading])

  const login = async (name: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))

    const found = findDemoUser(name.trim(), password.trim())
    if (!found) {
      throw new Error("Identifiants invalides. Vérifiez votre nom et mot de passe.")
    }

    const newToken = encodeCrmTokenPayload({
      id: found.id,
      name: found.name,
      role: found.role,
    })
    if (found.role === "COMMERCIAL") {
      localStorage.removeItem(CRM_MOCK_ROLE_KEY)
    }
    localStorage.setItem("crm_token", newToken)
    setAuth({ id: found.id, name: found.name, role: found.role }, newToken)
    try {
      await postSessionCookie(newToken)
    } catch { /* ignore */ }
  }

  const handleLogout = useCallback(async () => {
    try {
      await deleteSessionCookie()
    } catch { /* ignore */ }
    localStorage.removeItem("crm_token")
    logout()
  }, [logout])

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout: handleLogout,
    isAdmin: user?.role === "DG" || user?.role === "ADMIN",
  }
}
