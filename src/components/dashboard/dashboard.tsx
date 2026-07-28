'use client'

import { useState } from 'react'
import { Calendar, ChevronDown, SlidersHorizontal } from 'lucide-react'
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
import { useAuth, ROLE_LABELS, type Role } from '@/lib/auth'

const TITLE_BY_ROLE: Record<Role, string> = {
  admin: "Tableau de Bord Administrateur",
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

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  if (!user) return null

  const showCharts = user.role === 'admin' || user.role === 'agent'
  const showPartners = user.role === 'admin' || user.role === 'correspondant'
  const showSinistresStats =
    user.role === 'admin' ||
    user.role === 'gestionnaire' ||
    user.role === 'agent'

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 px-4 py-5 sm:px-6">
          {/* Title row */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {TITLE_BY_ROLE[user.role]}
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {SUBTITLE_BY_ROLE[user.role]}
              </p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
                Toutes branches
                <ChevronDown
                  className="h-3.5 w-3.5 text-slate-400"
                  strokeWidth={2.5}
                />
              </button>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                30 derniers jours
                <ChevronDown
                  className="h-3.5 w-3.5 text-slate-400"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          </div>

          {/* Stat cards - always shown, role-based content */}
          <StatCards />

          {showCharts && (
            <>
              {/* Charts row 1 */}
              <div className="mt-4 grid grid-cols-1 gap-4 xl:flex xl:items-stretch">
                <BugTrendsChart />
                <ResolutionTimeChart />
              </div>
            </>
          )}

          {/* Charts row 2 */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {showSinistresStats && <BugsStatusChart />}
            <BugsPerDeveloper />
            <BugsBySeverity />
          </div>

          {/* Bottom row */}
          <div className="mt-4 mb-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RecentActivity />
            {showPartners && <ActiveProjects />}
          </div>
        </div>
      </main>
    </div>
  )
}
