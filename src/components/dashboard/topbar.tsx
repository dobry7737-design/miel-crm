'use client'

import { Search, RefreshCw, Plus, Bell, Menu } from 'lucide-react'
import { useAuth, ROLE_LABELS } from '@/lib/auth'

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <header className="relative flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      {/* Mobile menu button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      )}

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher devis, contrats, sinistres, clients..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Refresh Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Refresh"
        >
          <RefreshCw className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>

        {/* Notifications */}
        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* New Quote Button - Role-based label */}
        <button className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] sm:px-4">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">
            {user.role === 'client'
              ? 'Demander un devis'
              : user.role === 'gestionnaire'
                ? 'Nouveau sinistre'
                : user.role === 'correspondant'
                  ? 'Mettre à jour tarifs'
                  : 'Nouveau devis'}
          </span>
        </button>
      </div>
    </header>
  )
}
