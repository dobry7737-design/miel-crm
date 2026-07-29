import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { isAuthError, requireRole } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

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
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const body = await req.json()

    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Email et nom requis' },
        { status: 400 }
      )
    }

    if (!body.password || String(body.password).length < 8) {
      return NextResponse.json(
        { error: 'Mot de passe requis (min. 8 caractères)' },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    const hashed = await hashPassword(body.password)

    const user = await db.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: hashed,
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
        userId: auth.userId,
        userName: auth.email,
        action: 'CREATE_USER',
        entity: 'user',
        entityId: user.id,
        details: `Utilisateur ${body.name} (${body.role || 'client'}) créé`,
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
