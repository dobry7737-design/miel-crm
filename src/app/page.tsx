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

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Blurred nature backdrop */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: 'url(/nature-bg.png)' }}
      />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900/10 via-transparent to-blue-900/20" />

      {/* Main container */}
      <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="flex w-full max-w-[1440px] flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl lg:h-[calc(100vh-4rem)]">
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex flex-1 flex-col overflow-hidden">
              <Topbar onMenuClick={() => setSidebarOpen(true)} />
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/40 px-4 py-5 sm:px-6">
                {/* Title row */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                      Dashboard Overview
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Welcome back! Here&apos;s what&apos;s happening with your
                      projects today.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                      <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
                      All Projects
                      <ChevronDown
                        className="h-3.5 w-3.5 text-slate-400"
                        strokeWidth={2.5}
                      />
                    </button>
                    <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                      Last 7 Days
                      <ChevronDown
                        className="h-3.5 w-3.5 text-slate-400"
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                </div>

                {/* Stat cards */}
                <StatCards />

                {/* Charts row 1 */}
                <div className="mt-4 grid grid-cols-1 gap-4 xl:flex xl:items-stretch">
                  <BugTrendsChart />
                  <ResolutionTimeChart />
                </div>

                {/* Charts row 2 */}
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <BugsStatusChart />
                  <BugsPerDeveloper />
                  <BugsBySeverity />
                </div>

                {/* Bottom row */}
                <div className="mt-4 mb-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <RecentActivity />
                  <ActiveProjects />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
