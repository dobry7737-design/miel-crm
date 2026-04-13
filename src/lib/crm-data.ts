// ========== CRM DATA STORE ==========
// Mixed architecture: Supabase for real backend, localStorage for sync UI cache

import { format, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from './supabase/client'
import { appendOrderAlertsContactLine } from './order-alerts-contact'

const supabase = createClient()

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  address: string
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
  link?: 'clients' | 'commandes' | 'dashboard' | null
}

export interface SalesRep {
  id: string
  name: string
  zone: string
  phone: string
  avatarInitials: string
  photoUrl?: string | null
  email?: string | null
  role?: string | null
  accentColor?: string | null
  tachesEnCours?: number | null
  activitesCommerciales?: string | null
  objectif: number
  clientIds: string[]
}

export function portraitUrlForRep(rep: Pick<SalesRep, 'id' | 'photoUrl'>): string {
  const u = rep.photoUrl?.trim()
  if (u) return u
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(rep.id)}`
}

export function portraitUrlForRepDraft(opts: { id?: string; name: string; photoUrl: string }): string {
  const u = opts.photoUrl.trim()
  if (u) return u
  if (opts.id) return `https://i.pravatar.cc/160?u=${encodeURIComponent(opts.id)}`
  const seed = opts.name.trim() || 'nouveau'
  return `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(seed)}&size=128`
}

// ========== DB MAPPERS ==========
function mapDbToClient(db: any): Client {
  return {
    id: db.id, name: db.name, phone: db.phone, email: db.email || '',
    address: db.address, region: db.region || '',
    commercial: db.commercial, commandes: db.commandes_count || 0,
  }
}

function mapClientToDb(c: Partial<Client>) {
  return {
    id: c.id, name: c.name, phone: c.phone, email: c.email || null,
    address: c.address, region: c.region || null,
    commercial: c.commercial, commandes_count: c.commandes
  }
}

function mapDbToCommande(db: any): Commande {
  return {
    id: db.id, client: db.client_name, commercial: db.commercial,
    qty: db.qty, prix: db.prix, montant: db.montant,
    statut: db.statut, date: db.date
  }
}

function mapCommandeToDb(c: Partial<Commande>) {
  return {
    id: c.id, client_name: c.client, commercial: c.commercial,
    qty: c.qty, prix: c.prix, montant: c.montant,
    statut: c.statut, date: c.date ? new Date(c.date).toISOString() : new Date().toISOString()
  }
}

function mapDbToNotif(db: any): Notification {
  return {
    id: db.id, type: db.type, title: db.title, message: db.message,
    date: db.date, read: !!db.read, link: db.link || undefined
  }
}

function mapDbToSalesRep(db: any): SalesRep {
  return {
    id: db.id, name: db.name, zone: db.zone, phone: db.phone,
    avatarInitials: db.avatar_initials, photoUrl: db.photo_url, email: db.email,
    role: db.role, accentColor: db.accent_color, tachesEnCours: db.taches_en_cours,
    activitesCommerciales: db.activites_commerciales, objectif: db.objectif, clientIds: db.client_ids || []
  }
}

// ========== STORAGE KEYS ==========
const KEYS = {
  clients: 'fab_clients',
  commandes: 'fab_commandes',
  notifications: 'fab_notifications',
  salesReps: 'fab_sales_reps',
}

function inferRegionFromAddress(address: string): string {
  if (!address) return 'Autre'
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
  // Include all active sales reps first
  getSalesReps().forEach((r) => s.add(r.name))
  // Also include any legacy references in orders and clients
  getCommandes().forEach((c) => s.add(c.commercial))
  getClients().forEach((c) => s.add(c.commercial))
  return [...s].sort((a, b) => a.localeCompare(b, 'fr'))
}

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

// ========== SYNC PUMP ==========
export async function syncSupabaseData() {
  if (!isBrowser()) return
  try {
    const [cRes, cmdRes, nRes, srRes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('commandes').select('*').order('date', { ascending: false }),
      supabase.from('notifications').select('*').order('date', { ascending: false }),
      supabase.from('sales_reps').select('*')
    ])
    
    if (cRes.data) save(KEYS.clients, cRes.data.map(mapDbToClient))
    if (cmdRes.data) save(KEYS.commandes, cmdRes.data.map(mapDbToCommande))
    if (nRes.data) save(KEYS.notifications, nRes.data.map(mapDbToNotif))
    if (srRes.data) save(KEYS.salesReps, srRes.data.map(mapDbToSalesRep))
      
    notifyCrmDataChanged('*')
  } catch (err) {
    console.error('Failed to sync with Supabase', err)
  }
}

