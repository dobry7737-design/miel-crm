'use client'

import { ChartCard } from './chart-card'
import { useAllDevis } from '@/lib/hooks'

const AVATAR_COLORS = [
  'bg-purple-100 text-purple-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
]

function initialsFor(name: string): string {
  return name.split(' ').slice(0, 2).map((s) => s[0]?.toUpperCase() || '').join('')
}

export function BugsPerDeveloper() {
  const { data: resp } = useAllDevis()

  // Group devis by agentName
  const devis = resp?.data || []
  const agentMap: Record<string, number> = {}
  for (const d of devis) {
    if (d.agentName) {
      agentMap[d.agentName] = (agentMap[d.agentName] || 0) + 1
    }
  }
  const max = Math.max(...Object.values(agentMap), 1)
  const agents = Object.entries(agentMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], i) => ({
      name,
      initials: initialsFor(name),
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      total: count,
      max,
    }))

  return (
    <ChartCard
      title="Devis par Agent"
      subtitle="Répartition des devis par agent commercial"
      dropdownLabel="Tous agents"
      dropdownItems={['Tous agents', 'Top 5']}
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
