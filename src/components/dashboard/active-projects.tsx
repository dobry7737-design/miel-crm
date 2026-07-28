'use client'

import { ChevronRight } from 'lucide-react'
import { ChartCard } from './chart-card'

interface Project {
  id: string
  icon: string
  iconColor: string
  name: string
  members: number
  bugs: number
  badgeColor: string
}

const projects: Project[] = [
  {
    id: '1',
    icon: 'E',
    iconColor: 'bg-blue-500',
    name: 'E-Commerce Platform',
    members: 12,
    bugs: 45,
    badgeColor: 'bg-rose-500',
  },
  {
    id: '2',
    icon: 'M',
    iconColor: 'bg-violet-500',
    name: 'Mobile App Redesign',
    members: 8,
    bugs: 23,
    badgeColor: 'bg-amber-500',
  },
  {
    id: '3',
    icon: 'A',
    iconColor: 'bg-emerald-500',
    name: 'Analytics Dashboard',
    members: 6,
    bugs: 14,
    badgeColor: 'bg-blue-500',
  },
]

export function ActiveProjects() {
  return (
    <ChartCard
      title="Active Projects"
      subtitle="Your current projects"
      className="lg:col-span-1"
      action={
        <button className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700">
          View All
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      }
      bodyClassName="flex flex-col gap-2.5 -mx-1"
    >
      {projects.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 rounded-lg px-1 py-2 transition hover:bg-slate-50"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white ${p.iconColor}`}
          >
            {p.icon}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold text-slate-900">
              {p.name}
            </span>
            <span className="text-xs text-slate-400">
              {p.members} members · {p.bugs} bugs
            </span>
          </div>
          <span
            className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${p.badgeColor}`}
          >
            {p.bugs}
          </span>
        </div>
      ))}
    </ChartCard>
  )
}
