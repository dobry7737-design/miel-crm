import { canAddClient, canModifyData, canViewTeam } from '@/lib/auth-policy'

export type AppView = 'dashboard' | 'clients' | 'commandes' | 'rapports' | 'equipe' | 'profil' | 'top-commerciaux'

/**
 * Onglets CRM visibles (sidebar, palette, navigation).
 * Commercial : dashboard, clients, profil.
 * Commandes / rapports : DG & Admin (canModifyData). Édition équipe : DG & Admin.
 */
export function canAccessCrmView(role: string | undefined, view: AppView): boolean {
  // Tant que le rôle n’est pas connu : éviter une liste vide (chargement / transition)
  if (!role) return view === 'dashboard' || view === 'profil'
  switch (view) {
    case 'dashboard':
      return true
    case 'clients':
      return canAddClient(role)
    case 'commandes':
      return true
    case 'rapports':
      return canModifyData(role)
    case 'equipe':
      return canViewTeam(role)
    case 'top-commerciaux':
      return role === 'DG' || role === 'ADMIN' // explicit inline auth or `canViewTopCommercials(role)`
    case 'profil':
      return true
    default:
      return false
  }
}

export const CRM_PATH: Record<AppView, string> = {
  dashboard: '/crm/dashboard',
  clients: '/crm/clients',
  commandes: '/crm/commandes',
  rapports: '/crm/rapports',
  equipe: '/crm/equipe',
  'top-commerciaux': '/crm/top-commerciaux',
  profil: '/crm/profil',
}

export function pathForView(view: AppView): string {
  return CRM_PATH[view]
}

/** Page historique des commandes pour un client (id métier). */
export function pathForClientHistory(clientId: string): string {
  return `/crm/clients/${encodeURIComponent(clientId)}/historique`
}

export function viewFromPathname(pathname: string): AppView {
  if (pathname.startsWith('/crm/clients')) return 'clients'
  if (pathname.startsWith('/crm/commandes')) return 'commandes'
  if (pathname.startsWith('/crm/rapports')) return 'rapports'
  if (pathname.startsWith('/crm/equipe')) return 'equipe'
  if (pathname.startsWith('/crm/top-commerciaux')) return 'top-commerciaux'
  if (pathname.startsWith('/crm/profil')) return 'profil'
  return 'dashboard'
}
