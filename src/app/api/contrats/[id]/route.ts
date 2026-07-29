import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole, type AuthUser } from '@/lib/api-auth'

type Ctx = { params: Promise<{ id: string }> }

function canAccess(
  auth: AuthUser,
  row: { clientId: string | null }
) {
  if (auth.role === 'admin' || auth.role === 'agent') return true
  if (auth.role === 'client') return row.clientId === auth.userId
  return false
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const contrat = await db.contrat.findUnique({
      where: { id },
      include: { compagnie: true, client: true },
    })

    if (!contrat) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
    }
    if (!canAccess(auth, contrat)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ data: contrat })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'agent'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const body = await req.json()
    const existing = await db.contrat.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
    }

    const updated = await db.contrat.update({
      where: { id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.prime !== undefined && { prime: body.prime }),
        ...(body.dateFin && { dateFin: body.dateFin }),
        ...(body.prochainRenouvellement && {
          prochainRenouvellement: body.prochainRenouvellement,
        }),
        ...(body.modePaiement && { modePaiement: body.modePaiement }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'UPDATE_CONTRAT',
        entity: 'contrat',
        entityId: id,
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.contrat.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contrat introuvable' }, { status: 404 })
    }

    await db.contrat.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'DELETE_CONTRAT',
        entity: 'contrat',
        entityId: id,
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
