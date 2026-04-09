"use client"

import { useEffect, useCallback } from "react"
import { useAuthStore } from "@/store/auth-store"
import type { User } from "@/store/auth-store"
import { isAppRole, type AppRole } from "@/lib/permissions"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()
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

  const login = async (phone: string, password: string) => {
    // Astuce: Convertir le téléphone en un faux email pour contourner 
    // l'obligation d'avoir un fournisseur SMS (Twilio) sur Supabase.
    // Normalise le numéro pour retirer +223 etc
    const p = phone.trim().replace(/\s+/g, '').replace(/^(\+223|00223|\+221|00221)/, '')
    const dummyEmail = `${p}@mielcrm.local`

    // Tenter de se connecter via Supabase
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password.trim(),
    })
    
    if (authErr || !authData.user) {
      // BACKDOOR TEMPORAIRE POUR LE DG
      if (phone === '63854545' && password === 'Oumartidiani7') {
        const adminToken = encodeCrmTokenPayload({
          id: 'admin_id',
          name: 'Directeur Général',
          role: 'DG',
        })
        localStorage.setItem("crm_token", adminToken)
        setAuth({ id: 'admin_id', name: 'Directeur Général', role: 'DG' }, adminToken)
        await postSessionCookie(adminToken)
        return
      }
      throw new Error("Identifiants invalides.")
    }

    const { user: supaUser } = authData

    // On cherche le commercial correspondant à ce auth_id, ou ce phone.
    const { data: crmUser } = await supabase
      .from('sales_reps')
      .select('id, name, role')
      .eq('auth_id', supaUser.id)
      .single()

    if (!crmUser) {
      throw new Error("Compte CRM introuvable. Veuillez vérifier avec l'administrateur.")
    }

    const crmRole = crmUser.role || 'COMMERCIAL'
    const newToken = encodeCrmTokenPayload({
      id: crmUser.id,
      name: crmUser.name,
      role: crmRole as AppRole,
    })

    if (crmRole === "COMMERCIAL") {
      localStorage.removeItem(CRM_MOCK_ROLE_KEY)
    }
    localStorage.setItem("crm_token", newToken)
    setAuth({ id: crmUser.id, name: crmUser.name, role: crmRole as AppRole }, newToken)
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

export async function registerAuthUser(phone: string, password: string): Promise<void> {
  const p = phone.trim().replace(/\s+/g, '').replace(/^(\+223|00223|\+221|00221)/, '')
  
  // Vérifie si le commercial existe avec ce numéro avant de créer le compte Auth
  const { data: rep } = await supabase.from('sales_reps').select('id, auth_id').eq('phone', p).maybeSingle()
  if (!rep) {
    throw new Error(`Aucun commercial trouvé avec le numéro ${p}. Contactez votre admin.`)
  }
  if (rep.auth_id) {
    throw new Error(`Ce numéro de téléphone est déjà activé. Vous pouvez vous connecter.`)
  }

  // Astuce: Convertir le téléphone en faux email
  const dummyEmail = `${p}@mielcrm.local`

  // Création du Auth Profile dans Supabase
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: dummyEmail,
    password: password,
  })

  if (authErr) {
    // Si l'user existe déjà sur Auth (ex: signUp précédent avorté)
    if (authErr.message.includes('User already registered')) {
      throw new Error("Ce téléphone est déjà enregistré dans Supabase.")
    }
    throw new Error(authErr.message)
  }

  if (authData.user) {
    // Lier l'auth_id généré avec notre table CRM
    const { error: updateErr } = await supabase
      .from('sales_reps')
      .update({ auth_id: authData.user.id })
      .eq('id', rep.id)
    
    if (updateErr) {
      throw new Error("Compte créé mais erreur de liaison CRM.")
    }
  }
}
