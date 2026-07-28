import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/devis — list all devis with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const branche = searchParams.get('branche')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (statut) where.statut = statut
    if (branche) where.branche = branche
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { clientName: { contains: search } },
        { companyName: { contains: search } },
      ]
    }

    const [devis, total] = await Promise.all([
      db.devis.findMany({
        where,
        include: {
          compagnie: { select: { id: true, nom: true } },
          client: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.devis.count({ where }),
    ])

    return NextResponse.json({
      data: devis,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

// POST /api/devis — create a new devis
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Generate reference
    const count = await db.devis.count()
    const reference = `DEV-2026-${String(count + 488).padStart(4, '0')}`

    const devis = await db.devis.create({
      data: {
        reference,
        clientId: body.clientId || null,
        clientName: body.clientName || '',
        clientAvatar: body.clientAvatar || '',
        branche: body.branche,
        compagnieId: body.compagnieId || null,
        companyName: body.companyName || '',
        produitNom: body.produitNom || '',
        prime: body.prime || 0,
        garanties: Array.isArray(body.garanties) ? body.garanties.join(',') : body.garanties || '',
        duree: body.duree || '12 mois',
        dateDebut: body.dateDebut || new Date().toISOString().split('T')[0],
        statut: body.statut || 'Émis',
        agentName: body.agentName || '',
        dateCreation: new Date().toLocaleDateString('fr-FR'),
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'CREATE_DEVIS',
        entity: 'devis',
        entityId: devis.id,
        details: `Devis ${reference} créé`,
      },
    })

    return NextResponse.json({ data: devis }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
