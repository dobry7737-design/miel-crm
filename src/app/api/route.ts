import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      usersCount,
      compagniesCount,
      devisCount,
      contratsCount,
      sinistresCount,
      paiementsCount,
    ] = await Promise.all([
      db.user.count(),
      db.compagnie.count(),
      db.devis.count(),
      db.contrat.count(),
      db.sinistre.count(),
      db.paiement.count(),
    ])

    return NextResponse.json({
      status: 'ok',
      service: 'AAM API — Assistances Assurances Mali',
      timestamp: new Date().toISOString(),
      database: {
        users: usersCount,
        compagnies: compagniesCount,
        devis: devisCount,
        contrats: contratsCount,
        sinistres: sinistresCount,
        paiements: paiementsCount,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
