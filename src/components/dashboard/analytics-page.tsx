'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Wallet,
  ShieldCheck,
  FileText,
  LifeBuoy,
  Award,
  Zap,
  Clock,
  TrendingDown,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { ChartCard } from '@/components/dashboard/chart-card'
import { formatFCFA } from '@/lib/api'
import { useStats, useAllDevis, useAllContrats } from '@/lib/hooks'

const BRANCH_COLORS: Record<string, string> = {
  Auto: '#3B82F6',
  Santé: '#10B981',
  Habitation: '#F59E0B',
  Vie: '#EC4899',
  Voyage: '#8B5CF6',
}

const STATUT_COLORS: Record<string, string> = {
  'Brouillon': '#94A3B8',
  'Émis': '#3B82F6',
  'Transformé': '#10B981',
  'Expiré': '#F59E0B',
  'Refusé': '#EF4444',
}

export function AnalyticsPage() {
  const { data: stats } = useStats()
  const { data: devisResp } = useAllDevis()
  const { data: contratsResp } = useAllContrats()

  const t = stats?.totals
  const f = stats?.financials
  const devis = devisResp?.data || []
  const contrats = contratsResp?.data || []

  // KPI cards
  const KPI_CARDS = [
    { label: 'CA total', value: f ? `${(f.totalPayments / 1000000).toFixed(1)}M` : '0', unit: 'FCFA', icon: Wallet, hint: 'encaissé', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
    { label: 'Devis émis', value: String(t?.devis ?? 0), icon: FileText, hint: 'volume', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/40' },
    { label: 'Contrats souscrits', value: String(t?.activeContrats ?? 0), icon: ShieldCheck, hint: 'actifs', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
    { label: 'Sinistres traités', value: String(t?.treatedSinistres ?? Math.max(0, (t?.sinistres ?? 0) - (t?.pendingSinistres ?? 0))), icon: LifeBuoy, hint: 'clos', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
  ]

  // CA par branche (from contrats prime sum by branche)
  const branchMap: Record<string, number> = {}
  for (const c of contrats) {
    if (c.statut === 'Actif') {
      branchMap[c.branche] = (branchMap[c.branche] || 0) + c.prime
    }
  }
  const BRANCH_CA_DATA = Object.entries(branchMap).map(([name, value]) => ({
    name,
    value: Math.round(value / 1000), // in thousands
    fill: BRANCH_COLORS[name] || '#94A3B8',
  }))

  // Devis & Contrats by month (from dateCreation)
  const monthMap: Record<string, { mois: string; devis: number; contrats: number }> = {}
  for (const d of devis) {
    const key = d.dateCreation || 'N/A'
    if (!monthMap[key]) monthMap[key] = { mois: key, devis: 0, contrats: 0 }
    monthMap[key].devis++
  }
  for (const c of contrats) {
    const key = c.dateDebut || 'N/A'
    if (!monthMap[key]) monthMap[key] = { mois: key, devis: 0, contrats: 0 }
    monthMap[key].contrats++
  }
  const CA_DATA = Object.values(monthMap).sort((a, b) => a.mois.localeCompare(b.mois))

  // Entonnoir de conversion
  const TRANSFORMATION_DATA = [
    { etape: 'Devis', value: t?.devis ?? 0 },
    { etape: 'Souscriptions', value: devis.filter((d) => d.statut === 'Transformé').length },
    { etape: 'Contrats', value: t?.activeContrats ?? 0 },
    { etape: 'Paiements', value: stats?.breakdowns?.paiementsByMoyen?.reduce((acc, p) => acc + p._count, 0) ?? 0 },
  ]

  // Top compagnies (by contract count)
  const compagnieCounts: Record<string, number> = {}
  for (const c of contrats) {
    compagnieCounts[c.companyName] = (compagnieCounts[c.companyName] || 0) + 1
  }
  const topCompagnies = Object.entries(compagnieCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], i) => ({
      name,
      contracts: count,
      color: ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-500'][i],
    }))

  // Score quality
  const scoreItems = [
    { label: 'Taux de conversion', value: stats?.scores?.conversionRate ?? 0, barColor: '#3B82F6', iconColor: 'text-blue-500' },
    { label: 'Respect délai 72h', value: stats?.scores?.respectDelai72h ?? 0, barColor: '#8B5CF6', iconColor: 'text-violet-500' },
    { label: 'Taux de sinistralité', value: Math.min(100, stats?.scores?.sinistralite ?? 0), barColor: '#F43F5E', iconColor: 'text-rose-500' },
    { label: 'Compagnies actives', value: t && t.compagnies > 0 ? Math.round(((t.activeCompagnies ?? 0) / t.compagnies) * 100) : 0, barColor: '#10B981', iconColor: 'text-emerald-500' },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics & Reporting"
        subtitle="Indicateurs clés de performance et tendances (données en temps réel)"
        filterLabel="Toutes périodes"
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {s.value}
                  {s.unit && <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">{s.unit}</span>}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{s.hint}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Big chart row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Évolution du Chiffre d'Affaires"
          subtitle="Devis et contrats dans le temps"
          className="lg:col-span-2"
          bodyClassName="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CA_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="caGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="devis"
                name="Devis"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fill="url(#caGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="CA par Branche"
          subtitle="Répartition des primes actives"
          bodyClassName="h-[280px] flex flex-col"
        >
          <div className="relative flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BRANCH_CA_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {BRANCH_CA_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {f ? `${(f.activeContratsPrime / 1000000).toFixed(1)}M` : '0'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">FCFA</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {BRANCH_CA_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{d.name}</span>
                <span className="ml-auto text-[11px] font-semibold text-slate-900 dark:text-slate-100">{d.value}k</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Devis & Contrats + Entonnoir */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Devis & Contrats" subtitle="Volume par date" bodyClassName="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CA_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="devis" name="Devis" fill="#8B5CF6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="contrats" name="Contrats" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Entonnoir de Conversion" subtitle="Devis → Contrats → Paiements" bodyClassName="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={TRANSFORMATION_DATA}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" strokeOpacity={0.6} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="etape"
                tick={{ fontSize: 11, fill: '#475569' }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Bar dataKey="value" name="Volume" fill="url(#funnelGrad)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              <defs>
                <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Top Compagnies"
          subtitle="Classement par volume de contrats"
          bodyClassName="flex flex-col gap-2.5 pt-1"
        >
          {topCompagnies.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">Aucune donnée</div>
          ) : (
            topCompagnies.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="flex w-5 shrink-0 items-center justify-center">
                  <span className={`text-xs font-bold ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>{i + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.contracts}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${c.color}`}
                      style={{ width: `${(c.contracts / (topCompagnies[0]?.contracts || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </ChartCard>

        <ChartCard
          title="Score Quality"
          subtitle="Indicateurs agrégés"
          bodyClassName="flex flex-col gap-3"
        >
          {scoreItems.map((s) => {
            const Icon = s.label.includes('Compagnies')
              ? Award
              : s.label.includes('conversion')
                ? Zap
                : s.label.includes('délai')
                  ? Clock
                  : TrendingDown
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800`} style={{ color: s.iconColor }}>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{s.value}%</span>
                  </div>
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full opacity-80"
                      style={{ width: `${s.value}%`, backgroundColor: s.barColor }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </ChartCard>
      </div>
    </div>
  )
}
