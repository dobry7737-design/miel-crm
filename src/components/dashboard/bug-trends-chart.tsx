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
import { ChartCard, DropdownPill } from './chart-card'

const data = [
  { date: 'Mar 1', created: 22, open: 35, closed: 28 },
  { date: 'Mar 2', created: 30, open: 40, closed: 33 },
  { date: 'Mar 3', created: 25, open: 38, closed: 30 },
  { date: 'Mar 4', created: 18, open: 47, closed: 61 },
  { date: 'Mar 5', created: 28, open: 44, closed: 38 },
  { date: 'Mar 6', created: 35, open: 42, closed: 45 },
  { date: 'Mar 7', created: 24, open: 39, closed: 32 },
  { date: 'Mar 8', created: 32, open: 46, closed: 40 },
  { date: 'Mar 9', created: 28, open: 41, closed: 36 },
  { date: 'Mar 10', created: 38, open: 49, closed: 52 },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-slate-900">
        March {label?.split(' ')[1]}, 2026
      </p>
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
      title="Bug Trends"
      subtitle="Daily bug creation and resolution over the last 11 days"
      dropdownLabel="All Bugs"
      dropdownItems={['All Bugs', 'Open', 'Closed']}
      className="xl:flex-[1.4]"
      bodyClassName="h-[260px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="createdStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="openStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4899" stopOpacity={1} />
              <stop offset="100%" stopColor="#EC4899" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="closedStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity={1} />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity={1} />
            </linearGradient>
          </defs>
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
            domain={[0, 60]}
            ticks={[0, 15, 30, 45, 60]}
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
            formatter={(value) => (
              <span className="text-slate-600">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="open"
            name="Open"
            stroke="#EC4899"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#EC4899', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#EC4899', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="closed"
            name="Closed"
            stroke="#14B8A6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#14B8A6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#14B8A6', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
