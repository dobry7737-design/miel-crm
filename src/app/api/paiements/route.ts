import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const moyen = searchParams.get('moyen')
    const search = searchParams.get('search')

    const where: any = {}
    if (statut) where.statut = statut
    if (moyen) where.moyen = moyen
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { clientName: { contains: search } },
        { transactionId: { contains: search } },
      ]
    }

    const paiements = await db.paiement.findMany({
      where,
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
    const body = await req.json()
    const count = await db.paiement.count()
    const reference = `PAY-2026-${String(count + 322).padStart(4, '0')}`

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
        userId: body.userId || null,
        userName: body.userName || 'System',
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
