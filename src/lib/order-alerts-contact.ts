/**
 * Coordonnées pour les alertes liées aux commandes (Ferme Agri Bio) — e-mail uniquement.
 */
export const ORDER_ALERTS_EMAIL = 'contact@fermeagribio.com'

export function orderAlertsMailtoHref(params?: { subject?: string; body?: string }): string {
  const subject = params?.subject ?? 'Commande — Ferme Agri Bio'
  const q = new URLSearchParams({ subject })
  if (params?.body?.trim()) q.set('body', params.body.trim())
  return `mailto:${ORDER_ALERTS_EMAIL}?${q.toString()}`
}

/** Ajouté au corps des notifications dont le lien est « commandes ». */
export function appendOrderAlertsContactLine(message: string): string {
  const m = message.trimEnd()
  const suffix = `\n\n— Contact alertes commandes : ${ORDER_ALERTS_EMAIL}`
  if (m.includes(ORDER_ALERTS_EMAIL) && m.includes('Contact alertes commandes')) return m
  return m + suffix
}
