// Format helpers (kept separate from static data for API-driven usage)

export const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

// ============ API FETCH FUNCTIONS ============

const API_BASE = '/api'

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function patchJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

async function deleteJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ============ TYPES (matching Prisma models) ============

export interface DevisDTO {
  id: string
  reference: string
  clientId: string | null
  clientName: string
  clientAvatar: string
  branche: string
  compagnieId: string | null
  companyName: string
  produitNom: string
  prime: number
  garanties: string
  duree: string
  dateDebut: string
  statut: string
  agentName: string
  dateCreation: string
  createdAt: string
  updatedAt: string
  compagnie?: { id: string; nom: string } | null
  client?: { id: string; name: string } | null
}

export interface ContratDTO {
  id: string
  reference: string
  clientId: string | null
  clientName: string
  clientAvatar: string
  branche: string
  compagnieId: string | null
  companyName: string
  produit: string
  prime: number
  garanties: string
  statut: string
  dateDebut: string
  dateFin: string
  prochainRenouvellement: string
  modePaiement: string
  agentName: string
  devisId: string | null
  createdAt: string
  updatedAt: string
  compagnie?: { id: string; nom: string } | null
  client?: { id: string; name: string } | null
}

export interface SinistreDTO {
  id: string
  reference: string
  clientId: string | null
  clientName: string
  clientAvatar: string
  branche: string
  compagnieId: string | null
  companyName: string
  contratRef: string
  description: string
  montantDemande: number
  montantRembourse: number | null
  statut: string
  dateDeclaration: string
  dateTraitement: string | null
  delaiH: number
  gestionnaire: string
  pieces: string
  createdAt: string
  updatedAt: string
  compagnie?: { id: string; nom: string } | null
  client?: { id: string; name: string } | null
}

export interface CompagnieDTO {
  id: string
  nom: string
  initials: string
  iconColor: string
  agrement: string
  statut: string
  rating: number
  delaiTraitement: number
  contact: string
  email: string
  telephone: string
  datePartenariat: string
  branches: string
  createdAt: string
  updatedAt: string
  _count?: { devis: number; contrats: number; sinistres: number }
}

export interface PaiementDTO {
  id: string
  reference: string
  clientId: string | null
  clientName: string
  clientAvatar: string
  contratRef: string
  compagnieId: string | null
  companyName: string
  montant: number
  commission: number
  moyen: string
  statut: string
  date: string
  transactionId: string
  createdAt: string
  updatedAt: string
  compagnie?: { id: string; nom: string } | null
  client?: { id: string; name: string } | null
}

