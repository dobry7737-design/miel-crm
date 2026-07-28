'use client'

import { Plus } from 'lucide-react'
import { ChartCard } from './chart-card'

interface Activity {
  id: string
  avatar: string
  avatarColor: string
  name: string
  action: string
  target: string
  time: string
  tag: string
}

const activities: Activity[] = [
  {
    id: '1',
    avatar: 'LA',
    avatarColor: 'bg-violet-500',
    name: 'Lisa Anderson',
    action: 'Created bug',
    target: 'BUG-1238',
    time: '3/7/2025, 10:03:09 PM',
    tag: 'BUG-1238',
  },
  {
    id: '2',
    avatar: 'MB',
    avatarColor: 'bg-emerald-500',
    name: 'Michael Booth',
    action: 'Resolved bug',
    target: 'BUG-1234',
    time: '3/7/2025, 9:45:21 PM',
    tag: 'BUG-1234',
  },
  {
    id: '3',
    avatar: 'AC',
    avatarColor: 'bg-amber-500',
    name: 'Andie Corbin',
    action: 'Updated bug',
    target: 'BUG-1230',
    time: '3/7/2025, 8:30:11 PM',
    tag: 'BUG-1230',
  },
  {
    id: '4',
    avatar: 'DB',
    avatarColor: 'bg-rose-500',
    name: 'Drake Blanset',
    action: 'Commented on',
    target: 'BUG-1228',
    time: '3/7/2025, 7:15:43 PM',
    tag: 'BUG-1228',
  },
  {
    id: '5',
    avatar: 'MF',
    avatarColor: 'bg-blue-500',
    name: 'Mick Folly',
    action: 'Closed bug',
    target: 'BUG-1225',
    time: '3/7/2025, 5:50:18 PM',
    tag: 'BUG-1225',
  },
]

export function RecentActivity() {
  return (
    <ChartCard
      title="Recent Activity"
      subtitle="Latest updates across all projects"
      className="lg:col-span-2"
      bodyClassName="flex flex-col gap-1 -mx-1"
    >
      <div className="flex flex-col">
        {activities.map((a, idx) => (
          <div
            key={a.id}
            className="flex items-center gap-3 border-b border-slate-100 px-1 py-2.5 last:border-0"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${a.avatarColor}`}
            >
              {a.avatar}
            </div>
            <div className="flex min-w-0 flex-1 items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-900">
                {a.name}
              </span>
              <span className="text-sm text-slate-500">{a.action}</span>
              <span className="text-sm font-semibold text-blue-600">
                {a.target}
              </span>
              <span className="text-xs text-slate-400 ml-1">· {a.time}</span>
            </div>
            <span className="ml-auto shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
              {a.tag}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
