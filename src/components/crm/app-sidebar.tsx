'use client'

import { useState, useEffect, useMemo } from 'react'
import { LayoutDashboard, Users, ShoppingCart, BarChart3, Settings, LogOut, UserCog } from 'lucide-react'
import { BrandLogo } from '@/components/crm/brand-logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { CRM_DATA_CHANGED_EVENT, getCommandes } from '@/lib/crm-data'
import { usePermissions } from '@/hooks/use-permissions'
import { canAccessCrmView, type AppView } from '@/lib/crm-routes'

export type { AppView }

interface AppSidebarProps {
  currentView: AppView
  onViewChange: (view: AppView) => void
  onLogout: () => void
}

const baseNavItems: { view: AppView; label: string; icon: React.ElementType }[] = [
  { view: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { view: 'clients', label: 'Clients', icon: Users },
  { view: 'commandes', label: 'Commandes', icon: ShoppingCart },
  { view: 'rapports', label: 'Rapports', icon: BarChart3 },
  { view: 'equipe', label: 'Équipe commerciale', icon: UserCog },
  { view: 'profil', label: 'Paramètres', icon: Settings },
]

function renderNavItem(
  item: (typeof baseNavItems)[number],
  currentView: AppView,
  onViewChange: (v: AppView) => void,
  pendingCount: number,
) {
  return (
    <SidebarMenuItem key={item.view}>
      <SidebarMenuButton
        isActive={currentView === item.view}
        onClick={() => onViewChange(item.view)}
        tooltip={item.label}
        className="mx-1"
      >
        <item.icon size={18} />
        <span>{item.label}</span>
        {item.view === 'commandes' && pendingCount > 0 && (
          <Badge className="ml-auto h-5 min-w-[20px] border-primary bg-primary px-1.5 text-[10px] text-primary-foreground group-data-[collapsible=icon]:hidden">
            {pendingCount}
          </Badge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebar({ currentView, onViewChange, onLogout }: AppSidebarProps) {
  const { effectiveRole, accountRole } = usePermissions()
  /** Rôle pour les droits d’affichage : effectif (simulation) ou compte réel en secours */
  const roleForNav = (effectiveRole || accountRole) as string | undefined

  const navItems = useMemo(
    () => baseNavItems.filter((i) => canAccessCrmView(roleForNav, i.view)),
    [roleForNav],
  )
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const pendingCount = useMemo(() => {
    try {
      return getCommandes().filter((c) => c.statut === 'EN_ATTENTE').length
    } catch {
      return 0
    }
  }, [version])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-2 py-4 group-data-[collapsible=icon]:py-2.5 group-data-[collapsible=icon]:px-1">
        <div className="flex w-full justify-center">
          <BrandLogo
            priority
            className="h-20 w-auto max-w-[min(100%,10rem)] sm:h-24 sm:max-w-[min(100%,11.5rem)] group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:max-w-[2rem]"
          />
        </div>
      </SidebarHeader>

      <Separator className="mx-3 w-auto bg-sidebar-border" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                renderNavItem(item, currentView, onViewChange, pendingCount),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="mb-3 bg-sidebar-border" />
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-400 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={onLogout}
          size="sm"
        >
          <LogOut size={16} />
          <span className="ml-2 group-data-[collapsible=icon]:hidden">Déconnexion</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
