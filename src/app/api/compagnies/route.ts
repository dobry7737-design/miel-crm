import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth, requireRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const statut = searchParams.get('statut')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (auth.role === 'correspondant' && auth.companyId) {
      where.id = auth.companyId
    }
    if (statut) where.statut = statut
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { agrement: { contains: search } },
      ]
    }

    const compagnies = await db.compagnie.findMany({
      where,
      include: {
        _count: { select: { devis: true, contrats: true, sinistres: true } },
      },
      orderBy: { nom: 'asc' },
    })

    const data = compagnies.map((c) => ({
      ...c,
      branches: c.branches
        ? c.branches.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    }))

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const body = await req.json()

    const compagnie = await db.compagnie.create({
      data: {
        nom: body.nom,
        initials: body.initials || '',
        iconColor: body.iconColor || 'bg-blue-500',
        agrement: body.agrement,
        statut: body.statut || 'À valider',
        rating: body.rating || 0,
        delaiTraitement: body.delaiTraitement || 0,
        contact: body.contact || '',
        email: body.email || '',
        telephone: body.telephone || '',
        datePartenariat:
          body.datePartenariat || new Date().toISOString().split('T')[0],
        branches: Array.isArray(body.branches)
          ? body.branches.join(',')
          : body.branches || '',
      },
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'CREATE_COMPAGNIE',
        entity: 'compagnie',
        entityId: compagnie.id,
        details: `Compagnie ${body.nom} ajoutée`,
      },
    })

    return NextResponse.json(
      {
        data: {
          ...compagnie,
          branches: compagnie.branches
            ? compagnie.branches.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
