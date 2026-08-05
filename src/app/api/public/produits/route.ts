import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withPublicCors } from '@/lib/cors'

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
    const { searchParams } = new URL(req.url)
    const branche = searchParams.get('branche')

    const where: Record<string, unknown> = {
      statut: 'Actif',
      compagnie: { statut: 'Actif' },
    }
    if (branche) where.branche = branche

    const produits = await db.produit.findMany({
      where,
      select: {
        id: true,
        nom: true,
        branche: true,
        tarifsJson: true,
        garanties: true,
        compagnie: {
          select: {
            id: true,
            nom: true,
            initials: true,
            iconColor: true,
            rating: true,
            delaiTraitement: true,
          },
        },
      },
      orderBy: { nom: 'asc' },
    })

    return withPublicCors(
      NextResponse.json({ data: produits.map(serializeProduit) })
    )
  } catch (error) {
    return withPublicCors(
      NextResponse.json(
        { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
        { status: 500 }
      )
    )
  }
}
