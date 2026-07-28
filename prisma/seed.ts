import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Helper to generate reference
const ref = (prefix: string, year: number, num: number) =>
  `${prefix}-${year}-${String(num).padStart(4, '0')}`

async function main() {
  console.log('🌱 Seeding AAM database...')

  // Clean existing data first
  console.log('🧹 Cleaning existing data...')
  await db.auditLog.deleteMany()
  await db.paiement.deleteMany()
  await db.sinistre.deleteMany()
  await db.contrat.deleteMany()
  await db.devis.deleteMany()
  await db.produit.deleteMany()
  await db.user.deleteMany()
  await db.compagnie.deleteMany()
  console.log('  ✓ Data cleaned')

  // ============ USERS ============
  const users = [
    { email: 'admin@aam.ml', password: 'admin', name: 'Mohamed Traoré', role: 'admin', telephone: '+223 70 00 00 01', avatar: 'MT', statut: 'Actif' },
    { email: 'agent@aam.ml', password: 'agent', name: 'Aïssata Diallo', role: 'agent', telephone: '+223 70 00 00 02', avatar: 'AD', statut: 'Actif' },
    { email: 'client@aam.ml', password: 'client', name: 'Ibrahim Coulibaly', role: 'client', telephone: '+223 70 00 00 03', avatar: 'IC', statut: 'Actif' },
    { email: 'sinistres@aam.ml', password: 'gest', name: 'Fatoumata Koné', role: 'gestionnaire', telephone: '+223 70 00 00 04', avatar: 'FK', statut: 'Actif' },
    { email: 'partenaire@nsia.ml', password: 'part', name: 'Seydou Ba', role: 'correspondant', telephone: '+223 70 00 00 05', avatar: 'SB', statut: 'Actif', companyName: 'NSIA Assurances' },
    { email: 'm.kone@aam.ml', password: 'agent', name: 'Moussa Koné', role: 'agent', telephone: '+223 70 00 00 06', avatar: 'MK', statut: 'Actif' },
    { email: 's.camara@aam.ml', password: 'agent', name: 'Seydou Camara', role: 'agent', telephone: '+223 70 00 00 07', avatar: 'SC', statut: 'Suspendu' },
    { email: 'a.toure@aam.ml', password: 'agent', name: 'Aminata Touré', role: 'agent', telephone: '+223 70 00 00 08', avatar: 'AT', statut: 'Invité' },
    { email: 'partenaire@sunu.ml', password: 'part', name: 'Mariam Cissé', role: 'correspondant', telephone: '+223 70 00 00 09', avatar: 'MC', statut: 'Actif', companyName: 'SUNU Assurances' },
  ]

  // ============ COMPAGNIES ============
  const compagnies = [
    { nom: 'NSIA Assurances', initials: 'NS', iconColor: 'bg-blue-500', agrement: 'CIMA-NSIA-2018', statut: 'Actif', rating: 4.8, delaiTraitement: 28, contact: 'Seydou Ba', email: 'partenaire@nsia.ml', telephone: '+223 20 22 33 44', datePartenariat: '2018-03-15', branches: 'Auto,Santé,Habitation,Voyage,Vie' },
    { nom: 'SUNU Assurances', initials: 'SU', iconColor: 'bg-violet-500', agrement: 'CIMA-SUNU-2019', statut: 'Actif', rating: 4.6, delaiTraitement: 35, contact: 'Mariam Cissé', email: 'partenaire@sunu.ml', telephone: '+223 20 22 55 66', datePartenariat: '2019-07-22', branches: 'Auto,Santé,Habitation' },
    { nom: 'AFG Assurances', initials: 'AF', iconColor: 'bg-emerald-500', agrement: 'CIMA-AFG-2017', statut: 'Actif', rating: 4.5, delaiTraitement: 14, contact: 'Oumar Diarra', email: 'partenaire@afg.ml', telephone: '+223 20 22 77 88', datePartenariat: '2017-11-08', branches: 'Santé,Vie,Habitation' },
    { nom: 'Sanlam Allianz', initials: 'SA', iconColor: 'bg-rose-500', agrement: 'CIMA-SAL-2020', statut: 'Actif', rating: 4.7, delaiTraitement: 22, contact: 'Boubacar Sow', email: 'partenaire@sanlam.ml', telephone: '+223 20 22 99 00', datePartenariat: '2020-02-14', branches: 'Auto,Voyage,Habitation' },
    { nom: 'CNAR', initials: 'CN', iconColor: 'bg-amber-500', agrement: 'CIMA-CNAR-2016', statut: 'Inactif', rating: 4.3, delaiTraitement: 48, contact: 'Adama Keïta', email: 'partenaire@cnar.ml', telephone: '+223 20 22 11 22', datePartenariat: '2016-09-30', branches: 'Auto,Habitation' },
    { nom: 'SONAVIE', initials: 'SO', iconColor: 'bg-cyan-500', agrement: 'CIMA-SNV-2018', statut: 'Actif', rating: 4.4, delaiTraitement: 32, contact: 'Hawa Maïga', email: 'partenaire@sonavie.ml', telephone: '+223 20 22 33 55', datePartenariat: '2018-06-12', branches: 'Vie' },
    { nom: 'Takaful Mali', initials: 'TM', iconColor: 'bg-indigo-500', agrement: 'CIMA-TKF-2021', statut: 'À valider', rating: 0, delaiTraitement: 0, contact: 'Moussa Bathily', email: 'partenaire@takaful.ml', telephone: '+223 20 22 77 99', datePartenariat: '2021-05-10', branches: 'Auto,Vie,Habitation' },
    { nom: 'Assurances Lafia', initials: 'AL', iconColor: 'bg-teal-500', agrement: 'CIMA-LAF-2019', statut: 'Actif', rating: 4.2, delaiTraitement: 40, contact: 'Salif Coulibaly', email: 'partenaire@lafia.ml', telephone: '+223 20 22 66 33', datePartenariat: '2019-12-01', branches: 'Santé,Habitation' },
    { nom: 'CIF Assurances', initials: 'CI', iconColor: 'bg-orange-500', agrement: 'CIMA-CIF-2017', statut: 'Actif', rating: 4.1, delaiTraitement: 36, contact: 'Aïssata Haïdara', email: 'partenaire@cif.ml', telephone: '+223 20 22 44 88', datePartenariat: '2017-08-18', branches: 'Auto,Santé' },
    { nom: 'NALLIAS-SA', initials: 'NA', iconColor: 'bg-fuchsia-500', agrement: 'CIMA-NAL-2020', statut: 'Actif', rating: 4.5, delaiTraitement: 26, contact: 'Bakary Traoré', email: 'partenaire@nallias.ml', telephone: '+223 20 22 99 11', datePartenariat: '2020-04-03', branches: 'Auto,Vie' },
    { nom: 'Sabunyuman', initials: 'SB', iconColor: 'bg-lime-500', agrement: 'CIMA-SAB-2022', statut: 'À valider', rating: 0, delaiTraitement: 0, contact: 'Yacouba Diallo', email: 'partenaire@sab.ml', telephone: '+223 20 22 22 33', datePartenariat: '2022-01-20', branches: 'Habitation,Voyage' },
  ]

  // ============ CREATE COMPAGNIES ============
  const createdCompagnies: { [key: string]: any } = {}
  for (const c of compagnies) {
    const comp = await db.compagnie.create({ data: c })
    createdCompagnies[c.nom] = comp
    console.log(`  ✓ Compagnie: ${c.nom}`)
  }

  // ============ CREATE USERS (with company link) ============
  const createdUsers: { [key: string]: any } = {}
  for (const u of users) {
    const { companyName, ...userData } = u
    const companyId = companyName ? createdCompagnies[companyName]?.id : null
    const user = await db.user.create({ data: { ...userData, companyId } })
    createdUsers[u.email] = user
    console.log(`  ✓ User: ${u.email}`)
  }

  // ============ CREATE PRODUITS (sample per compagnie) ============
  const produitsSeed = [
    { compagnieNom: 'NSIA Assurances', nom: 'Auto Tous Risques', branche: 'Auto', tarifsJson: '{"basePrime": 185000}', garanties: 'RC,Vol & Incendie,Bris de glace,Dommages tous accidents', statut: 'Actif' },
    { compagnieNom: 'NSIA Assurances', nom: 'Habitation Essentielle', branche: 'Habitation', tarifsJson: '{"basePrime": 110000}', garanties: 'Incendie,Dégât des eaux', statut: 'Actif' },
    { compagnieNom: 'SUNU Assurances', nom: 'Habitation Confort', branche: 'Habitation', tarifsJson: '{"basePrime": 95000}', garanties: 'Incendie,Dégât des eaux,Vol', statut: 'Actif' },
    { compagnieNom: 'AFG Assurances', nom: 'Santé Famille', branche: 'Santé', tarifsJson: '{"basePrime": 240000}', garanties: 'Frais médicaux,Hospitalisation,Optique,Dentaire', statut: 'Actif' },
    { compagnieNom: 'SONAVIE', nom: 'Vie Épargne', branche: 'Vie', tarifsJson: '{"basePrime": 320000}', garanties: 'Décès,Invalidité,Épargne', statut: 'Actif' },
    { compagnieNom: 'Sanlam Allianz', nom: 'Voyage International', branche: 'Voyage', tarifsJson: '{"basePrime": 45000}', garanties: 'Annulation,Bagages,Assistance 24/7', statut: 'Actif' },
  ]
  for (const p of produitsSeed) {
    const compagnie = createdCompagnies[p.compagnieNom]
    if (compagnie) {
      const { compagnieNom, ...produitData } = p
      await db.produit.create({
        data: { ...produitData, compagnieId: compagnie.id },
      })
      console.log(`  ✓ Produit: ${p.nom} (${p.compagnieNom})`)
    }
  }

  // ============ CREATE DEVIS ============
  const devisSeed = [
    { clientName: 'Ibrahim Coulibaly', clientAvatar: 'IC', branche: 'Auto', companyName: 'NSIA Assurances', produitNom: 'Auto Tous Risques', prime: 185000, garanties: 'RC,Vol & Incendie,Bris de glace', duree: '12 mois', dateDebut: '15/06/2026', statut: 'Émis', agentName: 'Aïssata Diallo', dateCreation: '08/07/2026', reference: ref('DEV', 2026, 487) },
    { clientName: 'Fatoumata Sangaré', clientAvatar: 'FS', branche: 'Habitation', companyName: 'SUNU Assurances', produitNom: 'Habitation Confort', prime: 95000, garanties: 'Incendie,Dégât des eaux,Vol', duree: '12 mois', dateDebut: '01/06/2026', statut: 'Transformé', agentName: 'Seydou Camara', dateCreation: '07/07/2026', reference: ref('DEV', 2026, 486) },
    { clientName: 'Moussa Koné', clientAvatar: 'MK', branche: 'Santé', companyName: 'AFG Assurances', produitNom: 'Santé Famille', prime: 240000, garanties: 'Frais médicaux,Hospitalisation,Optique', duree: '12 mois', dateDebut: '10/05/2026', statut: 'Émis', agentName: 'Aïssata Diallo', dateCreation: '07/07/2026', reference: ref('DEV', 2026, 485) },
    { clientName: 'Aminata Touré', clientAvatar: 'AT', branche: 'Voyage', companyName: 'Sanlam Allianz', produitNom: 'Voyage International', prime: 45000, garanties: 'Annulation,Bagages,Assistance', duree: '3 mois', dateDebut: '01/08/2026', statut: 'Brouillon', agentName: 'Aminata Touré', dateCreation: '06/07/2026', reference: ref('DEV', 2026, 484) },
    { clientName: 'Seydou Ba', clientAvatar: 'SB', branche: 'Auto', companyName: 'CNAR', produitNom: 'Auto RC', prime: 165000, garanties: 'RC', duree: '12 mois', dateDebut: '15/03/2025', statut: 'Expiré', agentName: 'Seydou Camara', dateCreation: '05/07/2026', reference: ref('DEV', 2026, 483) },
    { clientName: 'Aïssata Diallo', clientAvatar: 'AD', branche: 'Vie', companyName: 'SONAVIE', produitNom: 'Vie Épargne', prime: 320000, garanties: 'Décès,Invalidité,Épargne', duree: '20 ans', dateDebut: '20/04/2026', statut: 'Transformé', agentName: 'Moussa Koné', dateCreation: '04/07/2026', reference: ref('DEV', 2026, 482) },
    { clientName: 'Modibo Sidibé', clientAvatar: 'MS', branche: 'Auto', companyName: 'Takaful Mali', produitNom: 'Auto RC Plus', prime: 175000, garanties: 'RC,Vol', duree: '12 mois', dateDebut: '01/01/2026', statut: 'Refusé', agentName: 'Aminata Touré', dateCreation: '03/07/2026', reference: ref('DEV', 2026, 481) },
    { clientName: 'Kadiatou Traoré', clientAvatar: 'KT', branche: 'Habitation', companyName: 'NSIA Assurances', produitNom: 'Habitation Essentielle', prime: 110000, garanties: 'Incendie,Dégât des eaux', duree: '12 mois', dateDebut: '05/03/2026', statut: 'Émis', agentName: 'Aïssata Diallo', dateCreation: '02/07/2026', reference: ref('DEV', 2026, 480) },
  ]
  for (const d of devisSeed) {
    const compagnie = createdCompagnies[d.companyName]
    const client = Object.values(createdUsers).find((u: any) => u.name === d.clientName)
    await db.devis.create({
      data: {
        ...d,
        compagnieId: compagnie?.id || null,
        clientId: client?.id || null,
      },
    })
    console.log(`  ✓ Devis: ${d.reference}`)
  }

  // ============ CREATE CONTRATS ============
  const contratsSeed = [
    { clientName: 'Ibrahim Coulibaly', clientAvatar: 'IC', branche: 'Auto', companyName: 'NSIA Assurances', produit: 'Auto Tous Risques', prime: 185000, garanties: 'RC,Vol & Incendie,Bris de glace,Dommages tous accidents', statut: 'Actif', dateDebut: '15/06/2026', dateFin: '15/06/2027', prochainRenouvellement: '15/06/2027', modePaiement: 'Orange Money', agentName: 'Aïssata Diallo', reference: ref('CTR', 2026, 142) },
    { clientName: 'Fatoumata Sangaré', clientAvatar: 'FS', branche: 'Habitation', companyName: 'SUNU Assurances', produit: 'Habitation Confort', prime: 95000, garanties: 'Incendie,Dégât des eaux,Vol', statut: 'Actif', dateDebut: '01/06/2026', dateFin: '01/06/2027', prochainRenouvellement: '01/06/2027', modePaiement: 'Wave', agentName: 'Seydou Camara', reference: ref('CTR', 2026, 138) },
    { clientName: 'Moussa Koné', clientAvatar: 'MK', branche: 'Santé', companyName: 'AFG Assurances', produit: 'Santé Famille', prime: 240000, garanties: 'Frais médicaux,Hospitalisation,Optique,Dentaire', statut: 'Actif', dateDebut: '10/05/2026', dateFin: '10/05/2027', prochainRenouvellement: '10/05/2027', modePaiement: 'Moov Money', agentName: 'Aïssata Diallo', reference: ref('CTR', 2026, 125) },
    { clientName: 'Aïssata Diallo', clientAvatar: 'AD', branche: 'Vie', companyName: 'SONAVIE', produit: 'Vie Épargne', prime: 320000, garanties: 'Décès,Invalidité,Épargne', statut: 'Actif', dateDebut: '20/04/2026', dateFin: '20/04/2046', prochainRenouvellement: '20/04/2027', modePaiement: 'Virement', agentName: 'Moussa Koné', reference: ref('CTR', 2026, 98) },
    { clientName: 'Aminata Touré', clientAvatar: 'AT', branche: 'Voyage', companyName: 'Sanlam Allianz', produit: 'Voyage International', prime: 45000, garanties: 'Annulation,Bagages,Assistance 24/7', statut: 'En attente', dateDebut: '01/08/2026', dateFin: '31/08/2026', prochainRenouvellement: 'N/A', modePaiement: 'Carte bancaire', agentName: 'Aminata Touré', reference: ref('CTR', 2026, 76) },
    { clientName: 'Modibo Sidibé', clientAvatar: 'MS', branche: 'Auto', companyName: 'CNAR', produit: 'Auto RC', prime: 165000, garanties: 'RC', statut: 'Suspendu', dateDebut: '15/03/2025', dateFin: '15/03/2026', prochainRenouvellement: 'Échu', modePaiement: 'Orange Money', agentName: 'Seydou Camara', reference: ref('CTR', 2025, 1142) },
    { clientName: 'Kadiatou Traoré', clientAvatar: 'KT', branche: 'Habitation', companyName: 'NSIA Assurances', produit: 'Habitation Essentielle', prime: 110000, garanties: 'Incendie,Dégât des eaux', statut: 'Actif', dateDebut: '05/03/2026', dateFin: '05/03/2027', prochainRenouvellement: '05/03/2027', modePaiement: 'Wave', agentName: 'Aïssata Diallo', reference: ref('CTR', 2026, 64) },
  ]
  for (const c of contratsSeed) {
    const compagnie = createdCompagnies[c.companyName]
    const client = Object.values(createdUsers).find((u: any) => u.name === c.clientName)
    await db.contrat.create({
      data: {
        ...c,
        compagnieId: compagnie?.id || null,
        clientId: client?.id || null,
      },
    })
    console.log(`  ✓ Contrat: ${c.reference}`)
  }

  // ============ CREATE SINISTRES ============
  const sinistresSeed = [
    { clientName: 'Ibrahim Coulibaly', clientAvatar: 'IC', branche: 'Auto', companyName: 'NSIA Assurances', contratRef: 'CTR-2026-0142', description: 'Accident de la route, choc frontal', montantDemande: 850000, montantRembourse: 750000, statut: 'Traité', dateDeclaration: '12/07/2026', dateTraitement: '14/07/2026', delaiH: 38, gestionnaire: 'Fatoumata Koné', pieces: 'Constat,Photos,Facture garage', reference: ref('SIN', 2026, 98) },
    { clientName: 'Moussa Koné', clientAvatar: 'MK', branche: 'Santé', companyName: 'AFG Assurances', contratRef: 'CTR-2026-0125', description: 'Hospitalisation - appendicite', montantDemande: 425000, montantRembourse: 380000, statut: 'Validé', dateDeclaration: '10/07/2026', dateTraitement: '13/07/2026', delaiH: 62, gestionnaire: 'Fatoumata Koné', pieces: 'Facture,Ordonnance,Certificat', reference: ref('SIN', 2026, 97) },
    { clientName: 'Fatoumata Sangaré', clientAvatar: 'FS', branche: 'Habitation', companyName: 'SUNU Assurances', contratRef: 'CTR-2026-0138', description: 'Dégât des eaux - canalisation', montantDemande: 350000, montantRembourse: null, statut: 'En instruction', dateDeclaration: '08/07/2026', dateTraitement: null, delaiH: 24, gestionnaire: 'Fatoumata Koné', pieces: 'Photos,Devis plombier', reference: ref('SIN', 2026, 96) },
    { clientName: 'Aïssata Diallo', clientAvatar: 'AD', branche: 'Vie', companyName: 'SONAVIE', contratRef: 'CTR-2026-0098', description: 'Décès conjoint assuré', montantDemande: 5000000, montantRembourse: null, statut: 'En instruction', dateDeclaration: '05/07/2026', dateTraitement: null, delaiH: 96, gestionnaire: 'Fatoumata Koné', pieces: 'Acte de décès,Certificat', reference: ref('SIN', 2026, 95) },
    { clientName: 'Aminata Touré', clientAvatar: 'AT', branche: 'Voyage', companyName: 'Sanlam Allianz', contratRef: 'CTR-2026-0076', description: 'Annulation vol - raisons médicales', montantDemande: 180000, montantRembourse: 180000, statut: 'Traité', dateDeclaration: '02/07/2026', dateTraitement: '04/07/2026', delaiH: 48, gestionnaire: 'Fatoumata Koné', pieces: 'Certificat médical,Billet', reference: ref('SIN', 2026, 94) },
    { clientName: 'Kadiatou Traoré', clientAvatar: 'KT', branche: 'Habitation', companyName: 'NSIA Assurances', contratRef: 'CTR-2026-0064', description: 'Vol - effraction', montantDemande: 1200000, montantRembourse: null, statut: 'Déclaré', dateDeclaration: '28/06/2026', dateTraitement: null, delaiH: 12, gestionnaire: 'Fatoumata Koné', pieces: 'PV police,Photos', reference: ref('SIN', 2026, 93) },
  ]
  for (const s of sinistresSeed) {
    const compagnie = createdCompagnies[s.companyName]
    const client = Object.values(createdUsers).find((u: any) => u.name === s.clientName)
    await db.sinistre.create({
      data: {
        ...s,
        compagnieId: compagnie?.id || null,
        clientId: client?.id || null,
      },
    })
    console.log(`  ✓ Sinistre: ${s.reference}`)
  }

  // ============ CREATE PAIEMENTS ============
  const paiementsSeed = [
    { clientName: 'Ibrahim Coulibaly', clientAvatar: 'IC', contratRef: 'CTR-2026-0142', companyName: 'NSIA Assurances', montant: 185000, commission: 18500, moyen: 'Orange Money', statut: 'Réussi', date: '15/06/2026', transactionId: 'OM-987654', reference: ref('PAY', 2026, 321) },
    { clientName: 'Fatoumata Sangaré', clientAvatar: 'FS', contratRef: 'CTR-2026-0138', companyName: 'SUNU Assurances', montant: 95000, commission: 9500, moyen: 'Wave', statut: 'Réussi', date: '01/06/2026', transactionId: 'WV-123456', reference: ref('PAY', 2026, 320) },
    { clientName: 'Moussa Koné', clientAvatar: 'MK', contratRef: 'CTR-2026-0125', companyName: 'AFG Assurances', montant: 240000, commission: 24000, moyen: 'Moov Money', statut: 'Réussi', date: '10/05/2026', transactionId: 'MV-654321', reference: ref('PAY', 2026, 319) },
    { clientName: 'Aïssata Diallo', clientAvatar: 'AD', contratRef: 'CTR-2026-0098', companyName: 'SONAVIE', montant: 320000, commission: 32000, moyen: 'Virement', statut: 'En attente', date: '20/04/2026', transactionId: 'VIR-789012', reference: ref('PAY', 2026, 318) },
    { clientName: 'Aminata Touré', clientAvatar: 'AT', contratRef: 'CTR-2026-0076', companyName: 'Sanlam Allianz', montant: 45000, commission: 4500, moyen: 'Carte bancaire', statut: 'Réussi', date: '01/07/2026', transactionId: 'CB-456789', reference: ref('PAY', 2026, 317) },
    { clientName: 'Kadiatou Traoré', clientAvatar: 'KT', contratRef: 'CTR-2026-0064', companyName: 'NSIA Assurances', montant: 110000, commission: 11000, moyen: 'Wave', statut: 'Échoué', date: '05/03/2026', transactionId: 'WV-987654', reference: ref('PAY', 2026, 316) },
    { clientName: 'Modibo Sidibé', clientAvatar: 'MS', contratRef: 'CTR-2025-1142', companyName: 'CNAR', montant: 165000, commission: 16500, moyen: 'Orange Money', statut: 'Remboursé', date: '15/03/2025', transactionId: 'OM-111222', reference: ref('PAY', 2026, 315) },
  ]
  for (const p of paiementsSeed) {
    const compagnie = createdCompagnies[p.companyName]
    const client = Object.values(createdUsers).find((u: any) => u.name === p.clientName)
    await db.paiement.create({
      data: {
        ...p,
        compagnieId: compagnie?.id || null,
        clientId: client?.id || null,
      },
    })
    console.log(`  ✓ Paiement: ${p.reference}`)
  }

  // ============ CREATE AUDIT LOGS ============
  const admin = createdUsers['admin@aam.ml']
  const auditLogs = [
    { userName: 'Mohamed Traoré', userId: admin.id, action: 'CREATE_COMPAGNIE', entity: 'compagnie', details: 'Compagnie NSIA Assurances créée' },
    { userName: 'Aïssata Diallo', userId: createdUsers['agent@aam.ml'].id, action: 'CREATE_DEVIS', entity: 'devis', details: 'Devis DEV-2026-0487 créé' },
    { userName: 'Fatoumata Koné', userId: createdUsers['sinistres@aam.ml'].id, action: 'UPDATE_SINISTRE', entity: 'sinistre', details: 'Sinistre SIN-2026-0098 traité' },
  ]
  for (const log of auditLogs) {
    await db.auditLog.create({ data: log })
  }
  console.log(`  ✓ ${auditLogs.length} audit logs`)

  console.log('\n✅ Seed completed successfully!')
  console.log(`   - ${Object.keys(createdUsers).length} utilisateurs`)
  console.log(`   - ${Object.keys(createdCompagnies).length} compagnies`)
  console.log(`   - ${produitsSeed.length} produits`)
  console.log(`   - ${devisSeed.length} devis`)
  console.log(`   - ${contratsSeed.length} contrats`)
  console.log(`   - ${sinistresSeed.length} sinistres`)
  console.log(`   - ${paiementsSeed.length} paiements`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
