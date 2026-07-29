import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth, requireRole } from '@/lib/api-auth'

type Ctx = { params: Promise<{ id: string }> }

function serializeProduit(p: {
  garanties: string
  tarifsJson: string
  [key: string]: unknown
}) {
  return {
    ...p,
    garanties: p.garanties
      ? p.garanties.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    tarifs: (() => {
      try {
        return JSON.parse(p.tarifsJson || '{}')
      } catch {
        return {}
      }
    })(),
  }
}

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const produit = await db.produit.findUnique({
      where: { id },
      include: {
        compagnie: {
          select: {
            id: true,
            nom: true,
            initials: true,
            statut: true,
            rating: true,
            delaiTraitement: true,
          },
        },
      },
    })
    if (!produit) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }
    if (
      auth.role === 'correspondant' &&
      auth.companyId &&
      produit.compagnieId !== auth.companyId
    ) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    return NextResponse.json({ data: serializeProduit(produit) })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'correspondant'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.produit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }
    if (
      auth.role === 'correspondant' &&
      auth.companyId &&
      existing.compagnieId !== auth.companyId
    ) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await req.json()
    const tarifsJson =
      body.tarifsJson !== undefined
        ? typeof body.tarifsJson === 'string'
          ? body.tarifsJson
          : JSON.stringify(body.tarifsJson)
        : body.basePrime !== undefined
          ? JSON.stringify({ basePrime: Number(body.basePrime) || 0 })
          : undefined

    const updated = await db.produit.update({
      where: { id },
      data: {
        ...(body.nom && { nom: body.nom }),
        ...(body.branche && { branche: body.branche }),
        ...(body.statut && { statut: body.statut }),
        ...(body.garanties !== undefined && {
          garanties: Array.isArray(body.garanties)
            ? body.garanties.join(',')
            : body.garanties,
        }),
        ...(tarifsJson !== undefined && { tarifsJson }),
        ...(body.compagnieId &&
          auth.role === 'admin' && { compagnieId: body.compagnieId }),
      },
      include: {
        compagnie: {
          select: {
            id: true,
            nom: true,
            initials: true,
            statut: true,
            rating: true,
            delaiTraitement: true,
          },
        },
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'UPDATE_PRODUIT',
        entity: 'produit',
        entityId: id,
        details: `Produit ${existing.nom} mis à jour`,
      },
    })

    return NextResponse.json({ data: serializeProduit(updated) })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const auth = await requireRole(req, ['admin', 'correspondant'])
    if (isAuthError(auth)) return auth

    const { id } = await ctx.params
    const existing = await db.produit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
    }
    if (
      auth.role === 'correspondant' &&
      auth.companyId &&
      existing.compagnieId !== auth.companyId
    ) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    await db.produit.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'DELETE_PRODUIT',
        entity: 'produit',
        entityId: id,
        details: `Produit ${existing.nom} supprimé`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur lors de la suppression',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    )
  }
}
