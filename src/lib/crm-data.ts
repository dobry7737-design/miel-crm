// ========== CRM DATA STORE ==========
// localStorage-based persistence for demo mode

import { format, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
  /** Région / zone pour filtres rapports (dérivée de l’adresse si absente) */
  region?: string
  commercial: string
  commandes: number
}

export interface Commande {
  id: string
  client: string
  commercial: string
  qty: number
  prix: number
  montant: number
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'LIVREE' | 'ANNULEE'
  date: string // ISO string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  date: string
  read: boolean
  link?: 'clients' | 'commandes' | 'dashboard'
}

// ========== INITIAL SAMPLE DATA ==========

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Hôtel Riviera', phone: '+221 77 123 4567', email: 'contact@riviera.sn', address: 'Corniche Ouest, Dakar', region: 'Dakar', commercial: 'Amadou Diallo', commandes: 3 },
  { id: '2', name: 'Supermarché Auchan', phone: '+221 78 987 6543', email: 'achats@auchan.sn', address: 'Dakar', region: 'Dakar', commercial: 'Amadou Diallo', commandes: 2 },
  { id: '3', name: 'Boutique Naturelle', phone: '+221 76 555 1234', email: '', address: 'Thiès', region: 'Thiès', commercial: 'Amadou Diallo', commandes: 1 },
  { id: '4', name: 'Restaurant Le Saloum', phone: '+221 77 666 7890', email: 'info@lesaloum.sn', address: 'Saint-Louis', region: 'Saint-Louis', commercial: 'Fatou Sy', commandes: 2 },
  { id: '5', name: 'Pharmacie Centrale', phone: '+221 78 111 2222', email: '', address: 'Plateau, Dakar', region: 'Dakar', commercial: 'Fatou Sy', commandes: 2 },
  { id: '6', name: 'Épicerie du Coin', phone: '+221 76 333 4444', email: '', address: 'Rufisque', region: 'Périphérie', commercial: 'Fatou Sy', commandes: 1 },
  { id: '7', name: 'Café Touba Express', phone: '+221 77 444 5555', email: 'cafe@toubaexpress.sn', address: 'Médina, Dakar', region: 'Dakar', commercial: 'Amadou Diallo', commandes: 1 },
  { id: '8', name: 'Hôtel Terrou-Bi', phone: '+221 78 888 9999', email: 'reservation@terroubi.sn', address: 'Les Almadies, Dakar', region: 'Dakar', commercial: 'Fatou Sy', commandes: 2 },
]

const now = Date.now()
const day = 86400000

