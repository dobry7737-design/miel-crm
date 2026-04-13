"use client"

import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { format, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  DollarSign, Package, Users, ShoppingCart,
  BarChart3, Target, Award, Download, Crown, FileSpreadsheet, Printer,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie, CartesianGrid,
} from 'recharts'
import {
  getClients, getCommandes, getRegions, getUniqueCommercialNames, getClientRegion,
} from '@/lib/crm-data'
import { STATUS_PIE_FILL, BRAND_GREEN, BRAND_GREEN_SOFT } from '@/lib/chart-colors'
import { COMMANDE_STATUT_LABEL } from '@/lib/permissions'

function fmt(n: number) { return n.toLocaleString('fr-FR') }
function fmtCfa(n: number) { return fmt(n) + ' FCFA' }

const RANK_STYLES: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'bg-primary/12 dark:bg-primary/25', text: 'text-primary dark:text-primary', border: 'border border-primary/35 dark:border-primary/45' },
  1: { bg: 'bg-slate-100 dark:bg-slate-800/40', text: 'text-slate-600 dark:text-slate-300', border: 'border border-slate-300 dark:border-slate-600' },
  2: { bg: 'bg-chart-5/15 dark:bg-chart-5/25', text: 'text-chart-5 dark:text-chart-5', border: 'border border-chart-5/40 dark:border-chart-5/50' },
}

