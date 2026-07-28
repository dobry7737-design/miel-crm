import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/devis/[id] — get a single devis
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const devis = await db.devis.findUnique({
      where: { id: params.id },
      include: {
        compagnie: true,
        client: true,
      },
    })

    if (!devis) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    return NextResponse.json({ data: devis })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

// PATCH /api/devis/[id] — update a devis
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { id } = params

    const existing = await db.devis.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    const updated = await db.devis.update({
      where: { id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.prime !== undefined && { prime: body.prime }),
        ...(body.garanties && {
          garanties: Array.isArray(body.garanties)
            ? body.garanties.join(',')
            : body.garanties,
        }),
        ...(body.duree && { duree: body.duree }),
        ...(body.dateDebut && { dateDebut: body.dateDebut }),
        ...(body.compagnieId !== undefined && { compagnieId: body.compagnieId }),
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.produitNom !== undefined && { produitNom: body.produitNom }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'UPDATE_DEVIS',
        entity: 'devis',
        entityId: id,
        details: `Devis ${existing.reference} mis à jour — statut: ${body.statut || existing.statut}`,
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

// DELETE /api/devis/[id] — delete a devis
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await db.devis.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    await db.devis.delete({ where: { id: params.id } })

    await db.auditLog.create({
      data: {
        userName: 'System',
        action: 'DELETE_DEVIS',
        entity: 'devis',
        entityId: params.id,
        details: `Devis ${existing.reference} supprimé`,
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
