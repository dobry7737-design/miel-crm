import { create } from 'zustand'
import type { AppRole } from '@/lib/permissions'

export interface User {
  id: string
  name: string
  role: AppRole
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (user, token) => set({ user, token, isLoading: false }),
  logout: () => set({ user: null, token: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))
