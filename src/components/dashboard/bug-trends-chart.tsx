'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartCard } from './chart-card'

const data = [
  { date: 'Sem 1', devis: 28, souscriptions: 18, contrats: 14 },
  { date: 'Sem 2', devis: 35, souscriptions: 22, contrats: 19 },
  { date: 'Sem 3', devis: 42, souscriptions: 28, contrats: 24 },
  { date: 'Sem 4', devis: 38, souscriptions: 25, contrats: 22 },
  { date: 'Sem 5', devis: 52, souscriptions: 35, contrats: 28 },
  { date: 'Sem 6', devis: 48, souscriptions: 32, contrats: 26 },
  { date: 'Sem 7', devis: 62, souscriptions: 42, contrats: 36 },
  { date: 'Sem 8', devis: 58, souscriptions: 38, contrats: 33 },
  { date: 'Sem 9', devis: 72, souscriptions: 48, contrats: 42 },
  { date: 'Sem 10', devis: 85, souscriptions: 58, contrats: 51 },
  { date: 'Sem 11', devis: 78, souscriptions: 52, contrats: 47 },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-900">{label} · 2026</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize text-slate-500">{entry.name}:</span>
            <span className="font-semibold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BugTrendsChart() {
  return (
    <ChartCard
      title="Évolution des Devis"
      subtitle="Devis, souscriptions et contrats sur les 11 dernières semaines"
      dropdownLabel="Toutes branches"
      dropdownItems={['Toutes branches', 'Auto', 'Santé', 'Habitation', 'Voyage', 'Vie']}
      className="xl:flex-[1.4]"
      bodyClassName="h-[260px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 90]}
            ticks={[0, 15, 30, 45, 60, 75, 90]}
            tick={{ fontSize: 11, fill: '#94A3B8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => <span className="text-slate-600">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="devis"
            name="Devis"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="souscriptions"
            name="Souscriptions"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="contrats"
            name="Contrats Actifs"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