const INITIAL_COMMANDES: Commande[] = [
  { id: '1', client: 'Hôtel Terrou-Bi', commercial: 'Fatou Sy', qty: 20, prix: 6000, montant: 120000, statut: 'EN_ATTENTE', date: new Date(now).toISOString() },
  { id: '2', client: 'Pharmacie Centrale', commercial: 'Fatou Sy', qty: 40, prix: 5200, montant: 208000, statut: 'CONFIRMEE', date: new Date(now - 3 * day).toISOString() },
  { id: '3', client: 'Hôtel Riviera', commercial: 'Amadou Diallo', qty: 50, prix: 5000, montant: 250000, statut: 'LIVREE', date: new Date(now - 2 * day).toISOString() },
  { id: '4', client: 'Supermarché Auchan', commercial: 'Amadou Diallo', qty: 100, prix: 4500, montant: 450000, statut: 'CONFIRMEE', date: new Date(now - 5 * day).toISOString() },
  { id: '5', client: 'Boutique Naturelle', commercial: 'Amadou Diallo', qty: 30, prix: 5500, montant: 165000, statut: 'EN_ATTENTE', date: new Date(now - 1 * day).toISOString() },
  { id: '6', client: 'Restaurant Le Saloum', commercial: 'Fatou Sy', qty: 35, prix: 5200, montant: 182000, statut: 'ANNULEE', date: new Date(now - 7 * day).toISOString() },
  { id: '7', client: 'Café Touba Express', commercial: 'Amadou Diallo', qty: 25, prix: 4800, montant: 120000, statut: 'LIVREE', date: new Date(now - 10 * day).toISOString() },
  { id: '8', client: 'Hôtel Terrou-Bi', commercial: 'Fatou Sy', qty: 150, prix: 4800, montant: 720000, statut: 'LIVREE', date: new Date(now - 15 * day).toISOString() },
  { id: '9', client: 'Supermarché Auchan', commercial: 'Amadou Diallo', qty: 200, prix: 4300, montant: 860000, statut: 'LIVREE', date: new Date(now - 20 * day).toISOString() },
  { id: '10', client: 'Hôtel Riviera', commercial: 'Amadou Diallo', qty: 80, prix: 5000, montant: 400000, statut: 'LIVREE', date: new Date(now - 25 * day).toISOString() },
  { id: '11', client: 'Épicerie du Coin', commercial: 'Fatou Sy', qty: 60, prix: 4700, montant: 282000, statut: 'LIVREE', date: new Date(now - 18 * day).toISOString() },
  { id: '12', client: 'Hôtel Riviera', commercial: 'Amadou Diallo', qty: 75, prix: 5100, montant: 382500, statut: 'LIVREE', date: new Date(now - 35 * day).toISOString() },
  { id: '13', client: 'Hôtel Terrou-Bi', commercial: 'Fatou Sy', qty: 100, prix: 4900, montant: 490000, statut: 'LIVREE', date: new Date(now - 40 * day).toISOString() },
  { id: '14', client: 'Pharmacie Centrale', commercial: 'Fatou Sy', qty: 45, prix: 5500, montant: 247500, statut: 'LIVREE', date: new Date(now - 30 * day).toISOString() },
]

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'warning', title: 'Commande en attente', message: 'Hôtel Terrou-Bi — 20 pots en attente depuis aujourd\'hui', date: new Date(now).toISOString(), read: false, link: 'commandes' },
  { id: 'n2', type: 'warning', title: 'Commande en attente', message: 'Boutique Naturelle — 30 pots en attente depuis hier', date: new Date(now - day).toISOString(), read: false, link: 'commandes' },
  { id: 'n3', type: 'success', title: 'Commande livrée', message: 'Hôtel Riviera — 50 pots livrés avec succès', date: new Date(now - 2 * day).toISOString(), read: false, link: 'commandes' },
  { id: 'n4', type: 'info', title: 'Nouveau client', message: 'Café Touba Express a été ajouté au portefeuille', date: new Date(now - 5 * day).toISOString(), read: true, link: 'clients' },
  { id: 'n5', type: 'error', title: 'Commande annulée', message: 'Restaurant Le Saloum — commande de 182 000 FCFA annulée', date: new Date(now - 7 * day).toISOString(), read: true, link: 'commandes' },
]

export interface SalesRep {
  id: string
  name: string
  zone: string
  phone: string
  avatarInitials: string
  /** URL du portrait (https…). Si absent, un avatar de démo est dérivé de l’id. */
  photoUrl?: string
  /** E-mail professionnel (sinon dérivé du nom côté UI) */
  email?: string
  /** Libellé métier affiché dans le tableau (ex. Commercial senior) */
  role?: string
  /** Couleur d’accentuation (#RRGGBB) ; sinon palette dérivée de l’id côté UI */
  accentColor?: string
  /** Tâches en cours (démo) */
  tachesEnCours?: number
  /** Résumé des activités commerciales (démo) ; sinon texte dérivé des commandes côté UI */
  activitesCommerciales?: string
  /** Objectif annuel indicatif (FCFA) */
  objectif: number
  clientIds: string[]
}

/** Portrait affiché dans l’UI : URL enregistrée ou image de démo stable par id. */
export function portraitUrlForRep(rep: Pick<SalesRep, 'id' | 'photoUrl'>): string {
  const u = rep.photoUrl?.trim()
  if (u) return u
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(rep.id)}`
}

/** Aperçu formulaire (création sans id encore : seed par nom). */
export function portraitUrlForRepDraft(opts: { id?: string; name: string; photoUrl: string }): string {
  const u = opts.photoUrl.trim()
  if (u) return u
  if (opts.id) return `https://i.pravatar.cc/160?u=${encodeURIComponent(opts.id)}`
  const seed = opts.name.trim() || 'nouveau'
  return `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(seed)}&size=128`
}

