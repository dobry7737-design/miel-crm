"use client"

import { useEffect, useMemo, useRef, useState, type ElementType } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, subMonths, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus, Search, Pencil, Trash2, TrendingUp, UserCog, X,
  MapPin, Phone, Target, Users, User, Wallet, Package, ArrowUpRight, ArrowDownRight,
  Sparkles, BarChart3, Table2, Columns2, ArrowUpDown, Filter, Share2, Upload, Zap,
  Download, Link2, ListTodo, Activity, Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { usePermissions } from '@/hooks/use-permissions'
import { useToast } from '@/hooks/use-toast'
import {
  CRM_DATA_CHANGED_EVENT,
  getClients,
  getCommandes,
  getSalesReps,
  getClientIdsForCommercialName,
  addSalesRep,
  updateSalesRep,
  deleteSalesRep,
  ventesRealiseesForRep,
  portraitUrlForRep,
  portraitUrlForRepDraft,
  type SalesRep,
  type Commande,
} from '@/lib/crm-data'
import { BRAND_GREEN, BRAND_GREEN_SOFT } from '@/lib/chart-colors'
import { COMMANDE_STATUT_LABEL } from '@/lib/permissions'
import { getRoleLabel } from '@/lib/demo-users'
import { DataTablePagination } from '@/components/crm/data-table/data-table-pagination'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'

function fmtCfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

const REP_ACCENT_HEX = ['#8BEBFF', '#FFCCFF', '#FFFFCB', '#B8F2B0', '#FFD6A5', '#C9B8FF'] as const

function accentHexForRep(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return REP_ACCENT_HEX[h % REP_ACCENT_HEX.length]
}

function demoEmailFromName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return `${slug || 'contact'}@ferme-agribio.sn`
}

function normalizeHexColor(raw?: string | null): string | null {
  if (!raw?.trim()) return null
  let s = raw.trim()
  if (s.startsWith('#')) s = s.slice(1)
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null
  return `#${s.toUpperCase()}`
}

function buildActivitesFromData(cmds: Commande[], nbClients: number): string {
  const actives = cmds.filter((c) => c.statut !== 'ANNULEE').length
  const att = cmds.filter((c) => c.statut === 'EN_ATTENTE').length
  const liv = cmds.filter((c) => c.statut === 'LIVREE').length
  const parts: string[] = [`${actives} commande(s) active(s)`, `${nbClients} compte(s) client`]
  if (att > 0) parts.push(`${att} en attente`)
  if (liv > 0) parts.push(`${liv} livrée(s)`)
  return parts.join(' · ')
}

function PillStack({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <div className="flex max-w-[min(100%,14rem)] flex-wrap gap-1 sm:max-w-[16rem]">
      {labels.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex max-w-[10.5rem] truncate rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] font-medium leading-tight text-foreground dark:bg-muted/30"
          title={t}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

const EQUIPE_TABLE_STORAGE_KEY = 'fab_equipe_table_prefs_v2'
const EQUIPE_AUTO_STORAGE_KEY = 'fab_equipe_automation_flags_v1'

type ColumnId =
  | 'idx'
  | 'name'
  | 'email'
  | 'phone'
  | 'photo'
  | 'role'
  | 'color'
  | 'tasks'
  | 'activites'
  | 'zone'
  | 'commands'
  | 'clients'
  | 'ventes'
  | 'objectif'
  | 'actions'

const COLUMN_META: { id: ColumnId; label: string; toggleable: boolean }[] = [
  { id: 'idx', label: '#', toggleable: true },
  { id: 'name', label: 'Nom', toggleable: true },
  { id: 'email', label: 'Email', toggleable: true },
  { id: 'phone', label: 'Mobile', toggleable: true },
  { id: 'photo', label: 'Photo', toggleable: true },
  { id: 'role', label: 'Rôle', toggleable: true },
  { id: 'color', label: 'Couleur', toggleable: true },
  { id: 'tasks', label: 'Tâches', toggleable: true },
  { id: 'activites', label: 'Activités commerciales', toggleable: true },
  { id: 'zone', label: 'Zone', toggleable: true },
  { id: 'commands', label: 'Commandes (aperçu)', toggleable: true },
  { id: 'clients', label: 'Portefeuille clients', toggleable: true },
  { id: 'ventes', label: 'Ventes', toggleable: true },
  { id: 'objectif', label: 'Objectif', toggleable: true },
  { id: 'actions', label: 'Actions', toggleable: false },
]

function allColumnsVisible(): Record<ColumnId, boolean> {
  return COLUMN_META.reduce(
    (acc, c) => ({ ...acc, [c.id]: true }),
    {} as Record<ColumnId, boolean>,
  )
}

/** Colonnes demandées par défaut : Nom, Email, Mobile, Photo, Rôle, Couleur, Tâches, Activités commerciales (+ actions). */
const ESSENTIAL_PRESET: Record<ColumnId, boolean> = {
  idx: false,
  name: true,
  email: true,
  phone: true,
  photo: true,
  role: true,
  color: true,
  tasks: true,
  activites: true,
  zone: false,
  commands: false,
  clients: false,
  ventes: false,
  objectif: false,
  actions: true,
}

const VIEW_PRESETS: Record<'default' | 'full' | 'compact' | 'activity', Record<ColumnId, boolean>> = {
  default: { ...ESSENTIAL_PRESET },
  full: allColumnsVisible(),
  compact: {
    ...allColumnsVisible(),
    email: false,
    role: false,
    color: false,
    tasks: false,
    activites: false,
    zone: false,
    commands: false,
    clients: false,
  },
  activity: {
    ...allColumnsVisible(),
    email: false,
    role: false,
    color: false,
    phone: false,
    photo: false,
    objectif: false,
    zone: false,
    commands: false,
    clients: false,
    ventes: true,
    tasks: true,
    activites: true,
  },
}

type TableViewMode = 'default' | 'full' | 'compact' | 'activity' | 'custom'

function visibilityMatches(a: Record<ColumnId, boolean>, b: Record<ColumnId, boolean>): boolean {
  return COLUMN_META.every((c) => a[c.id] === b[c.id])
}

function inferViewMode(vis: Record<ColumnId, boolean>): TableViewMode {
  if (visibilityMatches(vis, VIEW_PRESETS.default)) return 'default'
  if (visibilityMatches(vis, VIEW_PRESETS.full)) return 'full'
  if (visibilityMatches(vis, VIEW_PRESETS.compact)) return 'compact'
  if (visibilityMatches(vis, VIEW_PRESETS.activity)) return 'activity'
  return 'custom'
}

function loadTablePrefs(): { view: TableViewMode; cols: Record<ColumnId, boolean> } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(EQUIPE_TABLE_STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as {
      view?: TableViewMode
      cols?: Partial<Record<ColumnId, boolean>>
    }
    const cols = { ...allColumnsVisible(), ...p.cols, actions: true }
    const view =
      p.view === 'default' ||
      p.view === 'full' ||
      p.view === 'compact' ||
      p.view === 'activity' ||
      p.view === 'custom'
        ? p.view
        : inferViewMode(cols)
    return { view, cols }
  } catch {
    return null
  }
}

function saveTablePrefs(view: TableViewMode, cols: Record<ColumnId, boolean>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      EQUIPE_TABLE_STORAGE_KEY,
      JSON.stringify({ view, cols: { ...cols, actions: true } }),
    )
  } catch {
    /* quota / private mode */
  }
}

