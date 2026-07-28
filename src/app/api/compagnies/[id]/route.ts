import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const compagnie = await db.compagnie.findUnique({
      where: { id: params.id },
      include: {
        produits: true,
        _count: { select: { devis: true, contrats: true, sinistres: true } },
      },
    })

    if (!compagnie) {
      return NextResponse.json({ error: 'Compagnie introuvable' }, { status: 404 })
    }

    return NextResponse.json({ data: compagnie })
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
    const existing = await db.compagnie.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Compagnie introuvable' }, { status: 404 })
    }

    const updated = await db.compagnie.update({
      where: { id: params.id },
      data: {
        ...(body.nom && { nom: body.nom }),
        ...(body.initials !== undefined && { initials: body.initials }),
        ...(body.iconColor && { iconColor: body.iconColor }),
        ...(body.statut && { statut: body.statut }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.delaiTraitement !== undefined && { delaiTraitement: body.delaiTraitement }),
        ...(body.contact !== undefined && { contact: body.contact }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.telephone !== undefined && { telephone: body.telephone }),
        ...(body.branches !== undefined && {
          branches: Array.isArray(body.branches) ? body.branches.join(',') : body.branches,
        }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.userId || null,
        userName: body.userName || 'System',
        action: 'UPDATE_COMPAGNIE',
        entity: 'compagnie',
        entityId: params.id,
        details: `Compagnie ${existing.nom} mise à jour`,
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
    const existing = await db.compagnie.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Compagnie introuvable' }, { status: 404 })
    }

    await db.compagnie.delete({ where: { id: params.id } })
    await db.auditLog.create({
      data: {
        userName: 'System',
        action: 'DELETE_COMPAGNIE',
        entity: 'compagnie',
        entityId: params.id,
        details: `Compagnie ${existing.nom} supprimée`,
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
