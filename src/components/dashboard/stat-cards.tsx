'use client'

import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  ShieldCheck,
  LifeBuoy,
  Wallet,
  Users,
  Building2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, type Role } from '@/lib/auth'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon: LucideIcon
  trend: number
  trendUp: boolean
  trendLabel?: string
  iconColor: string
  iconBg: string
}

// RBAC: stats vary by role
const STATS_BY_ROLE: Record<Role, StatCardProps[]> = {
  admin: [
    {
      label: 'Total Devis',
      value: 1248,
      icon: FileText,
      trend: 12,
      trendUp: true,
      trendLabel: 'vs mois dernier',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'Contrats Actifs',
      value: 856,
      icon: ShieldCheck,
      trend: 8,
      trendUp: true,
      trendLabel: 'ce mois',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Sinistres en cours',
      value: 47,
      icon: LifeBuoy,
      trend: 5,
      trendUp: false,
      trendLabel: 'engagement 72h',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      label: "Chiffre d'affaires",
      value: '142,5',
      unit: 'M FCFA',
      icon: Wallet,
      trend: 18,
      trendUp: true,
      trendLabel: 'vs N-1',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
  ],
  agent: [
    {
      label: 'Devis ce mois',
      value: 84,
      icon: FileText,
      trend: 23,
      trendUp: true,
      trendLabel: 'vs mois dernier',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'Contrats actifs',
      value: 127,
      icon: ShieldCheck,
      trend: 6,
      trendUp: true,
      trendLabel: 'portefeuille',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Commissions',
      value: '3,8',
      unit: 'M FCFA',
      icon: Wallet,
      trend: 14,
      trendUp: true,
      trendLabel: 'vs mois dernier',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Taux transformation',
      value: 38,
      unit: '%',
      icon: ArrowUpRight,
      trend: 4,
      trendUp: true,
      trendLabel: 'devis → contrats',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
  ],
  client: [
    {
      label: 'Mes contrats actifs',
      value: 3,
      icon: ShieldCheck,
      trend: 0,
      trendUp: true,
      trendLabel: 'Auto · Santé · Habitation',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Échéance proche',
      value: 1,
      icon: AlertTriangle,
      trend: 12,
      trendUp: false,
      trendLabel: 'dans 12 jours',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Sinistres en cours',
      value: 0,
      icon: LifeBuoy,
      trend: 0,
      trendUp: true,
      trendLabel: 'aucun sinistre actif',
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
    },
    {
      label: 'Mes devis récents',
      value: 5,
      icon: FileText,
      trend: 0,
      trendUp: true,
      trendLabel: 'comparaisons effectuées',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
  ],
  gestionnaire: [
    {
      label: 'Sinistres en cours',
      value: 47,
      icon: LifeBuoy,
      trend: 5,
      trendUp: false,
      trendLabel: 'engagement 72h',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Traités cette semaine',
      value: 18,
      icon: ShieldCheck,
      trend: 12,
      trendUp: true,
      trendLabel: 'dans les délais',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'En alerte (>72h)',
      value: 3,
      icon: AlertTriangle,
      trend: 0,
      trendUp: false,
      trendLabel: 'à traiter en urgence',
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50',
    },
    {
      label: 'Délai moyen',
      value: 38,
      unit: 'h',
      icon: ArrowUpRight,
      trend: 22,
      trendUp: true,
      trendLabel: 'amélioration délai',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
  ],
  correspondant: [
    {
      label: 'Mes produits',
      value: 12,
      icon: FileText,
      trend: 0,
      trendUp: true,
      trendLabel: 'grilles tarifaires actives',
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      label: 'Devis générés',
      value: 234,
      icon: ArrowUpRight,
      trend: 28,
      trendUp: true,
      trendLabel: 'via comparateur',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Contrats souscrits',
      value: 87,
      icon: ShieldCheck,
      trend: 15,
      trendUp: true,
      trendLabel: 'cette année',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Note moyenne',
      value: 4.7,
      unit: '/5',
      icon: Users,
      trend: 0.2,
      trendUp: true,
      trendLabel: 'satisfaction clients',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ],
}

export function StatCards() {
  const { user } = useAuth()
  if (!user) return null
  const stats = STATS_BY_ROLE[user.role] || STATS_BY_ROLE.admin

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendUp,
  trendLabel,
  iconColor,
  iconBg,
}: StatCardProps) {
  const hasTrend = trend > 0
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:shadow-md hover:shadow-slate-200/70">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            iconBg
          )}
        >
          <Icon className={cn('h-[18px] w-[18px]', iconColor)} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-semibold text-slate-400">
              {unit}
            </span>
          )}
        </span>
        {hasTrend ? (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold',
              trendUp ? 'text-emerald-600' : 'text-rose-500'
            )}
          >
            {trendUp ? (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
            {trendUp ? '+' : '-'}
            {trend}%
          </span>
        ) : null}
      </div>
      {trendLabel && (
        <p className="text-xs text-slate-400">{trendLabel}</p>
      )}
    </div>
  )
}
