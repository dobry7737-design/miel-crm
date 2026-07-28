'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  company?: string // Pour les correspondants
  avatar: string
}

interface DemoAccount {
  email: string
  password: string
  user: Omit<User, 'id'> & { id: string }
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

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@aam.ml',
    password: 'admin',
    user: {
      id: 'u-admin',
      name: 'Mohamed Traoré',
      email: 'admin@aam.ml',
      role: 'admin',
      avatar: 'MT',
    },
  },
  {
    email: 'agent@aam.ml',
    password: 'agent',
    user: {
      id: 'u-agent',
      name: 'Aïssata Diallo',
      email: 'agent@aam.ml',
      role: 'agent',
      avatar: 'AD',
    },
  },
  {
    email: 'client@aam.ml',
    password: 'client',
    user: {
      id: 'u-client',
      name: 'Ibrahim Coulibaly',
      email: 'client@aam.ml',
      role: 'client',
      avatar: 'IC',
    },
  },
  {
    email: 'sinistres@aam.ml',
    password: 'gest',
    user: {
      id: 'u-gest',
      name: 'Fatoumata Koné',
      email: 'sinistres@aam.ml',
      role: 'gestionnaire',
      avatar: 'FK',
    },
  },
  {
    email: 'partenaire@nsia.ml',
    password: 'part',
    user: {
      id: 'u-part',
      name: 'Seydou Ba',
      email: 'partenaire@nsia.ml',
      role: 'correspondant',
      company: 'NSIA Assurances',
      avatar: 'SB',
    },
  },
]

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => boolean
  logout: () => void
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      login: (email: string, password: string) => {
        const account = DEMO_ACCOUNTS.find(
          (a) =>
            a.email.toLowerCase() === email.toLowerCase() &&
            a.password === password
        )
        if (account) {
          set({ user: account.user, isAuthenticated: true, error: null })
          return true
        }
        set({ error: 'Identifiants incorrects. Vérifiez votre email et mot de passe.' })
        return false
      },
      logout: () => set({ user: null, isAuthenticated: false, error: null }),
      clearError: () => set({ error: null }),
    }),
    { name: 'aam-auth' }
  )
)
