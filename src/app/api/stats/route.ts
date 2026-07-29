import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthError, requireAuth, type AuthUser } from '@/lib/api-auth'

function parseFrDate(s: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim())
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return Number.isNaN(d.getTime()) ? null : d
}

function parseAnyDate(s: string | Date | null | undefined): Date | null {
  if (!s) return null
  if (s instanceof Date) return Number.isNaN(s.getTime()) ? null : s
  const fr = parseFrDate(s)
  if (fr) return fr
  const iso = new Date(s)
  return Number.isNaN(iso.getTime()) ? null : iso
}

function buildRoleScope(
  auth: AuthUser,
  kind: 'devis' | 'contrat' | 'sinistre'
): Record<string, unknown> {
  if (auth.role === 'client') return { clientId: auth.userId }
  if (auth.role === 'correspondant' && auth.companyId) {
    return { compagnieId: auth.companyId }
  }
  if (auth.role === 'agent' && (kind === 'devis' || kind === 'contrat')) {
    return { agentId: auth.userId }
  }
  // Agent / gestionnaire : sinistres globaux (pas d'agentId sur Sinistre)
  return {}
}

function parseDaysParam(raw: string | null): number | 'all' {
  if (!raw || raw === 'all') return raw === 'all' ? 'all' : 30
  const n = parseInt(raw, 10)
  if (n === 7 || n === 30 || n === 90) return n
  return 30
}

function inWindow(
  date: Date | null,
  days: number | 'all',
  now: Date
): boolean {
  if (days === 'all') return true
  if (!date) return false
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date >= from
}

