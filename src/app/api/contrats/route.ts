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

    const contrats = await db.contrat.findMany({
      where,
      include: {
        compagnie: { select: { id: true, nom: true } },
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: contrats })
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
    const count = await db.contrat.count()
    const reference = `CTR-2026-${String(count + 143).padStart(4, '0')}`

    const contrat = await db.contrat.create({
      data: {
        reference,
        clientId: body.clientId || null,
        clientName: body.clientName || '',
        clientAvatar: body.clientAvatar || '',
        branche: body.branche,
        compagnieId: body.compagnieId || null,
        companyName: body.companyName || '',
        produit: body.produit || '',
        prime: body.prime || 0,
        garanties: Array.isArray(body.garanties) ? body.garanties.join(',') : body.garanties || '',
        statut: body.statut || 'Actif',
        dateDebut: body.dateDebut || '',
        dateFin: body.dateFin || '',
        prochainRenouvellement: body.prochainRenouvellement || '',
        modePaiement: body.modePaiement || '',
        agentName: body.agentName || '',
        devisId: body.devisId || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'CREATE_CONTRAT',
        entity: 'contrat',
        entityId: contrat.id,
        details: `Contrat ${reference} créé`,
      },
    })

    return NextResponse.json({ data: contrat }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
