import type { Role } from './auth'

export interface Devis {
  id: string
  reference: string
  client: string
  clientAvatar: string
  branche: 'Auto' | 'Santé' | 'Habitation' | 'Voyage' | 'Vie'
  compagnie: string
  prime: number
  garanties: string[]
  statut: 'Brouillon' | 'Émis' | 'Transformé' | 'Expiré' | 'Refusé'
  dateCreation: string
  agent: string
}

export interface Contrat {
  id: string
  reference: string
  client: string
  clientAvatar: string
  branche: 'Auto' | 'Santé' | 'Habitation' | 'Voyage' | 'Vie'
  compagnie: string
  produit: string
  prime: number
  garanties: string[]
  statut: 'Actif' | 'En attente' | 'Résilié' | 'Suspendu' | 'Expiré'
  dateDebut: string
  dateFin: string
  prochainRenouvellement: string
  modePaiement: string
  agent: string
}

export interface Sinistre {
  id: string
  reference: string
  client: string
  clientAvatar: string
  branche: 'Auto' | 'Santé' | 'Habitation' | 'Voyage' | 'Vie'
  compagnie: string
  contratRef: string
  description: string
  montantDemande: number
  montantRembourse: number | null
  statut: 'Déclaré' | 'En instruction' | 'Traité' | 'Validé' | 'Rejeté'
  dateDeclaration: string
  dateTraitement: string | null
  delaiH: number
  gestionnaire: string
  pieces: string[]
}

export interface Compagnie {
  id: string
  nom: string
  initials: string
  iconColor: string
  agrement: string
  statut: 'Actif' | 'À valider' | 'Inactif'
  rating: number
  delaiTraitement: number // heures
  produits: number
  sinistresActifs: number
  contact: string
  email: string
  telephone: string
  datePartenariat: string
  branches: string[]
}

export interface Paiement {
  id: string
  reference: string
  client: string
  clientAvatar: string
  contratRef: string
  compagnie: string
  montant: number
  commission: number
  moyen: 'Orange Money' | 'Wave' | 'Moov Money' | 'Carte bancaire' | 'Virement'
  statut: 'Réussi' | 'En attente' | 'Échoué' | 'Remboursé'
  date: string
  transactionId: string
}

export interface Utilisateur {
  id: string
  nom: string
  email: string
  role: Role
  avatar: string
  avatarColor: string
  telephone: string
  statut: 'Actif' | 'Suspendu' | 'Invité'
  dateCreation: string
  derniereConnexion: string
  compagnie?: string
}

// ============ DATA ============