function labelDay(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  })
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req)
    if (isAuthError(auth)) return auth

    const { searchParams } = new URL(req.url)
    const brancheParam = searchParams.get('branche')
    const branche =
      brancheParam && brancheParam !== 'all' ? brancheParam : undefined
    const days = parseDaysParam(searchParams.get('days'))
    const now = new Date()

    const devisScope: Record<string, unknown> = {
      ...buildRoleScope(auth, 'devis'),
      ...(branche ? { branche } : {}),
    }
    const contratScope: Record<string, unknown> = {
      ...buildRoleScope(auth, 'contrat'),
      ...(branche ? { branche } : {}),
    }
    const sinistreScope: Record<string, unknown> = {
      ...buildRoleScope(auth, 'sinistre'),
      ...(branche ? { branche } : {}),
    }

    // Paiements: pas d'agentId — scope client/compagnie uniquement
    const paiementScope: Record<string, unknown> = {
      ...(auth.role === 'client' ? { clientId: auth.userId } : {}),
      ...(auth.role === 'correspondant' && auth.companyId
        ? { compagnieId: auth.companyId }
        : {}),
    }

    const [
      devisRows,
      contratRows,
      sinistreRows,
      paiementRows,
      totalCompagnies,
      activeCompagnies,
      pendingCompagnies,
      totalUsers,
      activeUsers,
      suspendedUsers,
      agentUsers,
      totalProduits,
    ] = await Promise.all([
      db.devis.findMany({
        where: devisScope,
        select: {
          id: true,
          statut: true,
          branche: true,
          dateCreation: true,
          createdAt: true,
          agentName: true,
        },
      }),
      db.contrat.findMany({
        where: contratScope,
        select: {
          id: true,
          statut: true,
          branche: true,
          prime: true,
          dateDebut: true,
          dateFin: true,
          prochainRenouvellement: true,
          createdAt: true,
          reference: true,
        },
      }),
      db.sinistre.findMany({
        where: sinistreScope,
        select: {
          id: true,
          statut: true,
          branche: true,
          delaiH: true,
          dateDeclaration: true,
          createdAt: true,
          contratRef: true,
        },
      }),
      db.paiement.findMany({
        where: paiementScope,
        select: {
          id: true,
          statut: true,
          moyen: true,
          montant: true,
          commission: true,
          date: true,
          createdAt: true,
          contratRef: true,
        },
      }),
      auth.role === 'correspondant' && auth.companyId
        ? db.compagnie.count({ where: { id: auth.companyId } })
        : db.compagnie.count(),
      auth.role === 'correspondant' && auth.companyId
        ? db.compagnie.count({ where: { id: auth.companyId, statut: 'Actif' } })
        : db.compagnie.count({ where: { statut: 'Actif' } }),
      auth.role === 'admin'
        ? db.compagnie.count({ where: { statut: 'À valider' } })
        : Promise.resolve(0),
      auth.role === 'admin' ? db.user.count() : Promise.resolve(0),
      auth.role === 'admin'
        ? db.user.count({ where: { statut: 'Actif' } })
        : Promise.resolve(0),
      auth.role === 'admin'
        ? db.user.count({ where: { statut: 'Suspendu' } })
        : Promise.resolve(0),
      auth.role === 'admin'
        ? db.user.count({ where: { role: 'agent' } })
        : Promise.resolve(0),
      auth.role === 'correspondant' && auth.companyId
        ? db.produit.count({
            where: {
              compagnieId: auth.companyId,
              statut: 'Actif',
              ...(branche ? { branche } : {}),
            },
          })
        : db.produit.count({
            where: {
              statut: 'Actif',
              ...(branche ? { branche } : {}),
            },
          }),
    ])

    // Scope agent : sinistres + paiements liés aux contrats du portefeuille
    let filteredSinistres = sinistreRows
    let filteredPaiements = paiementRows
    if (auth.role === 'agent') {
      const refs = new Set(contratRows.map((c) => c.reference))
      filteredSinistres = sinistreRows.filter((s) => refs.has(s.contratRef))
      filteredPaiements = paiementRows.filter((p) => refs.has(p.contratRef))
    }

    const devis = devisRows.filter((d) =>
      inWindow(parseAnyDate(d.dateCreation) || d.createdAt, days, now)
    )
    const contrats = contratRows.filter((c) =>
      inWindow(parseAnyDate(c.dateDebut) || c.createdAt, days, now)
    )
    const sinistres = filteredSinistres.filter((s) =>
      inWindow(parseAnyDate(s.dateDeclaration) || s.createdAt, days, now)
    )
    const paiements = filteredPaiements.filter((p) =>
      inWindow(parseAnyDate(p.date) || p.createdAt, days, now)
    )

    const totalDevis = devis.length
    const totalContrats = contrats.length
    const activeContrats = contrats.filter((c) => c.statut === 'Actif').length
    const pendingContrats = contrats.filter(
      (c) => c.statut === 'En attente'
    ).length
    const totalSinistres = sinistres.length
    const pendingSinistres = sinistres.filter((s) =>
      ['Déclaré', 'En instruction'].includes(s.statut)
    ).length
    const treatedSinistres = sinistres.filter((s) =>
      ['Traité', 'Validé', 'Clos'].includes(s.statut)
    ).length
    const totalPaiements = paiements.length

    const paymentsOk = paiements.filter((p) => p.statut === 'Réussi')
    const totalPayments = paymentsOk.reduce((a, p) => a + (p.montant || 0), 0)
    const totalCommissions = paymentsOk.reduce(
      (a, p) => a + (p.commission || 0),
      0
    )
    const activeContratsPrime = contrats
      .filter((c) => c.statut === 'Actif')
      .reduce((a, c) => a + (c.prime || 0), 0)

    const countBy = <T extends string>(
      rows: { [K in T]: string }[],
      key: T
    ) => {
      const map: Record<string, number> = {}
      for (const r of rows) {
        map[r[key]] = (map[r[key]] || 0) + 1
      }
      return Object.entries(map).map(([k, _count]) => ({
        [key]: k,
        _count,
      })) as Array<{ [K in T]: string } & { _count: number }>
    }

    const devisByStatut = countBy(devis, 'statut')
    const contratsByBranche = countBy(contrats, 'branche')
    const sinistresByStatut = countBy(sinistres, 'statut')
    const sinistresByBranche = countBy(sinistres, 'branche')
    const paiementsByMoyen = countBy(paiements, 'moyen')

    const paiementsByStatutMap: Record<
      string,
      { _count: number; montant: number }
    > = {}
    for (const p of paiements) {
      if (!paiementsByStatutMap[p.statut]) {
        paiementsByStatutMap[p.statut] = { _count: 0, montant: 0 }
      }
      paiementsByStatutMap[p.statut]._count++
      paiementsByStatutMap[p.statut].montant += p.montant || 0
    }
    const paiementsByStatut = Object.entries(paiementsByStatutMap).map(
      ([statut, v]) => ({ statut, _count: v._count, montant: v.montant })
    )

    const withDelay = sinistres.filter((s) => typeof s.delaiH === 'number')
    const alertOver72 = withDelay.filter(
      (s) =>
        s.delaiH > 72 &&
        (s.statut === 'Déclaré' || s.statut === 'En instruction')
    ).length
    const avgDelaiH =
      withDelay.length > 0
        ? Math.round(
            withDelay.reduce((a, s) => a + s.delaiH, 0) / withDelay.length
          )
        : 0
    const treatedUnder72 = withDelay.filter(
      (s) =>
        s.delaiH <= 72 &&
        ['Traité', 'Validé', 'Clos'].includes(s.statut)
    ).length
    const treatedTotal = withDelay.filter((s) =>
      ['Traité', 'Validé', 'Clos'].includes(s.statut)
    ).length
    const respectDelai72h =
      treatedTotal > 0 ? Math.round((treatedUnder72 / treatedTotal) * 100) : 100

    const delaiByBranche: Record<string, { total: number; count: number }> = {}
    for (const s of sinistres) {
      if (!delaiByBranche[s.branche]) {
        delaiByBranche[s.branche] = { total: 0, count: 0 }
      }
      delaiByBranche[s.branche].total += s.delaiH || 0
      delaiByBranche[s.branche].count++
    }
    const avgDelaiByBranche = Object.entries(delaiByBranche).map(
      ([brancheName, v]) => ({
        branche: brancheName,
        hours: v.count > 0 ? Math.round(v.total / v.count) : 0,
      })
    )

    const compagnies = await db.compagnie.findMany({
      where:
        auth.role === 'correspondant' && auth.companyId
          ? { id: auth.companyId }
          : undefined,
      select: { delaiTraitement: true, statut: true },
    })
    const activeWithDelai = compagnies.filter(
      (c) => c.statut === 'Actif' && c.delaiTraitement > 0
    )
    const avgCompagnieDelai =
      activeWithDelai.length > 0
        ? Math.round(
            activeWithDelai.reduce((a, c) => a + c.delaiTraitement, 0) /
              activeWithDelai.length
          )
        : 0

    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    let renewalsSoon = 0
    for (const c of contrats.filter((x) => x.statut === 'Actif')) {
      const d =
        parseFrDate(c.dateFin) ||
        parseFrDate(c.prochainRenouvellement) ||
        null
      if (d && d >= now && d <= in30) renewalsSoon++
    }

    const conversionRate =
      totalDevis > 0 ? Math.round((activeContrats / totalDevis) * 100) : 0
    const sinistralite =
      activeContrats > 0
        ? Math.round((totalSinistres / activeContrats) * 100)
        : 0

    // Timeline devis / souscriptions / contrats
    const timelineMap: Record<
      string,
      { date: string; sort: number; devis: number; souscriptions: number; contrats: number }
    > = {}
    for (const d of devis) {
      const dt = parseAnyDate(d.dateCreation) || d.createdAt
      const key = labelDay(dt)
      if (!timelineMap[key]) {
        timelineMap[key] = {
          date: key,
          sort: dt.getTime(),
          devis: 0,
          souscriptions: 0,
          contrats: 0,
        }
      }
      timelineMap[key].devis++
      if (d.statut === 'Transformé') timelineMap[key].souscriptions++
    }
    for (const c of contrats) {
      const dt = parseAnyDate(c.dateDebut) || c.createdAt
      const key = labelDay(dt)
      if (!timelineMap[key]) {
        timelineMap[key] = {
          date: key,
          sort: dt.getTime(),
          devis: 0,
          souscriptions: 0,
          contrats: 0,
        }
      }
      timelineMap[key].contrats++
    }
    const timeline = Object.values(timelineMap)
      .sort((a, b) => a.sort - b.sort)
      .map(({ date, devis: dv, souscriptions, contrats: ct }) => ({
        date,
        devis: dv,
        souscriptions,
        contrats: ct,
      }))

    // Devis par agent (top)
    const agentMap: Record<string, number> = {}
    for (const d of devis) {
      if (d.agentName) {
        agentMap[d.agentName] = (agentMap[d.agentName] || 0) + 1
      }
    }
    const devisByAgent = Object.entries(agentMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))

    return NextResponse.json({
      filters: {
        branche: branche || 'all',
        days: days === 'all' ? 'all' : days,
      },
      totals: {
        devis: totalDevis,
        contrats: totalContrats,
        activeContrats,
        pendingContrats,
        renewalsSoon,
        sinistres: totalSinistres,
        pendingSinistres,
        treatedSinistres,
        alertOver72,
        avgDelaiH,
        paiements: totalPaiements,
        compagnies: totalCompagnies,
        activeCompagnies,
        pendingCompagnies,
        avgCompagnieDelai,
        users: totalUsers,
        activeUsers,
        suspendedUsers,
        agentUsers,
        produits: totalProduits,
      },
      financials: {
        totalPayments,
        totalCommissions,
        activeContratsPrime,
      },
      scores: {
        conversionRate,
        respectDelai72h,
        sinistralite,
      },
      breakdowns: {
        devisByStatut,
        contratsByBranche,
        sinistresByStatut,
        sinistresByBranche,
        paiementsByMoyen,
        paiementsByStatut,
        avgDelaiByBranche,
        devisByAgent,
      },
      timeline,
    })
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
