'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type StatsQueryParams } from '@/lib/api'
import { useOptionalDashboardFilters } from '@/lib/dashboard-filters'

/**
 * Shared hooks for dashboard data.
 * Uses React Query's built-in deduplication — multiple components calling
 * useQuery with the same queryKey will share a single network request.
 */

// Stats — used by StatCards, charts, Analytics, list pages
export function useStats(params?: StatsQueryParams) {
  const filters = useOptionalDashboardFilters()
  const branche =
    params?.branche ??
    (filters?.branche && filters.branche !== 'all' ? filters.branche : 'all')
  const days = params?.days ?? filters?.days ?? 'all'

  return useQuery({
    queryKey: ['stats', { branche, days }],
    queryFn: () =>
      api.getStats({
        branche: branche === 'all' ? undefined : String(branche),
        days,
      }),
    staleTime: 60 * 1000,
  })
}

// All devis — used by list pages / analytics fallbacks
export function useAllDevis() {
  return useQuery({
    queryKey: ['devis', {}],
    queryFn: () => api.getDevis(),
    staleTime: 60 * 1000,
  })
}

export function useAllContrats() {
  return useQuery({
    queryKey: ['contrats', {}],
    queryFn: () => api.getContrats(),
    staleTime: 60 * 1000,
  })
}

export function useAllSinistres() {
  return useQuery({
    queryKey: ['sinistres', {}],
    queryFn: () => api.getSinistres(),
    staleTime: 60 * 1000,
  })
}

export function useAllCompagnies() {
  return useQuery({
    queryKey: ['compagnies', {}],
    queryFn: () => api.getCompagnies(),
    staleTime: 60 * 1000,
  })
}

export function useAudit(limit = 12) {
  return useQuery({
    queryKey: ['audit', limit],
    queryFn: () => api.getAudit(limit),
    staleTime: 60 * 1000,
  })
}

export function useInvalidateDashboard() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['stats'] }),
      queryClient.invalidateQueries({ queryKey: ['devis'] }),
      queryClient.invalidateQueries({ queryKey: ['contrats'] }),
      queryClient.invalidateQueries({ queryKey: ['sinistres'] }),
      queryClient.invalidateQueries({ queryKey: ['compagnies'] }),
      queryClient.invalidateQueries({ queryKey: ['paiements'] }),
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] }),
      queryClient.invalidateQueries({ queryKey: ['produits'] }),
      queryClient.invalidateQueries({ queryKey: ['audit'] }),
      queryClient.invalidateQueries({ queryKey: ['parametres'] }),
    ])
  }
}
