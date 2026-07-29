import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole, type AuthUser } from '@/lib/api-auth'

type Ctx = { params: Promise<{ id: string }> }

function canAccess(auth: AuthUser, row: { clientId: string | null }) {
  if (auth.role === 'admin' || auth.role === 'agent') return true
  if (auth.role === 'client') return row.clientId === auth.userId
  return false
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const paiement = await db.paiement.findUnique({
      where: { id },
      include: { compagnie: true, client: true },
    })
    if (!paiement) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }
    if (!canAccess(auth, paiement)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    return NextResponse.json({ data: paiement })
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
    const existing = await db.paiement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    const updated = await db.paiement.update({
      where: { id },
      data: {
        ...(body.statut && { statut: body.statut }),
        ...(body.montant !== undefined && { montant: body.montant }),
        ...(body.commission !== undefined && { commission: body.commission }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'UPDATE_PAIEMENT',
        entity: 'paiement',
        entityId: id,
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.paiement.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    await db.paiement.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
