import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole } from '@/lib/api-auth'

// GET /api/messages/[partnerId] — messages d'une conversation + marquer comme lus
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'])
    if (isAuthError(auth)) return auth

    const { partnerId } = await params
    const userId = auth.userId

    // Récupérer les messages de cette conversation
    const messages = await db.message.findMany({
      where: {
        OR: [
          { fromId: userId, toId: partnerId },
          { fromId: partnerId, toId: userId },
        ],
      },
      include: {
        from: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Marquer les messages reçus comme lus
    await db.message.updateMany({
      where: { fromId: partnerId, toId: userId, read: false },
      data: { read: true },
    })

    // Récupérer les infos du partenaire
    const partner = await db.user.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, avatar: true, role: true, statut: true, lastLoginAt: true },
    })

    return NextResponse.json({ data: messages, partner })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
