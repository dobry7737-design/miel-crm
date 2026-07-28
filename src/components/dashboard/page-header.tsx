'use client'

import { Plus, Search, Download, Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (v: string) => void
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  filterLabel?: string
}

export function PageHeader({
  title,
  subtitle,
  searchPlaceholder = 'Rechercher...',
  searchValue,
  onSearchChange,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel = 'Exporter',
  onSecondaryAction,
  filterLabel = 'Filtrer',
}: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-44 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 sm:w-56"
            />
          </div>
        )}
        <button className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
          <Filter className="h-3.5 w-3.5" strokeWidth={2} />
          {filterLabel}
          <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
        </button>
        {onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className={cn(
              'flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            )}
          >
            <Download className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">{secondaryActionLabel}</span>
          </button>
        )}
        {primaryActionLabel && onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            {primaryActionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
