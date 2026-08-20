'use client'

import { create } from 'zustand'

export type PageId =
  | 'dashboard'
  | 'devis'
  | 'contrats'
  | 'sinistres'
  | 'compagnies'
  | 'produits'
  | 'paiements'
  | 'analytics'
  | 'utilisateurs'
  | 'messagerie'
  | 'parametres'

interface NavState {
  page: PageId
  pendingAction: boolean // when true, target page should auto-open its primary modal
  setPage: (page: PageId) => void
  goToPageWithAction: (page: PageId) => void
  clearPendingAction: () => void
}

export const useNav = create<NavState>((set) => ({
  page: 'dashboard',
  pendingAction: false,
  setPage: (page) => set({ page, pendingAction: false }),
  goToPageWithAction: (page) => set({ page, pendingAction: true }),
  clearPendingAction: () => set({ pendingAction: false }),
}))
