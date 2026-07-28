'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  subtitle?: string
  dropdownLabel?: string
  dropdownItems?: string[]
  className?: string
  bodyClassName?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function ChartCard({
  title,
  subtitle,
  dropdownLabel,
  dropdownItems = ['All'],
  className,
  bodyClassName,
  children,
  action,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        {action ? (
          action
        ) : dropdownLabel ? (
          <DropdownPill label={dropdownLabel} items={dropdownItems} />
        ) : null}
      </div>
      <div className={cn('min-h-0', bodyClassName)}>{children}</div>
    </div>
  )
}

export function DropdownPill({
  label,
  items,
  size = 'md',
}: {
  label: string
  items?: string[]
  size?: 'sm' | 'md'
}) {
  return (
    <button
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
      )}
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
    </button>
  )
}