export interface UserDTO {
  id: string
  email: string
  name: string
  role: string
  telephone: string
  avatar: string
  statut: string
  companyId: string | null
  company?: { id: string; nom: string } | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StatsDTO {
  totals: {
    devis: number
    contrats: number
    activeContrats: number
    sinistres: number
    pendingSinistres: number
    paiements: number
    compagnies: number
    activeCompagnies: number
    users: number
    activeUsers: number
  }
  financials: {
    totalPayments: number
    totalCommissions: number
    activeContratsPrime: number
  }
  breakdowns: {
    devisByStatut: { _count: number; statut: string }[]
    contratsByBranche: { _count: number; branche: string }[]
    sinistresByStatut: { _count: number; statut: string }[]
    paiementsByMoyen: { _count: number; moyen: string }[]
  }
}

// ============ API FUNCTIONS ============

export const api = {
  // Devis
  getDevis: (params?: { statut?: string; branche?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.statut) qs.set('statut', params.statut)
    if (params?.branche) qs.set('branche', params.branche)
    if (params?.search) qs.set('search', params.search)
    return fetchJSON<{ data: DevisDTO[] }>(`${API_BASE}/devis?${qs}`)
  },
  createDevis: (body: any) => postJSON<{ data: DevisDTO }>(`${API_BASE}/devis`, body),
  updateDevis: (id: string, body: any) => patchJSON<{ data: DevisDTO }>(`${API_BASE}/devis/${id}`, body),
  deleteDevis: (id: string) => deleteJSON(`${API_BASE}/devis/${id}`),

  // Contrats
  getContrats: (params?: { statut?: string; branche?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.statut) qs.set('statut', params.statut)
    if (params?.branche) qs.set('branche', params.branche)
    if (params?.search) qs.set('search', params.search)
    return fetchJSON<{ data: ContratDTO[] }>(`${API_BASE}/contrats?${qs}`)
  },
  createContrat: (body: any) => postJSON<{ data: ContratDTO }>(`${API_BASE}/contrats`, body),
  updateContrat: (id: string, body: any) => patchJSON<{ data: ContratDTO }>(`${API_BASE}/contrats/${id}`, body),
  deleteContrat: (id: string) => deleteJSON(`${API_BASE}/contrats/${id}`),

  // Sinistres
  getSinistres: (params?: { statut?: string; branche?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.statut) qs.set('statut', params.statut)
    if (params?.branche) qs.set('branche', params.branche)
    if (params?.search) qs.set('search', params.search)
    return fetchJSON<{ data: SinistreDTO[] }>(`${API_BASE}/sinistres?${qs}`)
  },
  createSinistre: (body: any) => postJSON<{ data: SinistreDTO }>(`${API_BASE}/sinistres`, body),
  updateSinistre: (id: string, body: any) => patchJSON<{ data: SinistreDTO }>(`${API_BASE}/sinistres/${id}`, body),
  deleteSinistre: (id: string) => deleteJSON(`${API_BASE}/sinistres/${id}`),

  // Compagnies
  getCompagnies: (params?: { statut?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.statut) qs.set('statut', params.statut)
    if (params?.search) qs.set('search', params.search)
    return fetchJSON<{ data: CompagnieDTO[] }>(`${API_BASE}/compagnies?${qs}`)
  },
  createCompagnie: (body: any) => postJSON<{ data: CompagnieDTO }>(`${API_BASE}/compagnies`, body),
  updateCompagnie: (id: string, body: any) => patchJSON<{ data: CompagnieDTO }>(`${API_BASE}/compagnies/${id}`, body),
  deleteCompagnie: (id: string) => deleteJSON(`${API_BASE}/compagnies/${id}`),

  // Paiements
  getPaiements: (params?: { statut?: string; moyen?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.statut) qs.set('statut', params.statut)
    if (params?.moyen) qs.set('moyen', params.moyen)
    if (params?.search) qs.set('search', params.search)
    return fetchJSON<{ data: PaiementDTO[] }>(`${API_BASE}/paiements?${qs}`)
  },
  createPaiement: (body: any) => postJSON<{ data: PaiementDTO }>(`${API_BASE}/paiements`, body),
  updatePaiement: (id: string, body: any) => patchJSON<{ data: PaiementDTO }>(`${API_BASE}/paiements/${id}`, body),
  deletePaiement: (id: string) => deleteJSON(`${API_BASE}/paiements/${id}`),

  // Users
  getUsers: (params?: { role?: string; statut?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.role) qs.set('role', params.role)
    if (params?.statut) qs.set('statut', params.statut)
    if (params?.search) qs.set('search', params.search)
    return fetchJSON<{ data: UserDTO[] }>(`${API_BASE}/utilisateurs?${qs}`)
  },
  createUser: (body: any) => postJSON<{ data: UserDTO }>(`${API_BASE}/utilisateurs`, body),
  updateUser: (id: string, body: any) => patchJSON<{ data: UserDTO }>(`${API_BASE}/utilisateurs/${id}`, body),
  deleteUser: (id: string) => deleteJSON(`${API_BASE}/utilisateurs/${id}`),

  // Stats
  getStats: () => fetchJSON<StatsDTO>(`${API_BASE}/stats`),

  // Auth
  login: (email: string, password: string) =>
    postJSON<{ user: any; token: string }>(`${API_BASE}/auth/login`, { email, password }),

  // Search (global)
  search: async (query: string) => {
    if (!query || query.trim().length < 2) return []
    const [devis, contrats, sinistres, compagnies, paiements, users] = await Promise.all([
      api.getDevis({ search: query }),
      api.getContrats({ search: query }),
      api.getSinistres({ search: query }),
      api.getCompagnies({ search: query }),
      api.getPaiements({ search: query }),
      api.getUsers({ search: query }),
    ])
    const results: any[] = []
    devis.data.forEach((d) => results.push({ id: `devis-${d.id}`, type: 'devis', title: d.reference, subtitle: `${d.clientName} · ${d.branche}`, meta: formatFCFA(d.prime), page: 'devis' }))
    contrats.data.forEach((c) => results.push({ id: `contrat-${c.id}`, type: 'contrat', title: c.reference, subtitle: `${c.clientName} · ${c.produit}`, meta: c.statut, page: 'contrats' }))
    sinistres.data.forEach((s) => results.push({ id: `sinistre-${s.id}`, type: 'sinistre', title: s.reference, subtitle: `${s.clientName} · ${s.branche}`, meta: s.statut, page: 'sinistres' }))
    compagnies.data.forEach((c) => results.push({ id: `compagnie-${c.id}`, type: 'compagnie', title: c.nom, subtitle: c.agrement, meta: c.statut, page: 'compagnies' }))
    paiements.data.forEach((p) => results.push({ id: `paiement-${p.id}`, type: 'paiement', title: p.reference, subtitle: `${p.clientName} · ${p.moyen}`, meta: p.statut, page: 'paiements' }))
    users.data.forEach((u) => results.push({ id: `user-${u.id}`, type: 'utilisateur', title: u.name, subtitle: u.email, meta: u.statut, page: 'utilisateurs' }))
    return results.slice(0, 12)
  },
}
