import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  clientScopeWhere,
  companyScopeWhere,
  isAuthError,
  mergeWhere,
  requireRole,
} from '@/lib/api-auth'

const DEVIS_ROLES = ['admin', 'agent', 'client', 'correspondant'] as const

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, [...DEVIS_ROLES])
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const branche = searchParams.get('branche')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}
    if (statut) where.statut = statut
    if (branche) where.branche = branche
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { clientName: { contains: search } },
        { companyName: { contains: search } },
      ]
    }

    const scoped = mergeWhere(
      where,
      clientScopeWhere(auth),
      companyScopeWhere(auth)
    )

    const [devis, total] = await Promise.all([
      db.devis.findMany({
        where: scoped,
        include: {
          compagnie: { select: { id: true, nom: true } },
          client: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.devis.count({ where: scoped }),
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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client'])
    if (isAuthError(auth)) return auth

    const body = await req.json()
    const count = await db.devis.count()
    const reference = `DEV-2026-${String(count + 1).padStart(4, '0')}`

    const clientId =
      auth.role === 'client' ? auth.userId : body.clientId || null

    const devis = await db.devis.create({
      data: {
        reference,
        clientId,
        clientName: body.clientName || '',
        clientAvatar: body.clientAvatar || '',
        branche: body.branche,
        compagnieId: body.compagnieId || null,
        companyName: body.companyName || '',
        produitNom: body.produitNom || '',
        prime: body.prime || 0,
        garanties: Array.isArray(body.garanties)
          ? body.garanties.join(',')
          : body.garanties || '',
        duree: body.duree || '12 mois',
        dateDebut: body.dateDebut || new Date().toISOString().split('T')[0],
        statut: body.statut || 'Émis',
        agentName: body.agentName || (auth.role === 'agent' ? auth.email : ''),
        agentId: auth.role === 'agent' ? auth.userId : body.agentId || null,
        dateCreation: new Date().toLocaleDateString('fr-FR'),
        caracteristiquesJson:
          typeof body.caracteristiquesJson === 'string'
            ? body.caracteristiquesJson
            : JSON.stringify(body.caracteristiques || body.caracteristiquesJson || {}),
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
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
