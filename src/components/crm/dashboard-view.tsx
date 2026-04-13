"use client"

import { memo, useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  DollarSign, Users, ShoppingCart, Clock,
  TrendingUp, TrendingDown, Package, ArrowUpRight,
  UserPlus, Plus, BarChart3, Hexagon, Sun, Moon,
  CheckCircle2, XCircle, Truck, AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  CRM_DATA_CHANGED_EVENT,
  getDashboardStats,
  getNotifications,
  type Notification,
} from '@/lib/crm-data'
import { STATUS_PIE_FILL } from '@/lib/chart-colors'
import { COMMANDE_STATUT_LABEL } from '@/lib/permissions'
import { formatNotificationDates } from '@/lib/notification-display'
import type { AppView } from '@/lib/crm-routes'
import { canAccessCrmView } from '@/lib/crm-routes'
import { getRoleLabel } from '@/lib/demo-users'
import { OrderAlertsContactBar } from '@/components/crm/order-alerts-contact-bar'

const DashboardCharts = dynamic(() => import('./dashboard-charts'), {
  ssr: false,
  loading: () => (
    <div className="grid min-w-0 gap-6 lg:grid-cols-3">
      <Card className="min-w-0 lg:col-span-2 border-primary/15 dark:border-primary/25">
        <CardContent className="pt-6">
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </CardContent>
      </Card>
      <Card className="min-w-0 border-primary/15 dark:border-primary/25">
        <CardContent className="pt-6">
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  ),
})

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA' }

const statusLabel: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Validée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
}
const statusColor: Record<string, string> = {
  EN_ATTENTE: 'bg-chart-2/20 text-foreground border-chart-2/45 dark:bg-chart-2/15 dark:border-chart-2/40',
  CONFIRMEE: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  LIVREE: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800',
  ANNULEE: 'bg-destructive/15 text-destructive border-destructive/35 dark:bg-destructive/20 dark:text-red-300 dark:border-red-800',
}

// ========== Animated Counter ==========
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(2, -10 * progress)
      if (progress < 1) {
        setDisplay(Math.round(eased * value))
        rafIdRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value)
        rafIdRef.current = null
      }
    }
    rafIdRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [value, duration])

  return <>{display.toLocaleString('fr-FR')}</>
}

