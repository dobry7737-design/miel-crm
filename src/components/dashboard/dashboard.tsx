'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { QueryProvider } from '@/components/query-provider'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { StatCards } from '@/components/dashboard/stat-cards'
import { BugTrendsChart } from '@/components/dashboard/bug-trends-chart'
import { ResolutionTimeChart } from '@/components/dashboard/resolution-time-chart'
import { BugsStatusChart } from '@/components/dashboard/bugs-status-chart'
import { BugsPerDeveloper } from '@/components/dashboard/bugs-per-developer'
import { BugsBySeverity } from '@/components/dashboard/bugs-by-severity'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { ActiveProjects } from '@/components/dashboard/active-projects'
import { DevisPage } from '@/components/dashboard/devis-page'
import { ContratsPage } from '@/components/dashboard/contrats-page'
import { SinistresPage } from '@/components/dashboard/sinistres-page'
import { CompagniesPage } from '@/components/dashboard/compagnies-page'
import { ProduitsPage } from '@/components/dashboard/produits-page'
import { PaiementsPage } from '@/components/dashboard/paiements-page'
import { AnalyticsPage } from '@/components/dashboard/analytics-page'
import { UtilisateursPage } from '@/components/dashboard/utilisateurs-page'
import { ParametresPage } from '@/components/dashboard/parametres-page'
import { useAuth, ROLE_LABELS, type Role } from '@/lib/auth'
import { useNav, type PageId } from '@/lib/nav'
import { useUI } from '@/lib/ui-store'
import {
  DashboardFiltersProvider,
  useDashboardFilters,
  type DashboardBranche,
  type DashboardDays,
} from '@/lib/dashboard-filters'
import { cn } from '@/lib/utils'

const TITLE_BY_ROLE: Record<Role, string> = {
  admin: 'Tableau de Bord Administrateur',
  agent: 'Espace Agent / Courtier',
  client: 'Mon Espace Client',
  gestionnaire: 'Gestion des Sinistres',
  correspondant: 'Espace Compagnie Partenaire',
}

const SUBTITLE_BY_ROLE: Record<Role, string> = {
  admin:
    "Vue consolidée de la plateforme AAM : devis, contrats, sinistres et performance des partenaires.",
  agent:
    "Bienvenue ! Voici l'activité de votre portefeuille clients aujourd'hui.",
  client:
    'Bienvenue ! Gérez vos contrats, devis et sinistres depuis cet espace.',
  gestionnaire:
    "File de sinistres à traiter · Engagement de traitement sous 72h respecté.",
  correspondant:
    "Bienvenue ! Gérez vos produits et grilles tarifaires depuis cet espace.",
}

const PAGE_RBAC: Record<PageId, Role[]> = {
  dashboard: ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'],
  devis: ['admin', 'agent', 'client', 'correspondant'],
  contrats: ['admin', 'agent', 'client'],
  sinistres: ['admin', 'agent', 'client', 'gestionnaire'],
  compagnies: ['admin', 'correspondant'],
  produits: ['admin', 'correspondant'],
  paiements: ['admin', 'agent', 'client'],
  analytics: ['admin', 'agent'],
  utilisateurs: ['admin'],
  parametres: ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'],
}

const BRANCHES: { value: DashboardBranche; label: string }[] = [
  { value: 'all', label: 'Toutes branches' },
  { value: 'Auto', label: 'Auto' },
  { value: 'Santé', label: 'Santé' },
  { value: 'Habitation', label: 'Habitation' },
  { value: 'Voyage', label: 'Voyage' },
  { value: 'Vie', label: 'Vie' },
]

const PERIODS: { value: DashboardDays; label: string }[] = [
  { value: 7, label: '7 derniers jours' },
  { value: 30, label: '30 derniers jours' },
  { value: 90, label: '90 derniers jours' },
  { value: 'all', label: 'Toute la période' },
]

function FilterDropdown<T extends string | number>({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: typeof SlidersHorizontal
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-slate-400 transition dark:text-slate-500',
            open && 'rotate-180'
          )}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full px-3 py-2 text-left text-xs font-medium transition',
                opt.value === value
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DashboardHomeHeader() {
  const { user } = useAuth()
  const { branche, days, setBranche, setDays } = useDashboardFilters()
  if (!user) return null

  const brancheLabel =
    BRANCHES.find((b) => b.value === branche)?.label || 'Toutes branches'
  const daysLabel =
    PERIODS.find((p) => p.value === days)?.label || '30 derniers jours'

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
            {TITLE_BY_ROLE[user.role]}
          </h1>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {SUBTITLE_BY_ROLE[user.role]}
        </p>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterDropdown
          icon={SlidersHorizontal}
          label={brancheLabel}
          options={BRANCHES}
          value={branche}
          onChange={setBranche}
        />
        <FilterDropdown
          icon={Calendar}
          label={daysLabel}
          options={PERIODS}
          value={days}
          onChange={setDays}
        />
      </div>
    </div>
  )
}

function DashboardHome() {
  const { user } = useAuth()
  if (!user) return null

  const showCharts = user.role === 'admin' || user.role === 'agent'
  const showPartners = user.role === 'admin' || user.role === 'correspondant'
  const showSinistresStats =
    user.role === 'admin' || user.role === 'gestionnaire' || user.role === 'agent'

  return (
    <DashboardFiltersProvider>
      <DashboardHomeHeader />
      <StatCards />

      {showCharts && (
        <div className="mt-4 grid grid-cols-1 gap-4 xl:flex xl:items-stretch">
          <BugTrendsChart />
          <ResolutionTimeChart />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {showSinistresStats && <BugsStatusChart />}
        <BugsPerDeveloper />
        <BugsBySeverity />
      </div>

      <div className="mt-4 mb-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentActivity />
        {showPartners && <ActiveProjects />}
      </div>
    </DashboardFiltersProvider>
  )
}

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const { page, setPage, goToPageWithAction } = useNav()
  const { setPrimaryAction } = useUI()

  useEffect(() => {
    if (page === 'dashboard') {
      setPrimaryAction(() => goToPageWithAction('devis'))
      return () => setPrimaryAction(null)
    }
    setPrimaryAction(null)
  }, [page, setPrimaryAction, goToPageWithAction])

  if (!user) return null

  if (!PAGE_RBAC[page].includes(user.role)) {
    setPage('dashboard')
    return null
  }

  return (
    <QueryProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 px-4 py-5 dark:bg-slate-950 sm:px-6">
            {page === 'dashboard' && <DashboardHome />}
            {page === 'devis' && <DevisPage />}
            {page === 'contrats' && <ContratsPage />}
            {page === 'sinistres' && <SinistresPage />}
            {page === 'compagnies' && <CompagniesPage />}
            {page === 'produits' && <ProduitsPage />}
            {page === 'paiements' && <PaiementsPage />}
            {page === 'analytics' && <AnalyticsPage />}
            {page === 'utilisateurs' && <UtilisateursPage />}
            {page === 'parametres' && <ParametresPage />}
          </div>
        </main>
      </div>
    </QueryProvider>
  )
}