const INITIAL_SALES_REPS: SalesRep[] = [
  {
    id: 'rep-ad',
    name: 'Amadou Diallo',
    email: 'amadou.diallo@ferme-agribio.sn',
    zone: 'Dakar & Ouest',
    phone: '+221 77 100 2001',
    avatarInitials: 'AD',
    role: 'Commercial senior',
    accentColor: '#8BEBFF',
    tachesEnCours: 4,
    activitesCommerciales: '12 visites ce trimestre · 3 devis en cours · relances Dakar',
    objectif: 5_000_000,
    clientIds: ['1', '2', '3', '7'],
  },
  {
    id: 'rep-fs',
    name: 'Fatou Sy',
    email: 'fatou.sy@ferme-agribio.sn',
    zone: 'Nord & Thiès',
    phone: '+221 77 100 2002',
    avatarInitials: 'FS',
    role: 'Commercial',
    accentColor: '#FFCCFF',
    tachesEnCours: 2,
    activitesCommerciales: '8 rdv clients · prospection Thiès · salon bio Saint-Louis',
    objectif: 4_500_000,
    clientIds: ['4', '5', '6', '8'],
  },
]

// ========== STORAGE KEYS ==========
const KEYS = {
  clients: 'fab_clients',
  commandes: 'fab_commandes',
  notifications: 'fab_notifications',
  salesReps: 'fab_sales_reps',
}

function inferRegionFromAddress(address: string): string {
  const a = address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (a.includes('thies')) return 'Thiès'
  if (a.includes('saint-louis')) return 'Saint-Louis'
  if (a.includes('dakar') || a.includes('almadies') || a.includes('medina') || a.includes('plateau') || a.includes('corniche') || a.includes('rufisque')) return 'Dakar'
  return 'Autre'
}

export function getClientRegion(c: Client): string {
  return (c.region && c.region.trim()) ? c.region.trim() : inferRegionFromAddress(c.address)
}

export function getRegions(): string[] {
  const set = new Set<string>()
  getClients().forEach((c) => set.add(getClientRegion(c)))
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
}

export function getUniqueCommercialNames(): string[] {
  const s = new Set<string>()
  getCommandes().forEach((c) => s.add(c.commercial))
  getClients().forEach((c) => s.add(c.commercial))
  return [...s].sort((a, b) => a.localeCompare(b, 'fr'))
}

/** IDs des clients dont le champ `commercial` correspond exactement au nom (trim). Utilisé pour l’équipe commerciale. */
export function getClientIdsForCommercialName(commercialName: string): string[] {
  const n = commercialName.trim()
  if (!n) return []
  return getClients()
    .filter((c) => c.commercial.trim() === n)
    .map((c) => c.id)
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/** Émis sur `window` après chaque écriture CRM dans localStorage (même onglet). `detail.key` = clé stockée ou `*` après reset. */
export const CRM_DATA_CHANGED_EVENT = 'crm-data-changed' as const

export interface CrmDataChangedDetail {
  key: string
}

function notifyCrmDataChanged(key: string): void {
  if (!isBrowser()) return
  window.dispatchEvent(
    new CustomEvent<CrmDataChangedDetail>(CRM_DATA_CHANGED_EVENT, { detail: { key } }),
  )
}

function load<T>(key: string, fallback: T[]): T[] {
  if (!isBrowser()) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return fallback
}

function save<T>(key: string, data: T[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
    notifyCrmDataChanged(key)
  } catch { /* ignore */ }
}

// ========== PUBLIC API ==========

export function getClientNames(): string[] {
  const clients = load<Client>(KEYS.clients, INITIAL_CLIENTS)
  return clients.map(c => c.name)
}

// --- CLIENTS ---
export function getClients(): Client[] {
  return load<Client>(KEYS.clients, INITIAL_CLIENTS)
}

export function addClient(client: Omit<Client, 'id' | 'commandes'>): Client {
  const clients = getClients()
  const newClient: Client = {
    ...client,
    id: String(Date.now()),
    commandes: 0,
    region: client.region?.trim() || inferRegionFromAddress(client.address),
  }
  clients.unshift(newClient)
  save(KEYS.clients, clients)
  addNotification('success', 'Nouveau client', `${client.name} a été ajouté au portefeuille`, 'clients')
  return newClient
}

export function updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'commandes'>>): Client | null {
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === id)
  if (idx === -1) return null
  clients[idx] = { ...clients[idx], ...updates }
  save(KEYS.clients, clients)
  return clients[idx]
}

export function deleteClient(id: string): boolean {
  const clients = getClients()
  const filtered = clients.filter(c => c.id !== id)
  if (filtered.length === clients.length) return false
  const client = clients.find(c => c.id === id)
  save(KEYS.clients, filtered)
  if (client) {
    addNotification('warning', 'Client supprimé', `${client.name} a été retiré du portefeuille`, 'clients')
  }
  return true
}

