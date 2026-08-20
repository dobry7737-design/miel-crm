import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'mail.aamassistances.com'
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465
const SMTP_SECURE = process.env.SMTP_SECURE !== 'false'
const SMTP_USER = process.env.SMTP_USER || 'contact@aamassistances.com'
const SMTP_PASS = process.env.SMTP_PASS || process.env.MAIL_PASS || 'Oumartidiani7@'

const TARGET_ADMIN_EMAIL = 'contact@aamassistances.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.aamassistances.com'

function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  })
}

export interface SouscriptionEmailPayload {
  reference: string
  client: {
    name: string
    firstName?: string
    lastName?: string
    email: string
    whatsapp?: string
    telephone?: string
    vehicle?: string
    registration?: string
  }
  offer: {
    insurer: string
    plan: string
    branche?: string
    price?: number
    duree?: string
    dateEffet?: string
    features?: string[] | string
    cvLabel?: string
  }
  vehicle?: {
    model?: string
    registration?: string
    energy?: string
    usage?: string
    power?: string
  }
  dateEffet?: string
  duree?: string
  primeTotale?: number | string
}

export async function sendContratAEmettreEmail(payload: SouscriptionEmailPayload) {
  const clientName = payload.client.name || `${payload.client.firstName || ''} ${payload.client.lastName || ''}`.trim() || 'Client AAM'
  const clientEmail = payload.client.email || 'Non renseigné'
  const clientPhone = payload.client.whatsapp || payload.client.telephone || 'Non renseigné'
  
  const insurer = payload.offer.insurer || 'Compagnie partenaire'
  const plan = payload.offer.plan || 'Formule Automobile'
  const branche = payload.offer.branche || 'Auto'
  const reference = payload.reference || `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  
  const vehicleModel = payload.vehicle?.model || payload.client.vehicle || 'Non renseigné'
  const vehiclePlate = payload.vehicle?.registration || payload.client.registration || 'En cours'
  const dateEffet = payload.dateEffet || payload.offer.dateEffet || new Date().toLocaleDateString('fr-FR')
  const duree = payload.duree || payload.offer.duree || '12 mois'
  
  const prime = typeof payload.primeTotale === 'number' 
    ? `${payload.primeTotale.toLocaleString('fr-FR')} FCFA`
    : payload.primeTotale || (payload.offer.price ? `${payload.offer.price.toLocaleString('fr-FR')} FCFA` : 'Sur devis')

  const guaranteesList = Array.isArray(payload.offer.features)
    ? payload.offer.features.join(', ')
    : payload.offer.features || 'Responsabilité Civile Obligatoire, Défense & Recours'

  const subject = `Contrat à émettre — ${clientName} — ${insurer} (${vehiclePlate})`

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 20px; background-color: #f8fafc; }
        .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1d4ed8, #059669); padding: 28px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; }
        .content { padding: 28px; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
        .section-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13.5px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        th { color: #64748b; font-weight: 600; width: 38%; }
        td { color: #0f172a; font-weight: 500; }
        .price-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0; }
        .price-label { font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; }
        .price-val { font-size: 24px; font-weight: 800; color: #15803d; margin-top: 4px; }
        .footer { background: #0f172a; color: #94a3b8; padding: 20px; font-size: 11px; text-align: center; line-height: 1.5; }
        .footer strong { color: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>ASSISTANCES ASSURANCES MALI</h1>
          <p>Plateforme de courtage & gestion de contrats</p>
        </div>
        
        <div class="content">
          <div class="badge">NOUVELLE DEMANDE DE SOUSCRIPTION</div>
          <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">📄 Contrat à émettre : ${reference}</h2>
          <p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px;">Un prospect a validé sa demande de souscription sur le site AAM Assistances.</p>

          <div class="section-title">1. Informations du Souscripteur</div>
          <table>
            <tr><th>Nom complet</th><td><strong>${clientName}</strong></td></tr>
            <tr><th>Numéro WhatsApp</th><td><a href="https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${clientPhone}</a></td></tr>
            <tr><th>Adresse e-mail</th><td><a href="mailto:${clientEmail}" style="color: #2563eb; text-decoration: none;">${clientEmail}</a></td></tr>
          </table>

          <div class="section-title">2. Véhicule & Risque Assuré</div>
          <table>
            <tr><th>Modèle du véhicule</th><td><strong>${vehicleModel}</strong></td></tr>
            <tr><th>Immatriculation</th><td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">${vehiclePlate}</span></td></tr>
            <tr><th>Branche</th><td>${branche}</td></tr>
          </table>

          <div class="section-title">3. Effet et Durée de la Garantie</div>
          <table>
            <tr><th>Compagnie retenue</th><td><strong>${insurer}</strong></td></tr>
            <tr><th>Formule souscrite</th><td>${plan}</td></tr>
            <tr><th>Date de prise d'effet</th><td><strong>${dateEffet}</strong></td></tr>
            <tr><th>Durée de couverture</th><td><strong>${duree}</strong></td></tr>
            <tr><th>Garanties incluses</th><td>${guaranteesList}</td></tr>
          </table>

          <div class="price-box">
            <div class="price-label">Prime Totale TTC à percevoir</div>
            <div class="price-val">${prime}</div>
          </div>

          <p style="font-size: 12.5px; color: #475569; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            👉 <strong>Action requise :</strong> Veuillez vous connecter au back-office CRM (<a href="https://crm.aamassistances.com" style="color: #2563eb; font-weight: bold;">crm.aamassistances.com</a>) pour valider l'émission de la police et transmettre l'attestation CIMA au client.
          </p>
        </div>

        <div class="footer">
          <p><strong>Assistances Assurances Mali SARL</strong> — Capital : 20 000 000 FCFA</p>
          <p>Siège Social : Hamdallaye ACI 2000, Avenue Tombouctou, Rue 430, Bamako, Mali</p>
          <p>NINA : 42409194445016F — RCCM : MA.BKO.2024.B.</p>
          <p>Tél : +223 20 29 40 40 / 76 37 37 37 — E-mail : contact@aamassistances.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const transporter = createTransporter()

    const info = await transporter.sendMail({
      from: `"AAM Souscriptions" <${SMTP_USER}>`,
      to: TARGET_ADMIN_EMAIL,
      replyTo: clientEmail !== 'Non renseigné' ? clientEmail : SMTP_USER,
      subject,
      html: htmlContent,
    })

    console.log(`[Email envoyé] Contrat à émettre ${reference} envoyé à ${TARGET_ADMIN_EMAIL} (messageId: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[Erreur envoi email souscription]:', error)
    // En cas d'erreur de serveur SMTP, on ne bloque pas la souscription dans la base
    return { success: false, error: error instanceof Error ? error.message : 'SMTP Error' }
  }
}

