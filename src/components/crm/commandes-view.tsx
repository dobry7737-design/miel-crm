"use client"

import { useState, useCallback, useMemo, useEffect, type ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus, ShoppingCart, MoreHorizontal, Loader2, Package,
  CheckCircle2, Truck, XCircle, Pencil, Trash2, Eye, Search, X, ArrowUpDown,
  Wallet, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import { COMMANDE_STATUT_LABEL } from '@/lib/permissions'
import {
  getCommandes, addCommande, updateCommande, deleteCommande,
  getClientNames,
  getClients,
  getUniqueCommercialNames,
  CRM_DATA_CHANGED_EVENT,
  type Commande,
} from '@/lib/crm-data'
import { DataTablePagination } from '@/components/crm/data-table/data-table-pagination'

type StatusFilter = 'ALL' | 'EN_ATTENTE' | 'CONFIRMEE' | 'LIVREE' | 'ANNULEE'
type SortKey = 'id' | 'client' | 'date' | 'montant' | 'commercial'
type SortDir = 'asc' | 'desc'

type CommandeFormState = {
  client: string
  qty: string
  prix: string
  statut: Commande['statut']
  commercial: string
  date: string
}

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA' }

const ease = [0.16, 1, 0.3, 1] as const

function CommandesOverviewStat({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  delay,
}: {
  label: string
  value: string
  sub?: string
  icon: ElementType
  accent: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay }}
    >
      <Card className="group relative overflow-hidden border-primary/12 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/22 hover:shadow-lg hover:shadow-primary/5 dark:border-primary/18">
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

const statusBadge: Record<string, string> = {
  EN_ATTENTE: 'bg-chart-2/20 text-foreground border-chart-2/45 dark:bg-chart-2/15 dark:border-chart-2/40',
  CONFIRMEE: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
  LIVREE: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50',
  ANNULEE: 'bg-destructive/15 text-destructive border-destructive/35 dark:bg-destructive/20 dark:text-red-300 dark:border-red-800/50',
}
const statusIcon: Record<string, React.ElementType> = { EN_ATTENTE: Package, CONFIRMEE: CheckCircle2, LIVREE: Truck, ANNULEE: XCircle }
const nextStatus: Record<string, string[]> = { EN_ATTENTE: ['CONFIRMEE', 'ANNULEE'], CONFIRMEE: ['LIVREE', 'ANNULEE', 'EN_ATTENTE'], LIVREE: ['ANNULEE'], ANNULEE: ['EN_ATTENTE'] }

const emptyForm = (): CommandeFormState => ({
  client: '',
  qty: '',
  prix: '',
  statut: 'EN_ATTENTE',
  commercial: 'Amadou Diallo',
  date: format(new Date(), 'yyyy-MM-dd'),
})

export function CommandesView() {
  const { canModifyCommandes, isDirectorOrAdmin, dataUserName } = usePermissions()
  const [commandes, setCommandes] = useState<Commande[]>(() => getCommandes())
  const [commercialNames] = useState<string[]>(() => getUniqueCommercialNames())
  const [dataVersion, setDataVersion] = useState(0)
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [detailCmd, setDetailCmd] = useState<Commande | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState<CommandeFormState>(emptyForm)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const bump = () => {
      setDataVersion((v) => v + 1)
      setCommandes(getCommandes())
    }
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  // Auto-open new commande dialog if requested by dashboard
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('fab-auto-open-dialog') === 'commande') {
      sessionStorage.removeItem('fab-auto-open-dialog')
      if (canModifyCommandes) {
        setTimeout(() => {
          setEditMode(false)
          setForm(emptyForm())
          setDialogOpen(true)
        }, 150)
      }
    }
  }, [canModifyCommandes])

  const loadData = useCallback(() => {
    setCommandes(getCommandes())
  }, [])

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir(k === 'date' || k === 'montant' ? 'desc' : 'asc')
    }
  }

  const scopedCommandes = useMemo(() => {
    if (isDirectorOrAdmin) return commandes
    return commandes.filter((c) => c.commercial === dataUserName)
  }, [commandes, isDirectorOrAdmin, dataUserName])

  const filtered = useMemo(() => {
    let list = scopedCommandes
      .filter((c) => filter === 'ALL' || c.statut === filter)
      .filter(
        (c) =>
          !search ||
          c.client.toLowerCase().includes(search.toLowerCase()) ||
          c.commercial.toLowerCase().includes(search.toLowerCase()) ||
          c.id.includes(search),
      )
    if (dateFrom) {
      const start = new Date(dateFrom)
      start.setHours(0, 0, 0, 0)
      list = list.filter((c) => new Date(c.date) >= start)
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      list = list.filter((c) => new Date(c.date) <= end)
    }
    if (clientFilter !== 'all') {
      list = list.filter((c) => c.client === clientFilter)
    }
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'id') cmp = Number(a.id) - Number(b.id)
      else if (sortKey === 'client') cmp = a.client.localeCompare(b.client, 'fr')
      else if (sortKey === 'commercial') cmp = a.commercial.localeCompare(b.commercial, 'fr')
      else if (sortKey === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
      else if (sortKey === 'montant') cmp = a.montant - b.montant
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [scopedCommandes, filter, search, dateFrom, dateTo, clientFilter, sortKey, sortDir, dataVersion])

  const filterClientNames = useMemo(() => {
    if (isDirectorOrAdmin) return getClientNames()
    return getClients()
      .filter((c) => c.commercial === dataUserName)
      .map((c) => c.name)
  }, [isDirectorOrAdmin, dataUserName, dataVersion])

  const clientNames = filterClientNames

  const pageCount = filtered.length === 0 ? 0 : Math.ceil(filtered.length / pageSize)
  const maxPage = Math.max(0, pageCount - 1)
  const safePageIndex = pageCount === 0 ? 0 : Math.min(pageIndex, maxPage)
  const pageRows = useMemo(() => {
    const start = safePageIndex * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePageIndex, pageSize])

  const openAdd = () => {
    setForm({
      ...emptyForm(),
      commercial: isDirectorOrAdmin ? (commercialNames[0] || 'Amadou Diallo') : dataUserName,
      date: format(new Date(), 'yyyy-MM-dd'),
    })
    setEditMode(false)
    setEditId(null)
    setDialogOpen(true)
  }

  const openEdit = (cmd: Commande) => {
    setForm({
      client: cmd.client,
      qty: String(cmd.qty),
      prix: String(cmd.prix),
      statut: cmd.statut,
      commercial: cmd.commercial,
      date: cmd.date ? format(new Date(cmd.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    })
    setEditMode(true)
    setEditId(cmd.id)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.client || !form.qty || !form.prix) {
      toast({ title: 'Erreur', description: 'Client, quantité et prix sont requis', variant: 'destructive' })
      return
    }
    const qty = parseInt(form.qty, 10)
    const prix = parseFloat(form.prix)
    if (isNaN(qty) || qty <= 0) {
      toast({ title: 'Erreur', description: 'Quantité invalide', variant: 'destructive' })
      return
    }
    if (isNaN(prix) || prix < 0) {
      toast({ title: 'Erreur', description: 'Prix invalide', variant: 'destructive' })
      return
    }

    const commercial = isDirectorOrAdmin ? form.commercial : dataUserName

    setIsSubmitting(true)
    try {
      if (editMode && editId) {
        const updated = await updateCommande(editId, {
          client: form.client,
          qty,
          prix,
          montant: qty * prix,
          statut: form.statut,
          commercial,
          date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        })
        if (updated) toast({ title: 'Succès', description: 'Commande modifiée' })
      } else {
        await addCommande({
          client: form.client,
          commercial,
          qty,
          prix,
          montant: qty * prix,
          statut: form.statut,
          date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        })
        toast({ title: 'Succès', description: 'Commande créée' })
      }
      loadData()
      setDialogOpen(false)
      setForm(emptyForm())
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de la sauvegarde', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await updateCommande(id, { statut: newStatus as Commande['statut'] })
      if (updated) {
        loadData()
        toast({
          title: 'Statut modifié',
          description: `Commande passée à « ${COMMANDE_STATUT_LABEL[newStatus] || newStatus} »`,
        })
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de la mise à jour du statut', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    const cmd = commandes.find((c) => c.id === deleteDialog)
    try {
      await deleteCommande(deleteDialog)
      loadData()
      toast({ title: 'Supprimée', description: `Commande de ${cmd?.client || ''} supprimée` })
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Erreur lors de la suppression', variant: 'destructive' })
    } finally {
      setDeleteDialog(null)
    }
  }

  const counts = {
    ALL: scopedCommandes.length,
    EN_ATTENTE: scopedCommandes.filter((c) => c.statut === 'EN_ATTENTE').length,
    CONFIRMEE: scopedCommandes.filter((c) => c.statut === 'CONFIRMEE').length,
    LIVREE: scopedCommandes.filter((c) => c.statut === 'LIVREE').length,
    ANNULEE: scopedCommandes.filter((c) => c.statut === 'ANNULEE').length,
  }

  const totalFiltered = filtered.reduce((s, c) => s + c.montant, 0)

  const orderStats = useMemo(() => {
    const n = scopedCommandes.length
    const caHorsAnnule = scopedCommandes
      .filter((c) => c.statut !== 'ANNULEE')
      .reduce((s, c) => s + c.montant, 0)
    const pipeline = scopedCommandes.filter((c) => c.statut === 'EN_ATTENTE' || c.statut === 'CONFIRMEE').length
    const livrees = scopedCommandes.filter((c) => c.statut === 'LIVREE').length
    const pctLivree = n > 0 ? Math.min(100, Math.round((livrees / n) * 100)) : 0
    return { n, caHorsAnnule, pipeline, livrees, pctLivree }
  }, [scopedCommandes, dataVersion])

  const filtersActive =
    !!search.trim() || filter !== 'ALL' || !!dateFrom || !!dateTo || clientFilter !== 'all'

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
        <Card className="overflow-hidden border-primary/15 shadow-md shadow-black/[0.04] dark:border-primary/25 dark:shadow-black/20">
          <div className="relative">
            <div className="pointer-events-none absolute -right-24 -top-28 h-60 w-60 rounded-full bg-primary/18 blur-3xl dark:bg-primary/22" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-emerald-500/14 blur-3xl dark:bg-emerald-600/18" aria-hidden />
            <CardContent className="relative p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-primary/20 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary dark:bg-primary/15">
                      Gestion des commandes
                    </Badge>
                    {filtersActive && (
                      <Badge variant="outline" className="rounded-full text-[11px] font-normal">
                        {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
                        {filtered.length > 0 && (
                          <span className="ml-1 text-primary">· {fmt(totalFiltered)}</span>
                        )}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Commandes</h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Suivez les ventes, les statuts et les montants sur votre périmètre. Données de démonstration persistées en local.
                  </p>
                </div>
                {canModifyCommandes && (
                  <Button
                    onClick={openAdd}
                    size="lg"
                    className="h-11 shrink-0 gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-700 px-5 text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    <Plus className="h-4 w-4" />
                    Nouvelle commande
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <CommandesOverviewStat
          label="Commandes"
          value={String(orderStats.n)}
          sub="dans votre périmètre"
          icon={ShoppingCart}
          accent="from-violet-500 to-purple-600"
          delay={0.05}
        />
        <CommandesOverviewStat
          label="CA (hors annulées)"
          value={fmt(orderStats.caHorsAnnule)}
          sub="montants cumulés actifs"
          icon={Wallet}
          accent="from-primary to-emerald-600"
          delay={0.09}
        />
        <CommandesOverviewStat
          label="Pipeline"
          value={String(orderStats.pipeline)}
          sub="attente + validées"
          icon={Package}
          accent="from-sky-500 to-blue-600"
          delay={0.13}
        />
        <CommandesOverviewStat
          label="Taux livré"
          value={`${orderStats.pctLivree} %`}
          sub={`${orderStats.livrees} commande${orderStats.livrees !== 1 ? 's' : ''} livrée${orderStats.livrees !== 1 ? 's' : ''}`}
          icon={BarChart3}
          accent="from-amber-500 to-orange-600"
          delay={0.17}
        />
      </div>

      <Card className="border-primary/12 dark:border-primary/18">
        <CardHeader className="space-y-1 pb-3">
          <CardTitle className="text-base font-semibold">Filtres</CardTitle>
          <CardDescription>Statut, période, client et recherche libre (ID, client, commercial)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <Tabs
            value={filter}
            onValueChange={(v) => {
              setFilter(v as StatusFilter)
              setPageIndex(0)
            }}
            className="w-full"
          >
            <TabsList className="flex h-auto flex-wrap gap-1 bg-muted/40 p-1 dark:bg-muted/30">
              <TabsTrigger value="ALL" className="text-xs">
                Toutes <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{counts.ALL}</Badge>
              </TabsTrigger>
              <TabsTrigger value="EN_ATTENTE" className="text-xs">
                <Package className="mr-1 h-3 w-3 text-yellow-500" />
                Attente <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{counts.EN_ATTENTE}</Badge>
              </TabsTrigger>
              <TabsTrigger value="CONFIRMEE" className="text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3 text-blue-500" />
                Validée <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{counts.CONFIRMEE}</Badge>
              </TabsTrigger>
              <TabsTrigger value="LIVREE" className="text-xs">
                <Truck className="mr-1 h-3 w-3 text-green-500" />
                Livrée <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{counts.LIVREE}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ANNULEE" className="text-xs">
                <XCircle className="mr-1 h-3 w-3 text-red-500" />
                Annulée <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">{counts.ANNULEE}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Du</Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-primary/15 text-xs shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setPageIndex(0)
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Au</Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-primary/15 text-xs shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setPageIndex(0)
                  }}
                />
              </div>
            </div>
            <div className="min-w-[12rem] space-y-1.5">
              <Label className="text-xs text-muted-foreground">Client</Label>
              <Select
                value={clientFilter}
                onValueChange={(v) => {
                  setClientFilter(v)
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-11 rounded-xl border-primary/15 text-xs shadow-sm">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {filterClientNames.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative min-w-0 max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                placeholder="ID, client, commercial…"
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
                <ShoppingCart className="h-7 w-7 text-muted-foreground" aria-hidden />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{filtersActive ? 'Aucun résultat' : 'Aucune commande'}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {filtersActive
                  ? 'Modifiez les filtres ou réinitialisez la recherche.'
                  : canModifyCommandes
                    ? 'Créez une première commande pour alimenter le tableau.'
                    : 'Aucune commande sur votre périmètre pour le moment.'}
              </p>
            </div>
            {canModifyCommandes && !filtersActive && (
              <Button onClick={openAdd} variant="outline" className="rounded-xl border-primary/25">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle commande
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="min-w-0 overflow-hidden border-primary/12 shadow-sm dark:border-primary/18">
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4 dark:bg-muted/10">
              <CardTitle className="text-base font-semibold">Répertoire des commandes</CardTitle>
              <CardDescription>
                Cliquez sur les en-têtes pour trier — menu actions pour statut, détail et édition
              </CardDescription>
            </CardHeader>
            <div className="hidden min-w-0 overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-20 cursor-pointer text-xs font-semibold select-none" onClick={() => toggleSort('id')}>
                      <span className="inline-flex items-center gap-1">ID <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer text-xs font-semibold select-none" onClick={() => toggleSort('client')}>
                      <span className="inline-flex items-center gap-1">Client <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="hidden cursor-pointer text-xs font-semibold select-none md:table-cell" onClick={() => toggleSort('date')}>
                      <span className="inline-flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right text-xs font-semibold select-none" onClick={() => toggleSort('montant')}>
                      <span className="inline-flex w-full items-center justify-end gap-1">Montant <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold">Statut</TableHead>
                    <TableHead className="hidden text-center text-xs font-semibold lg:table-cell">Qté</TableHead>
                    <TableHead className="hidden cursor-pointer text-xs font-semibold select-none xl:table-cell" onClick={() => toggleSort('commercial')}>
                      <span className="inline-flex items-center gap-1">Commercial <ArrowUpDown className="h-3 w-3 opacity-50" /></span>
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {pageRows.map((cmd) => {
                      const Icon = statusIcon[cmd.statut] || Package
                      return (
                        <motion.tr
                          key={cmd.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-border/50 transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/10"
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">{cmd.id}</TableCell>
                          <TableCell>
                            <button type="button" onClick={() => setDetailCmd(cmd)} className="text-left text-sm font-medium hover:underline">
                              {cmd.client}
                            </button>
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground md:table-cell">
                            {format(new Date(cmd.date), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold tabular-nums">{fmt(cmd.montant)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`text-[10px] gap-1 ${statusBadge[cmd.statut] || ''}`}>
                              <Icon className="h-3 w-3" />{COMMANDE_STATUT_LABEL[cmd.statut] || cmd.statut}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center hidden lg:table-cell text-sm">{cmd.qty}</TableCell>
                          <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{cmd.commercial}</TableCell>
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setDetailCmd(cmd)}><Eye className="h-4 w-4 mr-2" />Voir détails</DropdownMenuItem>
                                {canModifyCommandes && (
                                  <>
                                    <DropdownMenuItem onClick={() => openEdit(cmd)}><Pencil className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {(nextStatus[cmd.statut] || []).map((s) => {
                                      const Ic = statusIcon[s] || Package
                                      return (
                                        <DropdownMenuItem key={s} onClick={() => handleStatusChange(cmd.id, s)}>
                                          <Ic className="h-4 w-4 mr-2" />Passer à « {COMMANDE_STATUT_LABEL[s] || s} »
                                        </DropdownMenuItem>
                                      )
                                    })}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteDialog(cmd.id)}><Trash2 className="h-4 w-4 mr-2" />Supprimer</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              <AnimatePresence mode="popLayout">
                {pageRows.map((cmd) => {
                  const Icon = statusIcon[cmd.statut] || Package
                  return (
                    <motion.div
                      key={cmd.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm dark:border-primary/25"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground font-mono">#{cmd.id}</p>
                          <p className="font-semibold text-sm">{cmd.client}</p>
                          <p className="text-xs text-muted-foreground">{cmd.commercial}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] gap-1 shrink-0 ${statusBadge[cmd.statut]}`}>
                          <Icon className="h-3 w-3" />{COMMANDE_STATUT_LABEL[cmd.statut]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{format(new Date(cmd.date), 'dd MMM yyyy', { locale: fr })} — {fmt(cmd.montant)}</p>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailCmd(cmd)}><Eye className="h-4 w-4 mr-2" />Détails</DropdownMenuItem>
                            {canModifyCommandes && (
                              <>
                                <DropdownMenuItem onClick={() => openEdit(cmd)}><Pencil className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(nextStatus[cmd.statut] || []).map((s) => {
                                  const Ic = statusIcon[s] || Package
                                  return (
                                    <DropdownMenuItem key={s} onClick={() => handleStatusChange(cmd.id, s)}>
                                      <Ic className="h-4 w-4 mr-2" />{COMMANDE_STATUT_LABEL[s]}
                                    </DropdownMenuItem>
                                  )
                                })}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteDialog(cmd.id)}><Trash2 className="h-4 w-4 mr-2" />Supprimer</DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(92vh,44rem)] w-[min(100vw-1.5rem,28rem)] max-w-[min(100vw-1.5rem,28rem)] flex-col gap-0 overflow-hidden rounded-xl border-primary/20 p-0 shadow-xl sm:max-w-md"
        >
          <DialogHeader className="space-y-2 border-b border-border/60 bg-muted/20 px-6 py-5 text-left dark:bg-muted/10">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 shadow-sm">
                {editMode ? <Pencil className="h-4 w-4 text-white" /> : <ShoppingCart className="h-4 w-4 text-white" />}
              </div>
              <span>{editMode ? 'Modifier la commande' : 'Nouvelle commande'}</span>
            </DialogTitle>
            <DialogDescription>
              {editMode ? 'Modifiez les informations de la commande.' : 'Créez une nouvelle commande liée à un client.'}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Client <span className="text-red-500">*</span></Label>
              {editMode ? (
                <Input className="h-10 rounded-lg" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
              ) : (
                <Select value={form.client} onValueChange={(v) => setForm({ ...form, client: v })}>
                  <SelectTrigger className="h-10 w-full rounded-lg"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                  <SelectContent>{clientNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            {isDirectorOrAdmin && (
              <div className="space-y-1.5">
                <Label className="text-xs">Commercial</Label>
                <Select value={form.commercial} onValueChange={(v) => setForm({ ...form, commercial: v })}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {commercialNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Quantité <span className="text-red-500">*</span></Label>
                <Input className="h-10 rounded-lg" type="number" placeholder="50" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prix unit. <span className="text-red-500">*</span></Label>
                <Input className="h-10 rounded-lg" type="number" placeholder="5000" min={0} value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
              </div>
            </div>
            {form.qty && form.prix && !isNaN(parseInt(form.qty, 10)) && !isNaN(parseFloat(form.prix)) && (
              <div className="rounded-lg border border-primary/20 bg-primary/8 p-3 dark:border-primary/35 dark:bg-primary/15">
                <p className="text-xs font-medium text-primary">Montant total</p>
                <p className="text-lg font-bold text-primary">{fmt(parseInt(form.qty, 10) * parseFloat(form.prix))}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Statut</Label>
              <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as Commande['statut'] })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN_ATTENTE">{COMMANDE_STATUT_LABEL.EN_ATTENTE}</SelectItem>
                  <SelectItem value="CONFIRMEE">{COMMANDE_STATUT_LABEL.CONFIRMEE}</SelectItem>
                  <SelectItem value="LIVREE">{COMMANDE_STATUT_LABEL.LIVREE}</SelectItem>
                  <SelectItem value="ANNULEE">{COMMANDE_STATUT_LABEL.ANNULEE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date de commande</Label>
              <Input
                type="date"
                className="h-10 rounded-lg"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
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
                'Créer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La commande de <strong>{commandes.find((c) => c.id === deleteDialog)?.client}</strong> ({fmt(commandes.find((c) => c.id === deleteDialog)?.montant || 0)}) sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!detailCmd} onOpenChange={() => setDetailCmd(null)}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(92vh,40rem)] w-[min(100vw-1.5rem,28rem)] max-w-[min(100vw-1.5rem,28rem)] flex-col gap-0 overflow-hidden rounded-xl border-primary/20 p-0 shadow-xl sm:max-w-md"
        >
          <DialogHeader className="space-y-2 border-b border-border/60 bg-muted/20 px-6 py-5 text-left dark:bg-muted/10">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/12 to-emerald-100/80 dark:from-primary/25 dark:to-emerald-950/40">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <span>Détail — commande #{detailCmd?.id}</span>
            </DialogTitle>
            <DialogDescription>Récapitulatif de la commande sélectionnée.</DialogDescription>
          </DialogHeader>
          {detailCmd && (
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-center">
                <span className="text-sm text-muted-foreground">Client</span>
                <span className="text-sm font-medium">{detailCmd.client}</span>
                <span className="text-sm text-muted-foreground">Commercial</span>
                <span className="text-sm">{detailCmd.commercial}</span>
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">{format(new Date(detailCmd.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                <span className="text-sm text-muted-foreground">Quantité</span>
                <span className="text-sm font-medium">{detailCmd.qty} pots</span>
                <span className="text-sm text-muted-foreground">Prix unitaire</span>
                <span className="text-sm">{fmt(detailCmd.prix)}</span>
                <span className="text-sm text-muted-foreground">Montant</span>
                <span className="text-lg font-bold text-primary">{fmt(detailCmd.montant)}</span>
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant="outline" className={`text-xs gap-1 w-fit ${statusBadge[detailCmd.statut] || ''}`}>
                  {(() => { const Ic = statusIcon[detailCmd.statut] || Package; return <Ic className="h-3 w-3" /> })()}
                  {COMMANDE_STATUT_LABEL[detailCmd.statut]}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter className="shrink-0 gap-2 border-t border-border/80 bg-muted/25 px-6 py-3 sm:flex-row sm:gap-2 sm:py-4">
            <Button variant="outline" className="w-full rounded-xl sm:flex-1" onClick={() => setDetailCmd(null)}>
              Fermer
            </Button>
            {detailCmd && canModifyCommandes && (
              <Button
                className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground sm:flex-1"
                onClick={() => {
                  const d = detailCmd
                  setDetailCmd(null)
                  openEdit(d)
                }}
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
