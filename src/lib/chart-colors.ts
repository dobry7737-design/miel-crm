/** Ferme Agri Bio — palette logo : #167F3C / #E4D837 / #E8141B */
export const BRAND_GREEN = '#167F3C'
export const BRAND_YELLOW = '#E4D837'
export const BRAND_GREEN_MID = '#0f5c2e'
export const BRAND_RED = '#E8141B'
/** Barres / séries secondaires (vert atténué, lisible sur fond clair) */
export const BRAND_GREEN_SOFT = '#6eb88a'

/** Remplissage camemberts « par statut » (ordre indépendant des index) */
export const STATUS_PIE_FILL: Record<string, string> = {
  EN_ATTENTE: BRAND_YELLOW,
  CONFIRMEE: '#2563eb',
  LIVREE: BRAND_GREEN,
  ANNULEE: BRAND_RED,
}
