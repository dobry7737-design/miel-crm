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

const data = [
  { name: 'Auto', hours: 28, fill: '#7C3AED' },
  { name: 'Santé', hours: 14, fill: '#8B5CF6' },
  { name: 'Habitation', hours: 42, fill: '#A78BFA' },
  { name: 'Voyage', hours: 18, fill: '#C4B5FD' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-slate-900">
        Branche {label}
      </p>
      <div className="flex items-center gap-2 text-xs">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: payload[0].payload.fill }}
        />
        <span className="text-slate-500">Délai moyen:</span>
        <span className="font-semibold text-slate-900">{payload[0].value}h</span>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">Engagement: 72h max</p>
    </div>
  )
}

export function ResolutionTimeChart() {
  return (
    <ChartCard
      title="Délai de Traitement Sinistres"
      subtitle="Délai moyen (heures) par branche d'assurance"
      dropdownLabel="Tous statuts"
      dropdownItems={['Tous statuts', 'En cours', 'Traité', 'Validé']}
      className="xl:flex-1"
      bodyClassName="h-[260px]"
    >
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
            domain={[0, 72]}
            ticks={[0, 18, 36, 54, 72]}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
            label={{
              value: 'heures',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 10, fill: '#94A3B8' },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="url(#barGradient)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
