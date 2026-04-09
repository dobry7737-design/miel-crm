import type { AppRole } from '@/lib/permissions'

export interface DemoUser {
  id: string
  name: string
  password: string
  role: AppRole
  /** Autres libellés acceptés au login (fautes / sans accent / raccourcis) */
  loginAliases?: string[]
}

/** Comptes de démonstration — source unique pour login et UI */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'dg-001',
    name: 'Directeur General',
    password: 'dg123',
    role: 'DG',
    loginAliases: ['Directeur Général', 'DG', 'dg', 'directeur'],
  },
  {
    id: 'adm-001',
    name: 'Admin Système',
    password: 'admin123',
    role: 'ADMIN',
    loginAliases: ['Admin Systeme', 'Admin', 'admin', 'Administrateur'],
  },
  {
    id: 'com-001',
    name: 'Amadou Diallo',
    password: 'com123',
    role: 'COMMERCIAL',
    loginAliases: ['Amadou', 'Diallo', 'amadou'],
  },
]

export function getDemoUsersByRole(role: AppRole): DemoUser[] {
  return DEMO_USERS.filter((u) => u.role === role)
}

export function getRoleLabel(role: AppRole): string {
  switch (role) {
    case 'DG':
      return 'Directeur général'
    case 'COMMERCIAL':
      return 'Commercial'
    case 'RESP_COMMERCIAL':
      return 'Responsable Commercial'
    case 'ADMIN':
      return 'Administrateur'
    default:
      return role
  }
}

function cleanCredential(s: string): string {
  return s
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
}

function stripAccentsLower(s: string): string {
  return cleanCredential(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function passwordMatches(stored: string, input: string): boolean {
  const a = cleanCredential(stored)
  const b = cleanCredential(input)
  if (a === b) return true
  return a.toLowerCase() === b.toLowerCase()
}

function nameMatchesUser(u: DemoUser, rawInput: string): boolean {
  const input = cleanCredential(rawInput).normalize('NFC')
  if (!input) return false
  const candidates = [u.id, u.name, ...(u.loginAliases ?? [])]
  for (const c of candidates) {
    const cand = cleanCredential(c).normalize('NFC')
    if (cand === input) return true
    if (cand.toLowerCase() === input.toLowerCase()) return true
    if (stripAccentsLower(cand) === stripAccentsLower(input)) return true
  }
  return false
}

export function findDemoUser(name: string, password: string): DemoUser | undefined {
  const p = cleanCredential(password)
  if (!p) return undefined
  return DEMO_USERS.find((u) => nameMatchesUser(u, name) && passwordMatches(u.password, p))
}
