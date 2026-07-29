import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth, requireRole } from '@/lib/api-auth'

function parseTarifsJson(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function serializeProduit(p: {
  garanties: string
  tarifsJson: string
  [key: string]: unknown
}) {
  return {
    ...p,
    garanties: p.garanties
      ? p.garanties.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    tarifs: parseTarifsJson(p.tarifsJson),
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const branche = searchParams.get('branche')
    const statut = searchParams.get('statut')
    const compagnieId = searchParams.get('compagnieId')

    const where: Record<string, string> = {}
    if (branche) where.branche = branche
    if (statut) where.statut = statut
    if (compagnieId) where.compagnieId = compagnieId
    if (auth.role === 'correspondant' && auth.companyId) {
      where.compagnieId = auth.companyId
    }

    const produits = await db.produit.findMany({
      where,
      include: {
        compagnie: {
          select: {
            id: true,
            nom: true,
            initials: true,
            statut: true,
            rating: true,
            delaiTraitement: true,
          },
        },
      },
      orderBy: { nom: 'asc' },
    })

    return NextResponse.json({ data: produits.map(serializeProduit) })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin', 'correspondant'])
    if (isAuthError(auth)) return auth

    const body = await req.json()
    if (!body.nom || !body.branche || !body.compagnieId) {
      return NextResponse.json(
        { error: 'nom, branche et compagnieId requis' },
        { status: 400 }
      )
    }

    if (auth.role === 'correspondant' && body.compagnieId !== auth.companyId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const tarifsJson =
      typeof body.tarifsJson === 'string'
        ? body.tarifsJson
        : JSON.stringify(
            body.tarifs || {
              basePrime: Number(body.basePrime) || 0,
            }
          )

    const garanties = Array.isArray(body.garanties)
      ? body.garanties.join(',')
      : body.garanties || ''

    const produit = await db.produit.create({
      data: {
        nom: body.nom,
        branche: body.branche,
        compagnieId: body.compagnieId,
        tarifsJson,
        garanties,
        statut: body.statut || 'Actif',
      },
      include: {
        compagnie: {
          select: {
            id: true,
            nom: true,
            initials: true,
            statut: true,
            rating: true,
            delaiTraitement: true,
          },
        },
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'CREATE_PRODUIT',
        entity: 'produit',
        entityId: produit.id,
        details: `Produit ${produit.nom} (${produit.branche}) créé`,
      },
    })

    return NextResponse.json({ data: serializeProduit(produit) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors de la création',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    )
  }
}
