import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get('limit')
    const limit = Math.min(
      Math.max(parseInt(limitParam || '30', 10) || 30, 1),
      100
    )

    const where =
      auth.role === 'admin' ||
      auth.role === 'agent' ||
      auth.role === 'gestionnaire'
        ? {}
        : { userId: auth.userId }

    const data = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : '',
      },
      { status: 500 }
    )
  }
}
