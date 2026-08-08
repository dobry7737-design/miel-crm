import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applyCorsHeaders, handleOptions } from '@/lib/cors'
import { sendContratAEmettreEmail } from '@/lib/email'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { offer, client, type, auto, travel, quoteData, vehicle, dateEffet, duree } = body

    const clientEmail = client?.email?.toLowerCase()?.trim()
    const clientName =
      client?.name ||
      (client?.firstName && client?.lastName
        ? `${client.firstName} ${client.lastName}`.trim()
        : client?.firstName || client?.lastName) ||
      'Prospect Web AAM'
    const clientPhone = client?.whatsapp || client?.telephone || ''

    // Trouver ou associer l'utilisateur client si existant
    let user = null
    if (clientEmail) {
      user = await db.user.findUnique({
        where: { email: clientEmail },
      })
    }

    const branche = type === 'voyage' || offer?.branche === 'Voyage' ? 'Voyage' : 'Auto'
    const reference = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    const contratRef = `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Trouver la compagnie partenaire par nom
    let compagnie = null
    if (offer?.insurer) {
      compagnie = await db.compagnie.findFirst({
        where: { nom: { contains: offer.insurer } },
      })
    }

    const prime = Number(offer?.price) || Number(offer?.calcDetails?.primeTotale) || 45040
    const garanties = Array.isArray(offer?.features)
      ? offer.features.join(',')
      : offer?.features || 'Responsabilité Civile Obligatoire, Défense & Recours'

    const effetStr = dateEffet || offer?.dateEffet || new Date().toISOString().split('T')[0]
    const dureeStr = duree || offer?.duree || auto?.duree || '12 mois'

    // 1. Création du Devis en base
    const devis = await db.devis.create({
      data: {
        reference,
        clientId: user ? user.id : null,
        clientName,
        clientAvatar: clientName.slice(0, 2).toUpperCase(),
        branche,
        compagnieId: compagnie ? compagnie.id : null,
        companyName: offer?.insurer || 'Assureur Partenaire',
        produitNom: offer?.plan || `${branche} Standard`,
        prime,
        garanties,
        duree: dureeStr,
        dateDebut: effetStr,
        statut: 'Validé',
        agentName: 'Plateforme Web AAM',
        dateCreation: new Date().toLocaleDateString('fr-FR'),
        caracteristiquesJson: JSON.stringify({
          clientInfo: { name: clientName, email: clientEmail, phone: clientPhone },
          vehicle: vehicle || auto || client?.vehicle || null,
          registration: client?.registration || null,
          travel: travel || null,
          quoteData: quoteData || null,
          dateEffet: effetStr,
          duree: dureeStr,
        }),
      },
    })

    // 2. Création automatique du Contrat à émettre dans le CRM
    const contrat = await db.contrat.create({
      data: {
        numeroPolice: contratRef,
        reference: contratRef,
        clientId: user ? user.id : null,
        clientName,
        clientAvatar: clientName.slice(0, 2).toUpperCase(),
        branche,
        compagnieId: compagnie ? compagnie.id : null,
        companyName: offer?.insurer || 'Assureur Partenaire',
        produitNom: offer?.plan || `${branche} Standard`,
        primeAnnuelle: prime,
        dateEffet: effetStr,
        dateEcheance: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: 'En attente', // "À émettre"
        agentName: 'Plateforme Web AAM',
      },
    })

    // 3. Notification Email à contact@aamassistances.com avec le titre "Contrat à émettre"
    await sendContratAEmettreEmail({
      reference: contratRef,
      client: {
        name: clientName,
        email: clientEmail,
        whatsapp: clientPhone,
        vehicle: client?.vehicle || vehicle?.model || '',
        registration: client?.registration || vehicle?.registration || '',
      },
      offer: {
        insurer: offer?.insurer || 'Assureur Partenaire',
        plan: offer?.plan || `${branche} Standard`,
        branche,
        price: prime,
        duree: dureeStr,
        dateEffet: effetStr,
        features: garanties,
        cvLabel: offer?.cvLabel,
      },
      vehicle: {
        model: client?.vehicle || vehicle?.model || 'Véhicule standard',
        registration: client?.registration || vehicle?.registration || 'En cours',
      },
      dateEffet: effetStr,
      duree: dureeStr,
      primeTotale: prime,
    })

    // 4. Log d'audit dans la base CRM
    await db.auditLog.create({
      data: {
        userId: user ? user.id : null,
        userName: clientName,
        action: 'CONTRAT_A_EMETTRE',
        entity: 'contrat',
        entityId: contrat.id,
        details: `Demande de souscription reçue pour ${clientName} (${branche} - ${offer?.insurer}) — Contrat à émettre : ${contratRef}`,
      },
    })

    return applyCorsHeaders(
      NextResponse.json({
        success: true,
        devis: {
          id: devis.id,
          reference: devis.reference,
          branche: devis.branche,
          prime: devis.prime,
          compagnie: devis.companyName,
          produit: devis.produitNom,
        },
        contrat: {
          id: contrat.id,
          reference: contrat.reference,
          statut: contrat.statut,
        },
      })
    )
  } catch (error) {
    console.error('Public quote/subscription creation error:', error)
    return applyCorsHeaders(
      NextResponse.json(
        {
          error: 'Impossible d’enregistrer la demande de contrat.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.toLowerCase()?.trim()

    if (!email) {
      return applyCorsHeaders(
        NextResponse.json({ error: 'Email requis' }, { status: 400 })
      )
    }

    const devisList = await db.devis.findMany({
      where: {
        OR: [
          { client: { email } },
          { caracteristiquesJson: { contains: email } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return applyCorsHeaders(
      NextResponse.json({
        success: true,
        data: devisList,
      })
    )
  } catch (error) {
    return applyCorsHeaders(
      NextResponse.json(
        { error: 'Erreur lors de la récupération des devis' },
        { status: 500 }
      )
    )
  }
}
