'use client'

import { ArrowUpRight, ArrowDownRight, Bug, Clock, Hourglass, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  trend: number
  trendUp: boolean
  iconColor: string
  iconBg: string
}

const stats: StatCardProps[] = [
  {
    label: 'Total Bugs',
    value: 8,
    icon: Bug,
    trend: 12,
    trendUp: true,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
  {
    label: 'Open Bugs',
    value: 4,
    icon: Clock,
    trend: 8,
    trendUp: false,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
  },
  {
    label: 'In Progress',
    value: 2,
    icon: Hourglass,
    trend: 42,
    trendUp: true,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Critical',
    value: 2,
    icon: Zap,
    trend: 15,
    trendUp: false,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50',
  },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, trend, trendUp, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:shadow-md hover:shadow-slate-200/70">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-[18px] w-[18px]', iconColor)} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
        <span
          className={cn(
            'flex items-center gap-0.5 text-xs font-semibold',
            trendUp ? 'text-emerald-600' : 'text-rose-500'
          )}
        >
          {trendUp ? (
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          )}
          {trendUp ? '+' : '-'}
          {trend}%
        </span>
      </div>
    </div>
  )
}
