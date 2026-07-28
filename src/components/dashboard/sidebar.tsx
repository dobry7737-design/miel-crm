'use client'

import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Building2,
  Wallet,
  BarChart3,
  Users,
  Settings,
  LogOut,
  BadgeCheck,
  X,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, ROLE_LABELS, type Role } from '@/lib/auth'
import { useNav, type PageId } from '@/lib/nav'

interface NavItem {
  id: PageId
  label: string
  icon: typeof LayoutDashboard
  roles: Role[] // RBAC: which roles can see this item
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    roles: ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'],
  },
  {
    id: 'devis',
    label: 'Devis',
    icon: FileText,
    roles: ['admin', 'agent', 'client', 'correspondant'],
  },
  {
    id: 'contrats',
    label: 'Contrats',
    icon: ShieldCheck,
    roles: ['admin', 'agent', 'client'],
  },
  {
    id: 'sinistres',
    label: 'Sinistres',
    icon: LifeBuoy,
    roles: ['admin', 'agent', 'client', 'gestionnaire'],
  },
  {
    id: 'compagnies',
    label: 'Compagnies Partenaires',
    icon: Building2,
    roles: ['admin', 'correspondant'],
  },
  {
    id: 'paiements',
    label: 'Paiements',
    icon: Wallet,
    roles: ['admin', 'agent', 'client'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: ['admin', 'agent'],
  },
  {
    id: 'utilisateurs',
    label: 'Utilisateurs',
    icon: Users,
    roles: ['admin'],
  },
  {
    id: 'parametres',
    label: 'Paramètres',
    icon: Settings,
    roles: ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'],
  },
]

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { user, logout } = useAuth()
  const { page, setPage } = useNav()

  if (!user) return null

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              AAM
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Assistances Assurances Mali
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-7 flex flex-1 flex-col gap-1 overflow-y-auto">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu Principal
          </p>
          {visibleItems.map((item) => {
            const Icon = item.icon
            const isActive = page === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id)
                  onClose()
                }}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  )}
                  strokeWidth={2}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Role badge */}
        <div className="mb-2 mt-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Profil RBAC
          </p>
          <p className="mt-0.5 text-xs font-semibold text-blue-600">
            {ROLE_LABELS[user.role]}
          </p>
        </div>

        {/* User Profile */}
        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white shadow-sm">
              {user.avatar}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <BadgeCheck className="h-4 w-4 text-blue-500" fill="currentColor" />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user.name}
              </span>
              <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                {user.company || ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/40 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