export const DEVIS_DATA: Devis[] = [
  { id: '1', reference: 'DEV-2026-0487', client: 'Ibrahim Coulibaly', clientAvatar: 'IC', branche: 'Auto', compagnie: 'NSIA Assurances', prime: 185000, garanties: ['RC', 'Vol & Incendie', 'Bris de glace'], statut: 'Émis', dateCreation: '08/07/2026', agent: 'Aïssata Diallo' },
  { id: '2', reference: 'DEV-2026-0486', client: 'Fatoumata Sangaré', clientAvatar: 'FS', branche: 'Habitation', compagnie: 'SUNU Assurances', prime: 95000, garanties: ['Incendie', 'Dégât des eaux', 'Vol'], statut: 'Transformé', dateCreation: '07/07/2026', agent: 'Seydou Camara' },
  { id: '3', reference: 'DEV-2026-0485', client: 'Moussa Koné', clientAvatar: 'MK', branche: 'Santé', compagnie: 'AFG Assurances', prime: 240000, garanties: ['Frais médicaux', 'Hospitalisation', 'Optique'], statut: 'Émis', dateCreation: '07/07/2026', agent: 'Aïssata Diallo' },
  { id: '4', reference: 'DEV-2026-0484', client: 'Aminata Touré', clientAvatar: 'AT', branche: 'Voyage', compagnie: 'Sanlam Allianz', prime: 45000, garanties: ['Annulation', 'Bagages', 'Assistance'], statut: 'Brouillon', dateCreation: '06/07/2026', agent: 'Aminata Touré' },
  { id: '5', reference: 'DEV-2026-0483', client: 'Seydou Ba', clientAvatar: 'SB', branche: 'Auto', compagnie: 'CNAR', prime: 165000, garanties: ['RC', 'Dommages tous accidents'], statut: 'Expiré', dateCreation: '05/07/2026', agent: 'Seydou Camara' },
  { id: '6', reference: 'DEV-2026-0482', client: 'Aïssata Diallo', clientAvatar: 'AD', branche: 'Vie', compagnie: 'SONAVIE', prime: 320000, garanties: ['Décès', 'Invalidité', 'Épargne'], statut: 'Transformé', dateCreation: '04/07/2026', agent: 'Moussa Koné' },
  { id: '7', reference: 'DEV-2026-0481', client: 'Modibo Sidibé', clientAvatar: 'MS', branche: 'Auto', compagnie: 'Takaful Mali', prime: 175000, garanties: ['RC', 'Vol'], statut: 'Refusé', dateCreation: '03/07/2026', agent: 'Aminata Touré' },
  { id: '8', reference: 'DEV-2026-0480', client: 'Kadiatou Traoré', clientAvatar: 'KT', branche: 'Habitation', compagnie: 'NSIA Assurances', prime: 110000, garanties: ['Incendie', 'Dégât des eaux'], statut: 'Émis', dateCreation: '02/07/2026', agent: 'Aïssata Diallo' },
]

export const CONTRATS_DATA: Contrat[] = [
  { id: '1', reference: 'CTR-2026-0142', client: 'Ibrahim Coulibaly', clientAvatar: 'IC', branche: 'Auto', compagnie: 'NSIA Assurances', produit: 'Auto Tous Risques', prime: 185000, garanties: ['RC', 'Vol & Incendie', 'Bris de glace', 'Dommages tous accidents'], statut: 'Actif', dateDebut: '15/06/2026', dateFin: '15/06/2027', prochainRenouvellement: '15/06/2027', modePaiement: 'Orange Money', agent: 'Aïssata Diallo' },
  { id: '2', reference: 'CTR-2026-0138', client: 'Fatoumata Sangaré', clientAvatar: 'FS', branche: 'Habitation', compagnie: 'SUNU Assurances', produit: 'Habitation Confort', prime: 95000, garanties: ['Incendie', 'Dégât des eaux', 'Vol'], statut: 'Actif', dateDebut: '01/06/2026', dateFin: '01/06/2027', prochainRenouvellement: '01/06/2027', modePaiement: 'Wave', agent: 'Seydou Camara' },
  { id: '3', reference: 'CTR-2026-0125', client: 'Moussa Koné', clientAvatar: 'MK', branche: 'Santé', compagnie: 'AFG Assurances', produit: 'Santé Famille', prime: 240000, garanties: ['Frais médicaux', 'Hospitalisation', 'Optique', 'Dentaire'], statut: 'Actif', dateDebut: '10/05/2026', dateFin: '10/05/2027', prochainRenouvellement: '10/05/2027', modePaiement: 'Moov Money', agent: 'Aïssata Diallo' },
  { id: '4', reference: 'CTR-2026-0098', client: 'Aïssata Diallo', clientAvatar: 'AD', branche: 'Vie', compagnie: 'SONAVIE', produit: 'Vie Épargne', prime: 320000, garanties: ['Décès', 'Invalidité', 'Épargne'], statut: 'Actif', dateDebut: '20/04/2026', dateFin: '20/04/2046', prochainRenouvellement: '20/04/2027', modePaiement: 'Virement', agent: 'Moussa Koné' },
  { id: '5', reference: 'CTR-2026-0076', client: 'Aminata Touré', clientAvatar: 'AT', branche: 'Voyage', compagnie: 'Sanlam Allianz', produit: 'Voyage International', prime: 45000, garanties: ['Annulation', 'Bagages', 'Assistance 24/7'], statut: 'En attente', dateDebut: '01/08/2026', dateFin: '31/08/2026', prochainRenouvellement: 'N/A', modePaiement: 'Carte bancaire', agent: 'Aminata Touré' },
  { id: '6', reference: 'CTR-2025-1142', client: 'Modibo Sidibé', clientAvatar: 'MS', branche: 'Auto', compagnie: 'CNAR', produit: 'Auto RC', prime: 165000, garanties: ['RC'], statut: 'Suspendu', dateDebut: '15/03/2025', dateFin: '15/03/2026', prochainRenouvellement: 'Échu', modePaiement: 'Orange Money', agent: 'Seydou Camara' },
  { id: '7', reference: 'CTR-2026-0064', client: 'Kadiatou Traoré', clientAvatar: 'KT', branche: 'Habitation', compagnie: 'NSIA Assurances', produit: 'Habitation Essentielle', prime: 110000, garanties: ['Incendie', 'Dégât des eaux'], statut: 'Actif', dateDebut: '05/03/2026', dateFin: '05/03/2027', prochainRenouvellement: '05/03/2027', modePaiement: 'Wave', agent: 'Aïssata Diallo' },
]