// ========== PUBLIC API ==========

export function getClientNames(): string[] {
  const clients = load<Client>(KEYS.clients, [])
  return clients.map(c => c.name)
}

// --- CLIENTS ---
export function getClients(): Client[] {
  return load<Client>(KEYS.clients, [])
}

export async function addClient(client: Omit<Client, 'id' | 'commandes'>): Promise<Client> {
  const newClientData = { ...client, region: client.region?.trim() || inferRegionFromAddress(client.address), commandes: 0 }
  
  // Insert into DB
  const { data: dbClient, error } = await supabase.from('clients').insert(mapClientToDb(newClientData)).select().single()
  if (error) throw error

  const finalClient = mapDbToClient(dbClient)
  const clients = getClients()
  clients.unshift(finalClient)
  save(KEYS.clients, clients)

  await addNotification('success', 'Nouveau client', `${finalClient.name} a été ajouté au portefeuille`, 'clients')
  return finalClient
}

export async function updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'commandes'>>): Promise<Client | null> {
  const { data: dbClient, error } = await supabase.from('clients').update(mapClientToDb(updates)).eq('id', id).select().single()
  if (error) throw error

  const updatedClient = mapDbToClient(dbClient)
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === id)
  if (idx !== -1) {
    clients[idx] = updatedClient
    save(KEYS.clients, clients)
  }
  return updatedClient
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error

  const clients = getClients()
  const client = clients.find(c => c.id === id)
  save(KEYS.clients, clients.filter(c => c.id !== id))
  if (client) {
    await addNotification('warning', 'Client supprimé', `${client.name} a été retiré du portefeuille`, 'clients')
  }
  return true
}

// --- COMMANDES ---
export function getCommandes(): Commande[] {
  return load<Commande>(KEYS.commandes, [])
}

export async function addCommande(commande: Omit<Commande, 'id'>): Promise<Commande> {
  const { data: dbCmd, error } = await supabase.from('commandes').insert(mapCommandeToDb(commande)).select().single()
  if (error) throw error

  const newCmd = mapDbToCommande(dbCmd)
  const commandes = getCommandes()
  commandes.unshift(newCmd)
  save(KEYS.commandes, commandes)

  // DB Sync Client count - Using RPC or just direct update.
  // Assuming a direct update for simplicity. Real app uses Supabase Trigger on insert!
  const clients = getClients()
  const clientIdx = clients.findIndex(c => c.name === commande.client)
  let updatedCount = 1
  if (clientIdx !== -1) {
    updatedCount = clients[clientIdx].commandes + 1
    clients[clientIdx].commandes = updatedCount
    save(KEYS.clients, clients)
    
    // Also update server side client count
    await supabase.from('clients').update({ commandes_count: updatedCount }).eq('id', clients[clientIdx].id)
  }

  if (commande.statut === 'EN_ATTENTE') {
    await addNotification('warning', 'Commande en attente', `${commande.client} — ${commande.qty} pots en attente`, 'commandes')
  } else if (commande.statut === 'LIVREE') {
    await addNotification('success', 'Commande livrée', `${commande.client} — ${commande.qty} pots livrés`, 'commandes')
  } else {
    await addNotification('info', 'Nouvelle commande', `${commande.client} — ${commande.montant.toLocaleString('fr-FR')} FCFA`, 'commandes')
  }

  return newCmd
}

