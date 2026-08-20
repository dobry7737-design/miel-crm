import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { isAuthError, requireRole } from '@/lib/api-auth'
import { sendInvitationEmail } from '@/lib/email'

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

    const existing = await db.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    // Création sans mot de passe — l'utilisateur le définira lui-même lors de l'activation
    const user = await db.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: '', // vide — sera défini lors de l'activation
        name: body.name,
        role: body.role || 'client',
        telephone: body.telephone || '',
        avatar: body.name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        statut: 'Invité',
        companyId: body.companyId || null,
      },
    })

    // Générer le token d'activation (48h de validité)
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await db.invitationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // Envoyer l'email d'invitation avec le lien d'activation
    const invitedByName = body.createdByName || auth.email || 'L\'administrateur AAM'
    await sendInvitationEmail({
      to: user.email,
      name: user.name,
      role: user.role,
      invitedByName,
      token,
    })

    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'INVITE_USER',
        entity: 'user',
        entityId: user.id,
        details: `Invitation envoyée à ${body.name} (${body.role || 'client'}) — token d'activation généré`,
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
