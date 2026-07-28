'use client'

import { ChevronRight } from 'lucide-react'
import { ChartCard } from './chart-card'
import { useNav } from '@/lib/nav'

interface Partner {
  id: string
  initials: string
  iconColor: string
  name: string
  rating: number
  sinistres: number
  badgeColor: string
  status: string
}

const partners: Partner[] = [
  {
    id: '1',
    initials: 'NS',
    iconColor: 'bg-blue-500',
    name: 'NSIA Assurances',
    rating: 4.8,
    sinistres: 12,
    badgeColor: 'bg-emerald-500',
    status: 'Actif',
  },
  {
    id: '2',
    initials: 'SU',
    iconColor: 'bg-violet-500',
    name: 'SUNU Assurances',
    rating: 4.6,
    sinistres: 8,
    badgeColor: 'bg-emerald-500',
    status: 'Actif',
  },
  {
    id: '3',
    initials: 'AF',
    iconColor: 'bg-emerald-500',
    name: 'AFG Assurances',
    rating: 4.5,
    sinistres: 15,
    badgeColor: 'bg-amber-500',
    status: 'À valider',
  },
  {
    id: '4',
    initials: 'SA',
    iconColor: 'bg-rose-500',
    name: 'Sanlam Allianz',
    rating: 4.7,
    sinistres: 6,
    badgeColor: 'bg-emerald-500',
    status: 'Actif',
  },
  {
    id: '5',
    initials: 'CN',
    iconColor: 'bg-amber-500',
    name: 'CNAR',
    rating: 4.3,
    sinistres: 4,
    badgeColor: 'bg-slate-400',
    status: 'Inactif',
  },
]

export function ActiveProjects() {
  const { setPage } = useNav()
  return (
    <ChartCard
      title="Compagnies Partenaires"
      subtitle="11 compagnies agréées CIMA"
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
      {partners.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 rounded-lg px-1 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${p.iconColor}`}
          >
            {p.initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {p.name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ★ {p.rating} · {p.sinistres} sinistres actifs
            </span>
          </div>
          <span
            className={`flex h-6 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold text-white ${p.badgeColor}`}
          >
            {p.status}
          </span>
        </div>
      ))}
    </ChartCard>
  )
}
