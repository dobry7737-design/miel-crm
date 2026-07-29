import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole, type AuthUser } from '@/lib/api-auth'

const DEVIS_ROLES = ['admin', 'agent', 'client', 'correspondant'] as const
type Ctx = { params: Promise<{ id: string }> }

function canAccessDevis(
  auth: AuthUser,
  row: { clientId: string | null; compagnieId: string | null }
) {
  if (auth.role === 'admin' || auth.role === 'agent') return true
  if (auth.role === 'client') return row.clientId === auth.userId
  if (auth.role === 'correspondant') return row.compagnieId === auth.companyId
  return false
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, [...DEVIS_ROLES])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const devis = await db.devis.findUnique({
      where: { id },
      include: { compagnie: true, client: true },
    })

    if (!devis) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }
    if (!canAccessDevis(auth, devis)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    return NextResponse.json({ data: devis })
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
        userId: auth.userId,
        userName: auth.email,
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

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'agent'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.devis.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    await db.devis.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'DELETE_DEVIS',
        entity: 'devis',
        entityId: id,
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
