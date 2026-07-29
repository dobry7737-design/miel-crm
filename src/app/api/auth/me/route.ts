import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionFromRequest } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { company: true },
    })

    if (!user || user.statut === 'Suspendu') {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        telephone: user.telephone,
        statut: user.statut,
        company: user.company
          ? { id: user.company.id, name: user.company.nom }
          : null,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    )
  }
}
