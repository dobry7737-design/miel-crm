"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Palette, RotateCcw, Download,
  Moon, Sun, Users, ShoppingCart, LogOut, AlertTriangle,
  Activity, Clock, Bell, BellOff, Settings,
  CheckCircle2, Info, XCircle, LayoutDashboard, Camera, ImageOff,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BrandLogo } from '@/components/crm/brand-logo'
import { DataTablePagination } from '@/components/crm/data-table/data-table-pagination'
import { useToast } from '@/hooks/use-toast'
import { formatNotificationDates } from '@/lib/notification-display'
import {
  CRM_DATA_CHANGED_EVENT,
  getClients,
  getCommandes,
  getNotifications,
  resetData,
  type Notification,
} from '@/lib/crm-data'
import type { AppRole } from '@/lib/permissions'
import { isAppRole } from '@/lib/permissions'
import { getRoleLabel } from '@/lib/demo-users'
import {
  MAX_PROFILE_AVATAR_BYTES,
  PROFILE_AVATAR_CHANGED_EVENT,
  profileAvatarStorageKey,
  readStoredProfileAvatarUrl,
} from '@/lib/profile-avatar'

function accountRoleBadgeClass(role: AppRole): string {
  switch (role) {
    case 'DG':
      return 'bg-chart-2/25 text-foreground border-chart-2/45 dark:bg-chart-2/20 dark:border-chart-2/40'
    case 'ADMIN':
      return 'bg-violet-100 text-violet-900 border-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:border-violet-800'
    case 'COMMERCIAL':
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
    default:
      return 'bg-muted text-foreground border-border'
  }
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const NOTIF_TYPE_META: Record<
  Notification['type'],
  { label: string; Icon: typeof Info; badgeClass: string }
> = {
  info: {
    label: 'Info',
    Icon: Info,
    badgeClass:
      'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  },
  success: {
    label: 'Succès',
    Icon: CheckCircle2,
    badgeClass:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  warning: {
    label: 'Attention',
    Icon: AlertTriangle,
    badgeClass:
      'border-chart-2/50 bg-chart-2/15 text-foreground dark:border-chart-2/40 dark:bg-chart-2/20',
  },
  error: {
    label: 'Alerte',
    Icon: XCircle,
    badgeClass:
      'border-destructive/35 bg-destructive/10 text-destructive dark:border-red-800 dark:bg-destructive/15',
  },
}

const LINK_META: Record<
  NonNullable<Notification['link']>,
  { label: string; Icon: typeof Users }
> = {
  clients: { label: 'Clients', Icon: Users },
  commandes: { label: 'Commandes', Icon: ShoppingCart },
  dashboard: { label: 'Tableau de bord', Icon: LayoutDashboard },
}

interface ProfilViewProps {
  /** Identifiant utilisateur (stockage avatar local) */
  userId: string
  userName: string
  /** Rôle issu du compte (token), inchangé par la simulation d’en-tête */
  accountRole: AppRole
  /** Rôle effectif pour menus / permissions (peut être simulé) */
  effectiveRole: AppRole | ''
  roleSimulationActive: boolean
  canModifyData?: boolean
  /** Export CSV : réservé au compte Directeur général */
  canExportFiles?: boolean
  /** Filtre clients / commandes lorsque l’utilisateur n’a pas accès aux données globales */
  dataUserName?: string
  onLogout: () => void
}

export function ProfilView({
  userId,
  userName,
  accountRole,
  effectiveRole,
  roleSimulationActive,
  canModifyData = true,
  canExportFiles = false,
  dataUserName = '',
  onLogout,
}: ProfilViewProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [resetDialog, setResetDialog] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState(true)
  const [exportRange, setExportRange] = useState('all')
  const [lastExport, setLastExport] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState('profil')
  const [activityRefresh, setActivityRefresh] = useState(0)
  const [crmDataVersion, setCrmDataVersion] = useState(0)
  const [activityPageIndex, setActivityPageIndex] = useState(0)
  const [activityPageSize, setActivityPageSize] = useState(10)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const bump = () => setCrmDataVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const clientsForScope = useMemo(() => {
    const all = getClients()
    if (canModifyData) return all
    return all.filter((c) => c.commercial === dataUserName)
  }, [canModifyData, dataUserName, crmDataVersion])

  const commandesForScope = useMemo(() => {
    const all = getCommandes()
    if (canModifyData) return all
    return all.filter((c) => c.commercial === dataUserName)
  }, [canModifyData, dataUserName, crmDataVersion])

  const clientCount = clientsForScope.length
  const commandeCount = commandesForScope.length
  const notifCount = getNotifications().length

  const activityRows = useMemo(() => {
    let rows = [...getNotifications()]
    if (!canModifyData) {
      rows = rows.filter((n) => n.link !== 'commandes')
    }
    return rows.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [activityRefresh, canModifyData, crmDataVersion])

  const activityTotal = activityRows.length
  const activityPageCount =
    activityTotal === 0 ? 0 : Math.ceil(activityTotal / activityPageSize)
  const activityMaxPage = Math.max(0, activityPageCount - 1)
  const safeActivityPageIndex =
    activityPageCount === 0
      ? 0
      : Math.min(activityPageIndex, activityMaxPage)

  const activityPageRows = useMemo(() => {
    const start = safeActivityPageIndex * activityPageSize
    return activityRows.slice(start, start + activityPageSize)
  }, [activityRows, safeActivityPageIndex, activityPageSize])

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fab_notif_prefs')
      const exportStored = localStorage.getItem('fab_last_export')
      const id = requestAnimationFrame(() => {
        if (stored !== null) setNotifPrefs(stored === 'true')
        setLastExport(exportStored)
      })
      return () => cancelAnimationFrame(id)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setAvatarSrc(null)
      return
    }
    setAvatarSrc(readStoredProfileAvatarUrl(userId))
  }, [userId])



  const handleToggleNotifPrefs = (checked: boolean) => {
    setNotifPrefs(checked)
    localStorage.setItem('fab_notif_prefs', String(checked))
    toast({
      title: checked ? 'Notifications activées' : 'Notifications désactivées',
      description: checked ? 'Vous recevrez les notifications de commande' : 'Les notifications sont désormais silencieuses',
    })
  }

  const recordExport = () => {
    const now = new Date().toLocaleString('fr-FR')
    localStorage.setItem('fab_last_export', now)
    setLastExport(now)
  }

  const handleAvatarFile = (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file || !userId) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Format non pris en charge', description: 'Choisissez une image (JPEG, PNG, WebP…)', variant: 'destructive' })
      return
    }
    if (file.size > MAX_PROFILE_AVATAR_BYTES) {
      toast({ title: 'Fichier trop volumineux', description: 'Image limitée à 1,5 Mo.', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null
      if (!dataUrl?.startsWith('data:image/')) return
      try {
        localStorage.setItem(profileAvatarStorageKey(userId), dataUrl)
        setAvatarSrc(dataUrl)
        window.dispatchEvent(new CustomEvent(PROFILE_AVATAR_CHANGED_EVENT))
        toast({ title: 'Photo mise à jour', description: 'Votre avatar est enregistré sur cet appareil.' })
      } catch {
        toast({ title: 'Enregistrement impossible', description: 'Espace de stockage insuffisant ou accès refusé.', variant: 'destructive' })
      }
    }
    reader.readAsDataURL(file)
  }

  const clearAvatar = () => {
    if (!userId) return
    try {
      localStorage.removeItem(profileAvatarStorageKey(userId))
      setAvatarSrc(null)
      window.dispatchEvent(new CustomEvent(PROFILE_AVATAR_CHANGED_EVENT))
      toast({ title: 'Photo retirée', description: 'Les initiales sont à nouveau affichées.' })
    } catch {
      /* ignore */
    }
  }

  const handleExportClients = () => {
    if (!canExportFiles) {
      toast({
        title: 'Export réservé',
        description: 'Seul le Directeur général peut télécharger des exports.',
        variant: 'destructive',
      })
      return
    }
    const clients = clientsForScope
    const headers = 'Nom,Téléphone,Email,Adresse,Commercial,Commandes'
    const rows = clients.map(c =>
      `"${c.name}","${c.phone}","${c.email}","${c.address}","${c.commercial}",${c.commandes}`
    ).join('\n')
    const csv = '\uFEFF' + headers + '\n' + rows // BOM for Excel
    downloadFile(csv, 'clients_ferme_agri_bio.csv', 'text/csv;charset=utf-8')
    recordExport()
    const scopeHint = canModifyData ? '' : ' (votre portefeuille)'
    toast({ title: 'Export réussi', description: `${clients.length} client(s) exporté(s)${scopeHint}` })
  }

  const handleExportCommandes = () => {
    if (!canExportFiles) {
      toast({
        title: 'Export réservé',
        description: 'Seul le Directeur général peut télécharger des exports.',
        variant: 'destructive',
      })
      return
    }
    const commandes = commandesForScope
    const headers = 'Client,Commercial,Quantité,PrixUnitaire,Montant,Statut,Date'
    const rows = commandes.map(c =>
      `"${c.client}","${c.commercial}",${c.qty},${c.prix},${c.montant},"${c.statut}","${c.date}"`
    ).join('\n')
    const csv = '\uFEFF' + headers + '\n' + rows
    downloadFile(csv, 'commandes_ferme_agri_bio.csv', 'text/csv;charset=utf-8')
    recordExport()
    const scopeHint = canModifyData ? '' : ' (votre portefeuille)'
    toast({ title: 'Export réussi', description: `${commandes.length} commande(s) exportée(s)${scopeHint}` })
  }

  const handleExportAll = () => {
    if (!canExportFiles) {
      toast({
        title: 'Export réservé',
        description: 'Seul le Directeur général peut télécharger des exports.',
        variant: 'destructive',
      })
      return
    }
    handleExportClients()
    // Small delay so browser doesn't block second download
    setTimeout(() => handleExportCommandes(), 300)
  }

  const handleReset = async () => {
    try {
      await resetData()
      setResetDialog(false)
      localStorage.removeItem('fab_last_export')
      setLastExport(null)
      toast({ title: 'Données réinitialisées', description: 'Toutes les données ont été restaurées aux valeurs par défaut' })
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Erreur lors de la réinitialisation', variant: 'destructive' })
      setResetDialog(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-0 min-w-0 flex-1 flex-col p-4 md:p-6"
    >
      <Tabs
        value={mainTab}
        onValueChange={(v) => {
          setMainTab(v)
          if (v === 'activite') {
            setActivityRefresh((x) => x + 1)
            setActivityPageIndex(0)
          }
        }}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList className="grid h-auto w-full min-w-0 shrink-0 grid-cols-2 gap-1 rounded-xl p-1 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="profil" className="min-w-0 gap-1.5 px-2 py-2 text-xs sm:text-sm">
            <Shield className="size-4 shrink-0" />
            <span className="truncate">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="activite" className="min-w-0 gap-1.5 px-2 py-2 text-xs sm:text-sm">
            <Activity className="size-4 shrink-0" />
            <span className="truncate">Activité</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="min-w-0 gap-1.5 px-2 py-2 text-xs sm:text-sm">
            <Palette className="size-4 shrink-0" />
            <span className="truncate">Préférences</span>
          </TabsTrigger>
          <TabsTrigger value="donnees" className="min-w-0 gap-1.5 px-2 py-2 text-xs sm:text-sm">
            <Download className="size-4 shrink-0" />
            <span className="truncate">Données</span>
          </TabsTrigger>
          <TabsTrigger value="compte" className="col-span-2 min-w-0 gap-1.5 px-2 py-2 text-xs sm:col-span-1 sm:text-sm">
            <Settings className="size-4 shrink-0" />
            <span className="truncate">Compte</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profil"
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col gap-6 pb-2">
      {/* Profile Card */}
      <Card className="w-full border-primary/15 dark:border-primary/25 overflow-hidden">
        {/* Animated gradient banner */}
        <div className="h-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-600 to-emerald-800 dark:from-primary dark:via-emerald-700 dark:to-emerald-900 animated-gradient" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yMCAwbDIwIDIwLTIwIDIwTDAgMjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L2c+PC9zdmc+')] opacity-30 dark:opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
        <CardContent className="pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="flex flex-col items-start gap-2">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt="" className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground text-2xl font-bold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="pointer-events-none absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-background bg-green-500 shadow-sm" />
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  handleAvatarFile(e.target.files)
                  e.target.value = ''
                }}
              />
              <div className="flex flex-wrap gap-2 pl-0.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg text-xs"
                  disabled={!userId}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Changer la photo
                </Button>
                {avatarSrc && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg text-xs text-muted-foreground"
                    onClick={clearAvatar}
                  >
                    <ImageOff className="h-3.5 w-3.5" />
                    Retirer
                  </Button>
                )}
              </div>
              {!userId && (
                <p className="text-[11px] text-muted-foreground">Connectez-vous pour enregistrer une photo.</p>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold">{userName}</h2>
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`text-xs ${accountRoleBadgeClass(accountRole)}`}>
                    <Shield className="mr-1 h-3 w-3" />
                    {getRoleLabel(accountRole)}
                  </Badge>
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-[10px] text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                    En ligne
                  </Badge>
                </div>
                {roleSimulationActive && isAppRole(effectiveRole) && (
                  <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                    <Info className="mr-1 inline-block size-3.5 align-text-bottom text-primary" aria-hidden />
                    Une simulation de rôle est active : elle applique un rôle de démo (
                    <span className="font-medium text-foreground">{getRoleLabel(effectiveRole)}</span>
                    ) pour les menus et les actions. Votre compte reste enregistré comme{' '}
                    <span className="font-medium text-foreground">{getRoleLabel(accountRole)}</span>.
                  </p>
                )}
              </div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            <div className="p-3 rounded-xl bg-muted/30 dark:bg-muted/20">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{clientCount}</p>
              <p className="text-xs text-muted-foreground">Clients</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 dark:bg-muted/20">
              <div className="flex items-center justify-center mb-1">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{commandeCount}</p>
              <p className="text-xs text-muted-foreground">Commandes</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 dark:bg-muted/20">
              <div className="flex items-center justify-center mb-1">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{notifCount}</p>
              <p className="text-xs text-muted-foreground">Notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full border-primary/15 dark:border-primary/25">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-between sm:gap-4">
            <BrandLogo className="h-5 w-auto max-h-5 object-contain opacity-90" />
            <span>Ferme Agri Bio v1.0</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Gestion commerciale — agriculture biologique</span>
          </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="activite"
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col pb-2">
      <Card className="flex min-h-0 flex-1 flex-col border-primary/15 dark:border-primary/25">
        <CardHeader className="shrink-0 space-y-3 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/12 to-emerald-100/80 dark:from-primary/25 dark:to-emerald-950/40">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Activité récente</CardTitle>
                <CardDescription className="text-xs">
                  Vos dernières actions — journal trié du plus récent au plus ancien
                </CardDescription>
              </div>
            </div>
            {activityTotal > 0 && (
              <div className="flex items-center gap-2 self-start rounded-lg border border-border/80 bg-muted/35 px-3 py-2 text-xs text-muted-foreground dark:bg-muted/25">
                <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
                <span>
                  <span className="font-semibold text-foreground">{activityTotal}</span>
                  {' '}entrée{activityTotal > 1 ? 's' : ''} enregistrée{activityTotal > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pt-0">
          {activityTotal > 0 ? (
            <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/90 bg-card/40 shadow-sm dark:bg-card/25">
              <div className="min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/95 shadow-[0_1px_0_0_hsl(var(--border))] backdrop-blur-sm dark:bg-muted/90">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-11 min-w-[2.75rem] pl-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        #
                      </TableHead>
                      <TableHead className="w-[118px] min-w-[118px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Type
                      </TableHead>
                      <TableHead className="min-w-[140px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Titre
                      </TableHead>
                      <TableHead className="min-w-[220px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Détail
                      </TableHead>
                      <TableHead className="hidden w-[132px] min-w-[132px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                        Contexte
                      </TableHead>
                      <TableHead className="w-[88px] min-w-[88px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Statut
                      </TableHead>
                      <TableHead className="w-[128px] min-w-[128px] pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Horodatage
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityPageRows.map((notif, i) => {
                      const meta = NOTIF_TYPE_META[notif.type] ?? NOTIF_TYPE_META.info
                      const { Icon } = meta
                      const { primary, secondary } = formatNotificationDates(notif.date)
                      const rowNum = safeActivityPageIndex * activityPageSize + i + 1
                      const linkMeta = notif.link ? LINK_META[notif.link] : null
                      const LinkIcon = linkMeta?.Icon
                      return (
                        <TableRow
                          key={notif.id}
                          className={
                            notif.read
                              ? 'border-border/60 hover:bg-muted/40'
                              : 'border-border/60 bg-primary/[0.05] hover:bg-primary/[0.08] dark:bg-primary/[0.07] dark:hover:bg-primary/[0.1]'
                          }
                        >
                          <TableCell className="align-middle pl-3 text-center">
                            <span className="text-xs tabular-nums text-muted-foreground">{rowNum}</span>
                          </TableCell>
                          <TableCell className="align-middle">
                            <Badge
                              variant="outline"
                              className={`gap-1 whitespace-nowrap font-normal ${meta.badgeClass}`}
                            >
                              <Icon className="size-3.5 shrink-0" aria-hidden />
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[14rem] align-middle">
                            <p
                              className={`line-clamp-2 text-sm font-medium leading-snug ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}
                            >
                              {notif.title}
                            </p>
                          </TableCell>
                          <TableCell className="max-w-xs align-middle sm:max-w-md">
                            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {notif.message}
                            </p>
                          </TableCell>
                          <TableCell className="hidden align-middle md:table-cell">
                            {linkMeta && LinkIcon ? (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <LinkIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                                <span className="text-xs font-medium text-foreground/90">{linkMeta.label}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="align-middle">
                            <Badge
                              variant="outline"
                              className={
                                notif.read
                                  ? 'border-border/80 bg-muted/30 text-[10px] font-normal text-muted-foreground'
                                  : 'border-primary/35 bg-primary/10 text-[10px] font-medium text-primary dark:border-primary/45 dark:bg-primary/15'
                              }
                            >
                              {notif.read ? 'Lu' : 'Non lu'}
                            </Badge>
                          </TableCell>
                          <TableCell className="align-middle pr-3 text-right">
                            <p className="text-xs font-medium tabular-nums text-foreground">{primary}</p>
                            <p className="text-[10px] leading-tight text-muted-foreground">{secondary}</p>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <DataTablePagination
                pageIndex={safeActivityPageIndex}
                pageSize={activityPageSize}
                totalRows={activityTotal}
                pageCount={activityPageCount}
                onPageChange={setActivityPageIndex}
                onPageSizeChange={(n) => {
                  setActivityPageSize(n)
                  setActivityPageIndex(0)
                }}
                className="shrink-0 rounded-b-xl border-t border-border/80 bg-muted/25 dark:bg-muted/20"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 py-14 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Aucune activité enregistrée</p>
              <p className="max-w-sm px-4 text-xs text-muted-foreground/90">
                Les alertes et actions (clients, commandes) apparaîtront ici au fil de l’usage du CRM.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="preferences"
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col pb-2">
      <Card className="flex min-h-0 flex-1 flex-col gap-2 border-primary/15 py-4 dark:border-primary/25">
        <CardHeader className="shrink-0 space-y-0 pb-0 pt-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40">
              <Palette className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-base leading-tight">Préférences</CardTitle>
              <CardDescription className="text-xs leading-snug">Personnalisez votre expérience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col space-y-2 pt-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-start gap-2.5 sm:items-center">
              {mounted && (theme === 'dark' ? <Moon className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" /> : <Sun className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />)}
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium leading-tight">Mode sombre</p>
                <p className="text-xs leading-snug text-muted-foreground">
                  {mounted
                    ? theme === 'dark'
                      ? 'Thème sombre actif — réduisez la fatigue oculaire'
                      : 'Thème clair actif — luminosité optimale pour le jour'
                    : 'Basculer entre le thème clair et sombre'
                  }
                </p>
              </div>
            </div>
            <Switch
              className="shrink-0 sm:ml-2"
              checked={mounted && theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          <Separator className="my-0.5" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-start gap-2.5 sm:items-center">
              {notifPrefs
                ? <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />
                : <BellOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground sm:mt-0" />
              }
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium leading-tight">Notifications</p>
                <p className="text-xs leading-snug text-muted-foreground">
                  {notifPrefs
                    ? 'Notifications activées — recevez les alertes de commande'
                    : 'Notifications désactivées — mode silencieux'
                  }
                </p>
              </div>
            </div>
            <Switch
              className="shrink-0 sm:ml-2"
              checked={notifPrefs}
              onCheckedChange={handleToggleNotifPrefs}
            />
          </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="donnees"
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col pb-2">
      <Card className="flex min-h-0 flex-1 flex-col border-primary/15 dark:border-primary/25">
        <CardHeader className="shrink-0 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 flex items-center justify-center">
              <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-base">Exporter les données</CardTitle>
              <CardDescription className="text-xs">
                {canExportFiles
                  ? canModifyData
                    ? 'Téléchargez vos données au format CSV.'
                    : 'Export limité à votre portefeuille (clients et commandes qui vous sont attribués).'
                  : 'Les exports CSV sont réservés au compte Directeur général.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
          {/* Date range selector */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Label className="shrink-0 text-xs text-muted-foreground">Plage :</Label>
            <Select value={exportRange} onValueChange={setExportRange}>
              <SelectTrigger className="h-8 w-full text-xs sm:w-48 md:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les données</SelectItem>
                <SelectItem value="1m">Dernier mois</SelectItem>
                <SelectItem value="3m">3 derniers mois</SelectItem>
                <SelectItem value="6m">6 derniers mois</SelectItem>
              </SelectContent>
            </Select>
            {lastExport && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dernier export : {lastExport}
              </p>
            )}
          </div>

          {/* Export buttons */}
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto py-3 border-primary/25 dark:border-primary/40 hover:bg-primary/8 dark:hover:bg-primary/15 justify-start"
              disabled={!canExportFiles}
              onClick={handleExportClients}
            >
              <Users className="h-5 w-5 text-primary mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Clients</p>
                <p className="text-xs text-muted-foreground">{clientCount} clients</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 border-primary/25 dark:border-primary/40 hover:bg-primary/8 dark:hover:bg-primary/15 justify-start"
              disabled={!canExportFiles}
              onClick={handleExportCommandes}
            >
              <ShoppingCart className="h-5 w-5 text-primary mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Commandes</p>
                <p className="text-xs text-muted-foreground">{commandeCount} commandes</p>
              </div>
            </Button>
          </div>

          {/* Export all button */}
          <Button
            className="mt-auto w-full bg-gradient-to-r from-primary to-emerald-700 hover:from-primary/90 hover:to-emerald-800 text-primary-foreground"
            disabled={!canExportFiles}
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4 mr-2" />Tout exporter
          </Button>
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="compte"
          className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto data-[state=inactive]:hidden"
        >
          <div className="flex w-full flex-col gap-2 pb-2">
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader className="space-y-0 pb-2 pt-4">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <CardTitle className="text-base leading-tight text-red-700 dark:text-red-400">
                      Zone de danger
                    </CardTitle>
                    <CardDescription className="text-xs leading-snug">Actions irréversibles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0 pb-4 lg:flex-row lg:gap-3">
                {canModifyData && (
                <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/50 p-2.5 dark:border-red-900/40 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between lg:min-w-0 lg:flex-1">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium leading-tight text-red-700 dark:text-red-400">
                      Réinitialiser les données
                    </p>
                    <p className="text-xs leading-snug text-muted-foreground">
                      <span className="font-semibold text-red-600 dark:text-red-400">{clientCount} clients</span>
                      {', '}
                      <span className="font-semibold text-red-600 dark:text-red-400">{commandeCount} commandes</span>
                      {', '}
                      <span className="font-semibold text-red-600 dark:text-red-400">{notifCount} notifications</span>
                      {' seront supprimés'}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={() => setResetDialog(true)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
                )}
                <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50/50 p-2.5 dark:border-red-900/40 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between lg:min-w-0 lg:flex-1">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium leading-tight text-red-700 dark:text-red-400">
                      Se déconnecter
                    </p>
                    <p className="text-xs leading-snug text-muted-foreground">Quitter votre session</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full shrink-0 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 sm:w-auto"
                    onClick={onLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation */}
      <AlertDialog open={resetDialog} onOpenChange={setResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-left">Réinitialiser toutes les données ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left space-y-2">
              <p className="font-medium text-red-700 dark:text-red-400">
                Cette action est irréversible et supprimera définitivement :
              </p>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 space-y-1">
                <p className="text-sm flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="font-semibold">{clientCount}</span> clients
                </p>
                <p className="text-sm flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="font-semibold">{commandeCount}</span> commandes
                </p>
                <p className="text-sm flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  <span className="font-semibold">{notifCount}</span> notifications
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Toutes les données seront restaurées aux valeurs de démonstration par défaut. Vos modifications seront perdues.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Oui, tout réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
