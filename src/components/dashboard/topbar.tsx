'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Search, RefreshCw, Plus, Bell, Menu, CheckCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useNav } from '@/lib/nav'
import { useUI } from '@/lib/ui-store'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface NotifItem {
  id: string
  title: string
  description: string
  time: string
  type: 'info' | 'success' | 'warning' | 'danger'
  read: boolean
}

const SAMPLE_NOTIFS: NotifItem[] = [
  { id: '1', title: 'Nouveau sinistre déclaré', description: 'SIN-2026-0098 · Ibrahim Coulibaly · Auto NSIA', time: 'il y a 3 min', type: 'danger', read: false },
  { id: '2', title: 'Paiement reçu', description: 'PAY-2026-0321 · 185 000 FCFA via Orange Money', time: 'il y a 12 min', type: 'success', read: false },
  { id: '3', title: 'Contrat expiré', description: 'CTR-2025-1142 · Modibo Sidibé · CNAR', time: 'il y a 1 h', type: 'warning', read: false },
  { id: '4', title: 'Compagnie à valider', description: 'Takaful Mali · En attente d\'agrément CIMA', time: 'il y a 2 h', type: 'info', read: true },
  { id: '5', title: 'Sinistre en alerte 72h', description: 'SIN-2026-0094 · Délai dépassé pour Aminata Touré', time: 'il y a 3 h', type: 'danger', read: true },
]

const TYPE_STYLES: Record<NotifItem['type'], { dot: string; bg: string; text: string }> = {
  info: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-300' },
  success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-300' },
  warning: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-300' },
  danger: { dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/40', text: 'text-rose-600 dark:text-rose-300' },
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth()
  const { page } = useNav()
  const { openPrimaryAction } = useUI()
  const [refreshing, setRefreshing] = useState(false)
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

  const handleRefresh = () => {
    setRefreshing(true)
    toast.info('Actualisation des données…', { description: 'Vos données sont rafraîchies.' })
    setTimeout(() => {
      setRefreshing(false)
      toast.success('Données actualisées', { description: 'La page est à jour.' })
    }, 1000)
  }

  const unreadCount = SAMPLE_NOTIFS.filter((n) => !n.read).length

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
        {/* Refresh with spinner */}
        <button
          onClick={handleRefresh}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Refresh"
        >
          <RefreshCw
            className={cn('h-[18px] w-[18px]', refreshing && 'animate-spin')}
            strokeWidth={2}
          />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => toast.success('Toutes les notifications marquées comme lues')}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {SAMPLE_NOTIFS.map((n) => {
                const style = TYPE_STYLES[n.type]
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40',
                      !n.read && 'bg-blue-50/30 dark:bg-blue-900/10'
                    )}
                  >
                    <div
                      className={cn(
                        'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        style.bg
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {n.description}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        {n.time}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
              <button
                onClick={() => toast.info('Ouverture du centre de notifications')}
                className="w-full rounded-lg py-2 text-center text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/40"
              >
                Voir toutes les notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

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
