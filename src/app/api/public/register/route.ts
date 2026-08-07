import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { signSession, setSessionCookie } from '@/lib/session'
import { applyCorsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, telephone, whatsapp } = body

    if (!name || !email || !password) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Nom, e-mail et mot de passe requis.' },
          { status: 400 }
        )
      )
    }

    const cleanEmail = String(email).toLowerCase().trim()
    const cleanName = String(name).trim()
    const cleanPhone = String(whatsapp || telephone || '').trim()

    // Vérifier si l'utilisateur existe déjà
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existing) {
      return applyCorsHeaders(
        NextResponse.json(
          { error: 'Un compte avec cet e-mail existe déjà. Veuillez vous connecter.' },
          { status: 409 }
        )
      )
    }

    const hashedPassword = await hashPassword(password)
    const avatarInitials = cleanName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'CL'

    const user = await db.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: 'client',
        telephone: cleanPhone || null,
        avatar: avatarInitials,
        statut: 'Actif',
      },
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: 'REGISTER_CLIENT',
        entity: 'user',
        entityId: user.id,
        details: `Création de compte client autonome pour ${user.email}`,
      },
    })

    // Générer la session JWT
    const token = await signSession({
      userId: user.id,
      email: user.email,
      role: 'client',
    })

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        telephone: user.telephone,
      },
    })

    setSessionCookie(res, token)
    return applyCorsHeaders(res)
  } catch (error) {
    console.error('Register error:', error)
    return applyCorsHeaders(
      NextResponse.json(
        {
          error: 'Impossible de créer le compte.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    )
  }
}
