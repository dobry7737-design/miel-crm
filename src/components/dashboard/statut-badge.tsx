'use client'

import { cn } from '@/lib/utils'

const STATUT_STYLES: Record<string, { bg: string; dot: string }> = {
  // Devis
  'Brouillon': { bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300', dot: 'bg-slate-400 dark:bg-slate-400' },
  'Émis': { bg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
  'Transformé': { bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'Expiré': { bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  'Refusé': { bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', dot: 'bg-rose-500' },
  // Contrats
  'Actif': { bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'En attente': { bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  'Résilié': { bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', dot: 'bg-rose-500' },
  'Suspendu': { bg: 'bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500' },
  // Sinistres
  'Déclaré': { bg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
  'En instruction': { bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  'Traité': { bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'Validé': { bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'Rejeté': { bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', dot: 'bg-rose-500' },
  // Paiements
  'Réussi': { bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'Échoué': { bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300', dot: 'bg-rose-500' },
  'Remboursé': { bg: 'bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300', dot: 'bg-violet-500' },
  // Compagnies
  'Inactif': { bg: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400', dot: 'bg-slate-400' },
  'À valider': { bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
  // Utilisateurs
  'Invité': { bg: 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300', dot: 'bg-blue-500' },
}

export function StatutBadge({ statut }: { statut: string }) {
  const style = STATUT_STYLES[statut] || STATUT_STYLES['Brouillon']
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        style.bg
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {statut}
    </span>
  )
}