// --- COMMANDES ---
export function getCommandes(): Commande[] {
  return load<Commande>(KEYS.commandes, INITIAL_COMMANDES)
}

export function addCommande(commande: Omit<Commande, 'id'>): Commande {
  const commandes = getCommandes()
  const newCmd: Commande = { ...commande, id: String(Date.now()) }
  commandes.unshift(newCmd)
  save(KEYS.commandes, commandes)

  // Update client order count
  const clients = getClients()
  const clientIdx = clients.findIndex(c => c.name === commande.client)
  if (clientIdx !== -1) {
    clients[clientIdx].commandes += 1
    save(KEYS.clients, clients)
  }

  if (commande.statut === 'EN_ATTENTE') {
    addNotification('warning', 'Commande en attente', `${commande.client} — ${commande.qty} pots en attente`, 'commandes')
  } else if (commande.statut === 'LIVREE') {
    addNotification('success', 'Commande livrée', `${commande.client} — ${commande.qty} pots livrés`, 'commandes')
  } else {
    addNotification('info', 'Nouvelle commande', `${commande.client} — ${commande.montant.toLocaleString('fr-FR')} FCFA`, 'commandes')
  }

  return newCmd
}

export function updateCommande(id: string, updates: Partial<Omit<Commande, 'id'>>): Commande | null {
  const commandes = getCommandes()
  const idx = commandes.findIndex(c => c.id === id)
  if (idx === -1) return null
  const old = commandes[idx]
  commandes[idx] = { ...old, ...updates }
  save(KEYS.commandes, commandes)

  if (updates.statut && updates.statut !== old.statut) {
    const sl: Record<string, string> = { EN_ATTENTE: 'En Attente', CONFIRMEE: 'Confirmée', LIVREE: 'Livrée', ANNULEE: 'Annulée' }
    const type = updates.statut === 'LIVREE' ? 'success' : updates.statut === 'ANNULEE' ? 'error' : updates.statut === 'CONFIRMEE' ? 'info' : 'warning'
    addNotification(type, `Commande ${sl[updates.statut]}`, `${old.client} — statut mis à jour`, 'commandes')
  }

  return commandes[idx]
}

export function deleteCommande(id: string): boolean {
  const commandes = getCommandes()
  const filtered = commandes.filter(c => c.id !== id)
  if (filtered.length === commandes.length) return false
  const cmd = commandes.find(c => c.id === id)
  save(KEYS.commandes, filtered)
  if (cmd) {
    const clients = getClients()
    const clientIdx = clients.findIndex(c => c.name === cmd.client)
    if (clientIdx !== -1 && clients[clientIdx].commandes > 0) {
      clients[clientIdx].commandes -= 1
      save(KEYS.clients, clients)
    }
    addNotification('error', 'Commande supprimée', `${cmd.client} — ${cmd.montant.toLocaleString('fr-FR')} FCFA`, 'commandes')
  }
  return true
}

// --- ÉQUIPE COMMERCIALE (mock persisté) ---
export function getSalesReps(): SalesRep[] {
  return load<SalesRep>(KEYS.salesReps, INITIAL_SALES_REPS)
}

export function addSalesRep(rep: Omit<SalesRep, 'id'>): SalesRep {
  const list = getSalesReps()
  const newRep: SalesRep = { ...rep, id: 'sr-' + Date.now() }
  list.unshift(newRep)
  save(KEYS.salesReps, list)
  return newRep
}

export function updateSalesRep(id: string, updates: Partial<Omit<SalesRep, 'id'>>): SalesRep | null {
  const list = getSalesReps()
  const idx = list.findIndex(r => r.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...updates }
  save(KEYS.salesReps, list)
  return list[idx]
}

export function deleteSalesRep(id: string): boolean {
  const list = getSalesReps()
  const next = list.filter(r => r.id !== id)
  if (next.length === list.length) return false
  save(KEYS.salesReps, next)
  return true
}

export function ventesRealiseesForRep(repName: string): number {
  return getCommandes()
    .filter(c => c.commercial === repName && c.statut !== 'ANNULEE')
    .reduce((s, c) => s + c.montant, 0)
}

// --- NOTIFICATIONS ---
export function getNotifications(): Notification[] {
  return load<Notification>(KEYS.notifications, INITIAL_NOTIFICATIONS)
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length
}

