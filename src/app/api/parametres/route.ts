import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth, requireRole } from '@/lib/api-auth'

const DEFAULTS: Record<string, string> = {
  nom: 'Assistances Assurances Mali',
  slogan: 'Assurance, simplifiée',
  email: 'contact@aam.ml',
  telephone: '+223 20 22 33 44',
  adresse: 'Bamako, Mali',
  langue: 'fr',
  anneesExperience: '15',
  partenaires: '0',
  tauxSatisfaction: '0',
  clients: '0',
  scorePrix: '40',
  scoreGaranties: '35',
  scoreNote: '15',
  scoreDelai: '10',
  dureeSession: '60',
  couleurPrimaire: '#2563eb',
  couleurSecondaire: '#10b981',
  theme: 'light',
}

async function loadSettings() {
  const settings = await db.setting.findMany()
  const result: Record<string, string> = { ...DEFAULTS }
  for (const s of settings) {
    result[s.key] = s.value
  }
  return result
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth
    return NextResponse.json(await loadSettings())
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const body = (await req.json()) as Record<string, string>
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
    }

    const entries = Object.entries(body).filter(
      ([key, value]) => typeof key === 'string' && typeof value === 'string'
    )

    await Promise.all(
      entries.map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    )

    return NextResponse.json(await loadSettings())
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    )
  }
}