// ========== KPI Card ==========
const KpiCard = memo(function KpiCard({ label, rawValue, icon: Icon, grad, bg, clr, trend, delay }: {
  label: string
  rawValue: number
  icon: React.ElementType
  grad: string
  bg: string
  clr: string
  trend: number | null
  delay: number
}) {
  const isCurrency = rawValue > 1000
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="border-primary/15 dark:border-primary/25 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative group">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${grad} transition-all duration-300 group-hover:h-2`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className={`flex items-center justify-center h-10 w-10 rounded-xl ${bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <Icon className={`h-5 w-5 ${clr}`} />
            </div>
            {trend !== null && (
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="font-medium">{trend >= 0 ? '+' : ''}{trend}%</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            {isCurrency ? (
              <p className="text-2xl font-bold tracking-tight">
                <AnimatedNumber value={rawValue} /> <span className="text-sm font-normal text-muted-foreground">FCFA</span>
              </p>
            ) : (
              <p className="text-2xl font-bold tracking-tight">
                <AnimatedNumber value={rawValue} />
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

// ========== Welcome Banner ==========
function getGreeting(): { text: string; icon: React.ElementType } {
  const hour = new Date().getHours()
  if (hour < 6) return { text: 'Bonne nuit', icon: Moon }
  if (hour < 12) return { text: 'Bonjour', icon: Sun }
  if (hour < 18) return { text: 'Bon après-midi', icon: Sun }
  return { text: 'Bonsoir', icon: Moon }
}

const WELCOME_QUICK_ACTIONS: { label: string; icon: React.ElementType; view: AppView; color: string; autoOpen?: string }[] = [
  { label: 'Nouveau client', icon: UserPlus, view: 'clients', color: 'bg-emerald-500 hover:bg-emerald-600', autoOpen: 'client' },
  { label: 'Nouvelle commande', icon: Plus, view: 'commandes', color: 'bg-primary hover:bg-primary/90', autoOpen: 'commande' },
  { label: 'Voir rapports', icon: BarChart3, view: 'rapports', color: 'bg-violet-500 hover:bg-violet-600' },
]

const WelcomeBanner = memo(function WelcomeBanner({
  userName,
  userRole,
  onNavigate,
}: {
  userName: string
  userRole: string
  onNavigate?: (view: AppView) => void
}) {
  const { text, icon: GreetingIcon } = getGreeting()
  const todayStr = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-emerald-600 to-emerald-800 p-5 md:p-6 text-primary-foreground">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -right-4 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-white/5" />
          <Hexagon className="absolute top-3 right-6 w-24 h-24 text-white/10" />
          <Hexagon className="absolute -bottom-4 right-20 w-16 h-16 text-white/10" />
          <div className="absolute inset-0 honeycomb-pattern" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Bonjour, {userName}
              </h2>
              <p className="text-sm text-primary-foreground/90 mt-2 flex flex-wrap items-center gap-2">
                <GreetingIcon className="h-4 w-4 shrink-0 opacity-90" />
                <span>{text}</span>
                <span className="opacity-60">·</span>
                <span className="capitalize">{todayStr}</span>
              </p>
              {(userRole === 'DG' || userRole === 'ADMIN') && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Badge className="mt-2 bg-white/20 text-white border-white/30 text-[10px] hover:bg-white/30">
                    {userRole === 'ADMIN' ? 'Vue Administrateur — accès complet' : 'Vue Directeur — accès complet'}
                  </Badge>
                </motion.div>
              )}
              {userRole === 'COMMERCIAL' && (
                <Badge className="mt-2 bg-white/20 text-white border-white/30 text-[10px]">
                  {getRoleLabel('COMMERCIAL')} — KPIs de votre portefeuille
                </Badge>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {WELCOME_QUICK_ACTIONS.filter(
                (action) => canAccessCrmView(userRole || undefined, action.view),
              ).map((action) => (
                <Button
                  key={action.label}
                  size="sm"
                  className={`${action.color} text-white shadow-lg shadow-black/10 transition-all hover:shadow-xl hover:-translate-y-0.5`}
                  onClick={() => {
                    if (action.autoOpen) sessionStorage.setItem('fab-auto-open-dialog', action.autoOpen)
                    onNavigate?.(action.view)
                  }}
                >
                  <action.icon className="h-4 w-4 mr-1.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ========== Activity Timeline ==========
const ActivityTimeline = memo(function ActivityTimeline({
  notifications,
  onNavigate,
}: {
  notifications: Notification[]
  onNavigate?: (view: AppView) => void
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-chart-2" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Truck className="h-4 w-4 text-blue-500" />
    }
  }

  if (notifications.length === 0) return null

  return (
    <Card className="border-primary/15 dark:border-primary/25">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-emerald-600" />
            <CardTitle className="text-base font-semibold">Activité récente</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => onNavigate?.('profil')}>
            Voir tout <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          {notifications.map((n, i) => {
            const { primary, secondary } = formatNotificationDates(n.date)
            return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 30 }}
              className="relative flex items-start gap-3 py-2.5"
            >
              <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                {getIcon(n.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!n.read ? 'font-semibold' : 'text-muted-foreground'}`}>{n.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
              </div>
              <div className="mt-0.5 flex max-w-[min(42%,11rem)] shrink-0 flex-col gap-0.5 text-right">
                <span className="text-[10px] font-medium tabular-nums text-foreground">{primary}</span>
                <span className="text-[9px] leading-tight text-muted-foreground">{secondary}</span>
              </div>
            </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
})

// ========== Commercial Performance Card (DG only) ==========
const RANK_MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = [
  'border-primary/50 bg-primary/8 dark:bg-primary/15',
  'border-slate-300 bg-slate-50/50 dark:bg-slate-900/10',
  'border-chart-5/45 bg-chart-5/10 dark:bg-chart-5/15',
]

const CommercialCard = memo(function CommercialCard({ commercial, rank, maxVentes, delay }: {
  commercial: { id: string; name: string; clients: number; commandes: number; ventes: number }
  rank: number
  maxVentes: number
  delay: number
}) {
  const pct = maxVentes > 0 ? Math.round((commercial.ventes / maxVentes) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`p-4 rounded-xl border hover:shadow-md transition-all duration-300 ${rank < 3 ? RANK_COLORS[rank] : 'border-border bg-muted/20 hover:bg-muted/40'}`}
    >
      <div className="flex items-center gap-2 mb-3">
        {rank < 3 ? (
          <span className="text-xl leading-none">{RANK_MEDALS[rank]}</span>
        ) : (
          <span className="text-xs font-bold text-muted-foreground w-6 text-center">#{rank + 1}</span>
        )}
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/15 to-emerald-100 dark:from-primary/25 dark:to-emerald-950/40 flex items-center justify-center">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{commercial.name}</p>
          <p className="text-[10px] text-muted-foreground">{pct}% du CA total</p>
        </div>
        {rank === 0 && (
          <Badge className="bg-primary/12 text-primary border-primary/25 text-[10px] shrink-0 dark:bg-primary/20 dark:border-primary/35">
            <TrendingUp className="h-3 w-3 mr-0.5" />Top vendeur
          </Badge>
        )}
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-600"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-background/50">
          <p className="text-lg font-bold">{commercial.clients}</p>
          <p className="text-[10px] text-muted-foreground">Clients</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/50">
          <p className="text-lg font-bold">{commercial.commandes}</p>
          <p className="text-[10px] text-muted-foreground">Commandes</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/50">
          <p className="text-lg font-bold text-primary">{(commercial.ventes / 1000000).toFixed(1)}M</p>
          <p className="text-[10px] text-muted-foreground">FCFA</p>
        </div>
      </div>
    </motion.div>
  )
})

interface DashboardProps {
  isAdmin: boolean
  userRole: string
  /** Nom affiché (connexion) dans la bannière d’accueil */
  userName?: string
  /** Nom utilisé pour filtrer KPIs / commandes (portefeuille commercial, y compris simulation DG/Admin) */
  statsUserName?: string
  onNavigate?: (view: AppView) => void
}

export function DashboardView({ isAdmin, userRole, userName, statsUserName, onNavigate }: DashboardProps) {
  const [dataRefreshKey, setDataRefreshKey] = useState(0)
  const canOpenCommandes = useMemo(
    () => canAccessCrmView(userRole || undefined, 'commandes'),
    [userRole],
  )

  useEffect(() => {
    const bump = () => setDataRefreshKey((k) => k + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const statsFilterName = statsUserName ?? userName ?? ''

  const stats = useMemo(
    () => getDashboardStats(userRole, statsFilterName),
    [userRole, statsFilterName, dataRefreshKey],
  )

  const topNotifications = useMemo(() => {
    const all = getNotifications(userRole || undefined, statsFilterName)
    const r = userRole || undefined
    const filtered = !canAccessCrmView(r, 'commandes')
      ? all.filter((n) => n.link !== 'commandes')
      : all
    return filtered.slice(0, 5)
  }, [userRole, dataRefreshKey])

  const pieData = useMemo(
    () =>
      stats.statusCounts
        .filter((s) => s.statut !== 'ANNULEE')
        .map((s) => ({
          name: statusLabel[s.statut] ?? s.statut,
          value: s.count,
          montant: s.montant,
          fill: STATUS_PIE_FILL[s.statut] || '#94a3b8',
        })),
    [stats.statusCounts],
  )

  const trend = useMemo(() => {
    const lastMonth = stats.monthlyData[stats.monthlyData.length - 1]
    const prevMonth = stats.monthlyData[stats.monthlyData.length - 2]
    return lastMonth && prevMonth && prevMonth.montant > 0
      ? Math.round(((lastMonth.montant - prevMonth.montant) / prevMonth.montant) * 100)
      : 0
  }, [stats.monthlyData])

  const { sortedCommercials, maxVentes } = useMemo(() => {
    const sorted = [...stats.commercials].sort((a, b) => b.ventes - a.ventes)
    return {
      sortedCommercials: sorted,
      maxVentes: sorted.length > 0 ? sorted[0].ventes : 1,
    }
  }, [stats.commercials])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 space-y-6 p-4 md:p-6">
      <WelcomeBanner
        userName={userName || ''}
        userRole={userRole}
        onNavigate={onNavigate}
      />

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Ventes" rawValue={stats.totalVentes} icon={DollarSign} grad="from-primary to-emerald-600" bg="bg-primary/10 dark:bg-primary/20" clr="text-primary" trend={trend} delay={0} />
        <KpiCard label="Clients" rawValue={stats.totalClients} icon={Users} grad="from-emerald-500 to-teal-500" bg="bg-emerald-100" clr="text-emerald-600" trend={null} delay={0.08} />
        <KpiCard label="Commandes" rawValue={stats.totalCommandes} icon={ShoppingCart} grad="from-violet-500 to-purple-500" bg="bg-violet-100" clr="text-violet-600" trend={null} delay={0.16} />
        <KpiCard label="En Attente" rawValue={stats.pendingOrders} icon={Clock} grad="from-chart-2 to-yellow-600" bg="bg-chart-2/15 dark:bg-chart-2/20" clr="text-foreground dark:text-chart-2" trend={null} delay={0.24} />
      </div>

      <DashboardCharts monthlyData={stats.monthlyData} pieData={pieData} />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <ActivityTimeline notifications={topNotifications} onNavigate={onNavigate} />

        <Card className="border-primary/15 dark:border-primary/25">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-emerald-600" />
                <CardTitle className="text-base font-semibold">Commandes récentes</CardTitle>
              </div>
              {canOpenCommandes && (
                <Button variant="outline" size="sm" className="text-xs" onClick={() => onNavigate?.('commandes')}>
                  Voir tout <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
              {stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/25 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm">Aucune commande récente</p>
                  <p className="text-xs text-muted-foreground">Les nouvelles commandes apparaîtront ici</p>
                </div>
              ) : stats.recentOrders.map((o, i) => (
                <motion.div key={o.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-2.5 rounded-xl bg-muted/30 transition-colors ${canOpenCommandes ? 'hover:bg-muted/50 cursor-pointer' : ''}`}
                  onClick={canOpenCommandes ? () => onNavigate?.('commandes') : undefined}
                  role={canOpenCommandes ? 'button' : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex-shrink-0">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{o.client}</p>
                      <p className="text-xs text-muted-foreground">{format(o.date, 'dd MMM', { locale: fr })} — {o.qty} unités</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold">{fmt(o.montant)}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[o.statut] || ''}`}>{COMMANDE_STATUT_LABEL[o.statut] || statusLabel[o.statut] || o.statut}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {canOpenCommandes && (
        <OrderAlertsContactBar label="Contact pour les commandes (e-mail) :" />
      )}

      {isAdmin && stats.commercials.length > 0 && (
        <Card className="border-primary/15 dark:border-primary/25">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-emerald-600" />
                <CardTitle className="text-base font-semibold">Performance des commerciaux</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => onNavigate?.('commandes')}>
                Voir tout <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedCommercials.map((c, i) => (
                <CommercialCard key={c.id} commercial={c} rank={i} maxVentes={maxVentes} delay={0.1 + i * 0.08} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