export const SINISTRES_DATA: Sinistre[] = [
  { id: '1', reference: 'SIN-2026-0098', client: 'Ibrahim Coulibaly', clientAvatar: 'IC', branche: 'Auto', compagnie: 'NSIA Assurances', contratRef: 'CTR-2026-0142', description: 'Accident de la route, choc frontal', montantDemande: 850000, montantRembourse: 750000, statut: 'Traité', dateDeclaration: '12/07/2026', dateTraitement: '14/07/2026', delaiH: 38, gestionnaire: 'Fatoumata Koné', pieces: ['Constat', 'Photos', 'Facture garage'] },
  { id: '2', reference: 'SIN-2026-0097', client: 'Moussa Koné', clientAvatar: 'MK', branche: 'Santé', compagnie: 'AFG Assurances', contratRef: 'CTR-2026-0125', description: 'Hospitalisation - appendicite', montantDemande: 425000, montantRembourse: 380000, statut: 'Validé', dateDeclaration: '10/07/2026', dateTraitement: '13/07/2026', delaiH: 62, gestionnaire: 'Fatoumata Koné', pieces: ['Facture', 'Ordonnance', 'Certificat'] },
  { id: '3', reference: 'SIN-2026-0096', client: 'Fatoumata Sangaré', clientAvatar: 'FS', branche: 'Habitation', compagnie: 'SUNU Assurances', contratRef: 'CTR-2026-0138', description: 'Dégât des eaux - canalisation', montantDemande: 350000, montantRembourse: null, statut: 'En instruction', dateDeclaration: '08/07/2026', dateTraitement: null, delaiH: 24, gestionnaire: 'Fatoumata Koné', pieces: ['Photos', 'Devis plombier'] },
  { id: '4', reference: 'SIN-2026-0095', client: 'Aïssata Diallo', clientAvatar: 'AD', branche: 'Vie', compagnie: 'SONAVIE', contratRef: 'CTR-2026-0098', description: 'Décès conjoint assuré', montantDemande: 5000000, montantRembourse: null, statut: 'En instruction', dateDeclaration: '05/07/2026', dateTraitement: null, delaiH: 96, gestionnaire: 'Fatoumata Koné', pieces: ['Acte de décès', 'Certificat'] },
  { id: '5', reference: 'SIN-2026-0094', client: 'Aminata Touré', clientAvatar: 'AT', branche: 'Voyage', compagnie: 'Sanlam Allianz', contratRef: 'CTR-2026-0076', description: 'Annulation vol - raisons médicales', montantDemande: 180000, montantRembourse: 180000, statut: 'Traité', dateDeclaration: '02/07/2026', dateTraitement: '04/07/2026', delaiH: 48, gestionnaire: 'Fatoumata Koné', pieces: ['Certificat médical', 'Billet'] },
  { id: '6', reference: 'SIN-2026-0093', client: 'Kadiatou Traoré', clientAvatar: 'KT', branche: 'Habitation', compagnie: 'NSIA Assurances', contratRef: 'CTR-2026-0064', description: 'Vol - effraction', montantDemande: 1200000, montantRembourse: null, statut: 'Déclaré', dateDeclaration: '28/06/2026', dateTraitement: null, delaiH: 12, gestionnaire: 'Fatoumata Koné', pieces: ['PV police', 'Photos'] },
]

