'use client'

import { ChevronRight } from 'lucide-react'
import { ChartCard } from './chart-card'
import { useNav } from '@/lib/nav'
import { formatFCFA } from '@/lib/api'
import { useAllDevis } from '@/lib/hooks'

const AVATAR_COLORS: Record<string, string> = {
  IC: 'bg-violet-500',
  AD: 'bg-emerald-500',
  MK: 'bg-amber-500',
  FS: 'bg-rose-500',
  SC: 'bg-blue-500',
  AT: 'bg-cyan-500',
  SB: 'bg-fuchsia-500',
  FK: 'bg-orange-500',
  MS: 'bg-teal-500',
  KT: 'bg-pink-500',
}

export function RecentActivity() {
  const { setPage } = useNav()
  const { data: resp } = useAllDevis()

  const devis = (resp?.data || []).slice(0, 6)

  return (
    <ChartCard
      title="Activité Récente"
      subtitle="Dernières actions sur la plateforme"
      className="lg:col-span-2"
      bodyClassName="flex flex-col gap-1 -mx-1"
      action={
        <button
          onClick={() => setPage('devis')}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Tout voir
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      }
    >
      <div className="flex flex-col">
        {devis.map((d) => {
          const avatarColor = AVATAR_COLORS[d.clientAvatar] || 'bg-slate-500'
          const page = d.reference.startsWith('CTR')
            ? 'contrats'
            : d.reference.startsWith('SIN')
              ? 'sinistres'
              : 'devis'
          return (
            <button
              key={d.id}
              onClick={() => setPage(page as any)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-1 py-2.5 text-left transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${avatarColor}`}
              >
                {d.clientAvatar || '?'}
              </div>
              <div className="flex min-w-0 flex-1 items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {d.clientName}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  a créé le devis
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {d.reference}
                </span>
                <span className="text-xs text-slate-400 ml-1 dark:text-slate-500">· {d.dateCreation}</span>
              </div>
              <span className="ml-auto shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {formatFCFA(d.prime)}
              </span>
            </button>
          )
        })}
        {devis.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            Aucune activité récente
          </div>
        )}
      </div>
    </ChartCard>
  )
}
