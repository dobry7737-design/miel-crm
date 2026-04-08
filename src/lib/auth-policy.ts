/**
 * Matrice d’accès — Ferme AgriBio (DG / Admin / Commercial)
 *
 * | Fonctionnalité              | DG | Admin | Commercial |
 * |-----------------------------|----|-------|------------|
 * | Dashboard + KPIs globaux    | oui| oui   | KPIs portefeuille |
 * | CRUD client (tous)          | oui| oui   | ses clients |
 * | Commandes (modifier)        | oui| oui   | non |
 * | Équipe commerciale (annuaire)| oui| oui   | oui (lecture seule) |
 * | Rapports complets + exports | oui| oui   | pas d’accès module (navigation) |
 * | Simulation de rôle (démo)   | oui| oui   | non |
 */

export function isFullDataAccess(role: string | undefined): boolean {
  return role === 'DG' || role === 'ADMIN'
}

/** Annuaire équipe : tous les rôles connectés ; édition réservée à canModifyData (DG / Admin). */
export function canViewTeam(role: string | undefined): boolean {
  return role === 'DG' || role === 'ADMIN' || role === 'COMMERCIAL'
}

/** Commandes, équipe (hors portefeuille client), paramètres sensibles */
export function canModifyData(role: string | undefined): boolean {
  return isFullDataAccess(role)
}

export function canModifyCommandes(role: string | undefined): boolean {
  return isFullDataAccess(role)
}

export function canExportReports(role: string | undefined): boolean {
  return isFullDataAccess(role)
}

export function canUseReportGlobalFilters(role: string | undefined): boolean {
  return isFullDataAccess(role)
}

export function canAddClient(_role: string | undefined): boolean {
  return true
}

/** Simulation de rôle : réservé au compte réel DG/Admin */
export function canAccessRoleSimulation(accountRole: string | undefined): boolean {
  return accountRole === 'DG' || accountRole === 'ADMIN'
}

/**
 * Édition / suppression d’une ligne client.
 * `portfolioUser` = nom commercial effectif (données), ex. useEffectiveRole().dataUserName
 */
export function canEditClientRow(
  effectiveRole: string | undefined,
  portfolioUser: string,
  rowCommercial: string,
): boolean {
  if (isFullDataAccess(effectiveRole)) return true
  if (effectiveRole === 'COMMERCIAL' && portfolioUser) {
    return rowCommercial === portfolioUser
  }
  return false
}

export function isCommercialRole(role: string | undefined): boolean {
  return role === 'COMMERCIAL'
}
