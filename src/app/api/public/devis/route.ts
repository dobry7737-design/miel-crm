import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { applyCorsHeaders, handleOptions } from '@/lib/cors'

export async function OPTIONS() {
  return handleOptions()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { offer, client, type, auto, travel, quoteData } = body

    const clientEmail = client?.email?.toLowerCase()?.trim()
    const clientName = client?.name || (client?.firstName && client?.lastName ? `${client.firstName} ${client.lastName}` : client?.firstName || client?.lastName) || 'Prospect Web'
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

    // Trouver la compagnie par nom
    let compagnie = null
    if (offer?.insurer) {
      compagnie = await db.compagnie.findFirst({
        where: { nom: { contains: offer.insurer } },
      })
    }

    const prime = Number(offer?.price) || 0
    const garanties = Array.isArray(offer?.features) ? offer.features.join(',') : (offer?.features || '')

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
        duree: offer?.period || auto?.duree || '12 mois',
        dateDebut: new Date().toISOString().split('T')[0],
        statut: 'Brouillon',
        agentName: 'Plateforme Web AAM',
        dateCreation: new Date().toLocaleDateString('fr-FR'),
        caracteristiquesJson: JSON.stringify({
          clientInfo: { name: clientName, email: clientEmail, phone: clientPhone },
          vehicle: auto || client?.vehicle || null,
          registration: client?.registration || null,
          travel: travel || null,
          quoteData: quoteData || null,
        }),
      },
    })

    // Log d'audit
    await db.auditLog.create({
      data: {
        userId: user ? user.id : null,
        userName: clientName,
        action: 'PUBLIC_QUOTE_REQUEST',
        entity: 'devis',
        entityId: devis.id,
        details: `Demande de devis ${reference} (${branche}) par ${clientName}`,
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
      })
    )
  } catch (error) {
    console.error('Public quote creation error:', error)
    return applyCorsHeaders(
      NextResponse.json(
        {
          error: 'Impossible d’enregistrer le devis.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    )
  }
}

// Récupérer les devis d'un client par son email
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
