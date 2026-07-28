'use client'

import {
  DEVIS_DATA,
  CONTRATS_DATA,
  SINISTRES_DATA,
  COMPAGNIES_DATA,
  PAIEMENTS_DATA,
  UTILISATEURS_DATA,
  formatFCFA,
} from '@/lib/data'
import type { PageId } from '@/lib/nav'

export interface SearchResult {
  id: string
  type: 'devis' | 'contrat' | 'sinistre' | 'compagnie' | 'paiement' | 'utilisateur'
  title: string
  subtitle: string
  meta?: string
  page: PageId // page to navigate to when clicked
}

export function searchAll(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  // Devis
  for (const d of DEVIS_DATA) {
    if (
      d.reference.toLowerCase().includes(q) ||
      d.client.toLowerCase().includes(q) ||
      d.compagnie.toLowerCase().includes(q) ||
      d.branche.toLowerCase().includes(q)
    ) {
      results.push({
        id: `devis-${d.id}`,
        type: 'devis',
        title: d.reference,
        subtitle: `${d.client} · ${d.branche}`,
        meta: `${formatFCFA(d.prime)}`,
        page: 'devis',
      })
    }
  }

  // Contrats
  for (const c of CONTRATS_DATA) {
    if (
      c.reference.toLowerCase().includes(q) ||
      c.client.toLowerCase().includes(q) ||
      c.compagnie.toLowerCase().includes(q) ||
      c.branche.toLowerCase().includes(q)
    ) {
      results.push({
        id: `contrat-${c.id}`,
        type: 'contrat',
        title: c.reference,
        subtitle: `${c.client} · ${c.produit}`,
        meta: c.statut,
        page: 'contrats',
      })
    }
  }

  // Sinistres
  for (const s of SINISTRES_DATA) {
    if (
      s.reference.toLowerCase().includes(q) ||
      s.client.toLowerCase().includes(q) ||
      s.compagnie.toLowerCase().includes(q) ||
      s.branche.toLowerCase().includes(q)
    ) {
      results.push({
        id: `sinistre-${s.id}`,
        type: 'sinistre',
        title: s.reference,
        subtitle: `${s.client} · ${s.branche}`,
        meta: s.statut,
        page: 'sinistres',
      })
    }
  }

  // Compagnies
  for (const c of COMPAGNIES_DATA) {
    if (
      c.nom.toLowerCase().includes(q) ||
      c.agrement.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q)
    ) {
      results.push({
        id: `compagnie-${c.id}`,
        type: 'compagnie',
        title: c.nom,
        subtitle: c.agrement,
        meta: c.statut,
        page: 'compagnies',
      })
    }
  }

  // Paiements
  for (const p of PAIEMENTS_DATA) {
    if (
      p.reference.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.compagnie.toLowerCase().includes(q) ||
      p.transactionId.toLowerCase().includes(q)
    ) {
      results.push({
        id: `paiement-${p.id}`,
        type: 'paiement',
        title: p.reference,
        subtitle: `${p.client} · ${p.moyen}`,
        meta: p.statut,
        page: 'paiements',
      })
    }
  }

  // Utilisateurs
  for (const u of UTILISATEURS_DATA) {
    if (
      u.nom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.telephone.toLowerCase().includes(q)
    ) {
      results.push({
        id: `user-${u.id}`,
        type: 'utilisateur',
        title: u.nom,
        subtitle: u.email,
        meta: u.statut,
        page: 'utilisateurs',
      })
    }
  }

  return results.slice(0, 12)
}
