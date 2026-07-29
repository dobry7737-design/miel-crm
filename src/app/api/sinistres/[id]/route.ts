import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole, type AuthUser } from '@/lib/api-auth'

type Ctx = { params: Promise<{ id: string }> }

function canAccess(
  auth: AuthUser,
  row: { clientId: string | null; compagnieId: string | null }
) {
  if (['admin', 'agent', 'gestionnaire'].includes(auth.role)) return true
  if (auth.role === 'client') return row.clientId === auth.userId
  return false
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, [
      'admin',
      'agent',
      'client',
      'gestionnaire',
    ])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const sinistre = await db.sinistre.findUnique({
      where: { id },
      include: { compagnie: true, client: true },
    })

    if (!sinistre) {
      return NextResponse.json({ error: 'Sinistre introuvable' }, { status: 404 })
    }
    if (!canAccess(auth, sinistre)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ data: sinistre })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'gestionnaire'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const body = await req.json()
    const existing = await db.sinistre.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sinistre introuvable' }, { status: 404 })
    }

    const updated = await db.sinistre.update({
      where: { id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.montantRembourse !== undefined && {
          montantRembourse: body.montantRembourse,
        }),
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
        userId: auth.userId,
        userName: auth.email,
        action: 'UPDATE_SINISTRE',
        entity: 'sinistre',
        entityId: id,
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.sinistre.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Sinistre introuvable' }, { status: 404 })
    }

    await db.sinistre.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'DELETE_SINISTRE',
        entity: 'sinistre',
        entityId: id,
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
