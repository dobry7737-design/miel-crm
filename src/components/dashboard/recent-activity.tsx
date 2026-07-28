'use client'

import { ChevronRight } from 'lucide-react'
import { ChartCard } from './chart-card'

interface Activity {
  id: string
  avatar: string
  avatarColor: string
  name: string
  action: string
  target: string
  time: string
  tag: string
}

const activities: Activity[] = [
  {
    id: '1',
    avatar: 'IC',
    avatarColor: 'bg-violet-500',
    name: 'Ibrahim Coulibaly',
    action: 'a souscrit un contrat',
    target: 'Auto - NSIA',
    time: 'il y a 3 min',
    tag: 'CTR-2026-0142',
  },
  {
    id: '2',
    avatar: 'AD',
    avatarColor: 'bg-emerald-500',
    name: 'Aïssata Diallo',
    action: 'a généré un devis',
    target: 'Habitation - SUNU',
    time: 'il y a 12 min',
    tag: 'DEV-2026-0487',
  },
  {
    id: '3',
    avatar: 'FK',
    avatarColor: 'bg-amber-500',
    name: 'Fatoumata Koné',
    action: 'a traité un sinistre',
    target: 'Santé - AFG',
    time: 'il y a 25 min',
    tag: 'SIN-2026-0098',
  },
  {
    id: '4',
    avatar: 'MT',
    avatarColor: 'bg-rose-500',
    name: 'Mohamed Traoré',
    action: 'a ajouté une grille tarifaire',
    target: 'CNAR · Auto',
    time: 'il y a 1 h',
    tag: 'TARIF-AUTO',
  },
  {
    id: '5',
    avatar: 'SB',
    avatarColor: 'bg-blue-500',
    name: 'Seydou Ba (NSIA)',
    action: 'a mis à jour les produits',
    target: 'Voyage',
    time: 'il y a 2 h',
    tag: 'MAJ-PRODUIT',
  },
]

export function RecentActivity() {
  return (
    <ChartCard
      title="Activité Récente"
      subtitle="Dernières actions sur la plateforme"
      className="lg:col-span-2"
      bodyClassName="flex flex-col gap-1 -mx-1"
      action={
        <button className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Tout voir
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      }
    >
      <div className="flex flex-col">
        {activities.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 border-b border-slate-100 px-1 py-2.5 last:border-0 dark:border-slate-800"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${a.avatarColor}`}
            >
              {a.avatar}
            </div>
            <div className="flex min-w-0 flex-1 items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {a.name}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{a.action}</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {a.target}
              </span>
              <span className="text-xs text-slate-400 ml-1 dark:text-slate-500">· {a.time}</span>
            </div>
            <span className="ml-auto shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {a.tag}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
