import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  clientScopeWhere,
  isAuthError,
  mergeWhere,
  requireRole,
} from '@/lib/api-auth'

const ROLES = ['admin', 'agent', 'client'] as const

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, [...ROLES])
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const moyen = searchParams.get('moyen')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (statut) where.statut = statut
    if (moyen) where.moyen = moyen
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { clientName: { contains: search } },
        { transactionId: { contains: search } },
      ]
    }

    const scoped = mergeWhere(where, clientScopeWhere(auth))

    const paiements = await db.paiement.findMany({
      where: scoped,
      include: {
        compagnie: { select: { id: true, nom: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: paiements })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin', 'agent'])
    if (isAuthError(auth)) return auth

    const body = await req.json()
    const count = await db.paiement.count()
    const reference = `PAY-2026-${String(count + 1).padStart(4, '0')}`

    const paiement = await db.paiement.create({
      data: {
        reference,
        clientId: body.clientId || null,
        clientName: body.clientName || '',
        clientAvatar: body.clientAvatar || '',
        contratRef: body.contratRef || '',
        compagnieId: body.compagnieId || null,
        companyName: body.companyName || '',
        montant: body.montant || 0,
        commission: body.commission || 0,
        moyen: body.moyen || 'Orange Money',
        statut: body.statut || 'En attente',
        date: body.date || new Date().toLocaleDateString('fr-FR'),
        transactionId: body.transactionId || `TXN-${Date.now()}`,
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'CREATE_PAIEMENT',
        entity: 'paiement',
        entityId: paiement.id,
        details: `Paiement ${reference} créé`,
      },
    })

    return NextResponse.json({ data: paiement }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
