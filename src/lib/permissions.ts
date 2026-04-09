/** Rôles applicatifs (auth + simulation) */
export type AppRole = 'DG' | 'COMMERCIAL' | 'ADMIN' | 'RESP_COMMERCIAL'

export function isAppRole(value: unknown): value is AppRole {
  return value === 'DG' || value === 'COMMERCIAL' || value === 'ADMIN' || value === 'RESP_COMMERCIAL'
}

export {
  isFullDataAccess,
  canViewTeam,
  canModifyData,
  canModifyCommandes,
  canExportReports,
  canUseReportGlobalFilters,
  canAddClient,
  canAccessRoleSimulation,
  canEditClientRow,
  isCommercialRole,
} from '@/lib/auth-policy'

/** Libellé UI pour les statuts de commande (données internes inchangées) */
export const COMMANDE_STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Validée',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
}