export const COMPAGNIES_DATA: Compagnie[] = [
  { id: '1', nom: 'NSIA Assurances', initials: 'NS', iconColor: 'bg-blue-500', agrement: 'CIMA-NSIA-2018', statut: 'Actif', rating: 4.8, delaiTraitement: 28, produits: 24, sinistresActifs: 12, contact: 'Seydou Ba', email: 'partenaire@nsia.ml', telephone: '+223 20 22 33 44', datePartenariat: '2018-03-15', branches: ['Auto', 'Santé', 'Habitation', 'Voyage', 'Vie'] },
  { id: '2', nom: 'SUNU Assurances', initials: 'SU', iconColor: 'bg-violet-500', agrement: 'CIMA-SUNU-2019', statut: 'Actif', rating: 4.6, delaiTraitement: 35, produits: 18, sinistresActifs: 8, contact: 'Mariam Cissé', email: 'partenaire@sunu.ml', telephone: '+223 20 22 55 66', datePartenariat: '2019-07-22', branches: ['Auto', 'Santé', 'Habitation'] },
  { id: '3', nom: 'AFG Assurances', initials: 'AF', iconColor: 'bg-emerald-500', agrement: 'CIMA-AFG-2017', statut: 'Actif', rating: 4.5, delaiTraitement: 14, produits: 16, sinistresActifs: 15, contact: 'Oumar Diarra', email: 'partenaire@afg.ml', telephone: '+223 20 22 77 88', datePartenariat: '2017-11-08', branches: ['Santé', 'Vie', 'Habitation'] },
  { id: '4', nom: 'Sanlam Allianz', initials: 'SA', iconColor: 'bg-rose-500', agrement: 'CIMA-SAL-2020', statut: 'Actif', rating: 4.7, delaiTraitement: 22, produits: 14, sinistresActifs: 6, contact: 'Boubacar Sow', email: 'partenaire@sanlam.ml', telephone: '+223 20 22 99 00', datePartenariat: '2020-02-14', branches: ['Auto', 'Voyage', 'Habitation'] },
  { id: '5', nom: 'CNAR', initials: 'CN', iconColor: 'bg-amber-500', agrement: 'CIMA-CNAR-2016', statut: 'Inactif', rating: 4.3, delaiTraitement: 48, produits: 12, sinistresActifs: 4, contact: 'Adama Keïta', email: 'partenaire@cnar.ml', telephone: '+223 20 22 11 22', datePartenariat: '2016-09-30', branches: ['Auto', 'Habitation'] },
  { id: '6', nom: 'SONAVIE', initials: 'SO', iconColor: 'bg-cyan-500', agrement: 'CIMA-SNV-2018', statut: 'Actif', rating: 4.4, delaiTraitement: 32, produits: 8, sinistresActifs: 5, contact: 'Hawa Maïga', email: 'partenaire@sonavie.ml', telephone: '+223 20 22 33 55', datePartenariat: '2018-06-12', branches: ['Vie'] },
  { id: '7', nom: 'Takaful Mali', initials: 'TM', iconColor: 'bg-indigo-500', agrement: 'CIMA-TKF-2021', statut: 'À valider', rating: 0, delaiTraitement: 0, produits: 10, sinistresActifs: 0, contact: 'Moussa Bathily', email: 'partenaire@takaful.ml', telephone: '+223 20 22 77 99', datePartenariat: '2021-05-10', branches: ['Auto', 'Vie', 'Habitation'] },
  { id: '8', nom: 'Assurances Lafia', initials: 'AL', iconColor: 'bg-teal-500', agrement: 'CIMA-LAF-2019', statut: 'Actif', rating: 4.2, delaiTraitement: 40, produits: 11, sinistresActifs: 3, contact: 'Salif Coulibaly', email: 'partenaire@lafia.ml', telephone: '+223 20 22 66 33', datePartenariat: '2019-12-01', branches: ['Santé', 'Habitation'] },
  { id: '9', nom: 'CIF Assurances', initials: 'CI', iconColor: 'bg-orange-500', agrement: 'CIMA-CIF-2017', statut: 'Actif', rating: 4.1, delaiTraitement: 36, produits: 13, sinistresActifs: 7, contact: 'Aïssata Haïdara', email: 'partenaire@cif.ml', telephone: '+223 20 22 44 88', datePartenariat: '2017-08-18', branches: ['Auto', 'Santé'] },
  { id: '10', nom: 'NALLIAS-SA', initials: 'NA', iconColor: 'bg-fuchsia-500', agrement: 'CIMA-NAL-2020', statut: 'Actif', rating: 4.5, delaiTraitement: 26, produits: 9, sinistresActifs: 2, contact: 'Bakary Traoré', email: 'partenaire@nallias.ml', telephone: '+223 20 22 99 11', datePartenariat: '2020-04-03', branches: ['Auto', 'Vie'] },
  { id: '11', nom: 'Sabunyuman', initials: 'SB', iconColor: 'bg-lime-500', agrement: 'CIMA-SAB-2022', statut: 'À valider', rating: 0, delaiTraitement: 0, produits: 7, sinistresActifs: 0, contact: 'Yacouba Diallo', email: 'partenaire@sab.ml', telephone: '+223 20 22 22 33', datePartenariat: '2022-01-20', branches: ['Habitation', 'Voyage'] },
]

