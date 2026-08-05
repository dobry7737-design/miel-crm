'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Building2,
  Package,
  Wallet,
  BarChart3,
  Users,
  Settings,
  LogOut,
  X,
  LifeBuoy,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, ROLE_LABELS, type Role } from '@/lib/auth'
import { useNav, type PageId } from '@/lib/nav'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
    id: 'produits',
    label: 'Produits',
    icon: Package,
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
  const [confirmLogout, setConfirmLogout] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    setConfirmLogout(false)
    setTimeout(() => {
      toast.success('Déconnexion réussie', {
        description: `À bientôt, ${user.name}.`,
      })
      void logout()
    }, 200)
  }

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

        {/* Logo — brand anchor, centered */}
        <div className="flex justify-center px-2 pb-1 pt-3">
          <img
            src="/logo-aam.jpg"
            alt="AAM — Assistances Assurances Mali"
            className="h-20 w-auto max-w-full shrink-0 select-none object-contain"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }}
          />
        </div>

        {/* Brand separator — logo ↔ navigation */}
        <div
          className="mx-1 my-4 flex items-center gap-2.5"
          role="separator"
          aria-hidden="true"
        >
          <div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-transparent via-slate-300 to-blue-400/80 dark:via-slate-600 dark:to-blue-500/70" />
          <div className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 opacity-35 blur-[2px]" />
            <span className="relative h-2 w-2 rotate-45 rounded-[2px] bg-gradient-to-br from-blue-600 to-emerald-500 shadow-sm shadow-blue-500/40 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="h-[2px] flex-1 rounded-full bg-gradient-to-l from-transparent via-slate-300 to-emerald-400/80 dark:via-slate-600 dark:to-emerald-500/70" />
        </div>

        {/* Navigation */}
        <nav className="mt-1 flex flex-1 flex-col gap-1 overflow-y-auto">
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

        {/* Déconnexion */}
        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/40 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="max-w-sm bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Confirmer la déconnexion
            </DialogTitle>
            <DialogDescription className="text-xs">
              Voulez-vous vraiment vous déconnecter de votre session AAM ?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <p>
              <span className="font-semibold">Session actuelle :</span>{' '}
              {user.name} ({ROLE_LABELS[user.role]})
            </p>
            <p className="mt-1">
              Vous devrez vous reconnecter pour accéder à nouveau à la plateforme.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmLogout(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Se déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
