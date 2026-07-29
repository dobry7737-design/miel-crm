import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth, requireRole } from '@/lib/api-auth'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    if (auth.role === 'correspondant' && auth.companyId !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const compagnie = await db.compagnie.findUnique({
      where: { id },
      include: {
        produits: true,
        _count: { select: { devis: true, contrats: true, sinistres: true } },
      },
    })

    if (!compagnie) {
      return NextResponse.json({ error: 'Compagnie introuvable' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        ...compagnie,
        branches: compagnie.branches
          ? compagnie.branches.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const body = await req.json()
    const existing = await db.compagnie.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Compagnie introuvable' }, { status: 404 })
    }

    const updated = await db.compagnie.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom }),
        ...(body.initials !== undefined && { initials: body.initials }),
        ...(body.iconColor && { iconColor: body.iconColor }),
        ...(body.statut && { statut: body.statut }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.delaiTraitement !== undefined && {
          delaiTraitement: body.delaiTraitement,
        }),
        ...(body.contact !== undefined && { contact: body.contact }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.telephone !== undefined && { telephone: body.telephone }),
        ...(body.branches !== undefined && {
          branches: Array.isArray(body.branches)
            ? body.branches.join(',')
            : body.branches,
        }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'UPDATE_COMPAGNIE',
        entity: 'compagnie',
        entityId: id,
        details: `Compagnie ${existing.nom} mise à jour`,
      },
    })

    return NextResponse.json({
      data: {
        ...updated,
        branches: updated.branches
          ? updated.branches.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.compagnie.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Compagnie introuvable' }, { status: 404 })
    }

    await db.compagnie.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'DELETE_COMPAGNIE',
        entity: 'compagnie',
        entityId: id,
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