export async function updateCommande(id: string, updates: Partial<Omit<Commande, 'id'>>): Promise<Commande | null> {
  const oldCommandes = getCommandes()
  const old = oldCommandes.find(c => c.id === id)
  if (!old) return null

  const { data: dbCmd, error } = await supabase.from('commandes').update(mapCommandeToDb(updates)).eq('id', id).select().single()
  if (error) throw error

  const newCmd = mapDbToCommande(dbCmd)
  const commandes = getCommandes()
  const idx = commandes.findIndex(c => c.id === id)
  if (idx !== -1) {
    commandes[idx] = newCmd
    save(KEYS.commandes, commandes)
  }

  if (updates.statut && updates.statut !== old.statut) {
    const sl: Record<string, string> = { EN_ATTENTE: 'En Attente', CONFIRMEE: 'Confirmée', LIVREE: 'Livrée', ANNULEE: 'Annulée' }
    const type = updates.statut === 'LIVREE' ? 'success' : updates.statut === 'ANNULEE' ? 'error' : updates.statut === 'CONFIRMEE' ? 'info' : 'warning'
    await addNotification(type, `Commande ${sl[updates.statut]}`, `${old.client} — statut mis à jour`, 'commandes')
  }

  return newCmd
}

export async function deleteCommande(id: string): Promise<boolean> {
  const oldCommandes = getCommandes()
  const cmd = oldCommandes.find(c => c.id === id)
  
  const { error } = await supabase.from('commandes').delete().eq('id', id)
  if (error) throw error

  save(KEYS.commandes, oldCommandes.filter(c => c.id !== id))

  if (cmd) {
    const clients = getClients()
    const clientIdx = clients.findIndex(c => c.name === cmd.client)
    if (clientIdx !== -1 && clients[clientIdx].commandes > 0) {
      const updatedCount = clients[clientIdx].commandes - 1
      clients[clientIdx].commandes = updatedCount
      save(KEYS.clients, clients)
      await supabase.from('clients').update({ commandes_count: updatedCount }).eq('id', clients[clientIdx].id)
    }
    await addNotification('error', 'Commande supprimée', `${cmd.client} — ${cmd.montant.toLocaleString('fr-FR')} FCFA`, 'commandes')
  }
  return true
}

// --- ÉQUIPE COMMERCIALE ---
export function getSalesReps(): SalesRep[] {
  return load<SalesRep>(KEYS.salesReps, [])
}

export async function addSalesRep(rep: Omit<SalesRep, 'id'>): Promise<SalesRep> {
  const { data: dbSr, error } = await supabase.from('sales_reps').insert({
    name: rep.name, email: rep.email, zone: rep.zone, phone: rep.phone, objectif: rep.objectif, // mapping issues handled
    avatar_initials: rep.avatarInitials, photo_url: rep.photoUrl, role: rep.role, 
    accent_color: rep.accentColor, taches_en_cours: rep.tachesEnCours,
    activites_commerciales: rep.activitesCommerciales, client_ids: rep.clientIds
  }).select().single()
  if (error) throw error

  const newRep = mapDbToSalesRep(dbSr)
  const list = getSalesReps()
  list.unshift(newRep)
  save(KEYS.salesReps, list)
  return newRep
}

export async function updateSalesRep(id: string, updates: Partial<Omit<SalesRep, 'id'>>): Promise<SalesRep | null> {
  const toUpdate: any = {}
  if (updates.name) toUpdate.name = updates.name
  if (updates.email) toUpdate.email = updates.email
  if (updates.zone) toUpdate.zone = updates.zone
  if (updates.phone) toUpdate.phone = updates.phone
  if (updates.objectif !== undefined) toUpdate.objectif = updates.objectif
  if (updates.avatarInitials) toUpdate.avatar_initials = updates.avatarInitials
  if (updates.photoUrl !== undefined) toUpdate.photo_url = updates.photoUrl
  if (updates.role !== undefined) toUpdate.role = updates.role
  if (updates.accentColor !== undefined) toUpdate.accent_color = updates.accentColor
  if (updates.tachesEnCours !== undefined) toUpdate.taches_en_cours = updates.tachesEnCours
  if (updates.activitesCommerciales !== undefined) toUpdate.activites_commerciales = updates.activitesCommerciales
  if (updates.clientIds) toUpdate.client_ids = updates.clientIds

  const { data: dbSr, error } = await supabase.from('sales_reps').update(toUpdate).eq('id', id).select().single()
  if (error) throw error

  const upRep = mapDbToSalesRep(dbSr)
  const list = getSalesReps()
  const idx = list.findIndex(r => r.id === id)
  if (idx !== -1) {
    list[idx] = upRep
    save(KEYS.salesReps, list)
  }
  return upRep
}

export async function deleteSalesRep(id: string): Promise<boolean> {
  const { error } = await supabase.from('sales_reps').delete().eq('id', id)
  if (error) throw error

  const list = getSalesReps()
  save(KEYS.salesReps, list.filter(r => r.id !== id))
  return true
}

