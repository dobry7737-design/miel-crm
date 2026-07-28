'use client'

import { ChevronRight } from 'lucide-react'
import { ChartCard } from './chart-card'
import { useNav } from '@/lib/nav'
import { useAllCompagnies } from '@/lib/hooks'

const BADGE_COLORS: Record<string, string> = {
  Actif: 'bg-emerald-500',
  'À valider': 'bg-amber-500',
  Inactif: 'bg-slate-400',
}

export function ActiveProjects() {
  const { setPage } = useNav()
  const { data: resp } = useAllCompagnies()

  const compagnies = (resp?.data || [])
    .filter((c) => c.statut === 'Actif')
    .slice(0, 5)

  return (
    <ChartCard
      title="Compagnies Partenaires"
      subtitle={`${resp?.data?.length || 0} compagnies agréées CIMA`}
      className="lg:col-span-1"
      action={
        <button
          onClick={() => setPage('compagnies')}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Tout voir
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      }
      bodyClassName="flex flex-col gap-2.5 -mx-1"
    >
      {compagnies.map((c) => (
        <button
          key={c.id}
          onClick={() => setPage('compagnies')}
          className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${c.iconColor}`}
          >
            {c.initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {c.nom}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ★ {c.rating > 0 ? c.rating : '—'} · {c._count?.sinistres || 0} sinistres
            </span>
          </div>
          <span
            className={`flex h-6 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold text-white ${BADGE_COLORS[c.statut] || 'bg-slate-400'}`}
          >
            {c.statut}
          </span>
        </button>
      ))}
      {compagnies.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          Aucune compagnie active
        </div>
      )}
    </ChartCard>
  )
}
