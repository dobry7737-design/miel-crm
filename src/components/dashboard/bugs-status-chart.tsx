'use client'

import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ChartCard } from './chart-card'
import { api } from '@/lib/api'

const STATUT_COLORS: Record<string, string> = {
  'Déclaré': '#3B82F6',
  'En instruction': '#F59E0B',
  'Traité': '#10B981',
  'Validé': '#10B981',
  'Rejeté': '#94A3B8',
}

export function BugsStatusChart() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
  })

  const raw = stats?.breakdowns?.sinistresByStatut || []
  const data = raw.map((s) => ({
    name: s.statut,
    value: s._count,
    color: STATUT_COLORS[s.statut] || '#94A3B8',
  }))
  const total = data.reduce((acc, d) => acc + d.value, 0)

  return (
    <ChartCard
      title="Sinistres par Statut"
      subtitle="Répartition actuelle · Engagement 72h"
      dropdownLabel="Toutes priorités"
      dropdownItems={['Toutes priorités', 'Auto', 'Santé', 'Habitation', 'Voyage', 'Vie']}
      className="lg:col-span-1"
      bodyClassName="flex flex-col"
    >
      <div className="relative flex items-center justify-center py-2">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={56}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{total}</span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Total sinistres
          </span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">
              {d.name}
            </span>
            <span className="ml-auto text-xs font-semibold text-slate-900 dark:text-slate-100">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