// ============ EMAIL D'INVITATION ============

export async function sendInvitationEmail({
  to,
  name,
  role,
  invitedByName,
  token,
}: {
  to: string
  name: string
  role: string
  invitedByName: string
  token: string
}) {
  const activationUrl = `${APP_URL}/activation?token=${token}`

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrateur',
    agent: 'Agent / Courtier',
    client: 'Client / Assuré',
    gestionnaire: 'Gestionnaire Sinistres',
    correspondant: 'Correspondant Partenaire',
  }
  const roleLabel = ROLE_LABELS[role] || role

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #1d4ed8 0%, #0369a1 100%); padding: 32px 28px; text-align: center; }
        .header h1 { color: #fff; margin: 0 0 6px; font-size: 22px; font-weight: 800; }
        .header p { color: rgba(255,255,255,0.8); margin: 0; font-size: 13px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
        .msg { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
        .role-badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 999px; margin-bottom: 24px; }
        .btn-wrap { text-align: center; margin: 28px 0; }
        .btn { display: inline-block; background: #1d4ed8; color: #fff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 36px; border-radius: 50px; letter-spacing: 0.3px; }
        .warning { background: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 12px 16px; font-size: 12px; color: #713f12; margin-top: 20px; }
        .link-fallback { font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 16px; }
        .footer { background: #0f172a; color: #64748b; padding: 18px 28px; font-size: 11px; text-align: center; line-height: 1.6; }
        .footer strong { color: #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>AAM ASSISTANCES</h1>
          <p>Plateforme de courtage en assurances — Mali</p>
        </div>
        <div class="body">
          <p class="greeting">Bonjour ${name},</p>
          <p class="msg">
            <strong>${invitedByName}</strong> vous invite à rejoindre la plateforme CRM d'<strong>Assistances Assurances Mali</strong>.
            Votre compte a été créé avec le profil suivant :
          </p>
          <div><span class="role-badge">${roleLabel}</span></div>
          <p class="msg">
            Cliquez sur le bouton ci-dessous pour <strong>activer votre compte</strong> et choisir votre mot de passe.
            Ce lien est valable pendant <strong>48 heures</strong>.
          </p>
          <div class="btn-wrap">
            <a href="${activationUrl}" class="btn">✅ Activer mon compte</a>
          </div>
          <div class="warning">
            ⚠️ Si vous n'êtes pas à l'origine de cette invitation, ignorez simplement cet email. Aucune action ne sera requise.
          </div>
          <p class="link-fallback">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>${activationUrl}</p>
        </div>
        <div class="footer">
          <p><strong>Assistances Assurances Mali SARL</strong> — Capital : 20 000 000 FCFA</p>
          <p>Hamdallaye ACI 2000, Bamako, Mali — contact@aamassistances.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const transporter = createTransporter()
    const info = await transporter.sendMail({
      from: `"AAM Assistances" <${SMTP_USER}>`,
      to,
      subject: `Invitation à rejoindre AAM Assistances — Activez votre compte`,
      html,
    })
    console.log(`[Invitation envoyée] ${to} (messageId: ${info.messageId})`)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[Erreur invitation email]:', error)
    return { success: false, error: error instanceof Error ? error.message : 'SMTP Error' }
  }
}
