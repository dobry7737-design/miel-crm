'use client'

import { ChartCard } from './chart-card'

interface Agent {
  name: string
  initials: string
  avatarColor: string
  total: number
  souscriptions: number
  max: number
}

const agents: Agent[] = [
  { name: 'Aïssata Diallo', initials: 'AD', avatarColor: 'bg-purple-100 text-purple-600', total: 38, souscriptions: 32, max: 40 },
  { name: 'Moussa Koné', initials: 'MK', avatarColor: 'bg-emerald-100 text-emerald-600', total: 28, souscriptions: 24, max: 40 },
  { name: 'Fatoumata Sangaré', initials: 'FS', avatarColor: 'bg-amber-100 text-amber-600', total: 22, souscriptions: 19, max: 40 },
  { name: 'Seydou Camara', initials: 'SC', avatarColor: 'bg-rose-100 text-rose-600', total: 35, souscriptions: 30, max: 40 },
  { name: 'Aminata Touré', initials: 'AT', avatarColor: 'bg-blue-100 text-blue-600', total: 28, souscriptions: 25, max: 40 },
]

export function BugsPerDeveloper() {
  return (
    <ChartCard
      title="Devis par Agent"
      subtitle="Devis et souscriptions ce mois"
      dropdownLabel="Tous agents"
      dropdownItems={['Tous agents', 'Top 5', 'Aïssata D.', 'Moussa K.', 'Fatoumata S.']}
      className="lg:col-span-1"
      bodyClassName="flex flex-col gap-3 pt-1"
    >
      {agents.map((agent) => (
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
                {agent.souscriptions}/{agent.total}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-violet-200"
                style={{ width: `${(agent.total / agent.max) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                style={{ width: `${(agent.souscriptions / agent.max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Souscriptions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-200" />
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Devis</span>
        </div>
      </div>
    </ChartCard>
  )
}
