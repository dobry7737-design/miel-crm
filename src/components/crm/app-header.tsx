'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Moon, Sun, LogOut, User,
  CheckCircle2, XCircle, Info, X, MoreHorizontal,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppView } from './app-sidebar'
import { usePermissions } from '@/hooks/use-permissions'
import { useToast } from '@/hooks/use-toast'
import { canAccessCrmView } from '@/lib/crm-routes'
import { getPaletteOpenKbdLabel } from '@/lib/kbd-shortcut-label'
import { formatNotificationDates } from '@/lib/notification-display'
import {
  CRM_DATA_CHANGED_EVENT,
  getNotifications, getUnreadCount, markAllRead, markAsRead,
  clearNotification, getClients, getCommandes,
  type Notification,
} from '@/lib/crm-data'
import {
  PROFILE_AVATAR_CHANGED_EVENT,
  profileAvatarStorageKey,
  readStoredProfileAvatarUrl,
} from '@/lib/profile-avatar'
import { OrderAlertsContactBar } from '@/components/crm/order-alerts-contact-bar'

interface AppHeaderProps {
  currentView: AppView
  userId: string
  userName: string
  onNavigate?: (view: AppView) => void
  onLogout: () => void
}

const viewTitles: Record<string, string> = {
  dashboard: 'Tableau de bord',
  clients: 'Gestion des Clients',
  commandes: 'Gestion des Commandes',
  rapports: 'Rapports & Analyses',
  equipe: 'Équipe commerciale',
  profil: 'Paramètres',
}

const viewDescriptions: Record<string, string> = {
  dashboard: "Vue d'ensemble de votre activité commerciale",
  clients: 'Gérer votre portefeuille clients',
  commandes: 'Suivre et gérer vos commandes',
  rapports: 'Statistiques détaillées de votre activité',
  equipe: 'Commerciaux, zones et performances',
  profil: 'Compte, préférences et données',
}

