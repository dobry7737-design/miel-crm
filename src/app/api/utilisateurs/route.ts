import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const statut = searchParams.get('statut')
    const search = searchParams.get('search')

    const where: any = {}
    if (role) where.role = role
    if (statut) where.statut = statut
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { telephone: { contains: search } },
      ]
    }

    const users = await db.user.findMany({
      where,
      include: { company: { select: { id: true, nom: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Strip passwords from response
    const safe = users.map((u) => {
      const { password, ...rest } = u
      return rest
    })

    return NextResponse.json({ data: safe })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Check email uniqueness
    const existing = await db.user.findUnique({ where: { email: body.email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: body.password || 'changeme123',
        name: body.name,
        role: body.role || 'client',
        telephone: body.telephone || '',
        avatar: body.avatar || '',
        statut: body.statut || 'Invité',
        companyId: body.companyId || null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: body.createdBy || null,
        userName: body.createdByName || 'System',
        action: 'CREATE_USER',
        entity: 'user',
        entityId: user.id,
        details: `Utilisateur ${body.name} (${body.role}) créé`,
      },
    })

    const { password: _, ...safe } = user
    return NextResponse.json({ data: safe }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
