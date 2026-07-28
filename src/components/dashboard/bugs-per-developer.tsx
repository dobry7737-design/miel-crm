'use client'

import { ChartCard } from './chart-card'

interface Developer {
  name: string
  initials: string
  avatarColor: string
  total: number
  resolved: number
  max: number
}

const developers: Developer[] = [
  { name: 'Michael Booth', initials: 'MB', avatarColor: 'bg-purple-100 text-purple-600', total: 18, resolved: 15, max: 20 },
  { name: 'Andie Corbin', initials: 'AC', avatarColor: 'bg-emerald-100 text-emerald-600', total: 14, resolved: 13, max: 20 },
  { name: 'Mitch Darmier', initials: 'MD', avatarColor: 'bg-amber-100 text-amber-600', total: 12, resolved: 11, max: 20 },
  { name: 'Drake Blanset', initials: 'DB', avatarColor: 'bg-rose-100 text-rose-600', total: 17, resolved: 15, max: 20 },
  { name: 'Mick Folly', initials: 'MF', avatarColor: 'bg-blue-100 text-blue-600', total: 14, resolved: 13, max: 20 },
]

export function BugsPerDeveloper() {
  return (
    <ChartCard
      title="Bugs Per Developer"
      subtitle="Active vs resolved"
      dropdownLabel="All Devs"
      dropdownItems={['All Devs', 'Active', 'Resolved']}
      className="lg:col-span-1"
      bodyClassName="flex flex-col gap-3 pt-1"
    >
      {developers.map((dev) => (
        <div key={dev.name} className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold ${dev.avatarColor}`}
          >
            {dev.initials}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">
                {dev.name}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {dev.resolved}/{dev.total}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-violet-200"
                style={{ width: `${(dev.total / dev.max) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                style={{ width: `${(dev.resolved / dev.max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-4 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-slate-500">Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-200" />
          <span className="text-[11px] font-medium text-slate-500">Active</span>
        </div>
      </div>
    </ChartCard>
  )
}
