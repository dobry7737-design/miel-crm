'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartCard } from './chart-card'
import { useStats } from '@/lib/hooks'

const BRANCH_COLORS: Record<string, string> = {
  Auto: '#7C3AED',
  Santé: '#8B5CF6',
  Habitation: '#A78BFA',
  Voyage: '#C4B5FD',
  Vie: '#C4B5FD',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
        Branche {label}
      </p>
      <div className="flex items-center gap-2 text-xs">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0].payload.fill }}
        />
        <span className="text-slate-500 dark:text-slate-400">Délai moyen:</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {payload[0].value}h
        </span>
      </div>
      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
        Engagement: 72h max
      </p>
    </div>
  )
}

export function ResolutionTimeChart() {
  const { data: stats } = useStats()
  const raw = stats?.breakdowns?.avgDelaiByBranche || []
  const data = raw.map((r) => ({
    name: r.branche,
    hours: r.hours,
    fill: BRANCH_COLORS[r.branche] || '#A78BFA',
  }))

  return (
    <ChartCard
      title="Délai de Traitement Sinistres"
      subtitle="Délai moyen (heures) par branche — filtres dashboard"
      className="xl:flex-1"
      bodyClassName="h-[260px]"
    >
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs text-slate-400">
          Aucun sinistre sur la période
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="32%"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={1} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
