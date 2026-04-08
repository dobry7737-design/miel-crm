"use client"

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, subMonths, startOfMonth, isAfter, isBefore, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  BarChart3,
  CalendarRange,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  UserCircle2,
  Wallet,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { CRM_DATA_CHANGED_EVENT, getCommandes, getClientRegion, type Client, type Commande } from '@/lib/crm-data'
import { COMMANDE_STATUT_LABEL } from '@/lib/permissions'
import { BRAND_GREEN, BRAND_GREEN_SOFT } from '@/lib/chart-colors'

function fmtCfa(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const statusBadge: Record<string, string> = {
  EN_ATTENTE: 'bg-chart-2/15 text-foreground border-chart-2/40',
  CONFIRMEE: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-800/50',
  LIVREE: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/50',
  ANNULEE: 'bg-destructive/10 text-destructive border-destructive/30',
}

const ease = [0.16, 1, 0.3, 1] as const

interface ClientHistoryViewProps {
  client: Client
}

function StatCard({
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
  icon: React.ElementType
  accent: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay }}
    >
      <Card className="group relative overflow-hidden border-primary/12 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 dark:border-primary/20">
        <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent} opacity-90 transition-all group-hover:h-1`} />
        <CardContent className="p-4 pt-5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl">{value}</p>
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

export function ClientHistoryView({ client }: ClientHistoryViewProps) {
  const [monthsWindow, setMonthsWindow] = useState<'6' | '12'>('6')
  const [version, setVersion] = useState(0)
  const region = getClientRegion(client)

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const { commandesFiltrees, monthlySeries, stats } = useMemo(() => {
    const now = new Date()
    const start = subMonths(now, monthsWindow === '6' ? 5 : 11)
    const startM = startOfMonth(start)
    const all = getCommandes().filter((c) => c.client === client.name)
    const filtrees = all.filter((c) => {
      const d = new Date(c.date)
      return !isBefore(d, startM) && !isAfter(d, endOfMonth(now))
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const months: Date[] = []
    const n = monthsWindow === '6' ? 6 : 12
    for (let i = 0; i < n; i++) {
      months.push(subMonths(startOfMonth(now), n - 1 - i))
    }
    const monthlySeries = months.map((d) => {
      const label = format(d, 'MMM', { locale: fr })
      const montant = filtrees
        .filter((c) => {
          const cd = new Date(c.date)
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear() && c.statut !== 'ANNULEE'
        })
        .reduce((s, c) => s + c.montant, 0)
      return { month: label, montant }
    })

    const nonAnn = filtrees.filter((c) => c.statut !== 'ANNULEE')
    const total = nonAnn.reduce((s, c) => s + c.montant, 0)
    const count = filtrees.length
    const monthsSpan = monthsWindow === '6' ? 6 : 12
    const freq = monthsSpan > 0 ? count / monthsSpan : 0
    const panier = nonAnn.length > 0 ? total / nonAnn.length : 0

    return {
      commandesFiltrees: filtrees,
      monthlySeries,
      stats: { count, total, freq, panier },
    }
  }, [client.name, monthsWindow, version])

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col gap-6 md:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <Card className="overflow-hidden border-primary/15 shadow-md shadow-black/[0.04] dark:border-primary/25 dark:shadow-black/20">
          <div className="relative">
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl dark:bg-emerald-600/20"
              aria-hidden
            />
            <CardContent className="relative p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
                  <Avatar className="h-16 w-16 shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background sm:h-20 sm:w-20">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-700 text-lg font-bold text-primary-foreground sm:text-xl">
                      {initials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                        Historique des commandes
                      </p>
                      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {client.name}
                      </h1>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        Synthèse des achats sur la période choisie. Totaux et panier moyen hors commandes annulées.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {client.phone && (
                        <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 font-normal">
                          <Phone className="h-3 w-3 opacity-70" aria-hidden />
                          {client.phone}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 font-normal">
                        <MapPin className="h-3 w-3 opacity-70" aria-hidden />
                        {region}
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 rounded-full border-primary/25 bg-primary/5 px-3 py-1 font-normal text-foreground">
                        <UserCircle2 className="h-3 w-3 text-primary" aria-hidden />
                        {client.commercial}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm dark:bg-background/40 lg:w-48">
                  <Label htmlFor="hist-period" className="text-xs font-medium text-muted-foreground">
                    Fenêtre d’analyse
                  </Label>
                  <Select value={monthsWindow} onValueChange={(v) => setMonthsWindow(v as '6' | '12')}>
                    <SelectTrigger id="hist-period" className="h-10 w-full">
                      <CalendarRange className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 derniers mois</SelectItem>
                      <SelectItem value="12">12 derniers mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Commandes"
          value={String(stats.count)}
          sub="sur la période"
          icon={Package}
          accent="from-violet-500 to-purple-600"
          delay={0.06}
        />
        <StatCard
          label="Total achats"
          value={stats.count === 0 ? '—' : fmtCfa(stats.total)}
          sub="hors annulées"
          icon={Wallet}
          accent="from-primary to-emerald-600"
          delay={0.1}
        />
        <StatCard
          label="Fréquence"
          value={`${stats.freq.toFixed(1)} / mois`}
          sub="commandes en moyenne"
          icon={BarChart3}
          accent="from-sky-500 to-blue-600"
          delay={0.14}
        />
        <StatCard
          label="Panier moyen"
          value={stats.count === 0 ? '—' : fmtCfa(stats.panier)}
          sub="par commande"
          icon={ShoppingCart}
          accent="from-amber-500 to-orange-600"
          delay={0.18}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.15 }}
      >
        <Card className="border-primary/12 dark:border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Évolution des montants</CardTitle>
                <CardDescription>Ventes réalisées par mois (hors annulées)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-2 dark:bg-muted/10">
              <ChartContainer
                config={{ montant: { label: 'FCFA', color: BRAND_GREEN } }}
                className="h-[220px] w-full min-w-0 sm:h-[260px]"
              >
                <BarChart data={monthlySeries} margin={{ top: 12, right: 12, left: 4, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="montant" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {monthlySeries.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === monthlySeries.length - 1 ? BRAND_GREEN : BRAND_GREEN_SOFT}
                        fillOpacity={i === monthlySeries.length - 1 ? 1 : 0.72}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.2 }}
      >
        <Card className="border-primary/12 dark:border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Détail des commandes</CardTitle>
            <CardDescription>Liste chronologique (plus récent en premier)</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {commandesFiltrees.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 ring-1 ring-border">
                  <Package className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <div>
                  <p className="font-medium text-foreground">Aucune commande sur cette période</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Changez la fenêtre d’analyse ou consultez une autre période.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[min(28rem,55vh)] min-w-0 overflow-auto md:max-h-[36rem]">
                <div className="min-w-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                      <TableHead className="sticky top-0 z-10 bg-card text-xs font-semibold">Date</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card text-right text-xs font-semibold">Montant</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-card text-xs font-semibold">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commandesFiltrees.map((c: Commande) => (
                      <TableRow
                        key={c.id}
                        className="border-border/50 transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/10"
                      >
                        <TableCell className="whitespace-nowrap text-sm font-medium">
                          {format(new Date(c.date), 'd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold tabular-nums">{fmtCfa(c.montant)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`rounded-md text-[11px] font-medium ${statusBadge[c.statut] || ''}`}>
                            {COMMANDE_STATUT_LABEL[c.statut] || c.statut}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
