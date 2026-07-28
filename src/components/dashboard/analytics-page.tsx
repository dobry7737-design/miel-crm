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
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  FileText,
  LifeBuoy,
  Award,
  Zap,
  Clock,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { ChartCard } from '@/components/dashboard/chart-card'

const KPI_CARDS = [
  { label: 'CA total (30j)', value: '142,5 M', unit: 'FCFA', icon: Wallet, trend: '+18%', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
  { label: 'Devis émis', value: '1 248', icon: FileText, trend: '+12%', trendUp: true, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/40' },
  { label: 'Contrats souscrits', value: '856', icon: ShieldCheck, trend: '+8%', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
  { label: 'Sinistres traités', value: '184', icon: LifeBuoy, trend: '+22%', trendUp: true, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
]

const CA_DATA = [
  { mois: 'Jan', ca: 18, devis: 95, contrats: 64 },
  { mois: 'Fév', ca: 22, devis: 110, contrats: 78 },
  { mois: 'Mar', ca: 25, devis: 128, contrats: 88 },
  { mois: 'Avr', ca: 28, devis: 142, contrats: 95 },
  { mois: 'Mai', ca: 32, devis: 158, contrats: 108 },
  { mois: 'Juin', ca: 38, devis: 178, contrats: 127 },
  { mois: 'Juil', ca: 42, devis: 195, contrats: 142 },
]

const BRANCH_CA_DATA = [
  { name: 'Auto', value: 48, fill: '#3B82F6' },
  { name: 'Santé', value: 32, fill: '#10B981' },
  { name: 'Habitation', value: 28, fill: '#F59E0B' },
  { name: 'Vie', value: 22, fill: '#EC4899' },
  { name: 'Voyage', value: 12, fill: '#8B5CF6' },
]

const TRANSFORMATION_DATA = [
  { etape: 'Visiteurs', value: 12840, conversion: 100 },
  { etape: 'Simulation', value: 8240, conversion: 64 },
  { etape: 'Devis émis', value: 1248, conversion: 9.7 },
  { etape: 'Souscription', value: 476, conversion: 3.7 },
  { etape: 'Paiement', value: 412, conversion: 3.2 },
]

export function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics & Reporting"
        subtitle="Indicateurs clés de performance et tendances (30 derniers jours)"
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
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {s.value}
                  {s.unit && <span className="ml-1 text-xs text-slate-400">{s.unit}</span>}
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {s.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Big chart row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Évolution du Chiffre d'Affaires"
          subtitle="CA mensuel (M FCFA) sur 7 mois"
          dropdownLabel="Toutes branches"
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
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: 12,
                  background: 'var(--app-surface)',
                  color: 'var(--app-text)',
                }}
              />
              <Area
                type="monotone"
                dataKey="ca"
                name="CA (M FCFA)"
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
          subtitle="Répartition sur 30 jours"
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
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">142M</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">FCFA</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {BRANCH_CA_DATA.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{d.name}</span>
                <span className="ml-auto text-[11px] font-semibold text-slate-900 dark:text-slate-100">{d.value}M</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Devis/Contrats evolution */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Devis & Contrats"
          subtitle="Volume mensuel"
          bodyClassName="h-[260px]"
        >
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

        <ChartCard
          title="Entonnoir de Conversion"
          subtitle="Visiteurs → Paiement"
          bodyClassName="h-[260px]"
        >
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
              <Bar
                dataKey="value"
                name="Volume"
                fill="url(#funnelGrad)"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
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
          {[
            { name: 'NSIA Assurances', value: 28, color: 'bg-blue-500', contracts: 248 },
            { name: 'SUNU Assurances', value: 22, color: 'bg-violet-500', contracts: 189 },
            { name: 'AFG Assurances', value: 18, color: 'bg-emerald-500', contracts: 156 },
            { name: 'Sanlam Allianz', value: 15, color: 'bg-rose-500', contracts: 128 },
            { name: 'SONAVIE', value: 12, color: 'bg-cyan-500', contracts: 105 },
          ].map((c, i) => (
            <div key={c.name} className="flex items-center gap-3">
              <div className="flex w-5 shrink-0 items-center justify-center">
                <span className={`text-xs font-bold ${i === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.contracts}</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${c.color}`}
                    style={{ width: `${c.value * 3.5}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </ChartCard>

        <ChartCard
          title="Score Quality"
          subtitle="Indicateurs agrégés"
          bodyClassName="flex flex-col gap-3"
        >
          {[
            { label: 'Satisfaction client', value: 98, icon: Award, barColor: '#10B981', iconColor: 'text-emerald-500' },
            { label: 'Taux de conversion', value: 38, icon: Zap, barColor: '#3B82F6', iconColor: 'text-blue-500' },
            { label: 'Respect délai 72h', value: 95, icon: Clock, barColor: '#8B5CF6', iconColor: 'text-violet-500' },
            { label: 'Taux de sinistralité', value: 12, icon: TrendingDown, barColor: '#F43F5E', iconColor: 'text-rose-500' },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 ${s.iconColor}`}>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{s.value}%</span>
                  </div>
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
