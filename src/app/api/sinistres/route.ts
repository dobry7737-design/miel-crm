import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const branche = searchParams.get('branche')
    const search = searchParams.get('search')

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

    const sinistres = await db.sinistre.findMany({
      where,
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
    const body = await req.json()
    const count = await db.sinistre.count()
    const reference = `SIN-2026-${String(count + 99).padStart(4, '0')}`

    const sinistre = await db.sinistre.create({
      data: {
        reference,
        clientId: body.clientId || null,
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
        dateDeclaration: body.dateDeclaration || new Date().toLocaleDateString('fr-FR'),
        dateTraitement: body.dateTraitement || null,
        delaiH: body.delaiH || 0,
        gestionnaire: body.gestionnaire || '',
        pieces: Array.isArray(body.pieces) ? body.pieces.join(',') : body.pieces || '',
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
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
