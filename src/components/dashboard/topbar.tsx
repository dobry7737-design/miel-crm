'use client'

import { Search, RefreshCw, Plus, Bell, Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useNav } from '@/lib/nav'
import { useUI } from '@/lib/ui-store'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth()
  const { page } = useNav()
  const { openPrimaryAction } = useUI()
  if (!user) return null

  const getActionLabel = () => {
    if (page === 'devis' || page === 'dashboard') {
      return user.role === 'client' ? 'Demander un devis' : 'Nouveau devis'
    }
    if (page === 'sinistres') return 'Déclarer un sinistre'
    if (page === 'compagnies') return 'Ajouter une compagnie'
    if (page === 'utilisateurs') return 'Inviter un utilisateur'
    return null
  }

  const actionLabel = getActionLabel()

  return (
    <header className="relative flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:gap-3 sm:px-6">
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher devis, contrats, sinistres, clients..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-900/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Refresh */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Refresh"
        >
          <RefreshCw className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {actionLabel && (
          <button
            onClick={openPrimaryAction}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] sm:px-4"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">{actionLabel}</span>
          </button>
        )}
      </div>
    </header>
  )
}