export function markAllRead(): void {
  const notifs = getNotifications()
  notifs.forEach(n => { n.read = true })
  save(KEYS.notifications, notifs)
}

export function markAsRead(id: string): void {
  const notifs = getNotifications()
  const n = notifs.find(x => x.id === id)
  if (n) { n.read = true; save(KEYS.notifications, notifs) }
}

export function clearNotification(id: string): void {
  const notifs = getNotifications()
  save(KEYS.notifications, notifs.filter(n => n.id !== id))
}

function addNotification(type: Notification['type'], title: string, message: string, link?: Notification['link']): void {
  const notifs = getNotifications()
  notifs.unshift({
    id: 'n' + Date.now(),
    type, title, message,
    date: new Date().toISOString(),
    read: false,
    link,
  })
  // Keep max 50 notifications
  if (notifs.length > 50) notifs.length = 50
  save(KEYS.notifications, notifs)
}

// --- DASHBOARD STATS ---
export function getDashboardStats(userRole: string, userName?: string) {
  const commandes = getCommandes()
  const clients = getClients()
  const fullAccess = userRole === 'DG' || userRole === 'ADMIN'

  // Role-based filtering
  const userCommandes = fullAccess ? commandes : commandes.filter(c => c.commercial === userName)
  const userClients = fullAccess ? clients : clients.filter(c => c.commercial === userName)

  const totalVentes = userCommandes.filter(c => c.statut !== 'ANNULEE').reduce((s, c) => s + c.montant, 0)
  const totalCommandes = userCommandes.length
  const totalClients = userClients.length
  const pendingOrders = userCommandes.filter(c => c.statut === 'EN_ATTENTE').length

  // Monthly data (last 6 months) — dynamic month labels
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    const monthLabel = format(d, 'MMM', { locale: fr })
    const monthCmds = userCommandes.filter(c => {
      const cd = new Date(c.date)
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear() && c.statut !== 'ANNULEE'
    })
    return {
      month: monthLabel,
      montant: monthCmds.reduce((s, c) => s + c.montant, 0),
      commandes: monthCmds.length,
    }
  })

  // Status counts
  const statusCounts = [
    { statut: 'EN_ATTENTE', count: userCommandes.filter(c => c.statut === 'EN_ATTENTE').length, montant: userCommandes.filter(c => c.statut === 'EN_ATTENTE').reduce((s, c) => s + c.montant, 0) },
    { statut: 'CONFIRMEE', count: userCommandes.filter(c => c.statut === 'CONFIRMEE').length, montant: userCommandes.filter(c => c.statut === 'CONFIRMEE').reduce((s, c) => s + c.montant, 0) },
    { statut: 'LIVREE', count: userCommandes.filter(c => c.statut === 'LIVREE').length, montant: userCommandes.filter(c => c.statut === 'LIVREE').reduce((s, c) => s + c.montant, 0) },
    { statut: 'ANNULEE', count: userCommandes.filter(c => c.statut === 'ANNULEE').length, montant: userCommandes.filter(c => c.statut === 'ANNULEE').reduce((s, c) => s + c.montant, 0) },
  ]

  // Commercials performance (DG / Admin)
  const commercials = fullAccess ? ['Amadou Diallo', 'Fatou Sy'].map(name => {
    const cCmds = commandes.filter(c => c.commercial === name)
    const cClients = clients.filter(c => c.commercial === name)
    return {
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      clients: cClients.length,
      commandes: cCmds.length,
      ventes: cCmds.filter(c => c.statut !== 'ANNULEE').reduce((s, c) => s + c.montant, 0),
    }
  }) : []

  // Recent orders
  const recentOrders = userCommandes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      client: c.client,
      montant: c.montant,
      statut: c.statut,
      qty: c.qty,
      date: new Date(c.date),
    }))

  return {
    totalVentes,
    totalClients,
    totalCommandes,
    pendingOrders,
    monthlyData,
    statusCounts,
    commercials,
    recentOrders,
  }
}

// --- RESET (for demo) ---
export function resetData(): void {
  if (!isBrowser()) return
  localStorage.removeItem(KEYS.clients)
  localStorage.removeItem(KEYS.commandes)
  localStorage.removeItem(KEYS.notifications)
  localStorage.removeItem(KEYS.salesReps)
  notifyCrmDataChanged('*')
}