function effectiveRoleLabel(role: string): string {
  if (role === 'DG') return 'Directeur Général'
  if (role === 'ADMIN') return 'Administrateur'
  return 'Commercial'
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const notifIcon: Record<string, React.ElementType> = {
  info: Info, success: CheckCircle2, warning: Bell, error: XCircle,
}
const notifColor: Record<string, string> = {
  info: 'text-primary bg-primary/10 dark:text-primary dark:bg-primary/20',
  success: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30',
  warning: 'text-chart-2 bg-chart-2/15 dark:text-chart-2 dark:bg-chart-2/20',
  error: 'text-destructive bg-destructive/10 dark:text-red-400 dark:bg-destructive/20',
}

export function AppHeader({ currentView, userId, userName, onNavigate, onLogout }: AppHeaderProps) {
  const { effectiveRole } = usePermissions()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const paletteKbdLabel = useMemo(
    () => (mounted ? getPaletteOpenKbdLabel() : 'Ctrl+K'),
    [mounted],
  )
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifVersion, setNotifVersion] = useState(0)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Mounted check for SSR
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const bump = () => setNotifVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  useEffect(() => {
    const refreshAvatar = () => setAvatarSrc(readStoredProfileAvatarUrl(userId))
    refreshAvatar()
    const onStorage = (e: StorageEvent) => {
      if (e.key === profileAvatarStorageKey(userId)) refreshAvatar()
    }
    const onAvatarChanged = () => refreshAvatar()
    window.addEventListener('storage', onStorage)
    window.addEventListener(PROFILE_AVATAR_CHANGED_EVENT, onAvatarChanged)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(PROFILE_AVATAR_CHANGED_EVENT, onAvatarChanged)
    }
  }, [userId])

  // Load notifications from store (reactive to version changes)
  const notifications = useMemo(() => getNotifications(effectiveRole || undefined, userName), [notifVersion, effectiveRole, userName])
  const unreadCount = useMemo(() => getUnreadCount(effectiveRole || undefined, userName), [notifVersion, effectiveRole, userName])

  const loadNotifications = useCallback(() => {
    setNotifVersion(v => v + 1)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Global search across clients & commandes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const r = effectiveRole || undefined
    try {
      const clients = getClients()
      const commandes = getCommandes()
      const q = searchQuery.toLowerCase()
      const results: { type: string; label: string; sub: string; view: AppView }[] = []

      if (canAccessCrmView(r, 'clients')) {
        clients.forEach(c => {
          if (c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q))) {
            results.push({ type: 'client', label: c.name, sub: c.phone, view: 'clients' })
          }
        })
      }
      if (canAccessCrmView(r, 'commandes')) {
        commandes.forEach(c => {
          if (c.client.toLowerCase().includes(q) || c.commercial.toLowerCase().includes(q)) {
            results.push({ type: 'commande', label: c.client, sub: `${c.montant.toLocaleString('fr-FR')} FCFA — ${c.statut}`, view: 'commandes' })
          }
        })
      }
      return results.slice(0, 8)
    } catch { return [] }
  }, [searchQuery, effectiveRole])

  const roleForAccess = effectiveRole || undefined
  const searchPlaceholder = canAccessCrmView(roleForAccess, 'commandes')
    ? 'Rechercher clients, commandes…'
    : 'Rechercher des clients…'

  const notifSeeAllTarget = useMemo(() => {
    if (canAccessCrmView(roleForAccess, 'rapports')) {
      return { view: 'rapports' as const, label: 'Voir dans les rapports' }
    }
    if (canAccessCrmView(roleForAccess, 'commandes')) {
      return { view: 'commandes' as const, label: 'Voir les commandes' }
    }
    return { view: 'dashboard' as const, label: 'Tableau de bord' }
  }, [roleForAccess])

  const handleNotifClick = async (notif: Notification) => {
    await markAsRead(notif.id)
    loadNotifications()
    if (notif.link && onNavigate) {
      const r = effectiveRole || undefined
      if (!canAccessCrmView(r, notif.link)) {
        toast({
          title: 'Accès réservé',
          description:
            'Cette notification renvoie vers une section réservée à la direction ou à l’administration.',
        })
        setNotifOpen(false)
        return
      }
      onNavigate(notif.link)
      setNotifOpen(false)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllRead(effectiveRole || undefined, userName)
    loadNotifications()
  }

  const handleClearNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await clearNotification(id)
    loadNotifications()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-1 border-b bg-background/95 px-2 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:gap-2 sm:px-3 md:gap-4 md:px-6">
      <SidebarTrigger className="-ml-0.5 shrink-0 sm:-ml-1" />
      <Separator orientation="vertical" className="hidden h-6 shrink-0 sm:block" />

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
          {viewTitles[currentView]}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {viewDescriptions[currentView]}
        </p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative shrink-0">
        <div className="relative hidden w-72 items-center md:flex">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-9 pr-20 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {paletteKbdLabel === '⌘K' ? (
              <>
                <span className="text-xs">⌘</span>K
              </>
            ) : (
              <span>Ctrl+K</span>
            )}
          </kbd>
        </div>
        {/* Mobile search trigger */}
        <Button variant="ghost" size="icon" className="h-10 w-10 md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {searchOpen && searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-popover shadow-lg md:left-0 md:right-auto md:w-80 md:max-w-none"
            >
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Aucun résultat pour &quot;{searchQuery}&quot;</div>
              ) : (
                <ScrollArea className="max-h-64">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      className="w-full px-4 py-2.5 text-left hover:bg-primary/8 dark:hover:bg-primary/15 flex items-center gap-3 border-b last:border-0 transition-colors"
                      onClick={() => {
                        if (onNavigate) onNavigate(r.view)
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.type === 'client' ? 'bg-primary/12 dark:bg-primary/25' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                        <Search className={`h-4 w-4 ${r.type === 'client' ? 'text-primary' : 'text-blue-600 dark:text-blue-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-[10px] flex-shrink-0">{r.type === 'client' ? 'Client' : 'Commande'}</Badge>
                    </button>
                  ))}
                </ScrollArea>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thème + notifications : boutons séparés dès sm ; menu « Plus » en dessous */}
      <div ref={notifRef} className="relative flex shrink-0 items-center gap-0.5 sm:gap-1">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-10 w-10 shrink-0 sm:inline-flex sm:h-9 sm:w-9"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
          </Button>
        )}

        <button
          type="button"
          className="relative hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted sm:flex sm:h-9 sm:w-auto sm:px-2"
          onClick={() => {
            setNotifOpen(!notifOpen)
            if (notifOpen) loadNotifications()
          }}
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center border-2 border-background bg-primary p-0 text-[10px] text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>

        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 sm:hidden" title="Plus d’options">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center justify-between gap-2"
                onClick={() => {
                  setNotifOpen((o) => !o)
                  loadNotifications()
                }}
              >
                <span className="flex items-center">
                  <Bell className="mr-2 h-4 w-4 shrink-0" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="fixed inset-x-3 top-16 z-50 max-h-[min(24rem,70vh)] w-auto overflow-hidden rounded-xl border bg-popover shadow-lg max-sm:mt-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-96 sm:max-w-none"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary/90" onClick={handleMarkAllRead}>
                      Tout marquer lu
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Aucune notification</div>
                ) : (
                  notifications.map(n => {
                    const Icon = notifIcon[n.type] || Info
                    const { primary, secondary } = formatNotificationDates(n.date)
                    return (
                      <div
                        key={n.id}
                        className={`group px-4 py-3 border-b last:border-0 flex items-start gap-3 cursor-pointer hover:bg-primary/8 dark:hover:bg-primary/12 transition-colors ${!n.read ? 'bg-muted/30' : ''}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifColor[n.type] || ''}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="mt-1 text-[11px] font-medium text-foreground/90">{primary}</p>
                          <p className="text-[10px] text-muted-foreground">{secondary}</p>
                        </div>
                        <button
                          onClick={(e) => handleClearNotif(n.id, e)}
                          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 flex-shrink-0 text-muted-foreground/40 hover:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  })
                )}
              </ScrollArea>
              <div className="space-y-2 border-t px-3 py-2.5">
                <OrderAlertsContactBar label="Alertes commandes (e-mail) :" />
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary transition-colors hover:text-primary/90"
                    onClick={() => {
                      if (onNavigate) onNavigate(notifSeeAllTarget.view)
                      setNotifOpen(false)
                    }}
                  >
                    {notifSeeAllTarget.label}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator orientation="vertical" className="hidden h-6 shrink-0 sm:block" />

      {/* User Profile Dropdown (avatar seul sur mobile, texte dès lg) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex min-h-10 min-w-10 shrink-0 items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-muted sm:min-h-0 sm:min-w-0 sm:gap-3 sm:px-2"
          >
            <Avatar className="h-9 w-9 ring-2 ring-primary/25 sm:h-8 sm:w-8">
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-700 text-xs font-bold text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 text-left lg:block">
              <p className="max-w-[10rem] truncate text-sm font-medium leading-none">{userName}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {effectiveRoleLabel(effectiveRole)}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20">
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-700 text-[10px] font-bold text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {effectiveRoleLabel(effectiveRole)}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-muted-foreground" onClick={() => onNavigate?.('profil')}>
            <User className="h-4 w-4 mr-2" />Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
            {mounted && theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