const COLOR_MAP: Record<string, { gradient: string; bg: string; text: string }> = {
  primary: { gradient: 'bg-gradient-to-r from-primary to-emerald-600', bg: 'bg-primary/10 dark:bg-primary/20', text: 'text-primary' },
  emerald: { gradient: 'bg-gradient-to-r from-emerald-400 to-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  violet: { gradient: 'bg-gradient-to-r from-violet-400 to-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
  green: { gradient: 'bg-gradient-to-r from-green-400 to-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
}

interface RapportsViewProps {
  userRole: string
  userName?: string
  /** DG / Admin uniquement */
  canExportReports?: boolean
  /** Filtres région + commercial (vue globale) */
  canUseGlobalFilters?: boolean
}

export function RapportsView({
  userRole,
  userName,
  canExportReports = true,
  canUseGlobalFilters = true,
}: RapportsViewProps) {
  const [period, setPeriod] = useState('all')
  const [regionFilter, setRegionFilter] = useState('all')
  const [commercialFilter, setCommercialFilter] = useState('all')

  const stats = useMemo(() => {
    const allCommandes = getCommandes()
    const allClients = getClients()
    const now = new Date()
    const fullAccess = userRole === 'DG' || userRole === 'ADMIN'

    let scoped = allCommandes

    if (period !== 'all') {
      const monthsBack = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12
      const start = subMonths(now, monthsBack)
      scoped = scoped.filter((c) => new Date(c.date) >= start)
    }

    if (canUseGlobalFilters && regionFilter !== 'all') {
      const names = new Set(
        allClients.filter((cl) => getClientRegion(cl) === regionFilter).map((cl) => cl.name),
      )
      scoped = scoped.filter((c) => names.has(c.client))
    }

    if (canUseGlobalFilters && commercialFilter !== 'all') {
      scoped = scoped.filter((c) => c.commercial === commercialFilter)
    }

    const userCommandes = fullAccess ? scoped : scoped.filter((c) => c.commercial === userName)
    const activeCommandes = userCommandes.filter((c) => c.statut !== 'ANNULEE')

    const totalVentes = activeCommandes.reduce((s, c) => s + c.montant, 0)
    const avgCommande = activeCommandes.length > 0 ? totalVentes / activeCommandes.length : 0
    const totalQty = activeCommandes.reduce((s, c) => s + c.qty, 0)
    const tauxLivraison = userCommandes.length > 0 ? (userCommandes.filter((c) => c.statut === 'LIVREE').length / userCommandes.length) * 100 : 0
    const tauxAnnulation = userCommandes.length > 0 ? (userCommandes.filter((c) => c.statut === 'ANNULEE').length / userCommandes.length) * 100 : 0

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i)
      const monthCmds = userCommandes.filter((c) => {
        const cd = new Date(c.date)
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()
      })
      return {
        month: format(d, 'MMM', { locale: fr }),
        montant: monthCmds.filter((c) => c.statut !== 'ANNULEE').reduce((s, c) => s + c.montant, 0),
        commandes: monthCmds.length,
      }
    })

    const statusData = [
      { name: COMMANDE_STATUT_LABEL.EN_ATTENTE, value: userCommandes.filter((c) => c.statut === 'EN_ATTENTE').length, fill: STATUS_PIE_FILL.EN_ATTENTE },
      { name: COMMANDE_STATUT_LABEL.CONFIRMEE, value: userCommandes.filter((c) => c.statut === 'CONFIRMEE').length, fill: STATUS_PIE_FILL.CONFIRMEE },
      { name: COMMANDE_STATUT_LABEL.LIVREE, value: userCommandes.filter((c) => c.statut === 'LIVREE').length, fill: STATUS_PIE_FILL.LIVREE },
      { name: COMMANDE_STATUT_LABEL.ANNULEE, value: userCommandes.filter((c) => c.statut === 'ANNULEE').length, fill: STATUS_PIE_FILL.ANNULEE },
    ].filter((s) => s.value > 0)

    const clientRevenue = new Map<string, number>()
    activeCommandes.forEach((c) => {
      clientRevenue.set(c.client, (clientRevenue.get(c.client) || 0) + c.montant)
    })
    const topClients = [...clientRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, montant]) => ({ name, montant }))

    const commercialPerf = fullAccess
      ? getUniqueCommercialNames()
          .map((name) => {
            const cCmds = userCommandes.filter((c) => c.commercial === name)
            const active = cCmds.filter((c) => c.statut !== 'ANNULEE')
            return {
              name,
              ventes: active.reduce((s, c) => s + c.montant, 0),
              commandes: cCmds.length,
              livrees: cCmds.filter((c) => c.statut === 'LIVREE').length,
              annulees: cCmds.filter((c) => c.statut === 'ANNULEE').length,
              avgMontant: active.length > 0 ? active.reduce((s, c) => s + c.montant, 0) / active.length : 0,
            }
          })
          .filter((c) => c.commandes > 0)
      : []

    const priceRanges = [
      { range: '< 4 000', min: 0, max: 4000 },
      { range: '4 000-5 000', min: 4000, max: 5000 },
      { range: '5 000-6 000', min: 5000, max: 6000 },
      { range: '> 6 000', min: 6000, max: Infinity },
    ].map((r) => ({
      range: r.range,
      count: activeCommandes.filter((c) => c.prix >= r.min && c.prix < r.max).length,
    }))

    return {
      totalVentes, avgCommande, totalQty, tauxLivraison, tauxAnnulation,
      commandes: userCommandes, activeCommandes, clientCount: allClients.length,
      monthlyData, statusData, topClients, commercialPerf, priceRanges,
    }
  }, [period, regionFilter, commercialFilter, userRole, userName, canUseGlobalFilters])

  const periodSummaryLabel = useMemo(() => {
    if (period === 'all') return 'Toutes périodes'
    if (period === '1m') return '1 mois'
    if (period === '3m') return '3 mois'
    if (period === '6m') return '6 mois'
    return '12 mois'
  }, [period])

  const filterSummary = useMemo(() => {
    const parts: string[] = []
    parts.push(periodSummaryLabel)
    if (canUseGlobalFilters && regionFilter !== 'all') parts.push(`Région : ${regionFilter}`)
    if (canUseGlobalFilters && commercialFilter !== 'all') parts.push(`Commercial : ${commercialFilter}`)
    return parts.join(' · ')
  }, [periodSummaryLabel, regionFilter, commercialFilter, canUseGlobalFilters])

  const buildExportLines = useCallback(() => {
    const lines: string[] = []
    lines.push('RAPPORT FERME AGRI BIO')
    lines.push(`Filtres: ${filterSummary}`)
    lines.push(`Date export: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`)
    lines.push('')
    lines.push('RÉSUMÉ')
    lines.push(`Chiffre d'affaires,${fmtCfa(stats.totalVentes)}`)
    lines.push(`Panier moyen,${fmtCfa(stats.avgCommande)}`)
    lines.push(`Quantité totale,${fmt(stats.totalQty)} pots`)
    lines.push(`Taux livraison,${stats.tauxLivraison.toFixed(0)}%`)
    lines.push(`Taux annulation,${stats.tauxAnnulation.toFixed(0)}%`)
    lines.push('')
    if (stats.topClients.length > 0) {
      lines.push('TOP CLIENTS')
      lines.push('Client,Chiffre d\'affaires,% du total')
      stats.topClients.forEach((c) => {
        const pctOfTotal = stats.totalVentes > 0 ? ((c.montant / stats.totalVentes) * 100).toFixed(1) : '0'
        lines.push(`"${c.name}",${fmtCfa(c.montant)},${pctOfTotal}%`)
      })
      lines.push('')
      if (stats.commercialPerf.length > 0) {
        lines.push('PERFORMANCE COMMERCIAUX')
        lines.push('Commercial,Ventes,Livrées/Total,Panier moyen')
        stats.commercialPerf.forEach((c) => {
          lines.push(`"${c.name}",${fmtCfa(c.ventes)},${c.livrees}/${c.commandes},${fmtCfa(c.avgMontant)}`)
        })
      }
    }
    return lines
  }, [filterSummary, stats])

  const handleExportReport = useCallback(() => {
    const csv = '\uFEFF' + buildExportLines().join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport_ferme_agri_bio_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [buildExportLines])

  const handleExportExcel = useCallback(() => {
    const csv = '\uFEFF' + buildExportLines().join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport_ferme_agri_bio_${format(new Date(), 'yyyy-MM-dd')}_excel.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [buildExportLines])

  const handlePrintPdf = useCallback(() => {
    window.print()
  }, [])

  const hasData = stats.commandes.length > 0
  const fullAccess = userRole === 'DG' || userRole === 'ADMIN'

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 space-y-6 p-4 md:p-6">
      <style dangerouslySetInnerHTML={{
        __html: `
@media print {
  body * { visibility: hidden !important; }
  #rapport-print-area, #rapport-print-area * { visibility: visible !important; }
  #rapport-print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 1rem !important; }
}
`,
      }}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between print:hidden">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {fullAccess ? 'Rapports & Analyses' : 'Mes performances'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {fullAccess
              ? 'Statistiques détaillées de votre activité'
              : 'Synthèse de votre activité commerciale (exports réservés au Directeur général)'}
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {canExportReports && (
          <div className="flex min-w-0 flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportReport} className="border-primary/25 dark:border-primary/40 hover:bg-primary/8 dark:hover:bg-primary/15">
              <Download className="h-4 w-4 mr-2" />Exporter CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="border-primary/25 dark:border-primary/40 hover:bg-primary/8 dark:hover:bg-primary/15">
              <FileSpreadsheet className="h-4 w-4 mr-2" />Exporter Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrintPdf} className="border-primary/25 dark:border-primary/40 hover:bg-primary/8 dark:hover:bg-primary/15">
              <Printer className="h-4 w-4 mr-2" />Exporter PDF
            </Button>
          </div>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-9 w-full min-w-0 text-xs sm:w-36" aria-label="Intervalle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="1m">1 mois</SelectItem>
                <SelectItem value="3m">3 mois</SelectItem>
                <SelectItem value="6m">6 mois</SelectItem>
                <SelectItem value="12m">12 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canUseGlobalFilters && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Label className="shrink-0 text-xs text-muted-foreground">Région</Label>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-9 w-full min-w-0 text-xs sm:w-36">
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {getRegions().map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}
          {canUseGlobalFilters && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Label className="shrink-0 text-xs text-muted-foreground">Commercial</Label>
            <Select value={commercialFilter} onValueChange={setCommercialFilter}>
              <SelectTrigger className="h-9 w-full min-w-0 text-xs sm:w-40">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {getUniqueCommercialNames().map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/25 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium text-lg">Aucune donnée disponible</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">Les données apparaîtront une fois des commandes enregistrées</p>
        </div>
      ) : (
        <div id="rapport-print-area" className="space-y-6">
          <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3 py-1 print:text-foreground">
            <span className="font-medium text-foreground">Analyse des ventes — </span>
            {filterSummary}. Synthèse du chiffre d&apos;affaires, des volumes et de la performance commerciale sur les critères sélectionnés.
          </p>
          {/* Summary KPIs */}
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Chiffre d'affaires"
              value={fmtCfa(stats.totalVentes)}
              icon={DollarSign}
              color="primary"
            />
            <StatCard
              label="Panier moyen"
              value={fmtCfa(stats.avgCommande)}
              icon={ShoppingCart}
              color="emerald"
            />
            <StatCard
              label="Quantité totale"
              value={`${fmt(stats.totalQty)} pots`}
              icon={Package}
              color="violet"
            />
            <StatCard
              label="Taux livraison"
              value={`${stats.tauxLivraison.toFixed(0)}%`}
              icon={Target}
              color="green"
              subtitle={`${stats.tauxAnnulation.toFixed(0)}% annulées`}
            />
          </div>

          {/* Revenue evolution chart */}
          <Card className="min-w-0 border-primary/15 dark:border-primary/25">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Évolution du chiffre d&apos;affaires</CardTitle>
              <CardDescription>12 derniers mois</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              <ChartContainer config={{ montant: { label: 'Ventes (FCFA)', color: BRAND_GREEN }, commandes: { label: 'Commandes', color: '#22c55e' } }} className="h-[250px] md:h-[300px] w-full min-w-0">
                <BarChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} className="fill-muted-foreground" />
                  <ChartTooltip
                    content={<ChartTooltipContent className="dark:bg-popover dark:border-border" />}
                  />
                  <Bar dataKey="montant" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {stats.monthlyData.map((_, i) => (
                      <Cell key={i} fill={i === stats.monthlyData.length - 1 ? BRAND_GREEN : BRAND_GREEN_SOFT} fillOpacity={i === stats.monthlyData.length - 1 ? 1 : 0.55} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            {/* Status Distribution */}
            <Card className="min-w-0 border-primary/15 dark:border-primary/25">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Répartition par statut</CardTitle>
                <CardDescription>Distribution des commandes</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0">
                {stats.statusData.length > 0 ? (
                  <>
                    <ChartContainer config={{}} className="h-[200px] w-full min-w-0">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent className="dark:bg-popover dark:border-border" />} />
                        <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {stats.statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                      {stats.statusData.map((e, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.fill }} />
                          <span className="text-muted-foreground">{e.name} ({e.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée</p>
                )}
              </CardContent>
            </Card>

            {/* Price Distribution */}
            <Card className="min-w-0 border-primary/15 dark:border-primary/25">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Distribution des prix</CardTitle>
                <CardDescription>Prix unitaire par tranche</CardDescription>
              </CardHeader>
              <CardContent className="min-w-0">
                <ChartContainer config={{ count: { label: 'Commandes', color: BRAND_GREEN } }} className="h-[200px] w-full min-w-0">
                  <BarChart data={stats.priceRanges} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis dataKey="range" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={80} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent className="dark:bg-popover dark:border-border" />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30} fill={BRAND_GREEN_SOFT} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            {/* Top Clients */}
            <Card className="min-w-0 border-primary/15 dark:border-primary/25">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Top clients</CardTitle>
                    <CardDescription>Par chiffre d&apos;affaires</CardDescription>
                  </div>
                  <Award className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {stats.topClients.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topClients.map((c, i) => {
                      const maxMontant = stats.topClients[0].montant
                      const pct = maxMontant > 0 ? (c.montant / maxMontant) * 100 : 0
                      const pctOfTotal = stats.totalVentes > 0 ? ((c.montant / stats.totalVentes) * 100).toFixed(1) : '0'
                      const rankStyle = RANK_STYLES[i]
                      return (
                        <div key={c.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${rankStyle ? `${rankStyle.bg} ${rankStyle.text} ${rankStyle.border}` : 'bg-muted text-muted-foreground'}`}>
                                {i < 3 ? (
                                  <span
                                    className="h-2 w-2 rounded-full inline-block"
                                    style={{ backgroundColor: i === 0 ? BRAND_GREEN : i === 1 ? '#94a3b8' : '#c2410c' }}
                                  />
                                ) : (
                                  i + 1
                                )}
                              </span>
                              <span className="font-medium">{c.name}</span>
                              {i === 0 && (
                                <Crown className="h-3.5 w-3.5 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{pctOfTotal}%</span>
                              <span className="font-semibold text-primary">{fmtCfa(c.montant)}</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-muted/50" />
                            <div
                              className="relative h-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-600 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
                )}
              </CardContent>
            </Card>

            {/* Commercial Performance (DG only) */}
            {stats.commercialPerf.length > 0 && (
              <Card className="min-w-0 border-primary/15 dark:border-primary/25">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Performance commerciaux</CardTitle>
                      <CardDescription>Comparaison détaillée</CardDescription>
                    </div>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="min-w-0">
                  {(() => {
                    const maxVentes = Math.max(...stats.commercialPerf.map(c => c.ventes), 1)
                    const topVendeur = stats.commercialPerf.reduce((best, c) => c.ventes > best.ventes ? c : best, stats.commercialPerf[0])
                    return (
                      <>
                        {/* Visual bar comparison */}
                        <div className="space-y-4 mb-5">
                          {stats.commercialPerf.map(c => {
                            const pctOfMax = (c.ventes / maxVentes) * 100
                            const isTop = c.name === topVendeur.name
                            return (
                              <div key={c.name} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{c.name}</span>
                                    {isTop && (
                                      <Badge className="bg-primary/12 dark:bg-primary/25 text-primary border-primary/25 dark:border-primary/40 text-[10px] px-1.5 py-0">
                                        <Crown className="h-2.5 w-2.5 mr-0.5" />Top vendeur
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="font-semibold text-primary">{fmtCfa(c.ventes)}</span>
                                </div>
                                <div className="relative">
                                  <div className="absolute inset-0 rounded-full bg-muted/50" />
                                  <div
                                    className={`relative h-2.5 rounded-full transition-all duration-500 ${isTop ? 'bg-gradient-to-r from-primary to-emerald-600' : 'bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50'}`}
                                    style={{ width: `${pctOfMax}%` }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Detailed table */}
                        <div className="min-w-0 overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border dark:border-border">
                              <TableHead>Commercial</TableHead>
                              <TableHead className="text-center">Ventes</TableHead>
                              <TableHead className="text-center">Livrées</TableHead>
                              <TableHead className="text-right">Panier moy.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stats.commercialPerf.map(c => (
                              <TableRow key={c.name} className="border-border dark:border-border">
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-1.5">
                                    {c.name}
                                    {c.name === topVendeur.name && (
                                      <Crown className="h-3 w-3 text-primary" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{fmtCfa(c.ventes)}</TableCell>
                                <TableCell className="text-center">
                                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px]">{c.livrees}/{c.commandes}</Badge>
                                </TableCell>
                                <TableCell className="text-right">{fmtCfa(c.avgMontant)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function StatCard({ label, value, icon: Icon, color, subtitle }: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  subtitle?: string
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary
  return (
    <Card className="min-w-0 border-primary/15 dark:border-primary/25 overflow-hidden relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors.gradient}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${colors.bg}`}>
            <Icon className={`h-4 w-4 ${colors.text}`} />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