export function ventesRealiseesForRep(repName: string): number {
  return getCommandes()
    .filter(c => c.commercial === repName && c.statut !== 'ANNULEE')
    .reduce((s, c) => s + c.montant, 0)
}

// --- NOTIFICATIONS ---
export function getNotifications(userRole?: string, userName?: string): Notification[] {
  const allNotifs = load<Notification>(KEYS.notifications, [])
  if (userRole === 'COMMERCIAL' && userName) {
    const clients = getClients()
    const myClients = clients.filter(c => c.commercial === userName)
    const myClientNames = myClients.map(c => c.name)
    return allNotifs.filter(n => 
      myClientNames.some(name => n.message.startsWith(name) || n.message.includes(name))
    )
  }
  return allNotifs
}

export function getUnreadCount(userRole?: string, userName?: string): number {
  return getNotifications(userRole, userName).filter(n => !n.read).length
}

export async function markAllRead(userRole?: string, userName?: string): Promise<void> {
  const notifs = getNotifications(userRole, userName)
  const ids = notifs.filter(n => !n.read).map(n => n.id)
  if (ids.length > 0) {
    await supabase.from('notifications').update({ read: true }).in('id', ids)
    const allNotifs = load<Notification>(KEYS.notifications, [])
    allNotifs.forEach(n => {
      if (ids.includes(n.id)) n.read = true
    })
    save(KEYS.notifications, allNotifs)
  }
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  if (!error) {
    const notifs = getNotifications()
    const n = notifs.find(x => x.id === id)
    if (n) { n.read = true; save(KEYS.notifications, notifs) }
  }
}

export async function clearNotification(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (!error) {
    const notifs = getNotifications()
    save(KEYS.notifications, notifs.filter(n => n.id !== id))
  }
}

export async function addNotification(type: Notification['type'], title: string, message: string, link?: string | null): Promise<void> {
  const messageOut =
    link === 'commandes' ? appendOrderAlertsContactLine(message) : message
  const dbPayload = { type, title, message: messageOut, link: link || null, read: false }
  const { data: dbNotif, error } = await supabase.from('notifications').insert(dbPayload).select().single()
  if (!error && dbNotif) {
    const notifs = getNotifications()
    notifs.unshift(mapDbToNotif(dbNotif))
    if (notifs.length > 50) notifs.length = 50
    save(KEYS.notifications, notifs)
  }
}

// --- DASHBOARD STATS ---
export function getDashboardStats(userRole: string, userName?: string) {
  const commandes = getCommandes()
  const clients = getClients()
  const fullAccess = userRole === 'DG' || userRole === 'ADMIN'

  const userCommandes = fullAccess ? commandes : commandes.filter(c => c.commercial === userName)
  const userClients = fullAccess ? clients : clients.filter(c => c.commercial === userName)

  const totalVentes = userCommandes.filter(c => c.statut !== 'ANNULEE').reduce((s, c) => s + c.montant, 0)
  const totalCommandes = userCommandes.length
  const totalClients = userClients.length
  const pendingOrders = userCommandes.filter(c => c.statut === 'EN_ATTENTE').length

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

  const statusCounts = [
    { statut: 'EN_ATTENTE', count: userCommandes.filter(c => c.statut === 'EN_ATTENTE').length, montant: userCommandes.filter(c => c.statut === 'EN_ATTENTE').reduce((s, c) => s + c.montant, 0) },
    { statut: 'CONFIRMEE', count: userCommandes.filter(c => c.statut === 'CONFIRMEE').length, montant: userCommandes.filter(c => c.statut === 'CONFIRMEE').reduce((s, c) => s + c.montant, 0) },
    { statut: 'LIVREE', count: userCommandes.filter(c => c.statut === 'LIVREE').length, montant: userCommandes.filter(c => c.statut === 'LIVREE').reduce((s, c) => s + c.montant, 0) },
    { statut: 'ANNULEE', count: userCommandes.filter(c => c.statut === 'ANNULEE').length, montant: userCommandes.filter(c => c.statut === 'ANNULEE').reduce((s, c) => s + c.montant, 0) },
  ]

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
  
  // Also sync again
  syncSupabaseData()
}
