'use client'

import { ChartCard } from './chart-card'
import { useStats } from '@/lib/hooks'

const BRANCH_COLORS: Record<string, string> = {
  Auto: 'bg-blue-500',
  Santé: 'bg-emerald-500',
  Habitation: 'bg-amber-500',
  Voyage: 'bg-violet-500',
  Vie: 'bg-rose-500',
}

export function BugsBySeverity() {
  const { data: stats } = useStats()

  const raw = stats?.breakdowns?.contratsByBranche || []
  const branches = raw.map((b) => ({
    label: b.branche,
    count: b._count,
    color: BRANCH_COLORS[b.branche] || 'bg-slate-400',
  }))
  const maxCount = Math.max(...branches.map((s) => s.count), 1)

  return (
    <ChartCard
      title="Sinistres par Branche"
      subtitle="Répartition par branche d'assurance"
      className="lg:col-span-1"
      bodyClassName="flex flex-col gap-2.5 pt-1"
    >
      {branches.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">Aucune donnée</div>
      ) : (
        branches.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="flex w-20 shrink-0 items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${s.color}`} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{s.label}</span>
            </div>
            <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-slate-50 dark:bg-slate-800">
              <div
                className={`absolute inset-y-0 left-0 rounded-md ${s.color}`}
                style={{ width: `${(s.count / maxCount) * 100}%`, opacity: 0.85 }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
              {s.count}
            </span>
          </div>
        ))
      )}
    </ChartCard>
  )
}