function csvEscape(cell: string): string {
  if (/[;\n\r"]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`
  return cell
}

type TeamRowExport = {
  id: string
  name: string
  email: string
  phone: string
  zone: string
  roleLabel: string
  accentHex: string
  tachesCount: number
  activitesLine: string
  commandLabels: string[]
  clientLabels: string[]
  ventes: number
  objectif: number
  photoUrl?: string
}

function exportTeamRowsToCsv(rows: TeamRowExport[], vis: Record<ColumnId, boolean>): string {
  const meta = COLUMN_META.filter((c) => vis[c.id] && c.id !== 'actions')
  const lines: string[] = [meta.map((c) => c.label).join(';')]
  rows.forEach((r, i) => {
    const cells: string[] = []
    for (const c of meta) {
      let v = ''
      switch (c.id) {
        case 'idx':
          v = String(i + 1)
          break
        case 'name':
          v = r.name
          break
        case 'email':
          v = r.email
          break
        case 'phone':
          v = r.phone
          break
        case 'photo':
          v = portraitUrlForRep({ id: r.id, photoUrl: r.photoUrl })
          break
        case 'role':
          v = r.roleLabel
          break
        case 'color':
          v = r.accentHex
          break
        case 'tasks':
          v = String(r.tachesCount)
          break
        case 'activites':
          v = r.activitesLine
          break
        case 'zone':
          v = r.zone
          break
        case 'commands':
          v = r.commandLabels.join(' | ')
          break
        case 'clients':
          v = r.clientLabels.join(' | ')
          break
        case 'ventes':
          v = String(r.ventes)
          break
        case 'objectif':
          v = String(r.objectif)
          break
        default:
          break
      }
      cells.push(csvEscape(v))
    }
    lines.push(cells.join(';'))
  })
  return `${lines.join('\r\n')}\r\n`
}

function normalizeCsvHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function parseCsvLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      q = !q
      continue
    }
    if (!q && ch === delim) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

function parseTeamImportCsv(text: string): Array<{
  name: string
  zone: string
  phone: string
  objectif: number
  avatarInitials: string
  photoUrl?: string
  email?: string
  role?: string
  accentColor?: string
  tachesEnCours?: number
  activitesCommerciales?: string
}> {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (rawLines.length < 2) return []
  const delim = rawLines[0].includes(';') ? ';' : ','
  const headers = parseCsvLine(rawLines[0], delim).map(normalizeCsvHeader)
  const col = (aliases: string[]) => {
    for (const a of aliases) {
      const j = headers.findIndex((h) => h === a || h.replace(/\s/g, '') === a.replace(/\s/g, ''))
      if (j !== -1) return j
    }
    return -1
  }
  const iNom = col(['nom', 'name', 'commercial'])
  const iZone = col(['zone', 'region'])
  const iTel = col(['mobile', 'telephone', 'phone', 'tel'])
  const iObj = col(['objectif', 'objectif fcfa', 'cible'])
  const iInit = col(['initiales', 'avatarinitials'])
  const iPhoto = col(['photourl', 'photo url', 'url photo', 'portrait', 'image', 'photo'])
  const iEmail = col(['email', 'e-mail', 'mail'])
  const iRole = col(['role', 'rôle', 'fonction'])
  const iColor = col(['couleur', 'color', 'accent', 'accentcolor'])
  const iTaches = col(['taches', 'tâches', 'tasks'])
  const iAct = col(['activites', 'activités', 'activites commerciales'])
  if (iNom === -1) return []
  const out: Array<{
    name: string
    zone: string
    phone: string
    objectif: number
    avatarInitials: string
    photoUrl?: string
    email?: string
    role?: string
    accentColor?: string
    tachesEnCours?: number
    activitesCommerciales?: string
  }> = []
  for (let L = 1; L < rawLines.length; L++) {
    const cells = parseCsvLine(rawLines[L], delim)
    const name = cells[iNom]?.trim()
    if (!name) continue
    const zone = (iZone >= 0 ? cells[iZone] : '')?.trim() || '—'
    const phone = (iTel >= 0 ? cells[iTel] : '')?.trim() || '—'
    let objectif = 1_000_000
    if (iObj >= 0 && cells[iObj]) {
      const n = parseInt(cells[iObj].replace(/\s/g, '').replace(/[^\d]/g, ''), 10)
      if (!Number.isNaN(n) && n > 0) objectif = n
    }
    let avatarInitials = ''
    if (iInit >= 0 && cells[iInit]) {
      avatarInitials = cells[iInit].toUpperCase().replace(/\s/g, '').slice(0, 2)
    }
    if (!avatarInitials) {
      const parts = name.split(/\s+/).filter(Boolean)
      avatarInitials =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase()
    }
    const photoUrl = iPhoto >= 0 ? cells[iPhoto]?.trim() || undefined : undefined
    const email = iEmail >= 0 ? cells[iEmail]?.trim() || undefined : undefined
    const role = iRole >= 0 ? cells[iRole]?.trim() || undefined : undefined
    const accentRaw = iColor >= 0 ? cells[iColor]?.trim() : undefined
    const accentColor = normalizeHexColor(accentRaw ?? undefined) ?? undefined
    let tachesEnCours: number | undefined
    if (iTaches >= 0 && cells[iTaches]) {
      const tn = parseInt(cells[iTaches].replace(/\s/g, ''), 10)
      if (!Number.isNaN(tn) && tn >= 0) tachesEnCours = tn
    }
    const activitesCommerciales = iAct >= 0 ? cells[iAct]?.trim() || undefined : undefined
    out.push({
      name,
      zone,
      phone,
      objectif,
      avatarInitials,
      photoUrl,
      email,
      role,
      accentColor,
      tachesEnCours,
      activitesCommerciales,
    })
  }
  return out
}

type SortKey = 'name' | 'zone' | 'phone' | 'ventes' | 'objectif'
type SortDir = 'asc' | 'desc'

const emptyForm = {
  name: '',
  zone: '',
  phone: '',
  avatarInitials: '',
  photoUrl: '',
  objectif: '',
  email: '',
  role: '',
  accentColor: '',
  tachesEnCours: '0',
  activitesCommerciales: '',
}

const ease = [0.16, 1, 0.3, 1] as const

function TeamOverviewStat({
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

export function EquipeCommercialeView() {
  const { canModifyData } = usePermissions()
  const { toast } = useToast()
  const [version, setVersion] = useState(0)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [formOpen, setFormOpen] = useState(false)
  const [repFormTab, setRepFormTab] = useState<'profile' | 'objectif' | 'portefeuille'>('profile')
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [perfRep, setPerfRep] = useState<SalesRep | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const [tableView, setTableView] = useState<TableViewMode>(() => loadTablePrefs()?.view ?? 'default')
  const [colVis, setColVis] = useState<Record<ColumnId, boolean>>(
    () => loadTablePrefs()?.cols ?? allColumnsVisible(),
  )
  const [automateOpen, setAutomateOpen] = useState(false)
  const [autoNotifyObjectif, setAutoNotifyObjectif] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const r = JSON.parse(localStorage.getItem(EQUIPE_AUTO_STORAGE_KEY) || '{}') as { notify?: boolean }
      return typeof r.notify === 'boolean' ? r.notify : false
    } catch {
      return false
    }
  })
  const [autoRappelHebdo, setAutoRappelHebdo] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const r = JSON.parse(localStorage.getItem(EQUIPE_AUTO_STORAGE_KEY) || '{}') as { weekly?: boolean }
      return typeof r.weekly === 'boolean' ? r.weekly : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    saveTablePrefs(tableView, colVis)
  }, [tableView, colVis])

  useEffect(() => {
    try {
      localStorage.setItem(
        EQUIPE_AUTO_STORAGE_KEY,
        JSON.stringify({ notify: autoNotifyObjectif, weekly: autoRappelHebdo }),
      )
    } catch {
      /* ignore */
    }
  }, [autoNotifyObjectif, autoRappelHebdo])

  const applyViewPreset = (mode: 'default' | 'full' | 'compact' | 'activity') => {
    setTableView(mode)
    setColVis({ ...VIEW_PRESETS[mode], actions: true })
  }

  const toggleColumn = (id: ColumnId, on: boolean) => {
    if (id === 'actions') return
    setColVis((prev) => ({ ...prev, [id]: on }))
    setTableView('custom')
  }

  const copyPageLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Lien copié', description: 'Collez-le pour partager cette page.' })
    } catch {
      toast({
        title: 'Copie impossible',
        description: url,
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const reps = useMemo(() => getSalesReps(), [version])

  const linkedClientsPreview = useMemo(() => {
    const name = form.name.trim()
    if (!name) return [] as { id: string; name: string }[]
    return getClients()
      .filter((c) => c.commercial.trim() === name)
      .map((c) => ({ id: c.id, name: c.name }))
  }, [form.name, version])

  const formHeaderInitials = useMemo(() => {
    const raw = form.avatarInitials.trim()
    if (raw.length >= 2) return raw.toUpperCase().slice(0, 2)
    if (raw.length === 1) return raw.toUpperCase()
    const parts = form.name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return '?'
  }, [form.avatarInitials, form.name])

  const formHeaderAccentHex = useMemo(
    () =>
      normalizeHexColor(
        form.accentColor.trim().startsWith('#')
          ? form.accentColor.trim()
          : form.accentColor.trim()
            ? `#${form.accentColor.trim()}`
            : undefined,
      ),
    [form.accentColor],
  )

  const formHeaderTaches = useMemo(() => {
    const n = parseInt(String(form.tachesEnCours).replace(/\s/g, ''), 10)
    return !Number.isNaN(n) && n >= 0 ? n : 0
  }, [form.tachesEnCours])

  const formHeaderEmailPreview = useMemo(
    () => (form.email.trim() ? form.email.trim() : form.name.trim() ? demoEmailFromName(form.name.trim()) : ''),
    [form.email, form.name],
  )

  const rows = useMemo(() => {
    const withVentes = reps.map((r) => {
      const ventes = ventesRealiseesForRep(r.name)
      const nbClients = getClientIdsForCommercialName(r.name).length
      const cmds = getCommandes().filter((c) => c.commercial === r.name)
      const tachesCount =
        typeof r.tachesEnCours === 'number' && Number.isFinite(r.tachesEnCours) && r.tachesEnCours >= 0
          ? Math.floor(r.tachesEnCours)
          : 0
      const activitesLine =
        r.activitesCommerciales?.trim() || buildActivitesFromData(cmds, nbClients)
      const seenCmd = new Set<string>()
      const commandLabels: string[] = []
      for (const c of cmds) {
        const k = `${c.client}|${c.statut}`
        if (seenCmd.has(k)) continue
        seenCmd.add(k)
        const shortClient = c.client.length > 16 ? `${c.client.slice(0, 16)}…` : c.client
        commandLabels.push(`${shortClient} · ${COMMANDE_STATUT_LABEL[c.statut] ?? c.statut}`)
        if (commandLabels.length >= 8) break
      }
      const clientLabels = getClients()
        .filter((c) => c.commercial.trim() === r.name.trim())
        .map((c) => (c.name.length > 20 ? `${c.name.slice(0, 20)}…` : c.name))
        .slice(0, 8)
      return {
        ...r,
        ventes,
        nbClients,
        email: r.email?.trim() || demoEmailFromName(r.name),
        roleLabel: r.role ? getRoleLabel(r.role as 'COMMERCIAL' | 'RESP_COMMERCIAL') : 'Commercial',
        accentHex: normalizeHexColor(r.accentColor) ?? accentHexForRep(r.id),
        tachesCount,
        activitesLine,
        commandLabels,
        clientLabels,
      }
    })
    let list = withVentes
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.roleLabel.toLowerCase().includes(q) ||
          r.activitesLine.toLowerCase().includes(q),
      )
    }
    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'fr')
      else if (sortKey === 'zone') cmp = a.zone.localeCompare(b.zone, 'fr')
      else if (sortKey === 'phone') cmp = a.phone.localeCompare(b.phone, 'fr')
      else if (sortKey === 'ventes') cmp = a.ventes - b.ventes
      else if (sortKey === 'objectif') cmp = a.objectif - b.objectif
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [reps, search, sortKey, sortDir, version])

  const teamStats = useMemo(() => {
    let ventes = 0
    let objectif = 0
    for (const r of reps) {
      ventes += ventesRealiseesForRep(r.name)
      objectif += r.objectif
    }
    return {
      count: reps.length,
      ventes,
      objectif,
      progressPct: objectif > 0 ? Math.min(100, Math.round((ventes / objectif) * 100)) : 0,
    }
  }, [reps, version])

  const pageCount = rows.length === 0 ? 0 : Math.ceil(rows.length / pageSize)
  const maxPage = Math.max(0, pageCount - 1)
  const safePageIndex = pageCount === 0 ? 0 : Math.min(pageIndex, maxPage)
  const pageRows = useMemo(() => {
    const start = safePageIndex * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, safePageIndex, pageSize])

  const downloadTeamCsv = () => {
    const exportRows: TeamRowExport[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      zone: r.zone,
      roleLabel: r.roleLabel,
      accentHex: r.accentHex,
      tachesCount: r.tachesCount,
      activitesLine: r.activitesLine,
      commandLabels: r.commandLabels,
      clientLabels: r.clientLabels,
      ventes: r.ventes,
      objectif: r.objectif,
      photoUrl: r.photoUrl,
    }))
    const csv = exportTeamRowsToCsv(exportRows, colVis)
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `equipe-commerciale-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(href)
    toast({ title: 'Export CSV', description: `${exportRows.length} ligne(s) — colonnes visibles.` })
  }

  const onImportFile = (file: File | undefined | null) => {
    if (!file) return
    if (!canModifyData) {
      toast({
        title: 'Import réservé',
        description: 'Seuls le DG et l’administrateur peuvent importer des commerciaux.',
        variant: 'destructive',
      })
      return
    }
    const reader = new FileReader()
    reader.onload = async () => {
      const text = String(reader.result || '')
      const parsed = parseTeamImportCsv(text)
      if (parsed.length === 0) {
        toast({
          title: 'Import impossible',
          description: 'Fichier vide ou en-tête sans colonne « nom ».',
          variant: 'destructive',
        })
        return
      }
      const existing = new Set(getSalesReps().map((r) => r.name.toLowerCase()))
      let added = 0
      let skipped = 0
      for (const row of parsed) {
        const key = row.name.toLowerCase()
        if (existing.has(key)) {
          skipped++
          continue
        }
        try {
          await addSalesRep({
            name: row.name,
            zone: row.zone,
            phone: row.phone,
            avatarInitials: row.avatarInitials,
            photoUrl: row.photoUrl,
            objectif: row.objectif,
            clientIds: [],
            email: row.email,
            role: row.role,
            accentColor: row.accentColor,
            tachesEnCours: row.tachesEnCours,
            activitesCommerciales: row.activitesCommerciales,
          })
          added++
        } catch(err) {
          console.error("Failed to add sales rep", row, err)
        }
        existing.add(key)
      }
      setVersion((v) => v + 1)
      toast({
        title: 'Import terminé',
        description: `${added} fiche(s) ajoutée(s)${skipped ? ` — ${skipped} doublon(s) ignoré(s)` : ''}.`,
      })
    }
    reader.readAsText(file, 'utf-8')
  }

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir('asc')
    }
  }

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setRepFormTab('profile')
    setFormOpen(true)
  }

  const openEdit = (r: SalesRep) => {
    setEditId(r.id)
    setForm({
      name: r.name,
      zone: r.zone,
      phone: r.phone,
      avatarInitials: r.avatarInitials,
      photoUrl: r.photoUrl ?? '',
      objectif: String(r.objectif),
      email: r.email ?? '',
      role: r.role ?? '',
      accentColor: r.accentColor ? r.accentColor.replace(/^#/, '') : '',
      tachesEnCours: String(r.tachesEnCours ?? 0),
      activitesCommerciales: r.activitesCommerciales ?? '',
    })
    setRepFormTab('profile')
    setFormOpen(true)
  }

  const saveRep = async () => {
    const obj = parseInt(String(form.objectif).replace(/\s/g, ''), 10)
    const phoneNorm = form.phone.trim().replace(/\s+/g, '').replace(/^(\+223|00223|\+221|00221)/, '')
    if (!form.name.trim() || !form.zone.trim() || !phoneNorm) {
      toast({ title: 'Champs requis', description: 'Nom, zone et téléphone sont obligatoires', variant: 'destructive' })
      return
    }
    if (isNaN(obj) || obj <= 0) {
      toast({ title: 'Objectif invalide', variant: 'destructive' })
      return
    }
    const initials =
      (form.avatarInitials || form.name)
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'XX'
    const clientIds = getClientIdsForCommercialName(form.name.trim())
    const hex =
      normalizeHexColor(
        form.accentColor.trim().startsWith('#')
          ? form.accentColor.trim()
          : form.accentColor.trim()
            ? `#${form.accentColor.trim()}`
            : undefined,
      ) ?? undefined
    const tc = parseInt(String(form.tachesEnCours).replace(/\s/g, ''), 10)
    const tachesEnCours = !Number.isNaN(tc) && tc >= 0 ? tc : 0
    const email = form.email.trim() || undefined
    const role = form.role.trim() || undefined
    const activitesCommerciales = form.activitesCommerciales.trim() || undefined
    try {
      if (editId) {
        await updateSalesRep(editId, {
          name: form.name.trim(),
          zone: form.zone.trim(),
          phone: form.phone.trim(),
          avatarInitials: initials,
          photoUrl: form.photoUrl.trim() || undefined,
          objectif: obj,
          clientIds,
          email,
          role,
          accentColor: hex,
          tachesEnCours,
          activitesCommerciales,
        })
        toast({ title: 'Commercial mis à jour' })
      } else {
        await addSalesRep({
          name: form.name.trim(),
          zone: form.zone.trim(),
          phone: form.phone.trim(),
          avatarInitials: initials,
          photoUrl: form.photoUrl.trim() || undefined,
          objectif: obj,
          clientIds,
          email,
          role,
          accentColor: hex,
          tachesEnCours,
          activitesCommerciales,
        })
        toast({ title: 'Commercial ajouté' })
      }
      setVersion((v) => v + 1)
      setFormOpen(false)
      setForm(emptyForm)
    } catch(err: any) {
      toast({ title: 'Erreur', description: err.message || 'Action impossible', variant: 'destructive' })
    }
  }

  const deleteTargetRep = useMemo(
    () => (deleteId ? getSalesReps().find((r) => r.id === deleteId) : undefined),
    [deleteId, version],
  )

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await deleteSalesRep(deleteId)
      setDeleteId(null)
      setVersion((v) => v + 1)
      toast({ title: 'Commercial supprimé' })
    } catch(err: any) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' })
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
        <Card className="overflow-hidden border-primary/15 shadow-md shadow-black/[0.04] dark:border-primary/25 dark:shadow-black/20">
          <div className="relative">
            <div className="pointer-events-none absolute -right-24 -top-28 h-60 w-60 rounded-full bg-primary/18 blur-3xl dark:bg-primary/22" aria-hidden />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-emerald-500/14 blur-3xl dark:bg-emerald-600/18" aria-hidden />
            <CardContent className="relative p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full border-primary/20 bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary dark:bg-primary/15">
                      Direction commerciale
                    </Badge>
                    {search.trim() && (
                      <Badge variant="outline" className="rounded-full text-[11px] font-normal">
                        {rows.length} résultat{rows.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Équipe commerciale</h1>
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Pilotez les représentants, objectifs et performances. Données de démonstration persistées en local.
                  </p>
                </div>
                {canModifyData && (
                  <Button
                    onClick={openAdd}
                    size="lg"
                    className="h-11 shrink-0 gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-700 px-5 text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un commercial
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <TeamOverviewStat
          label="Commerciaux"
          value={String(teamStats.count)}
          sub="actifs dans l’équipe"
          icon={UserCog}
          accent="from-violet-500 to-purple-600"
          delay={0.05}
        />
        <TeamOverviewStat
          label="CA équipe"
          value={fmtCfa(teamStats.ventes)}
          sub="ventes cumulées (hors annulées)"
          icon={Wallet}
          accent="from-primary to-emerald-600"
          delay={0.09}
        />
        <TeamOverviewStat
          label="Objectifs cumulés"
          value={fmtCfa(teamStats.objectif)}
          sub="cibles agrégées (démo)"
          icon={Target}
          accent="from-sky-500 to-blue-600"
          delay={0.13}
        />
        <TeamOverviewStat
          label="Taux global"
          value={`${teamStats.progressPct} %`}
          sub="CA / objectifs cumulés"
          icon={BarChart3}
          accent="from-amber-500 to-orange-600"
          delay={0.17}
        />
      </div>

      <Card className="border-primary/12 dark:border-primary/18">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recherche</CardTitle>
          <CardDescription>
            Filtrer par nom, e-mail, rôle, activités, zone ou téléphone
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              ref={searchInputRef}
              placeholder="Ex. Dakar, +221…"
              className="h-11 rounded-xl border-primary/15 pl-10 shadow-sm transition-shadow focus-visible:border-primary/40 focus-visible:ring-primary/15"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPageIndex(0)
              }}
            />
            {search && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card className="border-dashed border-primary/20">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 ring-1 ring-border">
              <UserCog className="h-7 w-7 text-muted-foreground" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aucun résultat</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search.trim()
                  ? 'Modifiez votre recherche ou réinitialisez le filtre.'
                  : 'Ajoutez un commercial pour commencer.'}
              </p>
            </div>
            {canModifyData && !search.trim() && (
              <Button onClick={openAdd} variant="outline" className="rounded-xl border-primary/25">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau commercial
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="min-w-0 overflow-hidden border-primary/12 shadow-sm dark:border-primary/18">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              onImportFile(f ?? null)
            }}
          />
          <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/35 px-3 py-3 dark:bg-muted/15 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Select
                value={tableView === 'custom' ? 'custom' : tableView}
                onValueChange={(v) => {
                  if (v === 'default' || v === 'full' || v === 'compact' || v === 'activity') applyViewPreset(v)
                  else setTableView('custom')
                }}
              >
                <SelectTrigger size="sm" className="h-9 w-[min(100%,14rem)] rounded-lg border-border/80 bg-background text-xs sm:text-sm">
                  <SelectValue placeholder="Vue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Vue équipe (colonnes essentielles)</SelectItem>
                  <SelectItem value="full">Toutes les colonnes</SelectItem>
                  <SelectItem value="compact">Vue compacte</SelectItem>
                  <SelectItem value="activity">Vue activité</SelectItem>
                  <SelectItem value="custom">Personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-0.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1 rounded-md px-2 text-xs text-foreground"
                aria-current="true"
              >
                <Table2 className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                <span className="hidden lg:inline">Vue table</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Columns2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="hidden lg:inline">Colonnes</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {COLUMN_META.filter((c) => c.toggleable).map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={colVis[c.id]}
                      onCheckedChange={(on) => toggleColumn(c.id, !!on)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {c.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      applyViewPreset('full')
                      toast({ title: 'Colonnes', description: 'Toutes les colonnes du tableau sont visibles.' })
                    }}
                  >
                    Tout afficher
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      applyViewPreset('default')
                      toast({
                        title: 'Colonnes',
                        description: 'Nom, e-mail, mobile, photo, rôle, couleur, tâches et activités commerciales.',
                      })
                    }}
                  >
                    Vue essentielle
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() =>
                  toast({
                    title: 'Tri',
                    description: 'Utilisez les en-têtes de colonnes (Nom, Zone, Mobile, Ventes, Objectif) pour trier.',
                  })
                }
              >
                <ArrowUpDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="hidden lg:inline">Trier</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  searchInputRef.current?.focus()
                  toast({ title: 'Filtre', description: 'Saisissez un critère dans la zone Recherche ci-dessus.' })
                }}
              >
                <Filter className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="hidden lg:inline">Filtrer</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="hidden lg:inline">Partager</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => void copyPageLink()}>
                    <Link2 className="h-4 w-4" aria-hidden />
                    Copier le lien
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadTeamCsv}>
                    <Download className="h-4 w-4" aria-hidden />
                    Exporter CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (!canModifyData) {
                    toast({
                      title: 'Import réservé',
                      description: 'Réservé au DG et à l’administrateur.',
                      variant: 'destructive',
                    })
                    return
                  }
                  importInputRef.current?.click()
                }}
              >
                <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="hidden lg:inline">Importer</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setAutomateOpen(true)}
              >
                <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="hidden lg:inline">Automatiser</span>
              </Button>
            </div>
          </div>

          <div className="hidden min-w-0 overflow-x-auto md:block">
            <Table className="w-max min-w-full table-fixed border-collapse text-sm">
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  {colVis.idx && <TableHead className="w-10 whitespace-nowrap text-xs font-semibold">#</TableHead>}
                  {colVis.name && (
                    <TableHead className="min-w-[9rem] cursor-pointer text-xs font-semibold" onClick={() => toggleSort('name')}>
                      Nom
                    </TableHead>
                  )}
                  {colVis.email && <TableHead className="min-w-[12rem] text-xs font-semibold">Email</TableHead>}
                  {colVis.phone && (
                    <TableHead className="min-w-[8.5rem] cursor-pointer text-xs font-semibold" onClick={() => toggleSort('phone')}>
                      Mobile
                    </TableHead>
                  )}
                  {colVis.photo && <TableHead className="w-16 text-center text-xs font-semibold">Photo</TableHead>}
                  {colVis.role && <TableHead className="min-w-[5.5rem] text-xs font-semibold">Rôle</TableHead>}
                  {colVis.color && <TableHead className="min-w-[6.5rem] text-xs font-semibold">Couleur</TableHead>}
                  {colVis.tasks && (
                    <TableHead className="min-w-[4.5rem] text-center text-xs font-semibold">
                      <span className="inline-flex items-center justify-center gap-1">
                        <ListTodo className="h-3.5 w-3.5 opacity-70" aria-hidden />
                        Tâches
                      </span>
                    </TableHead>
                  )}
                  {colVis.activites && (
                    <TableHead className="min-w-[14rem] text-xs font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 opacity-70" aria-hidden />
                        Activités commerciales
                      </span>
                    </TableHead>
                  )}
                  {colVis.zone && (
                    <TableHead className="min-w-[11rem] cursor-pointer text-xs font-semibold" onClick={() => toggleSort('zone')}>
                      Zone
                    </TableHead>
                  )}
                  {colVis.commands && <TableHead className="min-w-[12rem] text-xs font-semibold">Commandes (aperçu)</TableHead>}
                  {colVis.clients && <TableHead className="min-w-[12rem] text-xs font-semibold">Portefeuille clients</TableHead>}
                  {colVis.ventes && (
                    <TableHead className="cursor-pointer text-right text-xs font-semibold whitespace-nowrap" onClick={() => toggleSort('ventes')}>
                      Ventes
                    </TableHead>
                  )}
                  {colVis.objectif && (
                    <TableHead className="cursor-pointer text-right text-xs font-semibold whitespace-nowrap" onClick={() => toggleSort('objectif')}>
                      Objectif
                    </TableHead>
                  )}
                  {colVis.actions && <TableHead className="w-[7.5rem] text-center text-xs font-semibold">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((r, idx) => (
                  <TableRow
                    key={r.id}
                    className="border-border/50 transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/10"
                  >
                    {colVis.idx && (
                      <TableCell className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                        {safePageIndex * pageSize + idx + 1}
                      </TableCell>
                    )}
                    {colVis.name && <TableCell className="font-medium">{r.name}</TableCell>}
                    {colVis.email && (
                      <TableCell>
                        <a
                          href={`mailto:${r.email}`}
                          className="text-xs text-primary underline-offset-2 hover:underline"
                        >
                          {r.email}
                        </a>
                      </TableCell>
                    )}
                    {colVis.phone && <TableCell className="whitespace-nowrap text-xs">{r.phone}</TableCell>}
                    {colVis.photo && (
                      <TableCell>
                        <div className="flex justify-center">
                          <Avatar className="h-11 w-11 ring-1 ring-border/60">
                            <AvatarImage
                              src={portraitUrlForRep(r)}
                              alt=""
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-primary/90 to-emerald-800 text-[9px] font-bold text-primary-foreground">
                              {r.avatarInitials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                    )}
                    {colVis.role && (
                      <TableCell>
                        <Badge variant="secondary" className="max-w-[10rem] truncate text-[10px] font-normal" title={r.roleLabel}>
                          {r.roleLabel}
                        </Badge>
                      </TableCell>
                    )}
                    {colVis.color && (
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-mono tabular-nums"
                          style={{
                            backgroundColor: `${r.accentHex}40`,
                            borderColor: `${r.accentHex}88`,
                          }}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-sm border border-black/10" style={{ backgroundColor: r.accentHex }} aria-hidden />
                          {r.accentHex}
                        </span>
                      </TableCell>
                    )}
                    {colVis.tasks && (
                      <TableCell className="text-center">
                        <span className="inline-flex min-w-[1.75rem] justify-center rounded-md bg-muted/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground dark:bg-muted/40">
                          {r.tachesCount}
                        </span>
                      </TableCell>
                    )}
                    {colVis.activites && (
                      <TableCell>
                        <p className="line-clamp-3 text-xs leading-snug text-muted-foreground" title={r.activitesLine}>
                          {r.activitesLine}
                        </p>
                      </TableCell>
                    )}
                    {colVis.zone && <TableCell className="text-xs text-muted-foreground">{r.zone}</TableCell>}
                    {colVis.commands && (
                      <TableCell>
                        <PillStack labels={r.commandLabels} />
                      </TableCell>
                    )}
                    {colVis.clients && (
                      <TableCell>
                        <PillStack labels={r.clientLabels} />
                      </TableCell>
                    )}
                    {colVis.ventes && (
                      <TableCell className="text-right text-xs font-semibold tabular-nums whitespace-nowrap">{fmtCfa(r.ventes)}</TableCell>
                    )}
                    {colVis.objectif && (
                      <TableCell className="text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">{fmtCfa(r.objectif)}</TableCell>
                    )}
                    {colVis.actions && (
                      <TableCell>
                        <div className="flex justify-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"
                            onClick={() => setPerfRep(r as SalesRep)}
                            title="Performances"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          {canModifyData && (
                            <>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={() => openEdit(r)} title="Modifier">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                                onClick={() => setDeleteId(r.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            <AnimatePresence mode="popLayout">
              {pageRows.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm dark:border-primary/25"
                >
                  {(colVis.idx || colVis.color) && (
                    <div className="mb-2 flex items-center justify-between gap-2">
                      {colVis.idx && (
                        <span className="text-[10px] font-mono text-muted-foreground">#{safePageIndex * pageSize + idx + 1}</span>
                      )}
                      {colVis.color && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono"
                          style={{
                            backgroundColor: `${r.accentHex}40`,
                            borderColor: `${r.accentHex}88`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-sm" style={{ backgroundColor: r.accentHex }} aria-hidden />
                          {r.accentHex}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mb-3 flex items-start gap-3">
                    {colVis.photo && (
                      <Avatar className="h-12 w-12 shrink-0 ring-1 ring-primary/15">
                        <AvatarImage
                          src={portraitUrlForRep(r)}
                          alt=""
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/90 to-emerald-800 text-[10px] font-bold text-primary-foreground">
                          {r.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="min-w-0 flex-1">
                      {colVis.name && <p className="text-sm font-semibold leading-tight">{r.name}</p>}
                      {colVis.email && (
                        <a href={`mailto:${r.email}`} className="mt-0.5 block truncate text-xs text-primary underline-offset-2 hover:underline">
                          {r.email}
                        </a>
                      )}
                      {colVis.role && (
                        <Badge variant="secondary" className="mt-1.5 max-w-full truncate text-[10px] font-normal" title={r.roleLabel}>
                          {r.roleLabel}
                        </Badge>
                      )}
                      {colVis.zone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                          {r.zone}
                        </p>
                      )}
                      {colVis.phone && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" aria-hidden />
                          {r.phone}
                        </p>
                      )}
                      {colVis.tasks && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <ListTodo className="h-3 w-3 shrink-0" aria-hidden />
                          <span className="font-medium text-foreground">{r.tachesCount}</span> tâche(s) en cours
                        </p>
                      )}
                      {colVis.activites && (
                        <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{r.activitesLine}</p>
                      )}
                    </div>
                  </div>
                  {colVis.commands && (
                    <div className="mb-2 space-y-1.5">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Commandes</p>
                      <PillStack labels={r.commandLabels} />
                    </div>
                  )}
                  {colVis.clients && (
                    <div className="mb-3 space-y-1.5">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Portefeuille</p>
                      <PillStack labels={r.clientLabels} />
                    </div>
                  )}
                  {(colVis.ventes || colVis.objectif) && (
                    <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                      {colVis.ventes && (
                        <div className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 dark:bg-muted/10">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ventes</p>
                          <p className="mt-0.5 font-semibold tabular-nums text-foreground">{fmtCfa(r.ventes)}</p>
                        </div>
                      )}
                      {colVis.objectif && (
                        <div className="rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 dark:bg-muted/10">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Objectif</p>
                          <p className="mt-0.5 font-semibold tabular-nums text-foreground">{fmtCfa(r.objectif)}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {colVis.actions && (
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 rounded-lg text-xs"
                      onClick={() => setPerfRep(r as SalesRep)}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Perf.
                    </Button>
                    {canModifyData && (
                      <>
                        <Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg text-xs" onClick={() => openEdit(r)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 gap-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                          onClick={() => setDeleteId(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </Button>
                      </>
                    )}
                  </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <DataTablePagination
            pageIndex={safePageIndex}
            pageSize={pageSize}
            totalRows={rows.length}
            pageCount={pageCount}
            onPageChange={setPageIndex}
            onPageSizeChange={(n) => {
              setPageSize(n)
              setPageIndex(0)
            }}
            className="rounded-b-xl border-t border-border/60 bg-muted/15 dark:bg-muted/10"
          />
        </Card>
      )}

      <Dialog open={automateOpen} onOpenChange={setAutomateOpen}>
        <DialogContent className="max-w-md rounded-xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Automatisations</DialogTitle>
            <DialogDescription>
              Préférences enregistrées localement (démo). Aucun envoi serveur. Les rappels pourront plus tard
              s’appuyer sur les tâches et activités renseignées sur chaque fiche commerciale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-3 dark:bg-muted/10">
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="auto-notify" className="text-sm font-medium">
                  Alerte objectif
                </Label>
                <p className="text-xs text-muted-foreground">Rappel si progression &lt; 50 % (simulation).</p>
              </div>
              <Switch
                id="auto-notify"
                checked={autoNotifyObjectif}
                onCheckedChange={setAutoNotifyObjectif}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-3 dark:bg-muted/10">
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="auto-weekly" className="text-sm font-medium">
                  Synthèse hebdomadaire
                </Label>
                <p className="text-xs text-muted-foreground">Récap par e-mail — non branché en démo.</p>
              </div>
              <Switch
                id="auto-weekly"
                checked={autoRappelHebdo}
                onCheckedChange={setAutoRappelHebdo}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setAutomateOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setRepFormTab('profile')
        }}
      >
        <DialogContent
          showCloseButton
          className="flex max-h-[min(92vh,52rem)] w-[min(100vw-1.5rem,42rem)] max-w-[min(100vw-1.5rem,42rem)] flex-col gap-0 overflow-hidden rounded-xl border-primary/20 p-0 shadow-xl sm:max-w-2xl"
        >
          <DialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-b border-primary/10 bg-gradient-to-br from-primary/[0.12] via-emerald-50/90 to-amber-50/40 px-5 pb-5 pt-5 text-left sm:px-6 sm:pt-6 dark:from-primary/25 dark:via-emerald-950/40 dark:to-background">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl dark:bg-primary/20" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-20 w-20 rounded-full bg-amber-200/30 blur-2xl dark:bg-amber-900/20" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar className="h-14 w-14 shrink-0 border-2 border-primary/20 shadow-md ring-4 ring-background dark:ring-background">
                <AvatarImage
                  src={portraitUrlForRepDraft({
                    id: editId ?? undefined,
                    name: form.name,
                    photoUrl: form.photoUrl,
                  })}
                  alt=""
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-800 text-lg font-bold text-primary-foreground">
                  {formHeaderInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {editId
                      ? `Modifier — ${form.name.trim() || 'Commercial'}`
                      : 'Nouveau commercial'}
                  </DialogTitle>
                  <Badge
                    variant="secondary"
                    className="shrink-0 max-w-[min(100%,12rem)] truncate border-primary/20 bg-primary/10 text-[10px] font-medium text-primary dark:bg-primary/20"
                    title={form.role.trim() || 'Commercial'}
                  >
                    {form.role.trim() || 'Commercial'}
                  </Badge>
                  {!editId && (
                    <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                      Création
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  {editId
                    ? 'Onglet Profil : nom, e-mail, mobile, photo, rôle, couleur, tâches et activités commerciales. Objectif et portefeuille dans les autres onglets.'
                    : 'Onglet Profil : identité complète (e-mail, rôle, couleur, tâches, activités) alignée sur le tableau équipe. Le nom doit correspondre au champ « Commercial » des clients.'}
                </DialogDescription>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50"
                  >
                    <MapPin className="h-3 w-3 text-primary" aria-hidden />
                    {form.zone.trim() || 'Zone'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50"
                  >
                    <Phone className="h-3 w-3 text-primary" aria-hidden />
                    {form.phone.trim() || 'Mobile'}
                  </Badge>
                  {formHeaderEmailPreview && (
                    <Badge
                      variant="outline"
                      className="max-w-[min(100%,18rem)] gap-1.5 truncate border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50"
                      title={formHeaderEmailPreview}
                    >
                      <Mail className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                      <span className="truncate">{formHeaderEmailPreview}</span>
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50"
                  >
                    <ListTodo className="h-3 w-3 text-primary" aria-hidden />
                    {formHeaderTaches} tâche(s)
                  </Badge>
                  {formHeaderAccentHex && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/80 px-2.5 py-1 text-[10px] font-mono dark:bg-background/50"
                      style={{
                        backgroundColor: `${formHeaderAccentHex}35`,
                        borderColor: `${formHeaderAccentHex}70`,
                      }}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm border border-black/15"
                        style={{ backgroundColor: formHeaderAccentHex }}
                        aria-hidden
                      />
                      {formHeaderAccentHex}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs
            value={repFormTab}
            onValueChange={(v) => setRepFormTab(v as typeof repFormTab)}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="shrink-0 border-b border-border/60 bg-muted/15 px-5 py-3 dark:bg-muted/10 sm:px-6">
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/50 p-1 dark:bg-muted/30">
                <TabsTrigger value="profile" className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm">
                  <User className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="objectif" className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm">
                  <Target className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  Objectif
                </TabsTrigger>
                <TabsTrigger value="portefeuille" className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm">
                  <Users className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  Portefeuille
                  {linkedClientsPreview.length > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 min-w-[1.25rem] px-1.5 text-[10px]">
                      {linkedClientsPreview.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
              <TabsContent value="profile" className="m-0 space-y-4 focus-visible:outline-none">
                <p className="text-xs text-muted-foreground">
                  Identité telle qu’affichée dans l’équipe et sur les documents. Le nom doit correspondre au champ « Commercial » des fiches clients.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium">Nom complet</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex. Amadou Diallo"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Zone</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      value={form.zone}
                      onChange={(e) => setForm({ ...form, zone: e.target.value })}
                      placeholder="Ex. Dakar"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Téléphone</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+221 …"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium">E-mail</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="prenom.nom@ferme-agribio.sn"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium">Rôle affiché</Label>
                    <Select
                      value={form.role || 'COMMERCIAL'}
                      onValueChange={(val) => setForm({ ...form, role: val })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15">
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="RESP_COMMERCIAL">Responsable Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Couleur (#RRVVBB)</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 font-mono text-sm shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      value={form.accentColor}
                      onChange={(e) => setForm({ ...form, accentColor: e.target.value.replace(/[^#0-9a-fA-F]/g, '').slice(0, 7) })}
                      placeholder="8BEBFF ou #8BEBFF"
                      maxLength={7}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tâches en cours</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      type="number"
                      min={0}
                      value={form.tachesEnCours}
                      onChange={(e) => setForm({ ...form, tachesEnCours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium">Activités commerciales (texte libre)</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      value={form.activitesCommerciales}
                      onChange={(e) => setForm({ ...form, activitesCommerciales: e.target.value })}
                      placeholder="Résumé : visites, devis, relances…"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Laissé vide : résumé calculé à partir des commandes et du portefeuille.
                    </p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium">URL de la photo (optionnel)</Label>
                    <Input
                      className="h-11 rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      type="url"
                      inputMode="url"
                      value={form.photoUrl}
                      onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                      placeholder="https://exemple.com/photo.jpg"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Vide : portrait de démo automatique (image stable par fiche). HTTPS recommandé.
                    </p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-medium">Initiales affichées (optionnel)</Label>
                    <Input
                      className="h-11 max-w-[8rem] rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      value={form.avatarInitials}
                      onChange={(e) => setForm({ ...form, avatarInitials: e.target.value })}
                      placeholder="AD"
                      maxLength={4}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Laissé vide : génération automatique à partir du nom à l’enregistrement.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="objectif" className="m-0 space-y-4 focus-visible:outline-none">
                <Card className="border-primary/15 bg-muted/20 dark:bg-muted/10">
                  <CardHeader className="space-y-1 pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold">Cible commerciale</CardTitle>
                    <CardDescription className="text-xs">
                      Objectif annuel de référence (démo). Sert au suivi dans le tableau et les performances.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <Label className="text-xs font-medium">Montant (FCFA)</Label>
                    <Input
                      className="mt-1.5 h-11 max-w-xs rounded-xl border-primary/15 shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/15"
                      type="number"
                      min={1}
                      value={form.objectif}
                      onChange={(e) => setForm({ ...form, objectif: e.target.value })}
                      placeholder="5000000"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portefeuille" className="m-0 space-y-3 focus-visible:outline-none">
                <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-4 dark:bg-primary/10">
                  <p className="text-sm font-medium text-foreground">Rattachement automatique</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    À l’enregistrement, les clients dont le champ « Commercial » correspond exactement au nom (onglet Profil) sont associés à cette fiche. Vérifiez la colonne ID dans le module Clients.
                  </p>
                </div>
                {linkedClientsPreview.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                    Aucun client pour ce nom pour l’instant. Saisissez d’abord le nom exact dans Profil.
                  </p>
                ) : (
                  <ul className="grid max-h-[min(32vh,16rem)] gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2">
                    {linkedClientsPreview.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/[0.03]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">ID {c.id}</span>
                          <p className="truncate text-sm font-medium">{c.name}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="shrink-0 border-t border-border/80 bg-muted/25 px-5 py-3 sm:px-6 sm:py-4">
            <Button variant="outline" className="w-full rounded-xl sm:w-auto sm:min-w-[7rem]" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground sm:w-auto sm:min-w-[9rem]"
              onClick={saveRep}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PerformanceSheet rep={perfRep} onClose={() => setPerfRep(null)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce commercial ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  La fiche sera retirée de l&apos;équipe (données démo). Les clients existants ne sont pas
                  supprimés ; vérifiez le champ « Commercial » si besoin.
                </p>
                {deleteTargetRep && (
                  <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-foreground dark:bg-muted/20">
                    <p className="font-medium">{deleteTargetRep.name}</p>
                    {(deleteTargetRep.email?.trim() || demoEmailFromName(deleteTargetRep.name)) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {deleteTargetRep.email?.trim() || demoEmailFromName(deleteTargetRep.name)}
                      </p>
                    )}
                    {deleteTargetRep.role?.trim() && (
                      <p className="mt-1 text-xs text-muted-foreground">Rôle : {deleteTargetRep.role.trim()}</p>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

type PerfMonthRow = { month: string; shortMonth: string; montant: number; n: number; key: string }

type PerfSheetTab = 'synthese' | 'evolution' | 'portefeuille'

function PerformanceSheet({ rep, onClose }: { rep: SalesRep | null; onClose: () => void }) {
  if (!rep) return null

  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <PerformanceSheetInner key={rep.id} rep={rep} onClose={onClose} />
    </Dialog>
  )
}

function PerformanceSheetInner({ rep, onClose }: { rep: SalesRep; onClose: () => void }) {
  const [chartMonths, setChartMonths] = useState<6 | 12>(12)
  const [perfSheetTab, setPerfSheetTab] = useState<PerfSheetTab>('synthese')

  const sheetData = useMemo(() => {
    const allCmds = getCommandes().filter((c) => c.commercial === rep.name)
    const nbCommandesActives = allCmds.filter((c) => c.statut !== 'ANNULEE').length
    const ventesTotal = ventesRealiseesForRep(rep.name)
    const now = new Date()
    const months: Date[] = []
    for (let i = 0; i < 12; i++) {
      months.push(subMonths(startOfMonth(now), 11 - i))
    }
    const monthlyFull = months.map((d) => {
      const key = format(d, 'yyyy-MM')
      const label = format(d, 'MMM yyyy', { locale: fr })
      const shortLabel = format(d, 'MMM', { locale: fr })
      const montant = allCmds
        .filter((c) => {
          const cd = new Date(c.date)
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear() && c.statut !== 'ANNULEE'
        })
        .reduce((s, c) => s + c.montant, 0)
      const n = allCmds.filter((c) => {
        const cd = new Date(c.date)
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()
      }).length
      return { month: label, shortMonth: shortLabel, montant, n, key }
    })
    const last3 = monthlyFull.slice(-3).reduce((s, x) => s + x.montant, 0)
    const prev3 = monthlyFull.slice(-6, -3).reduce((s, x) => s + x.montant, 0)
    const trendPct =
      prev3 > 0 ? Math.round(((last3 - prev3) / prev3) * 100) : last3 > 0 ? 100 : null
    const best = monthlyFull.reduce(
      (acc, m) => (m.montant > acc.montant ? m : acc),
      monthlyFull[0] ?? ({ montant: 0, key: '', month: '', shortMonth: '', n: 0 } satisfies PerfMonthRow),
    )
    const clientList = getClients()
    const clients = clientList
      .filter((c) => c.commercial.trim() === rep.name.trim())
      .map((c) => ({ id: c.id, name: c.name }))
    const nbClients = clients.length
    const emailDisplay = rep.email?.trim() || demoEmailFromName(rep.name)
    const roleLabel = rep.role ? getRoleLabel(rep.role as 'COMMERCIAL' | 'RESP_COMMERCIAL') : 'Commercial'
    const accentHex = normalizeHexColor(rep.accentColor) ?? accentHexForRep(rep.id)
    const tachesCount =
      typeof rep.tachesEnCours === 'number' && Number.isFinite(rep.tachesEnCours) && rep.tachesEnCours >= 0
        ? Math.floor(rep.tachesEnCours)
        : 0
    const activitesLine =
      rep.activitesCommerciales?.trim() || buildActivitesFromData(allCmds, nbClients)

    return {
      monthlyFull,
      clients,
      ventesTotal,
      nbCommandesActives,
      trendPct,
      bestMonthKey: best?.key ?? '',
      emailDisplay,
      roleLabel,
      accentHex,
      tachesCount,
      activitesLine,
    }
  }, [rep])

  const monthlyChart = useMemo(() => {
    const slice = chartMonths === 6 ? sheetData.monthlyFull.slice(-6) : sheetData.monthlyFull
    return slice.map(({ shortMonth, montant }) => ({ month: shortMonth, montant }))
  }, [sheetData.monthlyFull, chartMonths])

  const breakdown = useMemo(() => {
    const slice = chartMonths === 6 ? sheetData.monthlyFull.slice(-6) : sheetData.monthlyFull
    return [...slice].reverse()
  }, [sheetData.monthlyFull, chartMonths])

  const objectif = rep.objectif
  const pctObjectif = objectif > 0 ? Math.min(100, Math.round((sheetData.ventesTotal / objectif) * 100)) : 0
  const depasse = objectif > 0 && sheetData.ventesTotal >= objectif

  return (
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92vh,52rem)] w-[min(100vw-1.5rem,42rem)] max-w-[min(100vw-1.5rem,42rem)] flex-col gap-0 overflow-hidden rounded-xl border-primary/20 p-0 shadow-xl sm:max-w-2xl"
      >
        <DialogHeader className="relative shrink-0 space-y-0 overflow-hidden border-b border-primary/10 bg-gradient-to-br from-primary/[0.12] via-emerald-50/90 to-amber-50/40 px-5 pb-5 pt-5 text-left sm:px-6 sm:pt-6 dark:from-primary/25 dark:via-emerald-950/40 dark:to-background">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl dark:bg-primary/20" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-20 w-20 rounded-full bg-amber-200/30 blur-2xl dark:bg-amber-900/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-14 w-14 shrink-0 border-2 border-primary/20 shadow-md ring-4 ring-background dark:ring-background">
              <AvatarImage
                src={portraitUrlForRep(rep)}
                alt=""
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-800 text-lg font-bold text-primary-foreground">
                {rep.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Performances — {rep.name}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className="shrink-0 max-w-[min(100%,11rem)] truncate border-primary/20 bg-primary/10 text-[10px] font-medium text-primary dark:bg-primary/20"
                  title={sheetData.roleLabel}
                >
                  {sheetData.roleLabel}
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                Synthèse chiffrée, évolution des ventes et portefeuille — alignée sur la fiche (e-mail, rôle, tâches,
                activités) et sur les commandes au nom de ce commercial.
              </DialogDescription>
              <div className="flex flex-wrap gap-2 pt-0.5">
                <Badge
                  variant="outline"
                  className="max-w-[min(100%,18rem)] gap-1.5 truncate border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50"
                  title={sheetData.emailDisplay}
                >
                  <Mail className="h-3 w-3 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{sheetData.emailDisplay}</span>
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50">
                  <MapPin className="h-3 w-3 text-primary" aria-hidden />
                  {rep.zone}
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50">
                  <Phone className="h-3 w-3 text-primary" aria-hidden />
                  {rep.phone}
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-primary/25 bg-background/80 py-1 pl-2 pr-2.5 font-normal dark:bg-background/50">
                  <ListTodo className="h-3 w-3 text-primary" aria-hidden />
                  {sheetData.tachesCount} tâche(s)
                </Badge>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/80 px-2.5 py-1 text-[10px] font-mono dark:bg-background/50"
                  style={{
                    backgroundColor: `${sheetData.accentHex}35`,
                    borderColor: `${sheetData.accentHex}70`,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm border border-black/15"
                    style={{ backgroundColor: sheetData.accentHex }}
                    aria-hidden
                  />
                  {sheetData.accentHex}
                </span>
              </div>
              <p className="line-clamp-2 pt-1 text-xs leading-snug text-muted-foreground" title={sheetData.activitesLine}>
                <Activity className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom text-primary/80" aria-hidden />
                {sheetData.activitesLine}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={perfSheetTab}
          onValueChange={(v) => setPerfSheetTab(v as PerfSheetTab)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="shrink-0 border-b border-border/60 bg-muted/15 px-5 py-3 dark:bg-muted/10 sm:px-6">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/50 p-1 dark:bg-muted/30">
              <TabsTrigger value="synthese" className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm">
                <Target className="h-3.5 w-3.5 shrink-0 opacity-70" />
                Synthèse
              </TabsTrigger>
              <TabsTrigger value="evolution" className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm">
                <BarChart3 className="h-3.5 w-3.5 shrink-0 opacity-70" />
                Évolution
              </TabsTrigger>
              <TabsTrigger value="portefeuille" className="gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm">
                <Users className="h-3.5 w-3.5 shrink-0 opacity-70" />
                Portefeuille
                {sheetData.clients.length > 0 && (
                  <Badge variant="secondary" className="ml-0.5 h-5 min-w-[1.25rem] px-1.5 text-[10px]">
                    {sheetData.clients.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <TabsContent value="synthese" className="m-0 space-y-6 pb-2 focus-visible:outline-none">
            <Card className="border-primary/15 bg-muted/20 dark:bg-muted/10">
              <CardHeader className="space-y-1 pb-2 pt-4">
                <CardTitle className="text-sm font-semibold">Fiche & terrain</CardTitle>
                <CardDescription className="text-xs">
                  Rappel des champs visibles dans le tableau équipe (hors indicateurs financiers).
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 pb-4 pt-0 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${sheetData.emailDisplay}`}
                    className="mt-1 block truncate text-sm text-primary underline-offset-2 hover:underline"
                  >
                    {sheetData.emailDisplay}
                  </a>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Rôle</p>
                  <p className="mt-1 text-sm font-medium">{sheetData.roleLabel}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tâches en cours</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold tabular-nums">
                    <ListTodo className="h-4 w-4 text-primary opacity-80" aria-hidden />
                    {sheetData.tachesCount}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Couleur</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-mono">
                    <span
                      className="h-4 w-4 shrink-0 rounded border border-black/15"
                      style={{ backgroundColor: sheetData.accentHex }}
                      aria-hidden
                    />
                    {sheetData.accentHex}
                  </p>
                </div>
                <div className="sm:col-span-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Activités commerciales
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground">{sheetData.activitesLine}</p>
                </div>
              </CardContent>
            </Card>

            {/* KPIs — cartes à hauteur / largeur homogènes dans la grille */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-3 [&>*]:min-h-0">
              <motion.div
                className="flex h-full min-h-[7.5rem]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Card className="flex h-full w-full min-h-[7.5rem] flex-col border-primary/15 shadow-sm">
                  <CardContent className="flex h-full flex-1 flex-col justify-between gap-2 p-4 pt-4">
                    <div className="flex min-h-[2.25rem] items-start justify-between gap-2">
                      <span className="line-clamp-2 text-[11px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
                        Ventes cumulées
                      </span>
                      <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary opacity-80" aria-hidden />
                    </div>
                    <p className="min-h-[1.75rem] text-base font-semibold tabular-nums leading-tight sm:text-lg">{fmtCfa(sheetData.ventesTotal)}</p>
                    <p className="min-h-[2rem] text-[10px] leading-snug text-muted-foreground">Hors commandes annulées</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                className="flex h-full min-h-[7.5rem]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="flex h-full w-full min-h-[7.5rem] flex-col border-primary/15 shadow-sm">
                  <CardContent className="flex h-full flex-1 flex-col justify-between gap-2 p-4 pt-4">
                    <div className="flex min-h-[2.25rem] items-start justify-between gap-2">
                      <span className="line-clamp-2 text-[11px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
                        Objectif
                      </span>
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary opacity-80" aria-hidden />
                    </div>
                    <p className="min-h-[1.75rem] text-base font-semibold tabular-nums leading-tight sm:text-lg">{fmtCfa(objectif)}</p>
                    <p className="min-h-[2rem] text-[10px] leading-snug text-muted-foreground">Référence annuelle (démo)</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                className="flex h-full min-h-[7.5rem]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="flex h-full w-full min-h-[7.5rem] flex-col border-primary/15 shadow-sm">
                  <CardContent className="flex h-full flex-1 flex-col justify-between gap-2 p-4 pt-4">
                    <div className="flex min-h-[2.25rem] items-start justify-between gap-2">
                      <span className="line-clamp-2 text-[11px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
                        Portefeuille
                      </span>
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary opacity-80" aria-hidden />
                    </div>
                    <p className="min-h-[1.75rem] text-base font-semibold tabular-nums leading-tight sm:text-lg">{sheetData.clients.length}</p>
                    <p className="min-h-[2rem] text-[10px] leading-snug text-muted-foreground">Clients rattachés</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                className="flex h-full min-h-[7.5rem]"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="flex h-full w-full min-h-[7.5rem] flex-col border-primary/15 shadow-sm">
                  <CardContent className="flex h-full flex-1 flex-col justify-between gap-2 p-4 pt-4">
                    <div className="flex min-h-[2.25rem] items-start justify-between gap-2">
                      <span className="line-clamp-2 text-[11px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">
                        Commandes
                      </span>
                      <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary opacity-80" aria-hidden />
                    </div>
                    <p className="min-h-[1.75rem] text-base font-semibold tabular-nums leading-tight sm:text-lg">{sheetData.nbCommandesActives}</p>
                    <p className="min-h-[2rem] text-[10px] leading-snug text-muted-foreground">Total enregistrées (actives)</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progression objectif + tendance */}
            <Card className="border-primary/15 bg-muted/20 dark:bg-muted/10">
              <CardHeader className="space-y-3 pb-2 pt-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Progression vers l&apos;objectif</CardTitle>
                    <CardDescription className="text-xs">
                      {depasse ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Sparkles className="h-3.5 w-3.5" />
                          Objectif atteint — continuez ainsi !
                        </span>
                      ) : (
                        `${pctObjectif} % de l’objectif annuel réalisé à ce jour`
                      )}
                    </CardDescription>
                  </div>
                  {sheetData.trendPct !== null && (
                    <Badge
                      variant="secondary"
                      className={
                        sheetData.trendPct >= 0
                          ? 'gap-1 border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'gap-1 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                      }
                    >
                      {sheetData.trendPct >= 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {sheetData.trendPct >= 0 ? '+' : ''}
                      {sheetData.trendPct}% vs trim. précédent
                    </Badge>
                  )}
                </div>
                <Progress value={depasse ? 100 : pctObjectif} className="h-2.5 bg-primary/10" />
                {!depasse && objectif > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    Reste à réaliser :{' '}
                    <span className="font-medium text-foreground">
                      {fmtCfa(Math.max(0, objectif - sheetData.ventesTotal))}
                    </span>
                  </p>
                )}
              </CardHeader>
            </Card>
            </TabsContent>

            <TabsContent value="evolution" className="m-0 space-y-6 pb-2 focus-visible:outline-none">
            {/* Graphique */}
            <section aria-labelledby="perf-chart-title" className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 id="perf-chart-title" className="flex items-center gap-2 text-sm font-semibold">
                    <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
                    Évolution des ventes
                  </h3>
                  <p className="text-xs text-muted-foreground">Montants hors annulations, par mois</p>
                </div>
                <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setChartMonths(6)}
                    className={`rounded-md px-2.5 py-1 transition-colors ${chartMonths === 6 ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    6 mois
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMonths(12)}
                    className={`rounded-md px-2.5 py-1 transition-colors ${chartMonths === 12 ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    12 mois
                  </button>
                </div>
              </div>
              <Card className="border-primary/15">
                <CardContent className="p-3 pt-4 sm:p-4">
                  <div className="min-h-[200px] w-full sm:min-h-[240px]">
                    <ChartContainer config={{ montant: { label: 'FCFA', color: BRAND_GREEN } }} className="aspect-auto h-[220px] w-full sm:h-[260px]">
                      <BarChart data={monthlyChart} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/80" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickMargin={8} />
                        <YAxis
                          width={40}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => (Number(v) >= 1_000_000 ? `${(Number(v) / 1_000_000).toFixed(1)}M` : `${(Number(v) / 1000).toFixed(0)}k`)}
                        />
                        <ChartTooltip
                          content={<ChartTooltipContent formatter={(v) => fmtCfa(Number(v))} />}
                        />
                        <Bar dataKey="montant" radius={[6, 6, 0, 0]} maxBarSize={40}>
                          {monthlyChart.map((_, i) => (
                            <Cell
                              key={i}
                              fill={i === monthlyChart.length - 1 ? BRAND_GREEN : BRAND_GREEN_SOFT}
                              fillOpacity={i === monthlyChart.length - 1 ? 1 : 0.72}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Détail mensuel */}
            <section aria-labelledby="perf-table-title" className="space-y-3">
              <h3 id="perf-table-title" className="text-sm font-semibold">Détail par mois</h3>
              <div className="overflow-hidden rounded-xl border border-primary/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-primary/10 bg-muted/40 hover:bg-muted/40">
                      <TableHead className="h-10 text-xs font-semibold">Période</TableHead>
                      <TableHead className="h-10 text-right text-xs font-semibold">CA (hors annulées)</TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold">Commandes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdown.map((row) => {
                      const isBest = row.key === sheetData.bestMonthKey && row.montant > 0
                      return (
                        <TableRow
                          key={row.key}
                          className={isBest ? 'bg-primary/[0.06] dark:bg-primary/10' : undefined}
                        >
                          <TableCell className="py-2.5">
                            <span className="text-sm font-medium capitalize">{row.month}</span>
                            {isBest && (
                              <Badge className="ml-2 align-middle text-[9px] font-normal" variant="secondary">
                                Pic
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 text-right text-sm tabular-nums font-medium">{fmtCfa(row.montant)}</TableCell>
                          <TableCell className="py-2.5 text-center text-sm tabular-nums text-muted-foreground">{row.n}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </section>
            </TabsContent>

            <TabsContent value="portefeuille" className="m-0 space-y-4 pb-2 focus-visible:outline-none">
              <div className="rounded-xl border border-primary/15 bg-primary/[0.06] p-4 dark:bg-primary/10">
                <p className="text-sm font-medium text-foreground">Clients rattachés</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Liste des fiches dont le champ « Commercial » correspond à ce nom — aligné sur le module Clients.
                </p>
              </div>
              {sheetData.clients.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  Aucun client n’a ce commercial dans le champ « Commercial » sur sa fiche. Mettez à jour les fiches dans le module Clients.
                </p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {sheetData.clients.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-primary/10 bg-card px-3 py-2.5 shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/[0.03]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary dark:bg-primary/20">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">ID {c.id}</span>
                        <p className="truncate text-sm font-medium">{c.name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="shrink-0 border-t border-border/80 bg-muted/25 px-5 py-3 sm:px-6 sm:py-4">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
  )
}
