'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Car,
  HeartPulse,
  Home,
  Plane,
  Shield,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  PartyPopper,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DevisWizardModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onComplete?: (data: WizardData) => void
}

export type Branch = 'Auto' | 'Santé' | 'Habitation' | 'Voyage' | 'Vie'

export interface WizardData {
  branche: Branch | null
  caracteristiques: Record<string, string>
  garanties: string[]
  duree: string
  dateDebut: string
}

const BRANCHES: { id: Branch; label: string; icon: typeof Car; desc: string; color: string }[] = [
  { id: 'Auto', label: 'Assurance Auto', icon: Car, desc: 'Voiture, moto, véhicule utilitaire', color: 'bg-blue-500' },
  { id: 'Santé', label: 'Assurance Santé', icon: HeartPulse, desc: 'Frais médicaux, hospitalisation', color: 'bg-emerald-500' },
  { id: 'Habitation', label: 'Assurance Habitation', icon: Home, desc: 'Maison, appartement, locaux', color: 'bg-amber-500' },
  { id: 'Voyage', label: 'Assurance Voyage', icon: Plane, desc: 'Voyage international, court/séjour', color: 'bg-violet-500' },
  { id: 'Vie', label: 'Assurance Vie', icon: Shield, desc: 'Décès, épargne, retraite', color: 'bg-rose-500' },
]

const CARACS_BY_BRANCH: Record<Branch, { id: string; label: string; type: 'text' | 'select'; options?: string[]; required?: boolean }[]> = {
  Auto: [
    { id: 'typeVehicule', label: 'Type de véhicule', type: 'select', options: ['Berline', 'SUV', 'Utilitaire', 'Moto', 'Camion'], required: true },
    { id: 'puissance', label: 'Puissance fiscale (CV)', type: 'select', options: ['4 CV', '5 CV', '6 CV', '7 CV', '8 CV', '10 CV', '12 CV et +'], required: true },
    { id: 'energie', label: 'Énergie', type: 'select', options: ['Essence', 'Diesel', 'Hybride', 'Électrique'], required: true },
    { id: 'usage', label: 'Usage', type: 'select', options: ['Personnel', 'Professionnel', 'Transport de marchandises'], required: true },
    { id: 'ville', label: 'Ville', type: 'select', options: ['Bamako', 'Sikasso', 'Ségou', 'Kayes', 'Mopti', 'Tombouctou', 'Gao'], required: true },
  ],
  Santé: [
    { id: 'age', label: 'Âge de l\'assuré', type: 'select', options: ['18-30 ans', '31-45 ans', '46-60 ans', '60+ ans'], required: true },
    { id: 'statut', label: 'Statut', type: 'select', options: ['Individuel', 'Famille', 'Salarié entreprise', 'Retraité'], required: true },
    { id: 'nbBeneficiaires', label: 'Nombre de bénéficiaires', type: 'select', options: ['1', '2', '3', '4', '5+'], required: true },
  ],
  Habitation: [
    { id: 'typeLogement', label: 'Type de logement', type: 'select', options: ['Villa', 'Appartement', 'Studio', 'Maison traditionnelle', 'Local commercial'], required: true },
    { id: 'surface', label: 'Surface estimée', type: 'select', options: ['< 50 m²', '50-100 m²', '100-200 m²', '> 200 m²'], required: true },
    { id: 'valeurBien', label: 'Valeur du bien', type: 'select', options: ['< 5 M FCFA', '5-15 M FCFA', '15-30 M FCFA', '> 30 M FCFA'], required: true },
    { id: 'ville', label: 'Ville', type: 'select', options: ['Bamako', 'Sikasso', 'Ségou', 'Kayes', 'Mopti'], required: true },
  ],
  Voyage: [
    { id: 'destination', label: 'Destination', type: 'select', options: ['Afrique de l\'Ouest', 'Europe', 'Asie', 'Amériques', 'Monde entier'], required: true },
    { id: 'dureeSejour', label: 'Durée du séjour', type: 'select', options: ['1-7 jours', '8-30 jours', '1-3 mois', '3-12 mois'], required: true },
    { id: 'motif', label: 'Motif', type: 'select', options: ['Tourisme', 'Affaires', 'Études', 'Familial'], required: true },
  ],
  Vie: [
    { id: 'ageSouscripteur', label: 'Âge du souscripteur', type: 'select', options: ['18-30 ans', '31-45 ans', '46-55 ans', '56-65 ans'], required: true },
    { id: 'capitalSouhaite', label: 'Capital souhaité', type: 'select', options: ['1 M FCFA', '5 M FCFA', '10 M FCFA', '20 M FCFA', '50 M FCFA et +'], required: true },
    { id: 'dureeContrat', label: 'Durée du contrat', type: 'select', options: ['5 ans', '10 ans', '15 ans', '20 ans', 'À vie'], required: true },
  ],
}

