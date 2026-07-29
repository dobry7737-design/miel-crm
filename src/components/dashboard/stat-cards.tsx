'use client'

import {
  FileText,
  ShieldCheck,
  LifeBuoy,
  Wallet,
  Package,
  Building2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, type Role } from '@/lib/auth'
import { useStats } from '@/lib/hooks'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon: LucideIcon
  hint?: string
  iconColor: string
  iconBg: string
}

export function StatCards() {
  const { user } = useAuth()
  const { data: stats } = useStats()

  if (!user) return null

  const t = stats?.totals
  const f = stats?.financials

  const statsByRole: Record<Role, StatCardProps[]> = {
    admin: [
      { label: 'Total Devis', value: t?.devis ?? 0, icon: FileText, hint: 'tous statuts', iconColor: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-900/40' },
      { label: 'Contrats Actifs', value: t?.activeContrats ?? 0, icon: ShieldCheck, hint: `${t?.pendingContrats ?? 0} en attente`, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
      { label: 'Sinistres en cours', value: t?.pendingSinistres ?? 0, icon: LifeBuoy, hint: 'engagement 72h', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/40' },
      { label: 'Total Paiements', value: f ? (f.totalPayments / 1000000).toFixed(1) : '0', unit: 'M FCFA', icon: Wallet, hint: 'paiements réussis', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/40' },
    ],
    agent: [
      { label: 'Devis', value: t?.devis ?? 0, icon: FileText, hint: 'portefeuille', iconColor: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-900/40' },
      { label: 'Contrats actifs', value: t?.activeContrats ?? 0, icon: ShieldCheck, hint: 'portefeuille', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
      { label: 'Commissions', value: f ? (f.totalCommissions / 1000000).toFixed(1) : '0', unit: 'M FCFA', icon: Wallet, hint: 'cumul réussi', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/40' },
      { label: 'Taux transformation', value: t && t.devis > 0 ? Math.round((t.activeContrats / t.devis) * 100) : 0, unit: '%', icon: ArrowUpRight, hint: 'devis → contrats', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
    ],
    client: [
      { label: 'Mes contrats actifs', value: t?.activeContrats ?? 0, icon: ShieldCheck, hint: 'portefeuille', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
      { label: 'Échéance proche', value: t?.renewalsSoon ?? 0, icon: AlertTriangle, hint: 'sous 30 jours', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/40' },
      { label: 'Sinistres en cours', value: t?.pendingSinistres ?? 0, icon: LifeBuoy, hint: 'dossiers ouverts', iconColor: 'text-slate-600 dark:text-slate-300', iconBg: 'bg-slate-100 dark:bg-slate-800' },
      { label: 'Mes devis récents', value: t?.devis ?? 0, icon: FileText, hint: 'comparaisons', iconColor: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-900/40' },
    ],
    gestionnaire: [
      { label: 'Sinistres en cours', value: t?.pendingSinistres ?? 0, icon: LifeBuoy, hint: 'engagement 72h', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/40' },
      { label: 'Sinistres traités', value: t?.treatedSinistres ?? 0, icon: ShieldCheck, hint: 'clos / validés', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
      { label: 'En alerte (>72h)', value: t?.alertOver72 ?? 0, icon: AlertTriangle, hint: 'à traiter en urgence', iconColor: 'text-rose-600', iconBg: 'bg-rose-50 dark:bg-rose-900/40' },
      { label: 'Délai moyen', value: t?.avgDelaiH ?? 0, unit: 'h', icon: ArrowUpRight, hint: 'tous dossiers', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/40' },
    ],
    correspondant: [
      { label: 'Compagnies', value: t?.compagnies ?? 0, icon: Building2, hint: `${t?.activeCompagnies ?? 0} actives`, iconColor: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-900/40' },
      { label: 'Devis générés', value: t?.devis ?? 0, icon: ArrowUpRight, hint: 'via comparateur', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
      { label: 'Contrats souscrits', value: t?.activeContrats ?? 0, icon: ShieldCheck, hint: 'actifs', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/40' },
      { label: 'Produits actifs', value: t?.produits ?? 0, icon: Package, hint: 'catalogue compagnie', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/40' },
    ],
  }

  const cards = statsByRole[user.role] || statsByRole.admin

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((s) => (
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
  hint,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:shadow-md hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30 dark:hover:shadow-slate-950/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
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
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-semibold text-slate-400 dark:text-slate-500">
              {unit}
            </span>
          )}
        </span>
      </div>
      {hint && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  )
}
