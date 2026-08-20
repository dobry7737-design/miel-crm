import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireRole } from '@/lib/api-auth'

// GET /api/messages — liste des conversations avec le dernier message
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'])
    if (isAuthError(auth)) return auth

    const userId = auth.userId

    // Récupérer tous les utilisateurs avec qui on a eu un échange
    const messages = await db.message.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
      include: {
        from: { select: { id: true, name: true, avatar: true, role: true, statut: true } },
        to: { select: { id: true, name: true, avatar: true, role: true, statut: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Grouper par interlocuteur pour obtenir les conversations
    const conversationMap = new Map<string, {
      partner: typeof messages[0]['from'],
      lastMessage: typeof messages[0],
      unreadCount: number,
    }>()

    for (const msg of messages) {
      const partnerId = msg.fromId === userId ? msg.toId : msg.fromId
      const partner = msg.fromId === userId ? msg.to : msg.from

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        })
      }

      // Compter les messages non lus reçus
      if (msg.toId === userId && !msg.read) {
        const conv = conversationMap.get(partnerId)!
        conv.unreadCount++
      }
    }

    const conversations = Array.from(conversationMap.values()).map((c) => ({
      partnerId: c.partner.id,
      partnerName: c.partner.name,
      partnerAvatar: c.partner.avatar,
      partnerRole: c.partner.role,
      lastMessage: c.lastMessage.content,
      lastMessageAt: c.lastMessage.createdAt,
      lastMessageFromMe: c.lastMessage.fromId === userId,
      unreadCount: c.unreadCount,
    }))

    // Nombre total de messages non lus
    const totalUnread = await db.message.count({
      where: { toId: userId, read: false },
    })

    return NextResponse.json({ data: conversations, totalUnread })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}

// POST /api/messages — envoyer un message
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['admin', 'agent', 'client', 'gestionnaire', 'correspondant'])
    if (isAuthError(auth)) return auth

    const { toId, content } = await req.json()

    if (!toId || !content?.trim()) {
      return NextResponse.json({ error: 'Destinataire et contenu requis' }, { status: 400 })
    }

    const recipient = await db.user.findUnique({ where: { id: toId } })
    if (!recipient) {
      return NextResponse.json({ error: 'Destinataire introuvable' }, { status: 404 })
    }

    const message = await db.message.create({
      data: {
        fromId: auth.userId,
        toId,
        content: content.trim(),
        read: false,
      },
      include: {
        from: { select: { id: true, name: true, avatar: true, role: true } },
        to: { select: { id: true, name: true, avatar: true, role: true } },
      },
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
