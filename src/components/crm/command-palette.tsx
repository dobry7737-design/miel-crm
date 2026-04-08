'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  UserPlus,
  PackagePlus,
  Moon,
  Sun,
  Keyboard,
  Search,
  UserCog,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getPaletteOpenKbdLabel } from '@/lib/kbd-shortcut-label'
import { usePermissions } from '@/hooks/use-permissions'
import { Separator } from '@/components/ui/separator'
import type { AppView } from './app-sidebar'
import { canAccessCrmView } from '@/lib/crm-routes'

// ── Types ──────────────────────────────────────────────────────────────────

interface CommandItem {
  id: string
  label: string
  description: string
  icon: React.ElementType
  category: 'Navigation' | 'Actions' | 'Aide'
  action: () => void
  shortcut?: string
}

interface CommandPaletteProps {
  onNavigate: (view: AppView) => void
  onNewClient?: () => void
  onNewCommande?: () => void
}

// ── Category order & labels ────────────────────────────────────────────────

const CATEGORY_ORDER: Array<CommandItem['category']> = ['Navigation', 'Actions', 'Aide']

const CATEGORY_LABELS: Record<CommandItem['category'], string> = {
  Navigation: 'Navigation',
  Actions: 'Actions rapides',
  Aide: 'Aide',
}

// ── Component ──────────────────────────────────────────────────────────────

