import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole } from '@/lib/api-auth'

// POST /api/admin/reset — Réinitialise toutes les données transactionnelles (admin only)
// Conserve : Admin(s), Compagnies, Produits, Settings
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin'])
    if (isAuthError(auth)) return auth

    const body = await req.json().catch(() => ({}))

    // Double confirmation obligatoire
    if (body.confirm !== 'REINITIALISER') {
      return NextResponse.json(
        { error: 'Confirmation incorrecte. Envoyez { "confirm": "REINITIALISER" }' },
        { status: 400 }
      )
    }

    // Supprimer dans l'ordre pour respecter les FK
    const [logs, paiements, sinistres, contrats, devis, messages, tokens, users] = await db.$transaction([
      db.auditLog.deleteMany(),
      db.paiement.deleteMany(),
      db.sinistre.deleteMany(),
      db.contrat.deleteMany(),
      db.devis.deleteMany(),
      db.message.deleteMany(),
      db.invitationToken.deleteMany(),
      // Supprimer tous les utilisateurs SAUF les admins
      db.user.deleteMany({ where: { role: { not: 'admin' } } }),
    ])

    // Journaliser l'action de réinitialisation (dans un nouveau log après nettoyage)
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        userName: auth.email,
        action: 'RESET_DATA',
        entity: 'system',
        details: JSON.stringify({
          deleted: { logs: logs.count, paiements: paiements.count, sinistres: sinistres.count, contrats: contrats.count, devis: devis.count, messages: messages.count, tokens: tokens.count, nonAdminUsers: users.count },
          preserved: ['admin accounts', 'compagnies', 'produits', 'settings'],
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Données réinitialisées avec succès',
      deleted: {
        auditLogs: logs.count,
        paiements: paiements.count,
        sinistres: sinistres.count,
        contrats: contrats.count,
        devis: devis.count,
        messages: messages.count,
        invitationTokens: tokens.count,
        utilisateurs: users.count,
      },
      preserved: ['Comptes administrateurs', 'Compagnies partenaires', 'Produits & tarifs', 'Paramètres'],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
