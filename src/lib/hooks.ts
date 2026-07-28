'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

/**
 * Shared hooks for dashboard data.
 * Uses React Query's built-in deduplication — multiple components calling
 * useQuery with the same queryKey will share a single network request.
 */

// Stats — used by StatCards, BugsStatusChart, BugsBySeverity, Analytics
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    staleTime: 60 * 1000, // 1 min cache
  })
}

// All devis — used by BugTrendsChart, BugsPerDeveloper, RecentActivity, DevisPage, Analytics, Search
export function useAllDevis() {
  return useQuery({
    queryKey: ['devis', {}],
    queryFn: () => api.getDevis(),
    staleTime: 60 * 1000,
  })
}

// All contrats — used by BugTrendsChart, Analytics
export function useAllContrats() {
  return useQuery({
    queryKey: ['contrats', {}],
    queryFn: () => api.getContrats(),
    staleTime: 60 * 1000,
  })
}

// All sinistres — used by ResolutionTimeChart
export function useAllSinistres() {
  return useQuery({
    queryKey: ['sinistres', {}],
    queryFn: () => api.getSinistres(),
    staleTime: 60 * 1000,
  })
}

// All compagnies — used by ActiveProjects, CompagniesPage
export function useAllCompagnies() {
  return useQuery({
    queryKey: ['compagnies', {}],
    queryFn: () => api.getCompagnies(),
    staleTime: 60 * 1000,
  })
}

// Invalidate all dashboard queries (use after mutations)
export function useInvalidateDashboard() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['stats'] })
    queryClient.invalidateQueries({ queryKey: ['devis'] })
    queryClient.invalidateQueries({ queryKey: ['contrats'] })
    queryClient.invalidateQueries({ queryKey: ['sinistres'] })
    queryClient.invalidateQueries({ queryKey: ['compagnies'] })
  }
}