const GARANTIES_BY_BRANCH: Record<Branch, { id: string; label: string; obligatoire?: boolean; dependDe?: string }[]> = {
  Auto: [
    { id: 'rc', label: 'Responsabilité civile', obligatoire: true },
    { id: 'vol', label: 'Vol & Incendie' },
    { id: 'brisGlace', label: 'Bris de glace', dependDe: 'vol' },
    { id: 'dommages', label: 'Dommages tous accidents', dependDe: 'vol' },
    { id: 'defense', label: 'Défense & recours' },
  ],
  Santé: [
    { id: 'fraisMedicaux', label: 'Frais médicaux', obligatoire: true },
    { id: 'hospitalisation', label: 'Hospitalisation' },
    { id: 'optique', label: 'Optique' },
    { id: 'dentaire', label: 'Dentaire' },
    { id: 'maternite', label: 'Maternité' },
  ],
  Habitation: [
    { id: 'incendie', label: 'Incendie', obligatoire: true },
    { id: 'degatEaux', label: 'Dégât des eaux' },
    { id: 'vol', label: 'Vol' },
    { id: 'responsabilite', label: 'Responsabilité civile' },
    { id: 'catastrophes', label: 'Catastrophes naturelles' },
  ],
  Voyage: [
    { id: 'fraisMedicaux', label: 'Frais médicaux', obligatoire: true },
    { id: 'annulation', label: 'Annulation' },
    { id: 'bagages', label: 'Bagages' },
    { id: 'assistance', label: 'Assistance 24/7' },
  ],
  Vie: [
    { id: 'deces', label: 'Garantie décès', obligatoire: true },
    { id: 'invalidite', label: 'Invalidité' },
    { id: 'epargne', label: 'Épargne' },
    { id: 'retraite', label: 'Complément retraite' },
  ],
}

const DUREES = ['12 mois', '6 mois', '3 mois']

const STEPS = ['Type d\'assurance', 'Caractéristiques', 'Choix des garanties', 'Durée du contrat']

