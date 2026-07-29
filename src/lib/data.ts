// Types UI historiques — les données seed ont été retirées (API dynamique).
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
  delaiTraitement: number
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
