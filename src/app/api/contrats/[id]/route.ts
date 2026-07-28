import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contrat = await db.contrat.findUnique({
      where: { id: params.id },
      include: { compagnie: true, client: true },
    })

    if (!contrat) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
    }

    return NextResponse.json({ data: contrat })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const existing = await db.contrat.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
    }

    const updated = await db.contrat.update({
      where: { id: params.id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.prime !== undefined && { prime: body.prime }),
        ...(body.dateFin && { dateFin: body.dateFin }),
        ...(body.prochainRenouvellement && { prochainRenouvellement: body.prochainRenouvellement }),
        ...(body.modePaiement && { modePaiement: body.modePaiement }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'UPDATE_CONTRAT',
        entity: 'contrat',
        entityId: params.id,
        details: `Contrat ${existing.reference} mis à jour`,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.contrat.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
    }

    await db.contrat.delete({ where: { id: params.id } })
    await db.auditLog.create({
      data: {
        userName: 'System',
        action: 'DELETE_CONTRAT',
        entity: 'contrat',
        entityId: params.id,
        details: `Contrat ${existing.reference} supprimé`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
