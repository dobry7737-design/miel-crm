'use client'

import { ChartCard } from './chart-card'

interface BranchItem {
  label: string
  count: number
  color: string
}

const branches: BranchItem[] = [
  { label: 'Auto', count: 32, color: 'bg-blue-500' },
  { label: 'Santé', count: 18, color: 'bg-emerald-500' },
  { label: 'Habitation', count: 24, color: 'bg-amber-500' },
  { label: 'Voyage', count: 11, color: 'bg-violet-500' },
  { label: 'Vie', count: 9, color: 'bg-rose-500' },
  { label: 'Multirisque', count: 14, color: 'bg-cyan-500' },
  { label: 'Autres', count: 7, color: 'bg-slate-400' },
]

export function BugsBySeverity() {
  const maxCount = Math.max(...branches.map((s) => s.count))
  return (
    <ChartCard
      title="Sinistres par Branche"
      subtitle="Répartition par branche d'assurance"
      className="lg:col-span-1"
      bodyClassName="flex flex-col gap-2.5 pt-1"
    >
      {branches.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <div className="flex w-20 shrink-0 items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            <span className="text-xs font-medium text-slate-600">{s.label}</span>
          </div>
          <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-slate-50">
            <div
              className={`absolute inset-y-0 left-0 rounded-md ${s.color}`}
              style={{ width: `${(s.count / maxCount) * 100}%`, opacity: 0.85 }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700">
            {s.count}
          </span>
        </div>
      ))}
    </ChartCard>
  )
}
