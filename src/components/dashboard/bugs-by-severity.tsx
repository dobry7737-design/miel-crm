'use client'

import { ChartCard } from './chart-card'

interface SeverityItem {
  label: string
  count: number
  color: string
  bgColor: string
}

const severities: SeverityItem[] = [
  { label: 'Blocker', count: 9, color: 'bg-rose-500', bgColor: 'bg-rose-50' },
  { label: 'Critical', count: 14, color: 'bg-violet-600', bgColor: 'bg-violet-50' },
  { label: 'High', count: 35, color: 'bg-blue-600', bgColor: 'bg-blue-50' },
  { label: 'Major', count: 11, color: 'bg-blue-400', bgColor: 'bg-blue-50' },
  { label: 'Medium', count: 25, color: 'bg-amber-500', bgColor: 'bg-amber-50' },
  { label: 'Minor', count: 53, color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  { label: 'Trivial', count: 40, color: 'bg-stone-700', bgColor: 'bg-stone-100' },
]

export function BugsBySeverity() {
  const maxCount = Math.max(...severities.map((s) => s.count))
  return (
    <ChartCard
      title="Bugs By Severity"
      subtitle="Priority breakdown"
      className="lg:col-span-1"
      bodyClassName="flex flex-col gap-2.5 pt-1"
    >
      {severities.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <div className="flex w-16 shrink-0 items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            <span className="text-xs font-medium text-slate-600">
              {s.label}
            </span>
          </div>
          <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-slate-50">
            <div
              className={`absolute inset-y-0 left-0 rounded-md ${s.color}`}
              style={{ width: `${(s.count / maxCount) * 100}%`, opacity: 0.85 }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700">
            {s.count}
          </span>
        </div>
      ))}
    </ChartCard>
  )
}