export function DevisWizardModal({ open, onOpenChange, onComplete }: DevisWizardModalProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>({
    branche: null,
    caracteristiques: {},
    garanties: [],
    duree: '12 mois',
    dateDebut: new Date().toISOString().split('T')[0],
  })
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const reset = () => {
    setStep(0)
    setData({
      branche: null,
      caracteristiques: {},
      garanties: [],
      duree: '12 mois',
      dateDebut: new Date().toISOString().split('T')[0],
    })
    setCompleted(false)
    setSubmitting(false)
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      // Reset on close
      setTimeout(reset, 200)
    }
    onOpenChange(v)
  }

  const selectBranche = (b: Branch) => {
    setData((d) => ({ ...d, branche: b, caracteristiques: {}, garanties: [] }))
    // Add default obligatoire garanties
    const oblig = GARANTIES_BY_BRANCH[b].filter((g) => g.obligatoire).map((g) => g.id)
    setData((d) => ({ ...d, garanties: oblig }))
  }

  const setCarac = (id: string, value: string) => {
    setData((d) => ({ ...d, caracteristiques: { ...d.caracteristiques, [id]: value } }))
  }

  const toggleGarantie = (id: string, obligatoire?: boolean, dependDe?: string) => {
    if (obligatoire) return
    setData((d) => {
      const has = d.garanties.includes(id)
      let next = has
        ? d.garanties.filter((g) => g !== id)
        : [...d.garanties, id]
      // If selecting a garanty that is a dependency, also add it
      if (!has && dependDe && !next.includes(dependDe)) {
        next = [...next, dependDe]
      }
      // If removing a garanty, also remove dependents
      if (has) {
        const branch = d.branche as Branch
        const dependents = GARANTIES_BY_BRANCH[branch]
          .filter((g) => g.dependDe === id)
          .map((g) => g.id)
        next = next.filter((g) => !dependents.includes(g))
      }
      return { ...d, garanties: next }
    })
  }

  const canNext = () => {
    if (step === 0) return data.branche !== null
    if (step === 1) {
      if (!data.branche) return false
      const caracs = CARACS_BY_BRANCH[data.branche]
      return caracs.every((c) => c.required ? data.caracteristiques[c.id] : true)
    }
    if (step === 2) return data.garanties.length > 0
    if (step === 3) return !!data.duree && !!data.dateDebut
    return false
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setCompleted(true)
      onComplete?.(data)
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-slate-50 p-0 dark:bg-slate-900 dark:text-slate-100 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            {completed ? 'Devis créé avec succès' : 'Nouveau devis — Comparateur'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            {completed
              ? 'Votre demande de devis a été transmise aux compagnies partenaires.'
              : 'Parcours guidé en 4 étapes — Comparez les offres en 30 secondes'}
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-8 w-8 text-emerald-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Devis transmis !</h3>
              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                Votre demande a été envoyée à 11 compagnies partenaires agréées CIMA. Vous recevrez les offres par email sous 5 minutes.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Récapitulatif :</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <li>• Branche : <span className="font-semibold dark:text-slate-100">{data.branche}</span></li>
                <li>• Garanties : <span className="font-semibold dark:text-slate-100">{data.garanties.length} sélectionnée(s)</span></li>
                <li>• Durée : <span className="font-semibold dark:text-slate-100">{data.duree}</span></li>
                <li>• Date d&apos;effet : <span className="font-semibold">{data.dateDebut}</span></li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleClose(false)
                }}
              >
                Fermer
              </Button>
              <Button
                size="sm"
                onClick={() => reset()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Nouveau devis
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Progress steps */}
            <div className="border-b border-slate-100 px-6 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex flex-1 items-center">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition',
                        i < step
                          ? 'bg-emerald-500 text-white'
                          : i === step
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <div className="ml-2 hidden flex-1 sm:block">
                      <p className={cn(
                        'text-xs font-medium',
                        i <= step ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                      )}>
                        {label}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        'mx-2 h-0.5 flex-1',
                        i < step ? 'bg-emerald-500' : 'bg-slate-200'
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-5 text-slate-800 dark:text-slate-200">
              {step === 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BRANCHES.map((b) => {
                    const Icon = b.icon
                    const isActive = data.branche === b.id
                    return (
                      <button
                        key={b.id}
                        onClick={() => selectBranche(b.id)}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                          isActive
                            ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100 dark:border-blue-700 dark:bg-blue-900/40 dark:ring-blue-900/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800'
                        )}
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white', b.color)}>
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            'text-sm font-semibold',
                            isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'
                          )}>
                            {b.label}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{b.desc}</p>
                        </div>
                        {isActive && (
                          <Check className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {step === 1 && data.branche && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Renseignez les caractéristiques pour votre assurance {data.branche.toLowerCase()} :
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {CARACS_BY_BRANCH[data.branche].map((c) => (
                      <div key={c.id} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {c.label} {c.required && <span className="text-rose-500">*</span>}
                        </label>
                        {c.type === 'select' ? (
                          <select
                            value={data.caracteristiques[c.id] || ''}
                            onChange={(e) => setCarac(c.id, e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                          >
                            <option value="">Sélectionner...</option>
                            {c.options?.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={data.caracteristiques[c.id] || ''}
                            onChange={(e) => setCarac(c.id, e.target.value)}
                            placeholder="Saisir..."
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && data.branche && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sélectionnez les garanties souhaitées pour votre assurance {data.branche.toLowerCase()} :
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {GARANTIES_BY_BRANCH[data.branche].map((g) => {
                      const checked = data.garanties.includes(g.id)
                      return (
                        <label
                          key={g.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all',
                            checked
                              ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/40'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800',
                            g.obligatoire && 'cursor-not-allowed opacity-90'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={g.obligatoire}
                            onChange={() => toggleGarantie(g.id, g.obligatoire, g.dependDe)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{g.label}</p>
                            {g.obligatoire && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">Obligatoire · précochée</p>
                            )}
                            {g.dependDe && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                Inclus &laquo; {GARANTIES_BY_BRANCH[data.branche].find((x) => x.id === g.dependDe)?.label} &raquo;
                              </p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choisissez la durée et la date d&apos;effet de votre contrat :
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DUREES.map((d) => (
                      <button
                        key={d}
                        onClick={() => setData((s) => ({ ...s, duree: d }))}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                          data.duree === d
                            ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100 dark:border-blue-700 dark:bg-blue-900/40 dark:ring-blue-900/40'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                        )}
                      >
                        <div className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full',
                          data.duree === d ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                        )}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={cn(
                            'text-sm font-semibold',
                            data.duree === d ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'
                          )}>
                            {d}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {d === '12 mois' && 'Tarif annuel · meilleur rapport'}
                            {d === '6 mois' && 'Souscription semestrielle'}
                            {d === '3 mois' && 'Idéal pour usage temporaire'}
                          </p>
                        </div>
                      </button>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                        Date d&apos;effet du contrat <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={data.dateDebut}
                        onChange={(e) => setData((s) => ({ ...s, dateDebut: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40 sm:max-w-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Précédent
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  size="sm"
                  disabled={!canNext()}
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Suivant
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!canNext() || submitting}
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Comparer les offres'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
