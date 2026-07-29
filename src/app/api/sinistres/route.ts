import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  clientScopeWhere,
  companyScopeWhere,
  isAuthError,
  mergeWhere,
  requireRole,
} from '@/lib/api-auth'

const ROLES = ['admin', 'agent', 'client', 'gestionnaire'] as const

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, [...ROLES])
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const branche = searchParams.get('branche')
    const search = searchParams.get('search')

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

    const scoped = mergeWhere(where, clientScopeWhere(auth), companyScopeWhere(auth))

    const sinistres = await db.sinistre.findMany({
      where: scoped,
      include: {
        compagnie: { select: { id: true, nom: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: sinistres })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client', 'gestionnaire'])
    if (isAuthError(auth)) return auth

    const body = await req.json()
    const count = await db.sinistre.count()
    const reference = `SIN-2026-${String(count + 1).padStart(4, '0')}`

    const clientId =
      auth.role === 'client' ? auth.userId : body.clientId || null

    const sinistre = await db.sinistre.create({
      data: {
        reference,
        clientId,
        clientName: body.clientName || '',
        clientAvatar: body.clientAvatar || '',
        branche: body.branche,
        compagnieId: body.compagnieId || null,
        companyName: body.companyName || '',
        contratRef: body.contratRef || '',
        description: body.description || '',
        montantDemande: body.montantDemande || 0,
        montantRembourse: body.montantRembourse || null,
        statut: body.statut || 'Déclaré',
        dateDeclaration:
          body.dateDeclaration || new Date().toLocaleDateString('fr-FR'),
        dateTraitement: body.dateTraitement || null,
        delaiH: body.delaiH || 0,
        gestionnaire: body.gestionnaire || '',
        pieces: Array.isArray(body.pieces)
          ? body.pieces.join(',')
          : body.pieces || '',
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'CREATE_SINISTRE',
        entity: 'sinistre',
        entityId: sinistre.id,
        details: `Sinistre ${reference} déclaré`,
      },
    })

    return NextResponse.json({ data: sinistre }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
