'use client'

import { create } from 'zustand'

export type PageId =
  | 'dashboard'
  | 'devis'
  | 'contrats'
  | 'sinistres'
  | 'compagnies'
  | 'paiements'
  | 'analytics'
  | 'utilisateurs'
  | 'parametres'

interface NavState {
  page: PageId
  setPage: (page: PageId) => void
}

export const useNav = create<NavState>((set) => ({
  page: 'dashboard',
  setPage: (page) => set({ page }),
}))
