import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      include: { company: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }
    const { password, ...safe } = user
    return NextResponse.json({ data: safe })
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
    const existing = await db.user.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const updated = await db.user.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.role && { role: body.role }),
        ...(body.telephone !== undefined && { telephone: body.telephone }),
        ...(body.statut && { statut: body.statut }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.updatedBy || null,
        userName: body.updatedByName || 'System',
        action: 'UPDATE_USER',
        entity: 'user',
        entityId: params.id,
        details: `Utilisateur ${existing.name} mis à jour`,
      },
    })

    const { password, ...safe } = updated
    return NextResponse.json({ data: safe })
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
    const existing = await db.user.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    await db.user.delete({ where: { id: params.id } })
    await db.auditLog.create({
      data: {
        userName: 'System',
        action: 'DELETE_USER',
        entity: 'user',
        entityId: params.id,
        details: `Utilisateur ${existing.name} supprimé`,
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
