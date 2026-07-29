'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type DashboardBranche = 'all' | 'Auto' | 'Santé' | 'Habitation' | 'Voyage' | 'Vie'
export type DashboardDays = 7 | 30 | 90 | 'all'

export interface DashboardFiltersState {
  branche: DashboardBranche
  days: DashboardDays
  setBranche: (b: DashboardBranche) => void
  setDays: (d: DashboardDays) => void
}

const DashboardFiltersContext = createContext<DashboardFiltersState | null>(
  null
)

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [branche, setBranche] = useState<DashboardBranche>('all')
  const [days, setDays] = useState<DashboardDays>(30)

  const value = useMemo(
    () => ({ branche, days, setBranche, setDays }),
    [branche, days]
  )

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  )
}

export function useDashboardFilters(): DashboardFiltersState {
  const ctx = useContext(DashboardFiltersContext)
  if (!ctx) {
    throw new Error(
      'useDashboardFilters must be used within DashboardFiltersProvider'
    )
  }
  return ctx
}

export function useOptionalDashboardFilters(): DashboardFiltersState | null {
  return useContext(DashboardFiltersContext)
}
