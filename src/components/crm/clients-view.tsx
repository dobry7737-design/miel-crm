"use client"

import { useState, useCallback, useMemo, useEffect, useRef, type ElementType, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Users, Phone, MapPin, ShoppingCart,
  Loader2, Pencil, Trash2, Eye, X, History, ArrowUpDown,
  MoreHorizontal, Wallet, BarChart3, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import {
  CRM_DATA_CHANGED_EVENT,
  getClients, addClient, updateClient, deleteClient,
  getCommandes,
  getClientRegion,
  getUniqueCommercialNames,
  type Client,
} from '@/lib/crm-data'
import { DataTablePagination } from '@/components/crm/data-table/data-table-pagination'
import { pathForClientHistory } from '@/lib/crm-routes'
import { cn } from '@/lib/utils'

type ClientRow = Client & { orderCount: number; totalAchats: number }
type SortKey = 'id' | 'name' | 'phone' | 'address' | 'orderCount' | 'totalAchats'
type SortDir = 'asc' | 'desc'
type ClientActivityFilter = 'ALL' | 'WITH_ORDERS' | 'NO_ORDERS'

const emptyForm = { name: '', phone: '', email: '', address: '', region: '', commercial: '' }

function fmtCfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

const ease = [0.16, 1, 0.3, 1] as const

function ClientsOverviewStat({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  delay,
  onActivate,
}: {
  label: string
  value: string
  sub?: string
  icon: ElementType
  accent: string
  delay: number
  onActivate?: () => void
}) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (!onActivate) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay }}
    >
      <Card
        className={cn(
          'group relative overflow-hidden border-primary/12 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/22 hover:shadow-lg hover:shadow-primary/5 dark:border-primary/18',
          onActivate && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        )}
        role={onActivate ? 'button' : undefined}
        tabIndex={onActivate ? 0 : undefined}
        onClick={onActivate}
        onKeyDown={onKeyDown}
        aria-label={onActivate ? `${label} — afficher la liste` : undefined}
      >
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent} opacity-90 transition-all group-hover:h-1`} />
        <CardContent className="p-4 pt-5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1.5 truncate text-lg font-bold tracking-tight sm:text-xl">{value}</p>
              {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform duration-300 group-hover:scale-105 dark:bg-primary/15">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ClientsView() {
  const router = useRouter()
  const {
    canModifyData,
    canEditThisClient,
    effectiveRole,
    isDirectorOrAdmin,
    dataUserName,
  } = usePermissions()
  const [clients, setClients] = useState<Client[]>(() => getClients())
  const [dataVersion, setDataVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [activityFilter, setActivityFilter] = useState<ClientActivityFilter>('ALL')
  const [commercialFilter, setCommercialFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [detailClient, setDetailClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState(emptyForm)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const listeRef = useRef<HTMLDivElement>(null)

  const scrollToListe = useCallback(() => {
    requestAnimationFrame(() => {
      listeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  useEffect(() => {
    const bump = () => {
      setDataVersion((v) => v + 1)
      setClients(getClients())
    }
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const loadClients = useCallback(() => {
    setClients(getClients())
  }, [])

  const portfolioClients = useMemo(() => {
    if (isDirectorOrAdmin) return clients
    return clients.filter((c) => c.commercial === dataUserName)
  }, [clients, isDirectorOrAdmin, dataUserName])

  const canUseClientForms = canModifyData || effectiveRole === 'COMMERCIAL'

  // Auto-open new client dialog if requested by dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('fab-auto-open-dialog') === 'client') {
      sessionStorage.removeItem('fab-auto-open-dialog')
      if (canUseClientForms) {
        // Need brief delay to ensure UI mounts and initial states process
        setTimeout(() => openAdd(), 150)
      }
    }
  }, [canUseClientForms])

  const rows: ClientRow[] = useMemo(() => {
    const cmds = getCommandes()
    const byName = new Map<string, { n: number; tot: number }>()
    cmds.forEach((c) => {
      const o = byName.get(c.client) || { n: 0, tot: 0 }
      o.n += 1
      if (c.statut !== 'ANNULEE') o.tot += c.montant
      byName.set(c.client, o)
    })
    return portfolioClients.map((c) => ({
      ...c,
      orderCount: byName.get(c.name)?.n ?? 0,
      totalAchats: byName.get(c.name)?.tot ?? 0,
    }))
  }, [portfolioClients, dataVersion])

  const commercialNamesForFilter = useMemo(() => {
    if (!isDirectorOrAdmin) return []
    return getUniqueCommercialNames()
  }, [isDirectorOrAdmin, dataVersion])

  const clientStats = useMemo(() => {
    const n = rows.length
    const caTotal = rows.reduce((s, r) => s + r.totalAchats, 0)
    const withOrders = rows.filter((r) => r.orderCount > 0).length
    const noOrders = rows.filter((r) => r.orderCount === 0).length
    const totalCmds = rows.reduce((s, r) => s + r.orderCount, 0)
    const avgCmd = n > 0 ? Math.round((totalCmds / n) * 10) / 10 : 0
    const pctActifs = n > 0 ? Math.min(100, Math.round((withOrders / n) * 100)) : 0
    return { n, caTotal, withOrders, noOrders, avgCmd, pctActifs }
  }, [rows])

  const activityCounts = useMemo(
    () => ({
      ALL: rows.length,
      WITH_ORDERS: rows.filter((r) => r.orderCount > 0).length,
      NO_ORDERS: rows.filter((r) => r.orderCount === 0).length,
    }),
    [rows],
  )

  const filtered = useMemo(() => {
    let list = rows.filter((c) => {
      if (activityFilter === 'WITH_ORDERS') return c.orderCount > 0
      if (activityFilter === 'NO_ORDERS') return c.orderCount === 0
      return true
    })
    if (isDirectorOrAdmin && commercialFilter !== 'all') {
      list = list.filter((c) => c.commercial.trim() === commercialFilter)
    }
    list = list.filter(
      (c) =>
        !search ||
        c.id.includes(search.trim()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
        c.address.toLowerCase().includes(search.toLowerCase()) ||
        getClientRegion(c).toLowerCase().includes(search.toLowerCase()) ||
        c.commercial.toLowerCase().includes(search.toLowerCase()),
    )
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'id') cmp = a.id.localeCompare(b.id, 'fr', { numeric: true })
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'fr')
      else if (sortKey === 'phone') cmp = a.phone.localeCompare(b.phone, 'fr')
      else if (sortKey === 'address') cmp = a.address.localeCompare(b.address, 'fr')
      else if (sortKey === 'orderCount') cmp = a.orderCount - b.orderCount
      else if (sortKey === 'totalAchats') cmp = a.totalAchats - b.totalAchats
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [rows, search, sortKey, sortDir, activityFilter, commercialFilter, isDirectorOrAdmin])

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir(k === 'orderCount' || k === 'totalAchats' ? 'desc' : 'asc')
    }
  }

  const filtersActive =
    !!search.trim() || activityFilter !== 'ALL' || (isDirectorOrAdmin && commercialFilter !== 'all')

  const totalFilteredCa = filtered.reduce((s, c) => s + c.totalAchats, 0)

  const pageCount = filtered.length === 0 ? 0 : Math.ceil(filtered.length / pageSize)
  const maxPage = Math.max(0, pageCount - 1)
  const safePageIndex = pageCount === 0 ? 0 : Math.min(pageIndex, maxPage)

  const pageRows = useMemo(() => {
    const start = safePageIndex * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePageIndex, pageSize])

  const openAdd = () => {
    setForm({
      ...emptyForm,
      commercial: isDirectorOrAdmin ? (commercialNamesForFilter[0] ?? '') : dataUserName,
    })
    setEditMode(false)
    setEditId(null)
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      region: client.region ?? '',
      commercial: client.commercial,
    })
    setEditMode(true)
    setEditId(client.id)
    setDialogOpen(true)
  }

  const openHistory = (c: Client) => {
    router.push(pathForClientHistory(c.id))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: 'Erreur', description: 'Nom et téléphone sont requis', variant: 'destructive' })
      return
    }
    const commercialAssigned = isDirectorOrAdmin
      ? form.commercial.trim()
      : dataUserName
    if (isDirectorOrAdmin && !commercialAssigned) {
      toast({ title: 'Erreur', description: 'Indiquez le commercial assigné', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      if (editMode && editId) {
        const updated = await updateClient(editId, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          region: form.region.trim() || undefined,
          commercial: commercialAssigned,
        })
        if (updated) toast({ title: 'Succès', description: `${updated.name} a été modifié` })
      } else {
        const created = await addClient({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          region: form.region.trim() || undefined,
          commercial: commercialAssigned,
        })
        toast({ title: 'Succès', description: `${created.name} a été ajouté` })
      }
      loadClients()
      setDialogOpen(false)
      setForm(emptyForm)
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de la sauvegarde', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    const client = clients.find((c) => c.id === deleteDialog)
    try {
      await deleteClient(deleteDialog)
      loadClients()
      toast({ title: 'Supprimé', description: `${client?.name || 'Client'} a été supprimé` })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de la suppression', variant: 'destructive' })
    } finally {
      setDeleteDialog(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-w-0 space-y-6 p-4 md:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <Card className="overflow-hidden border-primary/15 shadow-sm shadow-black/[0.03] dark:border-primary/25 dark:shadow-black/15">
          <div className="relative">
            <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary/14 blur-3xl dark:bg-primary/18" aria-hidden />
            <CardContent className="relative p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-primary/20 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary dark:bg-primary/15">
                      Portefeuille clients
                    </Badge>
                    {filtersActive && (
                      <Badge variant="outline" className="rounded-full text-[11px] font-normal">
                        {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
                        {filtered.length > 0 && (
                          <span className="ml-1 text-primary">· {fmtCfa(totalFilteredCa)}</span>
                        )}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-lg font-bold tracking-tight sm:text-xl">Clients</h1>
                  <p className="max-w-xl text-xs leading-snug text-muted-foreground">
                    Fiches, commerciaux et lien avec les commandes (données locales).
                  </p>
                </div>
                {canUseClientForms && (
                  <Button
                    onClick={openAdd}
                    size="default"
                    className="h-10 shrink-0 gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-700 px-4 text-primary-foreground shadow-md shadow-primary/15"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau client
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <ClientsOverviewStat
          label="Clients"
          value={String(clientStats.n)}
          sub="dans votre périmètre"
          icon={Users}
          accent="from-violet-500 to-purple-600"
          delay={0.05}
          onActivate={() => {
            setActivityFilter('ALL')
            setPageIndex(0)
            scrollToListe()
          }}
        />
        <ClientsOverviewStat
          label="CA cumulé (commandes)"
          value={fmtCfa(clientStats.caTotal)}
          sub="hors commandes annulées"
          icon={Wallet}
          accent="from-primary to-emerald-600"
          delay={0.09}
          onActivate={() => {
            setActivityFilter('ALL')
            setPageIndex(0)
            scrollToListe()
          }}
        />
        <ClientsOverviewStat
          label="Clients actifs"
          value={String(clientStats.withOrders)}
          sub="au moins une commande"
          icon={ShoppingCart}
          accent="from-sky-500 to-blue-600"
          delay={0.13}
          onActivate={() => {
            setActivityFilter('WITH_ORDERS')
            setPageIndex(0)
            scrollToListe()
          }}
        />
        <ClientsOverviewStat
          label="Cmd / client (moy.)"
          value={String(clientStats.avgCmd)}
          sub={`${clientStats.pctActifs} % avec commandes · ${clientStats.noOrders} sans`}
          icon={BarChart3}
          accent="from-amber-500 to-orange-600"
          delay={0.17}
          onActivate={() => {
            setActivityFilter('NO_ORDERS')
            setPageIndex(0)
            scrollToListe()
          }}
        />
      </div>

      <div ref={listeRef} className="scroll-mt-4 space-y-6">
      <Card className="border-primary/12 dark:border-primary/18">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-base font-semibold">Filtres</CardTitle>
          <CardDescription>
            Activité commandes, commercial (admin) et recherche libre (ID, nom, téléphone, commercial…)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <Tabs
            value={activityFilter}
            onValueChange={(v) => {
              setActivityFilter(v as ClientActivityFilter)
              setPageIndex(0)
            }}
            className="w-full"
          >
            <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/40 p-1 dark:bg-muted/30">
              <TabsTrigger value="ALL" className="text-xs">
                Tous <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{activityCounts.ALL}</Badge>
              </TabsTrigger>
              <TabsTrigger value="WITH_ORDERS" className="text-xs">
                <Package className="mr-1 h-3 w-3 text-green-600" />
                Avec commandes <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{activityCounts.WITH_ORDERS}</Badge>
              </TabsTrigger>
              <TabsTrigger value="NO_ORDERS" className="text-xs">
                Sans commande <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{activityCounts.NO_ORDERS}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            {isDirectorOrAdmin && (
              <div className="min-w-[12rem] space-y-1.5">
                <Label className="text-xs text-muted-foreground">Commercial</Label>
                <Select
                  value={commercialFilter}
                  onValueChange={(v) => {
                    setCommercialFilter(v)
                    setPageIndex(0)
                  }}
                >
                  <SelectTrigger className="h-11 rounded-xl border-primary/15 text-xs shadow-sm">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les commerciaux</SelectItem>
                    {commercialNamesForFilter.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="relative min-w-0 max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder="ID, nom, téléphone, commercial…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPageIndex(0)
                }}
                className="h-11 rounded-xl border-primary/15 pl-10 shadow-sm transition-shadow focus-visible:border-primary/40 focus-visible:ring-primary/15"
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setSearch('')
                    setPageIndex(0)
                  }}
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-primary/20">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 ring-1 ring-border">
              {filtersActive ? (
                <Search className="h-7 w-7 text-muted-foreground" aria-hidden />
              ) : (
                <Users className="h-7 w-7 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{filtersActive ? 'Aucun résultat' : 'Aucun client'}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {filtersActive
                  ? 'Modifiez les filtres ou réinitialisez la recherche.'
                  : canUseClientForms
                    ? 'Ajoutez une première fiche client pour alimenter le tableau.'
                    : 'Aucun client sur votre périmètre pour le moment.'}
              </p>
            </div>
            {canUseClientForms && !filtersActive && (
              <Button onClick={openAdd} variant="outline" className="rounded-xl border-primary/25">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="min-w-0 overflow-hidden border-primary/12 shadow-sm dark:border-primary/18">
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4 dark:bg-muted/10">
              <CardTitle className="text-base font-semibold">Répertoire des clients</CardTitle>
              <CardDescription>
                Tri sur les colonnes — menu actions pour détail, historique, édition (aligné sur la page Commandes)
              </CardDescription>
            </CardHeader>
            <div className="hidden min-w-0 overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-20 cursor-pointer text-xs font-semibold select-none" onClick={() => toggleSort('id')}>
                      <span className="inline-flex items-center gap-1">ID <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer text-xs font-semibold select-none" onClick={() => toggleSort('name')}>
                      <span className="inline-flex items-center gap-1">Client <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer text-xs font-semibold select-none" onClick={() => toggleSort('phone')}>
                      <span className="inline-flex items-center gap-1">Téléphone <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="hidden cursor-pointer text-xs font-semibold select-none lg:table-cell" onClick={() => toggleSort('address')}>
                      <span className="inline-flex items-center gap-1">Localisation <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold cursor-pointer select-none" onClick={() => toggleSort('orderCount')}>
                      <span className="inline-flex w-full items-center justify-center gap-1">Nb cmd <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right text-xs font-semibold select-none" onClick={() => toggleSort('totalAchats')}>
                      <span className="inline-flex w-full items-center justify-end gap-1">Total achats <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="hidden text-xs font-semibold xl:table-cell">Commercial</TableHead>
                    <TableHead className="text-center text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {pageRows.map((c) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-border/50 transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/10"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
                        <TableCell>
                          <button type="button" onClick={() => setDetailClient(c)} className="flex items-center gap-2.5 text-left text-sm font-medium hover:underline">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/12 to-emerald-100/80 dark:from-primary/25 dark:to-emerald-950/40">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            {c.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            {c.phone}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {c.address || '—'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="gap-1 border-primary/25 bg-primary/5 text-[10px] text-primary dark:bg-primary/10">
                            <ShoppingCart className="h-3 w-3" />
                            {c.orderCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold tabular-nums">{fmtCfa(c.totalAchats)}</TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">{c.commercial}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetailClient(c)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openHistory(c)}>
                                <History className="mr-2 h-4 w-4" />
                                Historique
                              </DropdownMenuItem>
                              {canEditThisClient(c.commercial) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openEdit(c)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteDialog(c.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              <AnimatePresence mode="popLayout">
                {pageRows.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm dark:border-primary/25"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-muted-foreground">#{c.id}</p>
                        <p className="text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.phone}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{c.commercial}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 gap-1 border-primary/25 bg-primary/5 text-[10px] text-primary dark:bg-primary/10">
                        <ShoppingCart className="h-3 w-3" />
                        {c.orderCount} cmd
                      </Badge>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">{fmtCfa(c.totalAchats)}</p>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailClient(c)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openHistory(c)}>
                            <History className="mr-2 h-4 w-4" />
                            Historique
                          </DropdownMenuItem>
                          {canEditThisClient(c.commercial) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openEdit(c)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDialog(c.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <DataTablePagination
              pageIndex={safePageIndex}
              pageSize={pageSize}
              totalRows={filtered.length}
              pageCount={pageCount}
              onPageChange={setPageIndex}
              onPageSizeChange={(n) => {
                setPageSize(n)
                setPageIndex(0)
              }}
              className="rounded-b-xl border-t border-border/60 bg-muted/15 dark:bg-muted/10"
            />
          </Card>
        </>
      )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(92vh,44rem)] w-[min(100vw-1.5rem,28rem)] max-w-[min(100vw-1.5rem,28rem)] flex-col gap-0 overflow-hidden rounded-xl border-primary/20 p-0 shadow-xl sm:max-w-md"
        >
          <DialogHeader className="space-y-2 border-b border-border/60 bg-muted/20 px-6 py-5 text-left dark:bg-muted/10">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 shadow-sm">
                {editMode ? <Pencil className="h-4 w-4 text-white" /> : <Users className="h-4 w-4 text-white" />}
              </div>
              <span>{editMode ? 'Modifier le client' : 'Nouveau client'}</span>
            </DialogTitle>
            <DialogDescription>
              {editMode ? 'Modifiez les informations de la fiche client.' : 'Créez une fiche liée à un commercial (comme pour une commande).'}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="cn">Nom <span className="text-red-500">*</span></Label>
              <Input id="cn" className="h-10 rounded-lg" placeholder="Nom du client" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="cp">Téléphone <span className="text-red-500">*</span></Label>
              <Input id="cp" className="h-10 rounded-lg" placeholder="+221 77 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="ce">Email</Label>
              <Input id="ce" className="h-10 rounded-lg" type="email" placeholder="contact@entreprise.sn" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="ca">Adresse / localisation</Label>
              <Textarea id="ca" className="min-h-[4.5rem] rounded-lg" placeholder="Adresse complète" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="cr">Région (optionnel)</Label>
              <Input id="cr" className="h-10 rounded-lg" placeholder="Ex. Dakar" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            {isDirectorOrAdmin ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Commercial assigné <span className="text-red-500">*</span></Label>
                <Select value={form.commercial} onValueChange={(v) => setForm({ ...form, commercial: v })}>
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {commercialNamesForFilter.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs" htmlFor="cc">Commercial assigné</Label>
                <Input id="cc" className="h-10 rounded-lg bg-muted/50" value={form.commercial} readOnly />
                <p className="text-[11px] text-muted-foreground">Rattaché à votre portefeuille</p>
              </div>
            )}
          </div>
          <DialogFooter className="shrink-0 gap-2 border-t border-border/80 bg-muted/25 px-6 py-3 sm:flex-row sm:gap-2 sm:px-6 sm:py-4">
            <Button variant="outline" className="w-full rounded-xl sm:flex-1" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground sm:flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? 'Modification…' : 'Création…'}
                </>
              ) : editMode ? (
                'Enregistrer'
              ) : (
                'Créer le client'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client <strong>{clients.find((c) => c.id === deleteDialog)?.name}</strong> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detailClient} onOpenChange={() => setDetailClient(null)}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(92vh,36rem)] max-w-md flex-col gap-0 overflow-hidden rounded-xl border-primary/20 p-0 shadow-xl sm:max-w-md"
        >
          <DialogHeader className="border-b border-border/60 bg-muted/20 px-6 py-5 text-left dark:bg-muted/10">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/12 to-emerald-100/80 dark:from-primary/25 dark:to-emerald-950/40">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Détails du client
            </DialogTitle>
          </DialogHeader>
          {detailClient && (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-muted-foreground">{detailClient.id}</span>
                <span className="text-muted-foreground">Nom</span>
                <span className="font-medium">{detailClient.name}</span>
                <span className="text-muted-foreground">Téléphone</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground" />{detailClient.phone}</span>
                <span className="text-muted-foreground">Email</span>
                <span>{detailClient.email || '—'}</span>
                <span className="text-muted-foreground">Localisation</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" />{detailClient.address || '—'}</span>
                <span className="text-muted-foreground">Région</span>
                <span>{getClientRegion(detailClient)}</span>
                <span className="text-muted-foreground">Commercial</span>
                <span>{detailClient.commercial}</span>
                <span className="text-muted-foreground">Commandes / Total</span>
                <span className="inline-flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit"><ShoppingCart className="h-3 w-3" />{rows.find((r) => r.id === detailClient.id)?.orderCount ?? detailClient.commandes}</span>
                  <span className="text-xs font-medium">{fmtCfa(rows.find((r) => r.id === detailClient.id)?.totalAchats ?? 0)}</span>
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 border-t border-border/80 bg-muted/25 px-6 py-4 sm:flex-row">
            <Button variant="outline" className="w-full rounded-xl sm:flex-1" onClick={() => detailClient && openHistory(detailClient)}>
              <History className="mr-2 h-4 w-4" />
              Historique
            </Button>
            <Button variant="outline" className="w-full rounded-xl sm:flex-1" onClick={() => setDetailClient(null)}>
              Fermer
            </Button>
            {detailClient && canEditThisClient(detailClient.commercial) && (
              <Button
                onClick={() => {
                  const d = detailClient
                  setDetailClient(null)
                  openEdit(d)
                }}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground sm:flex-1"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  )
}
