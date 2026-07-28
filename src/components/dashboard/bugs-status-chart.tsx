'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ChartCard } from './chart-card'

const data = [
  { name: 'Open', value: 35, color: '#3B82F6' },
  { name: 'In Progress', value: 20, color: '#F59E0B' },
  { name: 'Fixed', value: 28, color: '#10B981' },
  { name: 'Closed', value: 13, color: '#94A3B8' },
]

const total = data.reduce((acc, d) => acc + d.value, 0)

export function BugsStatusChart() {
  return (
    <ChartCard
      title="Bugs by Status"
      subtitle="Current distribution"
      dropdownLabel="All Priority"
      dropdownItems={['All Priority', 'Critical', 'High', 'Medium']}
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
          <span className="text-2xl font-extrabold text-slate-900">{total}</span>
          <span className="text-[11px] font-medium text-slate-400">Total Bugs</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs font-medium text-slate-600">{d.name}</span>
            <span className="ml-auto text-xs font-semibold text-slate-900">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
