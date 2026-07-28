import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true },
    })

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      )
    }

    if (user.statut === 'Suspendu') {
      return NextResponse.json(
        { error: 'Compte suspendu. Contactez l\'administrateur.' },
        { status: 403 }
      )
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'LOGIN',
        entity: 'user',
        entityId: user.id,
        details: `Connexion réussie pour ${user.email}`,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        telephone: user.telephone,
        statut: user.statut,
        company: user.company
          ? { id: user.company.id, name: user.company.nom }
          : null,
      },
      token: `aam-${user.id}-${Date.now()}`, // simple token (demo)
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