export const PAIEMENTS_DATA: Paiement[] = [
  { id: '1', reference: 'PAY-2026-0321', client: 'Ibrahim Coulibaly', clientAvatar: 'IC', contratRef: 'CTR-2026-0142', compagnie: 'NSIA Assurances', montant: 185000, commission: 18500, moyen: 'Orange Money', statut: 'Réussi', date: '15/06/2026', transactionId: 'OM-987654' },
  { id: '2', reference: 'PAY-2026-0320', client: 'Fatoumata Sangaré', clientAvatar: 'FS', contratRef: 'CTR-2026-0138', compagnie: 'SUNU Assurances', montant: 95000, commission: 9500, moyen: 'Wave', statut: 'Réussi', date: '01/06/2026', transactionId: 'WV-123456' },
  { id: '3', reference: 'PAY-2026-0319', client: 'Moussa Koné', clientAvatar: 'MK', contratRef: 'CTR-2026-0125', compagnie: 'AFG Assurances', montant: 240000, commission: 24000, moyen: 'Moov Money', statut: 'Réussi', date: '10/05/2026', transactionId: 'MV-654321' },
  { id: '4', reference: 'PAY-2026-0318', client: 'Aïssata Diallo', clientAvatar: 'AD', contratRef: 'CTR-2026-0098', compagnie: 'SONAVIE', montant: 320000, commission: 32000, moyen: 'Virement', statut: 'En attente', date: '20/04/2026', transactionId: 'VIR-789012' },
  { id: '5', reference: 'PAY-2026-0317', client: 'Aminata Touré', clientAvatar: 'AT', contratRef: 'CTR-2026-0076', compagnie: 'Sanlam Allianz', montant: 45000, commission: 4500, moyen: 'Carte bancaire', statut: 'Réussi', date: '01/07/2026', transactionId: 'CB-456789' },
  { id: '6', reference: 'PAY-2026-0316', client: 'Kadiatou Traoré', clientAvatar: 'KT', contratRef: 'CTR-2026-0064', compagnie: 'NSIA Assurances', montant: 110000, commission: 11000, moyen: 'Wave', statut: 'Échoué', date: '05/03/2026', transactionId: 'WV-987654' },
  { id: '7', reference: 'PAY-2026-0315', client: 'Modibo Sidibé', clientAvatar: 'MS', contratRef: 'CTR-2025-1142', compagnie: 'CNAR', montant: 165000, commission: 16500, moyen: 'Orange Money', statut: 'Remboursé', date: '15/03/2025', transactionId: 'OM-111222' },
]

