'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  LifeBuoy,
  Building2,
  Wallet,
  BarChart3,
  Users,
  Settings,
  Plus,
  Search,
  CornerDownLeft,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNav, type PageId } from '@/lib/nav'
import { useAuth, ROLE_LABELS, type Role } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { useStats } from '@/lib/hooks'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: typeof FileText
  group: 'navigation' | 'actions' | 'system'
  shortcut?: string
  onSelect: () => void
  roles?: Role[] // RBAC: restrict visibility
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { user, logout } = useAuth()
  const { setPage, goToPageWithAction } = useNav()
  const { theme, setTheme } = useTheme()
  const { data: stats } = useStats()
  const compagniesCount = stats?.totals?.compagnies
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevQuery, setPrevQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when opening
  useEffect(() => {
    if (open && user) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, user])

  // Reset selection when query changes (adjust during render — React-safe pattern)
  if (prevQuery !== query) {
    setPrevQuery(query)
    setSelectedIndex(0)
  }

  const navigate = (page: PageId) => {
    setPage(page)
    onOpenChange(false)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    onOpenChange(false)
  }

  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Tableau de bord',
      description: 'Vue d\'ensemble de la plateforme',
      icon: LayoutDashboard,
      group: 'navigation',
      onSelect: () => navigate('dashboard'),
    },
    {
      id: 'nav-devis',
      label: 'Devis',
      description: 'Comparaisons et conversions en contrats',
      icon: FileText,
      group: 'navigation',
      onSelect: () => navigate('devis'),
      roles: ['admin', 'agent', 'client', 'correspondant'],
    },
    {
      id: 'nav-contrats',
      label: 'Contrats',
      description: 'Contrats souscrits, renouvellements, attestations',
      icon: ShieldCheck,
      group: 'navigation',
      onSelect: () => navigate('contrats'),
      roles: ['admin', 'agent', 'client'],
    },
    {
      id: 'nav-sinistres',
      label: 'Sinistres',
      description: 'Déclarations, instruction et traitement 72h',
      icon: LifeBuoy,
      group: 'navigation',
      onSelect: () => navigate('sinistres'),
      roles: ['admin', 'agent', 'client', 'gestionnaire'],
    },
    {
      id: 'nav-compagnies',
      label: 'Compagnies Partenaires',
      description: compagniesCount != null
        ? `Référentiel des ${compagniesCount} compagnies agréées CIMA`
        : 'Référentiel des compagnies agréées CIMA',
      icon: Building2,
      group: 'navigation',
      onSelect: () => navigate('compagnies'),
      roles: ['admin', 'correspondant'],
    },
    {
      id: 'nav-paiements',
      label: 'Paiements',
      description: 'Suivi des paiements et commissions',
      icon: Wallet,
      group: 'navigation',
      onSelect: () => navigate('paiements'),
      roles: ['admin', 'agent', 'client'],
    },
    {
      id: 'nav-analytics',
      label: 'Analytics',
      description: 'Indicateurs clés et tendances',
      icon: BarChart3,
      group: 'navigation',
      onSelect: () => navigate('analytics'),
      roles: ['admin', 'agent'],
    },
    {
      id: 'nav-utilisateurs',
      label: 'Utilisateurs',
      description: 'Comptes clients, agents et partenaires',
      icon: Users,
      group: 'navigation',
      onSelect: () => navigate('utilisateurs'),
      roles: ['admin'],
    },
    {
      id: 'nav-parametres',
      label: 'Paramètres',
      description: 'Configuration de la plateforme',
      icon: Settings,
      group: 'navigation',
      onSelect: () => navigate('parametres'),
    },
    // Actions
    {
      id: 'action-new-devis',
      label: 'Nouveau devis',
      description: user.role === 'client' ? 'Demander un devis' : 'Créer un nouveau devis',
      icon: Plus,
      group: 'actions',
      onSelect: () => {
        goToPageWithAction('devis')
        onOpenChange(false)
      },
      roles: ['admin', 'agent', 'client', 'correspondant'],
    },
    {
      id: 'action-declare-sinistre',
      label: 'Déclarer un sinistre',
      description: 'Nouvelle déclaration de sinistre',
      icon: LifeBuoy,
      group: 'actions',
      onSelect: () => {
        goToPageWithAction('sinistres')
        onOpenChange(false)
      },
      roles: ['admin', 'agent', 'client', 'gestionnaire'],
    },
    {
      id: 'action-add-compagnie',
      label: 'Ajouter une compagnie',
      description: 'Ajouter une compagnie partenaire CIMA',
      icon: Building2,
      group: 'actions',
      onSelect: () => {
        goToPageWithAction('compagnies')
        onOpenChange(false)
      },
      roles: ['admin', 'correspondant'],
    },
    {
      id: 'action-invite-user',
      label: 'Inviter un utilisateur',
      description: 'Envoyer une invitation à un nouvel utilisateur',
      icon: Users,
      group: 'actions',
      onSelect: () => {
        goToPageWithAction('utilisateurs')
        onOpenChange(false)
      },
      roles: ['admin'],
    },
    // System
    {
      id: 'system-theme',
      label: theme === 'dark' ? 'Mode clair' : 'Mode sombre',
      description: 'Basculer entre thème clair et sombre',
      icon: theme === 'dark' ? Sun : Moon,
      group: 'system',
      onSelect: toggleTheme,
    },
    {
      id: 'system-logout',
      label: 'Déconnexion',
      description: `Se déconnecter de ${ROLE_LABELS[user.role]}`,
      icon: LogOut,
      group: 'system',
      onSelect: () => {
        onOpenChange(false)
        setTimeout(() => {
          void logout()
        }, 100)
      },
    },
  ]

  // Filter by user role
  const roleFiltered = allCommands.filter(
    (c) => !c.roles || c.roles.includes(user.role)
  )

  // Filter by search query
  const filtered = roleFiltered.filter((c) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      c.label.toLowerCase().includes(q) ||
      (c.description?.toLowerCase().includes(q) ?? false) ||
      c.group.toLowerCase().includes(q)
    )
  })

  // Group by section
  const groups = [
    { id: 'navigation', label: 'Navigation' },
    { id: 'actions', label: 'Actions rapides' },
    { id: 'system', label: 'Système' },
  ]
  const groupedFiltered = groups
    .map((g) => ({
      ...g,
      items: filtered.filter((c) => c.group === g.id),
    }))
    .filter((g) => g.items.length > 0)

  const flatList = useMemo(
    () => groupedFiltered.flatMap((g) => g.items),
    [groupedFiltered]
  )

  // Keyboard navigation (after flatList computation)
  useEffect(() => {
    if (!open || !user) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = flatList[selectedIndex]
        if (item) item.onSelect()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, user, selectedIndex, flatList, onOpenChange])

  if (!user || !open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[15vh]"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-hidden
      />
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une commande ou une page…"
              className="h-14 w-full bg-transparent pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 select-none rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {flatList.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aucune commande pour « {query} »
              </p>
            </div>
          ) : (
            groupedFiltered.map((group) => (
              <div key={group.id} className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const flatIndex = flatList.findIndex((c) => c.id === item.id)
                  const isActive = flatIndex === selectedIndex
                  return (
                    <button
                      key={item.id}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-sm font-medium',
                            isActive
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-slate-900 dark:text-slate-100'
                          )}
                        >
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <CornerDownLeft className="h-3 w-3 shrink-0 text-blue-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">
                ↑↓
              </kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">
                ↵
              </kbd>
              sélectionner
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1 dark:border-slate-700 dark:bg-slate-800">
                esc
              </kbd>
              fermer
            </span>
          </div>
          <span>AAM · {ROLE_LABELS[user.role]}</span>
        </div>
      </div>
    </div>
  )
}
