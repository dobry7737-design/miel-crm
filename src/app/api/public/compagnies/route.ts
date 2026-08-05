import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withPublicCors } from '@/lib/cors'

function serializeCompagnie(c: { branches: string; [key: string]: unknown }) {
  return {
    ...c,
    branches: c.branches
      ? c.branches.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const branche = searchParams.get('branche')

    const where: Record<string, unknown> = { statut: 'Actif' }
    if (branche) where.branches = { contains: branche }

    const compagnies = await db.compagnie.findMany({
      where,
      select: {
        id: true,
        nom: true,
        initials: true,
        iconColor: true,
        rating: true,
        delaiTraitement: true,
        branches: true,
      },
      orderBy: { nom: 'asc' },
    })

    return withPublicCors(
      NextResponse.json({ data: compagnies.map(serializeCompagnie) })
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
