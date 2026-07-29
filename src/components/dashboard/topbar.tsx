'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  RefreshCw,
  Plus,
  Bell,
  Menu,
  CheckCheck,
  FileText,
  ShieldCheck,
  LifeBuoy,
  Building2,
  Wallet,
  Users,
  CornerDownLeft,
  Command,
  BadgeCheck,
} from 'lucide-react'
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
import { searchAll, type SearchResult } from '@/lib/search'
import { CommandPalette } from '@/components/dashboard/command-palette'
import { cn } from '@/lib/utils'
import { useInvalidateDashboard } from '@/lib/hooks'
import { api, type AuditLogDTO } from '@/lib/api'

interface NotifItem {
  id: string
  title: string
  description: string
  time: string
  type: 'info' | 'success' | 'warning' | 'danger'
  read: boolean
}

const READ_KEY = 'aam-notif-read'

const TYPE_STYLES: Record<NotifItem['type'], { dot: string; bg: string; text: string }> = {
  info: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-300' },
  success: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-300' },
  warning: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-300' },
  danger: { dot: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/40', text: 'text-rose-600 dark:text-rose-300' },
}

function relativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  if (Number.isNaN(diffMs)) return ''
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return 'à l\'instant'
  const min = Math.floor(sec / 60)
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `il y a ${d} j`
  return date.toLocaleDateString('fr-FR')
}

function notifTypeFromAction(action: string): NotifItem['type'] {
  const a = action.toUpperCase()
  if (a.includes('DELETE') || a.includes('REJECT') || a.includes('FAIL')) return 'danger'
  if (a.includes('CREATE') || a.includes('SUCCESS') || a.includes('PAY')) return 'success'
  if (a.includes('UPDATE') || a.includes('ALERT') || a.includes('EXPIRE')) return 'warning'
  return 'info'
}

function loadReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(READ_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed.filter((x) => typeof x === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]))
}

function mapAuditToNotif(log: AuditLogDTO, readIds: Set<string>): NotifItem {
  return {
    id: log.id,
    title: log.action,
    description: log.details || `${log.entity}${log.entityId ? ` · ${log.entityId}` : ''}`,
    time: relativeTime(log.createdAt),
    type: notifTypeFromAction(log.action),
    read: readIds.has(log.id),
  }
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth()
  const { page, setPage } = useNav()
  const { openPrimaryAction } = useUI()
  const invalidateDashboard = useInvalidateDashboard()
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds())
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { data: searchResults = [] } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => searchAll(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  })

  const { data: auditResp } = useQuery({
    queryKey: ['audit', 20],
    queryFn: () => api.getAudit(20),
    staleTime: 30 * 1000,
  })

  const notifs = useMemo(
    () => (auditResp?.data || []).map((log) => mapAuditToNotif(log, readIds)),
    [auditResp?.data, readIds]
  )

  const unreadCount = notifs.filter((n) => !n.read).length

  const markAllRead = useCallback(() => {
    const next = new Set(readIds)
    notifs.forEach((n) => next.add(n.id))
    setReadIds(next)
    saveReadIds(next)
    toast.success('Toutes les notifications marquées comme lues')
  }, [notifs, readIds])

  const handleResultClick = (result: SearchResult) => {
    setPage(result.page)
    setSearchOpen(false)
    setSearchQuery('')
    toast.info(`Navigation vers ${result.page}`, {
      description: `${result.title} — ${result.subtitle}`,
    })
  }

  // Keyboard shortcut: Ctrl/Cmd+K to open command palette, "/" to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((p) => !p)
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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

  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('Actualisation des données…', { description: 'Vos données sont rafraîchies.' })
    try {
      await invalidateDashboard()
      toast.success('Données actualisées', { description: 'La page est à jour.' })
    } finally {
      setRefreshing(false)
    }
  }

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
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          placeholder="Rechercher devis, contrats, sinistres, clients..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-10 pr-16 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-900/40"
        />
        <kbd
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:flex"
        >
          <Command className="h-2.5 w-2.5" />K
        </kbd>

        {/* Live search results dropdown */}
        {searchOpen && searchQuery.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Aucun résultat pour « {searchQuery} »
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Essayez un autre terme (référence, nom, branche…)
                </p>
              </div>
            ) : (
              <>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                </p>
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleResultClick(r)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <ResultIcon type={r.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {r.title}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {r.subtitle}
                      </p>
                    </div>
                    {r.meta && (
                      <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {r.meta}
                      </span>
                    )}
                    <CornerDownLeft className="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600" />
                  </button>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-slate-100 px-3 pt-2 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
                  <span>↵ pour naviguer</span>
                  <button
                    onClick={() => {
                      setPaletteOpen(true)
                      setSearchOpen(false)
                    }}
                    className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Palette de commandes →
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tout lire
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  Aucune notification pour le moment
                </div>
              ) : (
                notifs.map((n) => {
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
                })
              )}
            </div>
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
              <button
                onClick={() => toast.info('Journal d\'audit — dernières actions')}
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

        {/* Profil utilisateur */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-2 dark:border-slate-700 sm:pl-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 text-xs font-semibold text-white shadow-sm">
            {user.avatar}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-slate-900">
              <BadgeCheck className="h-3.5 w-3.5 text-blue-500" fill="currentColor" />
            </span>
          </div>
          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="max-w-[140px] truncate text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100 lg:max-w-[180px]">
              {user.name}
            </span>
            <span className="max-w-[140px] truncate text-[11px] leading-tight text-slate-500 dark:text-slate-400 lg:max-w-[180px]">
              {user.company || user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Command palette modal (Ctrl/Cmd+K) */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  )
}

function ResultIcon({ type }: { type: SearchResult['type'] }) {
  switch (type) {
    case 'devis':
      return <FileText className="h-3.5 w-3.5" strokeWidth={2} />
    case 'contrat':
      return <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
    case 'sinistre':
      return <LifeBuoy className="h-3.5 w-3.5" strokeWidth={2} />
    case 'compagnie':
      return <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
    case 'paiement':
      return <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
    case 'utilisateur':
      return <Users className="h-3.5 w-3.5" strokeWidth={2} />
    default:
      return <FileText className="h-3.5 w-3.5" strokeWidth={2} />
  }
}
