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
import { useAllDevis, useAllContrats } from '@/lib/hooks'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-xs font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize text-slate-500 dark:text-slate-400">{entry.name}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BugTrendsChart() {
  const { data: devisResp } = useAllDevis()
  const { data: contratsResp } = useAllContrats()

  // Group by dateCreation (or by branche as fallback)
  const devis = devisResp?.data || []
  const contrats = contratsResp?.data || []

  // Create a simple timeline by grouping by dateCreation
  const dateMap: Record<string, { date: string; devis: number; souscriptions: number; contrats: number }> = {}
  for (const d of devis) {
    const key = d.dateCreation || 'N/A'
    if (!dateMap[key]) dateMap[key] = { date: key, devis: 0, souscriptions: 0, contrats: 0 }
    dateMap[key].devis++
    if (d.statut === 'Transformé') dateMap[key].souscriptions++
  }
  for (const c of contrats) {
    const key = c.dateDebut || 'N/A'
    if (!dateMap[key]) dateMap[key] = { date: key, devis: 0, souscriptions: 0, contrats: 0 }
    dateMap[key].contrats++
  }

  const data = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <ChartCard
      title="Évolution des Devis"
      subtitle="Devis, souscriptions et contrats dans le temps"
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
            formatter={(value) => <span className="text-slate-600 dark:text-slate-400">{value}</span>}
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
            name="Contrats"
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
