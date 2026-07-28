import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sinistre = await db.sinistre.findUnique({
      where: { id: params.id },
      include: { compagnie: true, client: true },
    })

    if (!sinistre) {
      return NextResponse.json({ error: 'Sinistre introuvable' }, { status: 404 })
    }

    return NextResponse.json({ data: sinistre })
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
    const existing = await db.sinistre.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sinistre introuvable' }, { status: 404 })
    }

    const updated = await db.sinistre.update({
      where: { id: params.id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.montantRembourse !== undefined && { montantRembourse: body.montantRembourse }),
        ...(body.dateTraitement && { dateTraitement: body.dateTraitement }),
        ...(body.delaiH !== undefined && { delaiH: body.delaiH }),
        ...(body.gestionnaire && { gestionnaire: body.gestionnaire }),
        ...(body.pieces && {
          pieces: Array.isArray(body.pieces) ? body.pieces.join(',') : body.pieces,
        }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'UPDATE_SINISTRE',
        entity: 'sinistre',
        entityId: params.id,
        details: `Sinistre ${existing.reference} mis à jour — statut: ${body.statut || existing.statut}`,
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
    const existing = await db.sinistre.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sinistre introuvable' }, { status: 404 })
    }

    await db.sinistre.delete({ where: { id: params.id } })
    await db.auditLog.create({
      data: {
        userName: 'System',
        action: 'DELETE_SINISTRE',
        entity: 'sinistre',
        entityId: params.id,
        details: `Sinistre ${existing.reference} supprimé`,
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
