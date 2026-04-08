"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import type { AppRole } from '@/lib/permissions'

const STORAGE_KEY = 'crm_mock_role'

export type MockRoleMode = 'real' | 'DG' | 'COMMERCIAL' | 'ADMIN'

function readStoredMock(): MockRoleMode {
  if (typeof window === 'undefined') return 'real'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'DG' || v === 'COMMERCIAL' || v === 'ADMIN') return v
  return 'real'
}

/**
 * Rôle effectif pour l’UI : simulation localStorage ou rôle issu du token.
 * Ne modifie pas le token.
 */
export function useEffectiveRole(): {
  mockMode: MockRoleMode
  setMockMode: (m: MockRoleMode) => void
  effectiveRole: AppRole | ''
  dataUserName: string
  hydrated: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [mockMode, setMockModeState] = useState<MockRoleMode>('real')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const mode = readStoredMock()
    // Mise à jour en callback (synchronisation avec un système externe : localStorage)
    const id = requestAnimationFrame(() => {
      setMockModeState(mode)
      setHydrated(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const setMockMode = useCallback((m: MockRoleMode) => {
    if (m === 'real') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, m)
    setMockModeState(m)
  }, [])

  /** La simulation ne concerne que les comptes DG / Admin (évite un vieux localStorage « ADMIN » sous un commercial). */
  const canUseStoredSimulation =
    user?.role === 'DG' || user?.role === 'ADMIN'

  useEffect(() => {
    if (user?.role !== 'COMMERCIAL') return
    localStorage.removeItem(STORAGE_KEY)
    const id = requestAnimationFrame(() => {
      setMockModeState('real')
    })
    return () => cancelAnimationFrame(id)
  }, [user?.id, user?.role])

  const effectiveRole = useMemo<AppRole | ''>(() => {
    if (!hydrated) return user?.role ?? ''
    if (!canUseStoredSimulation) return user?.role ?? ''
    return mockMode === 'real' ? (user?.role ?? '') : (mockMode as AppRole)
  }, [hydrated, mockMode, user?.role, canUseStoredSimulation])

  /** Nom commercial utilisé pour filtrer les données (vue « commercial ») */
  const dataUserName = useMemo(() => {
    if (effectiveRole !== 'COMMERCIAL') return user?.name ?? ''
    if (user?.role === 'COMMERCIAL') return user.name
    return 'Amadou Diallo'
  }, [effectiveRole, user])

  return { mockMode, setMockMode, effectiveRole, dataUserName, hydrated }
}
