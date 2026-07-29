import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { isAuthError, requireAuth, requireRole } from '@/lib/api-auth'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    if (auth.role !== 'admin' && auth.userId !== id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id },
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const body = await req.json()
    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const passwordUpdate =
      body.password && String(body.password).length >= 8
        ? { password: await hashPassword(body.password) }
        : {}

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.role && { role: body.role }),
        ...(body.telephone !== undefined && { telephone: body.telephone }),
        ...(body.statut && { statut: body.statut }),
        ...(body.avatar !== undefined && { avatar: body.avatar }),
        ...(body.companyId !== undefined && { companyId: body.companyId }),
        ...passwordUpdate,
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'UPDATE_USER',
        entity: 'user',
        entityId: id,
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'DELETE_USER',
        entity: 'user',
        entityId: id,
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
