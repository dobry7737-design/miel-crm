'use client'

import { api } from '@/lib/api'
import type { PageId } from '@/lib/nav'

export interface SearchResult {
  id: string
  type: 'devis' | 'contrat' | 'sinistre' | 'compagnie' | 'paiement' | 'utilisateur'
  title: string
  subtitle: string
  meta?: string
  page: PageId
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  return api.search(query)
}
