'use client'

import { ChartCard } from './chart-card'
import { useStats } from '@/lib/hooks'

const AVATAR_COLORS = [
  'bg-purple-100 text-purple-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
]

function initialsFor(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('')
}

export function BugsPerDeveloper() {
  const { data: stats } = useStats()
  const agentsRaw = stats?.breakdowns?.devisByAgent || []
  const max = Math.max(...agentsRaw.map((a) => a.count), 1)
  const agents = agentsRaw.slice(0, 5).map((a, i) => ({
    name: a.name,
    initials: initialsFor(a.name),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    total: a.count,
    max,
  }))

  return (
    <ChartCard
      title="Devis par Agent"
      subtitle="Répartition filtrée des devis par agent"
      className="lg:col-span-1"
      bodyClassName="flex flex-col gap-3 pt-1"
    >
      {agents.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">Aucun agent</div>
      ) : (
        agents.map((agent) => (
          <div key={agent.name} className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${agent.avatarColor}`}
            >
              {agent.initials}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {agent.name}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {agent.total}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
                  style={{ width: `${(agent.total / agent.max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </ChartCard>
  )
}
