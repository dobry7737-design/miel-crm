import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paiement = await db.paiement.findUnique({
      where: { id: params.id },
      include: { compagnie: true, client: true },
    })
    if (!paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }
    return NextResponse.json({ data: paiement })
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
    const existing = await db.paiement.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    const updated = await db.paiement.update({
      where: { id: params.id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.montant !== undefined && { montant: body.montant }),
        ...(body.commission !== undefined && { commission: body.commission }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'UPDATE_PAIEMENT',
        entity: 'paiement',
        entityId: params.id,
        details: `Paiement ${existing.reference} mis à jour — statut: ${body.statut || existing.statut}`,
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
    const existing = await db.paiement.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    await db.paiement.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