export const UTILISATEURS_DATA: Utilisateur[] = [
  { id: '1', nom: 'Mohamed Traoré', email: 'admin@aam.ml', role: 'admin', avatar: 'MT', avatarColor: 'bg-purple-100 text-purple-600', telephone: '+223 70 00 00 01', statut: 'Actif', dateCreation: '15/01/2026', derniereConnexion: 'Aujourd\'hui 09:45' },
  { id: '2', nom: 'Aïssata Diallo', email: 'agent@aam.ml', role: 'agent', avatar: 'AD', avatarColor: 'bg-emerald-100 text-emerald-600', telephone: '+223 70 00 00 02', statut: 'Actif', dateCreation: '20/01/2026', derniereConnexion: 'Aujourd\'hui 08:30' },
  { id: '3', nom: 'Ibrahim Coulibaly', email: 'client@aam.ml', role: 'client', avatar: 'IC', avatarColor: 'bg-blue-100 text-blue-600', telephone: '+223 70 00 00 03', statut: 'Actif', dateCreation: '05/02/2026', derniereConnexion: 'Hier 18:22' },
  { id: '4', nom: 'Fatoumata Koné', email: 'sinistres@aam.ml', role: 'gestionnaire', avatar: 'FK', avatarColor: 'bg-amber-100 text-amber-600', telephone: '+223 70 00 00 04', statut: 'Actif', dateCreation: '10/02/2026', derniereConnexion: 'Aujourd\'hui 07:50' },
  { id: '5', nom: 'Seydou Ba', email: 'partenaire@nsia.ml', role: 'correspondant', avatar: 'SB', avatarColor: 'bg-rose-100 text-rose-600', telephone: '+223 70 00 00 05', statut: 'Actif', dateCreation: '01/03/2026', derniereConnexion: 'Aujourd\'hui 06:15', compagnie: 'NSIA Assurances' },
  { id: '6', nom: 'Moussa Koné', email: 'm.kone@aam.ml', role: 'agent', avatar: 'MK', avatarColor: 'bg-emerald-100 text-emerald-600', telephone: '+223 70 00 00 06', statut: 'Actif', dateCreation: '12/03/2026', derniereConnexion: 'Aujourd\'hui 09:12' },
  { id: '7', nom: 'Seydou Camara', email: 's.camara@aam.ml', role: 'agent', avatar: 'SC', avatarColor: 'bg-emerald-100 text-emerald-600', telephone: '+223 70 00 00 07', statut: 'Suspendu', dateCreation: '15/03/2026', derniereConnexion: 'Il y a 7 jours' },
  { id: '8', nom: 'Aminata Touré', email: 'a.toure@aam.ml', role: 'agent', avatar: 'AT', avatarColor: 'bg-emerald-100 text-emerald-600', telephone: '+223 70 00 00 08', statut: 'Invité', dateCreation: '20/03/2026', derniereConnexion: 'Jamais' },
  { id: '9', nom: 'Mariam Cissé', email: 'partenaire@sunu.ml', role: 'correspondant', avatar: 'MC', avatarColor: 'bg-rose-100 text-rose-600', telephone: '+223 70 00 00 09', statut: 'Actif', dateCreation: '05/04/2026', derniereConnexion: 'Hier 14:00', compagnie: 'SUNU Assurances' },
]

// Formatting helpers
export const formatFCFA = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