export function CommandPalette({ onNavigate, onNewClient, onNewCommande }: CommandPaletteProps) {
  const { effectiveRole, canModifyCommandes } = usePermissions()
  const role = effectiveRole || undefined
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Build command list ─────────────────────────────────────────────────

  const commands = useMemo<CommandItem[]>(() => {
    const resolvedTheme = theme || 'light'
    const navigation: CommandItem[] = [
      ...(canAccessCrmView(role, 'dashboard')
        ? [{
            id: 'nav-dashboard',
            label: 'Tableau de bord',
            description: 'Vue d\'ensemble de l\'activité',
            icon: LayoutDashboard,
            category: 'Navigation' as const,
            action: () => onNavigate('dashboard'),
            shortcut: 'G D',
          }]
        : []),
      ...(canAccessCrmView(role, 'clients')
        ? [{
            id: 'nav-clients',
            label: 'Clients',
            description: 'Gérer les clients et prospects',
            icon: Users,
            category: 'Navigation' as const,
            action: () => onNavigate('clients'),
            shortcut: 'G C',
          }]
        : []),
      ...(canAccessCrmView(role, 'commandes')
        ? [{
            id: 'nav-commandes',
            label: 'Commandes',
            description: 'Suivre et gérer les commandes',
            icon: ShoppingCart,
            category: 'Navigation' as const,
            action: () => onNavigate('commandes'),
            shortcut: 'G O',
          }]
        : []),
      ...(canAccessCrmView(role, 'rapports')
        ? [{
            id: 'nav-rapports',
            label: 'Rapports',
            description: 'Analyses et statistiques',
            icon: BarChart3,
            category: 'Navigation' as const,
            action: () => onNavigate('rapports'),
            shortcut: 'G R',
          }]
        : []),
      ...(canAccessCrmView(role, 'equipe')
        ? [{
            id: 'nav-equipe',
            label: 'Équipe commerciale',
            description: 'Commerciaux et performances',
            icon: UserCog,
            category: 'Navigation' as const,
            action: () => onNavigate('equipe'),
            shortcut: 'G E',
          }]
        : []),
      {
        id: 'nav-parametres',
        label: 'Paramètres',
        description: 'Compte, thème et préférences',
        icon: Settings,
        category: 'Navigation',
        action: () => onNavigate('profil'),
        shortcut: 'G P',
      },
    ]

    return [
      ...navigation,
      // Actions
      {
        id: 'action-new-client',
        label: 'Nouveau client',
        description: 'Ajouter un nouveau client',
        icon: UserPlus,
        category: 'Actions',
        action: () => {
          onNewClient?.()
          onNavigate('clients')
        },
        shortcut: 'N C',
      },
      ...(canModifyCommandes
        ? [{
            id: 'action-new-commande',
            label: 'Nouvelle commande',
            description: 'Créer une nouvelle commande',
            icon: PackagePlus,
            category: 'Actions' as const,
            action: () => {
              onNewCommande?.()
              onNavigate('commandes')
            },
            shortcut: 'N O',
          }]
        : []),
      {
        id: 'action-toggle-theme',
        label: 'Basculer le thème',
        description: resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre',
        icon: resolvedTheme === 'dark' ? Sun : Moon,
        category: 'Actions',
        action: () => {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        },
        shortcut: '⇧ D',
      },
      // Help
      {
        id: 'help-shortcuts',
        label: 'Raccourcis clavier',
        description: 'Afficher les raccourcis disponibles',
        icon: Keyboard,
        category: 'Aide',
        action: () => {
          toast({
            title: 'Raccourcis clavier',
            description: `${getPaletteOpenKbdLabel()} : palette de commandes • G D/C/O/R/P : navigation • N C/O : nouveau`,
          })
        },
      },
    ]
  }, [theme, setTheme, onNavigate, onNewClient, onNewCommande, toast, role, canModifyCommandes])

  // ── Filter commands ────────────────────────────────────────────────────

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      // Return all groups in order
      const groups: Array<{ category: CommandItem['category']; items: CommandItem[] }> = []
      for (const cat of CATEGORY_ORDER) {
        const items = commands.filter(c => c.category === cat)
        if (items.length > 0) {
          groups.push({ category: cat, items })
        }
      }
      return groups
    }

    const groups: Array<{ category: CommandItem['category']; items: CommandItem[] }> = []
    for (const cat of CATEGORY_ORDER) {
      const items = commands.filter(
        c =>
          c.category === cat &&
          (c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      )
      if (items.length > 0) {
        groups.push({ category: cat, items })
      }
    }
    return groups
  }, [query, commands])

  // Flat list for index-based navigation
  const flatFiltered = useMemo(
    () => filteredGroups.flatMap(g => g.items),
    [filteredGroups]
  )

  const totalResults = flatFiltered.length

  // ── Reset selection when query changes (via ref to avoid cascading renders) ─

  const queryRef = useRef(query)
  useEffect(() => {
    if (queryRef.current !== query) {
      queryRef.current = query
      requestAnimationFrame(() => {
        setSelectedIndex(0)
      })
    }
  }, [query])

  // ── Scroll selected item into view ─────────────────────────────────────

  useEffect(() => {
    if (!listRef.current || totalResults === 0) return
    const selectedEl = listRef.current.querySelector('[data-selected="true"]')
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, totalResults])

  // ── Handle dialog open state changes ───────────────────────────────────

  const handleOpenChange = useCallback((value: boolean) => {
    if (!value) {
      // Reset state on close via callback, not in an effect
      setQuery('')
      setSelectedIndex(0)
    }
    setOpen(value)
  }, [])

  // ── Focus input when dialog opens ──────────────────────────────────────

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [open])

  // ── Global Ctrl+K / Cmd+K listener ────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleOpenChange(!open)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, handleOpenChange])

  // ── Keyboard navigation inside dialog ──────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalResults)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults)
      } else if (e.key === 'Enter' && totalResults > 0) {
        e.preventDefault()
        flatFiltered[selectedIndex].action()
        handleOpenChange(false)
      }
    },
    [totalResults, flatFiltered, selectedIndex, handleOpenChange]
  )

  // ── Execute a command ──────────────────────────────────────────────────

  const executeCommand = useCallback(
    (item: CommandItem) => {
      item.action()
      handleOpenChange(false)
    },
    [handleOpenChange]
  )

  // ── Build a running index counter per group ────────────────────────────

  const getItemGlobalIndex = useCallback(
    (groupIndex: number, itemIndex: number) => {
      let idx = 0
      for (let g = 0; g < groupIndex; g++) {
        idx += filteredGroups[g].items.length
      }
      return idx + itemIndex
    },
    [filteredGroups]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(32rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg"
        onOpenAutoFocus={(e) => {
          // Prevent Dialog from stealing focus — we manage it ourselves
          e.preventDefault()
          inputRef.current?.focus()
        }}
      >
        {/* Visually-hidden title for accessibility */}
        <DialogTitle className="sr-only">Palette de commandes</DialogTitle>
        <DialogDescription className="sr-only">
          Recherchez et exécutez des actions rapidement
        </DialogDescription>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une commande..."
            className="h-11 border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/60 bg-transparent px-0"
          />
        </div>

        <Separator className="opacity-50" />

        {/* Command List */}
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto px-2 py-2 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent"
        >
          {totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Search className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">Aucune commande trouvée</p>
              <p className="text-xs mt-1 opacity-70">Essayez un autre terme de recherche</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="mb-1 last:mb-0">
                {/* Category Header */}
                <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 select-none">
                  {CATEGORY_LABELS[group.category]}
                </p>

                {/* Items */}
                {group.items.map((item, itemIdx) => {
                  const globalIdx = getItemGlobalIndex(
                    filteredGroups.indexOf(group),
                    itemIdx
                  )
                  const isSelected = globalIdx === selectedIndex
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      data-selected={isSelected}
                      onClick={() => executeCommand(item)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                        ${isSelected
                          ? 'bg-primary/12 dark:bg-primary/25'
                          : 'hover:bg-primary/8 dark:hover:bg-primary/15'
                        }
                      `}
                    >
                      {/* Icon */}
                      <div
                        className={`
                          flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-colors
                          ${isSelected
                            ? 'bg-primary/20 dark:bg-primary/35'
                            : 'bg-muted'
                          }
                        `}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected
                              ? 'text-primary'
                              : 'text-primary/70'
                          }`}
                        />
                      </div>

                      {/* Label & Description */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isSelected
                              ? 'text-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground/70 truncate">
                          {item.description}
                        </p>
                      </div>

                      {/* Shortcut Badge */}
                      {item.shortcut && (
                        <span
                          className={`
                            text-[10px] font-mono tracking-wide px-2 py-1 rounded-md shrink-0
                            ${isSelected
                              ? 'bg-primary/18 dark:bg-primary/30 text-primary'
                              : 'bg-muted text-muted-foreground'
                            }
                          `}
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <Separator className="opacity-50" />

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-muted font-mono text-[10px]">
                ↕
              </kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-muted font-mono text-[10px]">
                ↵
              </kbd>
              <span>Sélectionner</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-muted font-mono text-[10px]">
              Esc
            </kbd>
            <span>Fermer</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
