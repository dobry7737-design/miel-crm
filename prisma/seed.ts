import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const PASSWORDS: Record<string, string> = {
  admin: 'Admin@AAM2026!',
  agent: 'Agent@AAM2026!',
  client: 'Client@AAM2026!',
  gest: 'Gest@AAM2026!',
  part: 'Part@AAM2026!',
}

async function hash(plain: string) {
  return bcrypt.hash(plain, 12)
}

async function main() {
  console.log('🌱 Seeding AAM — données métier dynamiques...')

  await db.auditLog.deleteMany()
  await db.paiement.deleteMany()
  await db.sinistre.deleteMany()
  await db.contrat.deleteMany()
  await db.devis.deleteMany()
  await db.produit.deleteMany()
  await db.user.deleteMany()
  await db.compagnie.deleteMany()
  await db.setting.deleteMany()
  console.log('  ✓ Données vidées')

  // ============ COMPAGNIES D'ASSURANCES AU MALI (OFFICIELLES) ============
  // NON VIE
  const afg = await db.compagnie.create({
    data: {
      nom: 'AFG Assurances Mali',
      initials: 'AFG',
      iconColor: 'bg-amber-500',
      agrement: 'CIMA-AFG-ML-2017',
      statut: 'Actif',
      rating: 4.5,
      delaiTraitement: 18,
      contact: 'Oumar Diarra',
      email: 'contact@afg-mali.com',
      telephone: '+223 20 22 77 88',
      datePartenariat: '2017-11-08',
      branches: 'Auto,Santé,Habitation,Voyage,Vie',
    },
  })

  const lafia = await db.compagnie.create({
    data: {
      nom: 'Assurances Lafia',
      initials: 'LAF',
      iconColor: 'bg-teal-500',
      agrement: 'CIMA-LAFIA-ML-2015',
      statut: 'Actif',
      rating: 4.4,
      delaiTraitement: 24,
      contact: 'Amadou Touré',
      email: 'contact@assuranceslafia.ml',
      telephone: '+223 20 29 10 10',
      datePartenariat: '2015-05-12',
      branches: 'Auto,Santé,Habitation',
    },
  })

  const cnar = await db.compagnie.create({
    data: {
      nom: 'Les Assurances Bleues / CNAR SA',
      initials: 'CNAR',
      iconColor: 'bg-blue-600',
      agrement: 'CIMA-CNAR-ML-2010',
      statut: 'Actif',
      rating: 4.6,
      delaiTraitement: 20,
      contact: 'Fatoumata Coulibaly',
      email: 'contact@assurancesbleues.ml',
      telephone: '+223 20 22 45 67',
      datePartenariat: '2010-09-01',
      branches: 'Auto,Santé,Habitation,Voyage',
    },
  })

  const nallias = await db.compagnie.create({
    data: {
      nom: 'Nallias SA',
      initials: 'NAL',
      iconColor: 'bg-indigo-500',
      agrement: 'CIMA-NAL-ML-2021',
      statut: 'Actif',
      rating: 4.3,
      delaiTraitement: 30,
      contact: 'Moussa Keïta',
      email: 'contact@nallias-assurances.ml',
      telephone: '+223 20 23 11 22',
      datePartenariat: '2021-04-18',
      branches: 'Auto,Santé,Habitation',
    },
  })

  const nsia = await db.compagnie.create({
    data: {
      nom: 'NSIA Mali',
      initials: 'NSIA',
      iconColor: 'bg-blue-500',
      agrement: 'CIMA-NSIA-ML-2018',
      statut: 'Actif',
      rating: 4.8,
      delaiTraitement: 28,
      contact: 'Seydou Ba',
      email: 'partenaire@nsia.ml',
      telephone: '+223 20 22 33 44',
      datePartenariat: '2018-03-15',
      branches: 'Auto,Santé,Habitation,Voyage,Vie',
    },
  })

  const sabu = await db.compagnie.create({
    data: {
      nom: 'Sabu Nyuman (SBN)',
      initials: 'SBN',
      iconColor: 'bg-lime-600',
      agrement: 'CIMA-SBN-ML-2016',
      statut: 'Actif',
      rating: 4.4,
      delaiTraitement: 26,
      contact: 'Bakary Samaké',
      email: 'contact@sabunyuman.ml',
      telephone: '+223 20 21 88 99',
      datePartenariat: '2016-08-20',
      branches: 'Auto,Santé,Habitation',
    },
  })

  const sanlam = await db.compagnie.create({
    data: {
      nom: 'SanlamAllianz Mali',
      initials: 'SAL',
      iconColor: 'bg-rose-500',
      agrement: 'CIMA-SAL-ML-2020',
      statut: 'Actif',
      rating: 4.7,
      delaiTraitement: 22,
      contact: 'Boubacar Sow',
      email: 'partenaire@sanlam.ml',
      telephone: '+223 20 22 99 00',
      datePartenariat: '2020-02-14',
      branches: 'Auto,Voyage,Habitation,Santé',
    },
  })

  const sunu = await db.compagnie.create({
    data: {
      nom: 'SUNU Assurances Mali',
      initials: 'SUNU',
      iconColor: 'bg-emerald-500',
      agrement: 'CIMA-SUNU-ML-2019',
      statut: 'Actif',
      rating: 4.6,
      delaiTraitement: 35,
      contact: 'Mariam Cissé',
      email: 'partenaire@sunu.ml',
      telephone: '+223 20 22 55 66',
      datePartenariat: '2019-07-22',
      branches: 'Auto,Santé,Habitation,Voyage',
    },
  })

  // VIE
  const cifVie = await db.compagnie.create({
    data: {
      nom: 'CIF Assurances Vie Mali',
      initials: 'CIF',
      iconColor: 'bg-purple-500',
      agrement: 'CIMA-CIFVIE-ML-2021',
      statut: 'Actif',
      rating: 4.5,
      delaiTraitement: 24,
      contact: 'Ibrahim Traoré',
      email: 'contact@cif-vie.ml',
      telephone: '+223 20 24 33 55',
      datePartenariat: '2021-01-10',
      branches: 'Vie,Santé',
    },
  })

  const nsiaVie = await db.compagnie.create({
    data: {
      nom: 'NSIA Vie Mali',
      initials: 'NSIA-V',
      iconColor: 'bg-sky-500',
      agrement: 'CIMA-NSIAVIE-ML-2018',
      statut: 'Actif',
      rating: 4.7,
      delaiTraitement: 20,
      contact: 'Aminata Diop',
      email: 'contact@nsia-vie.ml',
      telephone: '+223 20 22 33 45',
      datePartenariat: '2018-03-15',
      branches: 'Vie',
    },
  })

  const sanlamVie = await db.compagnie.create({
    data: {
      nom: 'SanlamAllianz Mali Vie',
      initials: 'SAL-V',
      iconColor: 'bg-red-500',
      agrement: 'CIMA-SALVIE-ML-2020',
      statut: 'Actif',
      rating: 4.6,
      delaiTraitement: 22,
      contact: 'Mahamadou Diallo',
      email: 'contact@sanlam-vie.ml',
      telephone: '+223 20 22 99 11',
      datePartenariat: '2020-02-14',
      branches: 'Vie',
    },
  })

  const sonavie = await db.compagnie.create({
    data: {
      nom: 'SONAVIE',
      initials: 'SON',
      iconColor: 'bg-violet-600',
      agrement: 'CIMA-SONAVIE-ML-2005',
      statut: 'Actif',
      rating: 4.8,
      delaiTraitement: 18,
      contact: 'Alou Sangaré',
      email: 'contact@sonavie.ml',
      telephone: '+223 20 22 58 58',
      datePartenariat: '2005-06-15',
      branches: 'Vie',
    },
  })

  const sunuVie = await db.compagnie.create({
    data: {
      nom: 'SUNU Assurances Vie',
      initials: 'SUNU-V',
      iconColor: 'bg-teal-600',
      agrement: 'CIMA-SUNUVIE-ML-2019',
      statut: 'Actif',
      rating: 4.6,
      delaiTraitement: 25,
      contact: 'Kadiatou Koné',
      email: 'contact@sunu-vie.ml',
      telephone: '+223 20 22 55 77',
      datePartenariat: '2019-07-22',
      branches: 'Vie',
    },
  })
  console.log('  ✓ 13 compagnies d\'assurances au Mali (8 Non-Vie + 5 Vie)')

  // ============ PRODUITS ============
  const AUTO_RC_TARIFFS = {
    '1_cv': { 1: 10246, 3: 14492, 6: 21568, 12: 23590 },
    '2_4_cv': { 1: 11121, 3: 16242, 6: 24779, 12: 40144 },
    '5_7_cv': { 1: 11856, 3: 17712, 6: 27472, 12: 45040 },
    '8_10_cv': { 1: 13612, 3: 21223, 6: 33910, 12: 56746 },
    '11_16_cv': { 1: 16264, 3: 26527, 6: 43634, 12: 74428 },
    '17_plus_cv': { 1: 18444, 3: 30888, 6: 51628, 12: 88960 },
  }
  const produitsData = [
    {
      compagnieId: nsia.id,
      nom: 'Auto Tous Risques (NSIA)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Vol & Incendie,Bris de glace,Dommages tous accidents,Défense & recours',
    },
    {
      compagnieId: sunu.id,
      nom: 'Auto RC Plus (SUNU)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Vol & Incendie,Défense & recours',
    },
    {
      compagnieId: sanlam.id,
      nom: 'Auto Essentiel (SanlamAllianz)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Bris de glace,Défense & recours',
    },
    {
      compagnieId: cnar.id,
      nom: 'Auto Sérénité (CNAR / Assurances Bleues)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Défense & recours,Assistance 24/7',
    },
    {
      compagnieId: lafia.id,
      nom: 'Auto Confort (Assurances Lafia)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Vol & Incendie',
    },
    {
      compagnieId: sabu.id,
      nom: 'Auto Populaire (Sabu Nyuman)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Défense & recours',
    },
    {
      compagnieId: nallias.id,
      nom: 'Auto Protection (Nallias SA)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Bris de glace',
    },
    {
      compagnieId: afg.id,
      nom: 'Auto Privilège (AFG Assurances)',
      branche: 'Auto',
      tarifsJson: JSON.stringify({ basePrime: 45040, rcGrid: AUTO_RC_TARIFFS }),
      garanties: 'Responsabilité civile,Dommages tous accidents,Assistance 24/7',
    },
    {
      compagnieId: afg.id,
      nom: 'Santé Famille',
      branche: 'Santé',
      tarifsJson: JSON.stringify({ basePrime: 240000 }),
      garanties: 'Frais médicaux,Hospitalisation,Optique,Dentaire',
    },
    {
      compagnieId: sunu.id,
      nom: 'Santé Individuel',
      branche: 'Santé',
      tarifsJson: JSON.stringify({ basePrime: 145000 }),
      garanties: 'Frais médicaux,Hospitalisation',
    },
    {
      compagnieId: nsia.id,
      nom: 'Habitation Essentielle',
      branche: 'Habitation',
      tarifsJson: JSON.stringify({ basePrime: 110000 }),
      garanties: 'Incendie,Dégât des eaux,Vol',
    },
    {
      compagnieId: sunu.id,
      nom: 'Habitation Confort',
      branche: 'Habitation',
      tarifsJson: JSON.stringify({ basePrime: 95000 }),
      garanties: 'Incendie,Dégât des eaux,Vol,Responsabilité civile',
    },
    {
      compagnieId: sanlam.id,
      nom: 'Voyage International (Zone 1 & 2)',
      branche: 'Voyage',
      tarifsJson: JSON.stringify({
        basePrime: 11700,
        grid: {
          zone1: {
            junior: [
              { maxDays: 7, primeTotale: 8700 },
              { maxDays: 15, primeTotale: 15100 },
              { maxDays: 32, primeTotale: 20500 },
              { maxDays: 62, primeTotale: 30200 },
              { maxDays: 92, primeTotale: 39000 },
              { maxDays: 180, primeTotale: 51000 },
              { maxDays: 365, primeTotale: 59000 },
            ],
            adult: [
              { maxDays: 7, primeTotale: 11700 },
              { maxDays: 15, primeTotale: 15500 },
              { maxDays: 32, primeTotale: 24300 },
              { maxDays: 62, primeTotale: 42500 },
              { maxDays: 92, primeTotale: 53000 },
              { maxDays: 180, primeTotale: 59500 },
              { maxDays: 365, primeTotale: 65000 },
            ],
          },
          zone2: {
            junior: [
              { maxDays: 7, primeTotale: 11800 },
              { maxDays: 15, primeTotale: 17000 },
              { maxDays: 32, primeTotale: 24300 },
              { maxDays: 62, primeTotale: 43000 },
              { maxDays: 92, primeTotale: 53500 },
              { maxDays: 180, primeTotale: 72500 },
              { maxDays: 365, primeTotale: 87000 },
            ],
            adult: [
              { maxDays: 7, primeTotale: 15800 },
              { maxDays: 15, primeTotale: 22300 },
              { maxDays: 32, primeTotale: 32300 },
              { maxDays: 62, primeTotale: 50000 },
              { maxDays: 92, primeTotale: 64000 },
              { maxDays: 180, primeTotale: 96500 },
              { maxDays: 365, primeTotale: 120000 },
            ],
          },
        },
      }),
      garanties: 'Frais médicaux,Rapatriement,Annulation,Bagages,Assistance 24/7',
    },
    {
      compagnieId: nsia.id,
      nom: 'Voyage Afrique & Moyen-Orient',
      branche: 'Voyage',
      tarifsJson: JSON.stringify({
        basePrime: 8700,
        grid: {
          zone1: {
            junior: [
              { maxDays: 7, primeTotale: 8700 },
              { maxDays: 15, primeTotale: 15100 },
              { maxDays: 32, primeTotale: 20500 },
              { maxDays: 62, primeTotale: 30200 },
              { maxDays: 92, primeTotale: 39000 },
              { maxDays: 180, primeTotale: 51000 },
              { maxDays: 365, primeTotale: 59000 },
            ],
            adult: [
              { maxDays: 7, primeTotale: 11700 },
              { maxDays: 15, primeTotale: 15500 },
              { maxDays: 32, primeTotale: 24300 },
              { maxDays: 62, primeTotale: 42500 },
              { maxDays: 92, primeTotale: 53000 },
              { maxDays: 180, primeTotale: 59500 },
              { maxDays: 365, primeTotale: 65000 },
            ],
          },
        },
      }),
      garanties: 'Frais médicaux,Rapatriement,Assistance 24/7',
    },
    {
      compagnieId: afg.id,
      nom: 'Vie Épargne',
      branche: 'Vie',
      tarifsJson: JSON.stringify({ basePrime: 320000 }),
      garanties: 'Garantie décès,Invalidité,Épargne',
    },
    {
      compagnieId: nsia.id,
      nom: 'Vie Protection',
      branche: 'Vie',
      tarifsJson: JSON.stringify({ basePrime: 180000 }),
      garanties: 'Garantie décès,Invalidité',
    },
  ]

  const createdProduits: Record<string, { id: string; nom: string; branche: string; compagnieId: string; tarifsJson: string; garanties: string }> = {}
  for (const p of produitsData) {
    const created = await db.produit.create({
      data: { ...p, statut: 'Actif' },
    })
    createdProduits[`${p.branche}:${p.nom}`] = created
  }
  console.log(`  ✓ ${produitsData.length} produits`)

  // ============ USERS ============
  const admin = await db.user.create({
    data: {
      email: 'admin@aam.ml',
      password: await hash(PASSWORDS.admin),
      name: 'Administrateur AAM',
      role: 'admin',
      telephone: '+223 20 22 33 44',
      avatar: 'AA',
      statut: 'Actif',
    },
  })
  const agent = await db.user.create({
    data: {
      email: 'agent@aam.ml',
      password: await hash(PASSWORDS.agent),
      name: 'Aïssata Diallo',
      role: 'agent',
      telephone: '+223 70 00 00 02',
      avatar: 'AD',
      statut: 'Actif',
    },
  })
  const client = await db.user.create({
    data: {
      email: 'client@aam.ml',
      password: await hash(PASSWORDS.client),
      name: 'Ibrahim Coulibaly',
      role: 'client',
      telephone: '+223 70 00 00 03',
      avatar: 'IC',
      statut: 'Actif',
    },
  })
  await db.user.create({
    data: {
      email: 'sinistres@aam.ml',
      password: await hash(PASSWORDS.gest),
      name: 'Fatoumata Koné',
      role: 'gestionnaire',
      telephone: '+223 70 00 00 04',
      avatar: 'FK',
      statut: 'Actif',
    },
  })
  await db.user.create({
    data: {
      email: 'partenaire@nsia.ml',
      password: await hash(PASSWORDS.part),
      name: 'Seydou Ba',
      role: 'correspondant',
      telephone: '+223 70 00 00 05',
      avatar: 'SB',
      statut: 'Actif',
      companyId: nsia.id,
    },
  })
  console.log('  ✓ 5 utilisateurs')

  // ============ DEVIS ============
  const autoProd = createdProduits['Auto:Auto Tous Risques (NSIA)']
  const habitProd = createdProduits['Habitation:Habitation Confort']
  const santeProd = createdProduits['Santé:Santé Famille']

  const devis1 = await db.devis.create({
    data: {
      reference: 'DEV-2026-0001',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Auto',
      compagnieId: nsia.id,
      companyName: nsia.nom,
      produitNom: autoProd.nom,
      prime: 185000,
      garanties: autoProd.garanties,
      duree: '12 mois',
      dateDebut: '2026-08-01',
      statut: 'Émis',
      agentName: agent.name,
      agentId: agent.id,
      dateCreation: '15/07/2026',
      caracteristiquesJson: JSON.stringify({
        typeVehicule: 'Berline',
        puissance: '6 CV',
        energie: 'Essence',
        usage: 'Personnel',
        ville: 'Bamako',
      }),
    },
  })
  const devis2 = await db.devis.create({
    data: {
      reference: 'DEV-2026-0002',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Habitation',
      compagnieId: sunu.id,
      companyName: sunu.nom,
      produitNom: habitProd.nom,
      prime: 95000,
      garanties: habitProd.garanties,
      duree: '12 mois',
      dateDebut: '2026-06-01',
      statut: 'Transformé',
      agentName: agent.name,
      agentId: agent.id,
      dateCreation: '10/06/2026',
    },
  })
  await db.devis.create({
    data: {
      reference: 'DEV-2026-0003',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Santé',
      compagnieId: afg.id,
      companyName: afg.nom,
      produitNom: santeProd.nom,
      prime: 240000,
      garanties: santeProd.garanties,
      duree: '12 mois',
      dateDebut: '2026-09-01',
      statut: 'Brouillon',
      agentName: agent.name,
      agentId: agent.id,
      dateCreation: '20/07/2026',
    },
  })
  console.log('  ✓ 3 devis')

  // ============ CONTRATS ============
  const contrat1 = await db.contrat.create({
    data: {
      reference: 'CTR-2026-0001',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Habitation',
      compagnieId: sunu.id,
      companyName: sunu.nom,
      produit: habitProd.nom,
      prime: 95000,
      garanties: habitProd.garanties,
      statut: 'Actif',
      dateDebut: '01/06/2026',
      dateFin: '31/05/2027',
      prochainRenouvellement: '01/05/2027',
      modePaiement: 'Orange Money',
      agentName: agent.name,
      agentId: agent.id,
      devisId: devis2.id,
    },
  })
  const contrat2 = await db.contrat.create({
    data: {
      reference: 'CTR-2026-0002',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Auto',
      compagnieId: nsia.id,
      companyName: nsia.nom,
      produit: autoProd.nom,
      prime: 185000,
      garanties: autoProd.garanties,
      statut: 'Actif',
      dateDebut: '01/08/2026',
      dateFin: '31/07/2027',
      prochainRenouvellement: '01/07/2027',
      modePaiement: 'Wave',
      agentName: agent.name,
      agentId: agent.id,
      devisId: devis1.id,
    },
  })
  console.log('  ✓ 2 contrats')

  // ============ PAIEMENT ============
  await db.paiement.create({
    data: {
      reference: 'PAY-2026-0001',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      contratRef: contrat1.reference,
      compagnieId: sunu.id,
      companyName: sunu.nom,
      montant: 95000,
      commission: 9500,
      moyen: 'Orange Money',
      statut: 'Réussi',
      date: '05/06/2026',
      transactionId: 'TXN-SEED-001',
    },
  })
  console.log('  ✓ 1 paiement')

  // ============ SINISTRE ============
  await db.sinistre.create({
    data: {
      reference: 'SIN-2026-0001',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Habitation',
      compagnieId: sunu.id,
      companyName: sunu.nom,
      contratRef: contrat1.reference,
      description: 'Dégât des eaux — fuite canalisation cuisine',
      montantDemande: 450000,
      montantRembourse: null,
      statut: 'En instruction',
      dateDeclaration: '18/07/2026',
      delaiH: 24,
      gestionnaire: 'Fatoumata Koné',
      pieces: 'facture_plombier.pdf,photos_degats.zip',
    },
  })
  await db.paiement.create({
    data: {
      reference: 'PAY-2026-0002',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      contratRef: contrat2.reference,
      compagnieId: nsia.id,
      companyName: nsia.nom,
      montant: 185000,
      commission: 18500,
      moyen: 'Wave',
      statut: 'En attente',
      date: '02/08/2026',
      transactionId: 'TXN-SEED-002',
    },
  })
  await db.sinistre.create({
    data: {
      reference: 'SIN-2026-0002',
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || 'IC',
      branche: 'Auto',
      compagnieId: nsia.id,
      companyName: nsia.nom,
      contratRef: contrat2.reference,
      description: 'Collision parking — rétroviseur droit',
      montantDemande: 125000,
      montantRembourse: 98000,
      statut: 'Traité',
      dateDeclaration: '10/07/2026',
      dateTraitement: '12/07/2026',
      delaiH: 36,
      gestionnaire: 'Fatoumata Koné',
      pieces: 'constat_amiable.pdf',
    },
  })
  console.log('  ✓ paiement + sinistre supplémentaires')

  // ============ SETTINGS ============
  const settings: Record<string, string> = {
    nom: 'Assistances Assurances Mali',
    slogan: 'Assurance, simplifiée',
    email: 'contact@aam.ml',
    telephone: '+223 20 22 33 44',
    adresse: 'Bamako, Mali',
    langue: 'fr',
    anneesExperience: '15',
    partenaires: '4',
    tauxSatisfaction: '98',
    clients: '1250',
    scorePrix: '40',
    scoreGaranties: '35',
    scoreNote: '15',
    scoreDelai: '10',
    dureeSession: '60',
    couleurPrimaire: '#2563eb',
    couleurSecondaire: '#10b981',
    theme: 'light',
    sec_2fa_admin: '1',
    sec_2fa_agent: '1',
    sec_2fa_correspondant: '0',
    sec_tls: '1',
    sec_audit: '1',
    sec_backup: '1',
    sec_ip_restrict: '0',
    notif_devis: '1',
    notif_paiement: '1',
    notif_contrat: '1',
    notif_sinistre_declare: '1',
    notif_sinistre_traite: '1',
    notif_echeance: '0',
    notif_newsletter: '0',
    notif_2fa_sms: '0',
    int_orange: 'connecté',
    int_wave: 'connecté',
    int_moov: 'connecté',
    int_cinetpay: 'en attente',
    int_paydunya: 'déconnecté',
    int_twilio: 'connecté',
    int_sendgrid: 'connecté',
  }
  for (const [key, value] of Object.entries(settings)) {
    await db.setting.create({ data: { key, value } })
  }
  console.log('  ✓ Settings')

  // ============ AUDIT ============
  await db.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        userName: admin.name,
        action: 'SEED',
        entity: 'system',
        details: 'Initialisation base métier AAM',
      },
      {
        userId: agent.id,
        userName: agent.name,
        action: 'CREATE_DEVIS',
        entity: 'devis',
        entityId: devis1.id,
        details: `Devis ${devis1.reference} créé`,
      },
      {
        userId: agent.id,
        userName: agent.name,
        action: 'CREATE_DEVIS',
        entity: 'devis',
        entityId: devis2.id,
        details: `Devis ${devis2.reference} créé`,
      },
      {
        userId: agent.id,
        userName: agent.name,
        action: 'CREATE_CONTRAT',
        entity: 'contrat',
        entityId: contrat1.id,
        details: `Contrat ${contrat1.reference} créé`,
      },
      {
        userId: agent.id,
        userName: agent.name,
        action: 'CREATE_CONTRAT',
        entity: 'contrat',
        entityId: contrat2.id,
        details: `Contrat ${contrat2.reference} créé`,
      },
      {
        userId: client.id,
        userName: client.name,
        action: 'CREATE_SINISTRE',
        entity: 'sinistre',
        details: 'Sinistre SIN-2026-0001 déclaré',
      },
      {
        userId: client.id,
        userName: client.name,
        action: 'CREATE_PAIEMENT',
        entity: 'paiement',
        details: 'Paiement PAY-2026-0001 via Orange Money',
      },
      {
        userId: admin.id,
        userName: admin.name,
        action: 'CREATE_PRODUIT',
        entity: 'produit',
        details: 'Catalogue produits partenaires synchronisé',
      },
    ],
  })
  console.log('  ✓ Audit logs')

  console.log('')
  console.log('✅ Seed terminé. Comptes (bcrypt) :')
  console.log(`   admin@aam.ml          / ${PASSWORDS.admin}`)
  console.log(`   agent@aam.ml          / ${PASSWORDS.agent}`)
  console.log(`   client@aam.ml         / ${PASSWORDS.client}`)
  console.log(`   sinistres@aam.ml      / ${PASSWORDS.gest}`)
  console.log(`   partenaire@nsia.ml    / ${PASSWORDS.part}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
