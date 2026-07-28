import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      totalDevis,
      totalContrats,
      activeContrats,
      totalSinistres,
      pendingSinistres,
      totalPaiements,
      totalCompagnies,
      activeCompagnies,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      db.devis.count(),
      db.contrat.count(),
      db.contrat.count({ where: { statut: 'Actif' } }),
      db.sinistre.count(),
      db.sinistre.count({ where: { statut: { in: ['Déclaré', 'En instruction'] } } }),
      db.paiement.count(),
      db.compagnie.count(),
      db.compagnie.count({ where: { statut: 'Actif' } }),
      db.user.count(),
      db.user.count({ where: { statut: 'Actif' } }),
    ])

    // Sum of all payments (successful)
    const paymentsAgg = await db.paiement.aggregate({
      _sum: { montant: true, commission: true },
      where: { statut: 'Réussi' },
    })

    // Sum of all primes from contrats
    const contratsAgg = await db.contrat.aggregate({
      _sum: { prime: true },
      where: { statut: 'Actif' },
    })

    // Devis by statut
    const devisByStatut = await db.devis.groupBy({
      by: ['statut'],
      _count: true,
    })

    // Contrats by branche
    const contratsByBranche = await db.contrat.groupBy({
      by: ['branche'],
      _count: true,
    })

    // Sinistres by statut
    const sinistresByStatut = await db.sinistre.groupBy({
      by: ['statut'],
      _count: true,
    })

    // Paiements by moyen
    const paiementsByMoyen = await db.paiement.groupBy({
      by: ['moyen'],
      _count: true,
    })

    return NextResponse.json({
      totals: {
        devis: totalDevis,
        contrats: totalContrats,
        activeContrats,
        sinistres: totalSinistres,
        pendingSinistres,
        paiements: totalPaiements,
        compagnies: totalCompagnies,
        activeCompagnies,
        users: totalUsers,
        activeUsers,
      },
      financials: {
        totalPayments: paymentsAgg._sum.montant || 0,
        totalCommissions: paymentsAgg._sum.commission || 0,
        activeContratsPrime: contratsAgg._sum.prime || 0,
      },
      breakdowns: {
        devisByStatut,
        contratsByBranche,
        sinistresByStatut,
        paiementsByMoyen,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    )
  }
}
