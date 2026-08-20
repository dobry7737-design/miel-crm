import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

// GET /api/activation?token=xxx — vérifie la validité du token
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
  }

  const inv = await db.invitationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, name: true, email: true, role: true, statut: true } } },
  })

  if (!inv) {
    return NextResponse.json({ error: 'Token invalide ou inexistant' }, { status: 404 })
  }

  if (inv.used) {
    return NextResponse.json({ error: 'Ce lien d\'activation a déjà été utilisé' }, { status: 410 })
  }

  if (new Date() > inv.expiresAt) {
    return NextResponse.json({ error: 'Ce lien d\'activation a expiré (48h)' }, { status: 410 })
  }

  return NextResponse.json({
    valid: true,
    user: {
      name: inv.user.name,
      email: inv.user.email,
      role: inv.user.role,
    },
  })
}

// POST /api/activation — définit le mot de passe et active le compte
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 })
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
    }

    const inv = await db.invitationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!inv) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 404 })
    }

    if (inv.used) {
      return NextResponse.json({ error: 'Ce lien d\'activation a déjà été utilisé' }, { status: 410 })
    }

    if (new Date() > inv.expiresAt) {
      return NextResponse.json({ error: 'Ce lien d\'activation a expiré. Contactez votre administrateur.' }, { status: 410 })
    }

    const hashed = await hashPassword(password)

    // Activer le compte + définir le mot de passe
    await db.user.update({
      where: { id: inv.userId },
      data: {
        password: hashed,
        statut: 'Actif',
      },
    })

    // Marquer le token comme utilisé
    await db.invitationToken.update({
      where: { id: inv.id },
      data: { used: true },
    })

    await db.auditLog.create({
      data: {
        userId: inv.userId,
        userName: inv.user.name,
        action: 'ACTIVATE_ACCOUNT',
        entity: 'user',
        entityId: inv.userId,
        details: 'Compte activé — mot de passe défini par l\'utilisateur via lien d\'invitation',
      },
    })

    return NextResponse.json({ success: true, message: 'Compte activé avec succès. Vous pouvez maintenant vous connecter.' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'activation', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
