'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

export type Role =
  | 'admin'
  | 'agent'
  | 'client'
  | 'gestionnaire'
  | 'correspondant'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  company?: string
  avatar: string
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  agent: 'Agent / Courtier',
  client: 'Client / Assuré',
  gestionnaire: 'Gestionnaire Sinistres',
  correspondant: 'Correspondant Partenaire',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin:
    'Pilotage global : partenaires, produits, tarifs, utilisateurs, reporting',
  agent:
    'Portefeuille clients, devis assistés, suivi des commissions',
  client:
    'Vos contrats, devis, sinistres et paiements',
  gestionnaire:
    'Traitement des déclarations de sinistres (engagement 72h)',
  correspondant:
    'Accès restreint au catalogue de votre compagnie',
}

function mapUser(u: {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
  company?: { id?: string; name?: string; nom?: string } | null
}): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as Role,
    avatar: u.avatar || u.name?.slice(0, 2)?.toUpperCase() || '??',
    company: u.company?.name || u.company?.nom,
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isHydrated: boolean
  error: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  hydrate: () => Promise<void>
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      error: null,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const res = await api.login(email, password)
          set({
            user: mapUser(res.user),
            isAuthenticated: true,
            isHydrated: true,
            error: null,
            isLoading: false,
          })
          return true
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Identifiants incorrects. Vérifiez votre email et mot de passe.'
          set({
            error: message,
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isHydrated: true,
          })
          return false
        }
      },
      logout: async () => {
        try {
          await api.logout()
        } catch {
          // ignore network errors on logout
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
          isHydrated: true,
        })
      },
      hydrate: async () => {
        if (get().isLoading) return
        set({ isLoading: true })
        try {
          const res = await api.me()
          set({
            user: mapUser(res.user),
            isAuthenticated: true,
            isHydrated: true,
            isLoading: false,
            error: null,
          })
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isHydrated: true,
            isLoading: false,
          })
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'aam-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
