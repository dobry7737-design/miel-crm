'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Eye,
  LifeBuoy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  PartyPopper,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatutBadge } from '@/components/dashboard/statut-badge'
import { BranchBadge } from '@/components/dashboard/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUI } from '@/lib/ui-store'
import { useNav } from '@/lib/nav'
import { toast } from 'sonner'
import { Pagination } from '@/components/dashboard/pagination'
import { usePagination } from '@/lib/use-pagination'
import { api, formatFCFA, type SinistreDTO } from '@/lib/api'

const STAT_CARDS = [
  { label: 'Sinistres en cours', value: '47', icon: LifeBuoy, trend: '+5', trendUp: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
  { label: 'Traités (7j)', value: '18', icon: CheckCircle2, trend: '+12%', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
  { label: 'En alerte (>72h)', value: '3', icon: AlertTriangle, trend: '-2', trendUp: false, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/40' },
  { label: 'Délai moyen', value: '38h', icon: Clock, trend: '-22%', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
]

const BRANCHES: Branch[] = ['Auto', 'Santé', 'Habitation', 'Voyage', 'Vie']

export function SinistresPage() {
  const { setPrimaryAction, openPrimaryAction } = useUI()
  const { pendingAction, clearPendingAction } = useNav()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [brancheFilter, setBrancheFilter] = useState('')
  const [viewSinistre, setViewSinistre] = useState<SinistreDTO | null>(null)
  const [declareOpen, setDeclareOpen] = useState(false)

  useEffect(() => {
    setPrimaryAction(() => setDeclareOpen(true))
    return () => setPrimaryAction(null)
  }, [setPrimaryAction])

  useEffect(() => {
    if (pendingAction) {
      openPrimaryAction()
      clearPendingAction()
    }
  }, [pendingAction, clearPendingAction, openPrimaryAction])

  const { data: resp, isLoading } = useQuery({
    queryKey: ['sinistres', { statut: statusFilter, branche: brancheFilter, search }],
    queryFn: () => api.getSinistres({ statut: statusFilter || undefined, branche: brancheFilter || undefined, search: search || undefined }),
  })
  const filtered = resp?.data || []

  const { page, pageSize, total, paged, setPage, setPageSize } =
    usePagination(filtered, 5, [search, statusFilter, brancheFilter])

  const filters = [
    {
      title: 'Statut',
      selected: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Tous', value: '' },
        { label: 'Déclaré', value: 'Déclaré' },
        { label: 'En instruction', value: 'En instruction' },
        { label: 'Traité', value: 'Traité' },
        { label: 'Validé', value: 'Validé' },
        { label: 'Rejeté', value: 'Rejeté' },
      ],
    },
    {
      title: 'Branche',
      selected: brancheFilter,
      onChange: setBrancheFilter,
      options: [
        { label: 'Toutes', value: '' },
        { label: 'Auto', value: 'Auto' },
        { label: 'Santé', value: 'Santé' },
        { label: 'Habitation', value: 'Habitation' },
        { label: 'Voyage', value: 'Voyage' },
        { label: 'Vie', value: 'Vie' },
      ],
    },
  ]

  return (
    <div>
      <PageHeader
        title="Gestion des Sinistres"
        subtitle="Déclarations, instruction et traitement — Engagement 72h"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un sinistre, un client..."
        primaryActionLabel="Déclarer un sinistre"
        onPrimaryAction={() => setDeclareOpen(true)}
        filters={filters}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{s.value}</span>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {s.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">File de sinistres</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">{total} résultat(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Référence</th>
                <th className="px-5 py-3 text-left font-medium">Client</th>
                <th className="px-5 py-3 text-left font-medium">Branche</th>
                <th className="px-5 py-3 text-left font-medium">Compagnie</th>
                <th className="px-5 py-3 text-left font-medium">Contrat</th>
                <th className="px-5 py-3 text-left font-medium">Description</th>
                <th className="px-5 py-3 text-right font-medium">Demande (FCFA)</th>
                <th className="px-5 py-3 text-left font-medium">Délai</th>
                <th className="px-5 py-3 text-left font-medium">Statut</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-400">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    Aucun sinistre trouvé
                  </td>
                </tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-blue-600">{s.reference}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                          {s.clientNameAvatar}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200">{s.clientNameName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><BranchBadge branch={s.branche} /></td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{s.companyName}</td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{s.contratRef}</span>
                    </td>
                    <td className="px-5 py-3 max-w-[200px] truncate text-slate-600 dark:text-slate-300" title={s.description}>
                      {s.description}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">{formatFCFA(s.montantDemande)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${s.delaiH > 72 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {s.delaiH}h
                      </span>
                    </td>
                    <td className="px-5 py-3"><StatutBadge statut={s.statut} /></td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setViewSinistre(s)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        aria-label="Voir le sinistre"
                      >
                        <Eye className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* View Modal */}
      <Dialog open={!!viewSinistre} onOpenChange={(v) => !v && setViewSinistre(null)}>
        <DialogContent className="max-w-xl bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <LifeBuoy className="h-4 w-4 text-rose-600" />
              Sinistre {viewSinistre?.reference}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Déclaré le {viewSinistre?.dateDeclaration} · Gestionnaire : {viewSinistre?.gestionnaire}
            </DialogDescription>
          </DialogHeader>

          {viewSinistre && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Client" value={viewSinistre.clientName} />
                <InfoField label="Branche" value={viewSinistre.branche} />
                <InfoField label="Compagnie" value={viewSinistre.companyName} />
                <InfoField label="Contrat" value={viewSinistre.contratRef} />
                <InfoField label="Date déclaration" value={viewSinistre.dateDeclaration} />
                <InfoField
                  label="Date traitement"
                  value={viewSinistre.dateTraitement || 'En cours...'}
                />
                <InfoField label="Délai" value={`${viewSinistre.delaiH}h`} />
                <InfoField label="Statut" value={viewSinistre.statut} />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Description
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewSinistre.description}</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Pièces jointes ({viewSinistre.pieces.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {viewSinistre.pieces.map((p) => (
                    <span key={p} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <Upload className="h-3 w-3 text-slate-400" />
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Montant demandé</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatFCFA(viewSinistre.montantDemande)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Montant remboursé</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {viewSinistre.montantRembourse ? formatFCFA(viewSinistre.montantRembourse) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setViewSinistre(null)}>
                  Fermer
                </Button>
                {viewSinistre.statut === 'En instruction' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      toast.success('Remboursement validé', {
                        description: `Sinistre ${viewSinistre.reference} — remboursement de ${formatFCFA(viewSinistre.montantDemande)} validé.`,
                      })
                      setViewSinistre(null)
                    }}
                  >
                    Valider le remboursement
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Declare Sinistre Modal */}
      <DeclareSinistreModal open={declareOpen} onOpenChange={setDeclareOpen} />
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  )
}

function DeclareSinistreModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [form, setForm] = useState({
    contratRef: '',
    branche: '' as Branch | '',
    description: '',
    montantDemande: '',
  })
  const [pieces, setPieces] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const reset = () => {
    setForm({ contratRef: '', branche: '', description: '', montantDemande: '' })
    setPieces([])
    setSubmitting(false)
    setCompleted(false)
  }

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(reset, 200)
    onOpenChange(v)
  }

  const canSubmit = form.contratRef && form.branche && form.description && form.montantDemande

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setCompleted(true)
      toast.success('Sinistre déclaré avec succès', {
        description: `Référence SIN-2026-0099 · Engagement de traitement sous 72h.`,
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <LifeBuoy className="h-4 w-4 text-rose-600" />
            {completed ? 'Sinistre déclaré avec succès' : 'Déclarer un sinistre'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {completed
              ? 'Votre déclaration a été enregistrée et transmise au gestionnaire.'
              : 'Renseignez les informations ci-dessous · Engagement de traitement sous 72h'}
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-7 w-7 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Déclaration transmise !</h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Votre sinistre a été enregistré sous la référence <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">SIN-2026-0099</span>. Le gestionnaire vous contactera sous 72h.
            </p>
            <Button size="sm" onClick={() => handleClose(false)} className="mt-2 bg-blue-600 hover:bg-blue-700">
              Fermer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Référence du contrat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contratRef}
                  onChange={(e) => setForm((f) => ({ ...f, contratRef: e.target.value }))}
                  placeholder="ex: CTR-2026-0142"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Branche <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.branche}
                  onChange={(e) => setForm((f) => ({ ...f, branche: e.target.value as Branch }))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                >
                  <option value="">Sélectionner...</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Description de l&apos;événement <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Décrivez l'événement avec le maximum de détails..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Montant estimé du préjudice (FCFA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={form.montantDemande}
                onChange={(e) => setForm((f) => ({ ...f, montantDemande: e.target.value }))}
                placeholder="ex: 850000"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Pièces justificatives (photos, factures, PV...)
              </label>
              <div className="flex flex-wrap gap-2">
                {pieces.map((p, i) => (
                  <span key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Upload className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    {p}
                    <button
                      onClick={() => setPieces((arr) => arr.filter((_, idx) => idx !== i))}
                      className="ml-1 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setPieces((arr) => [...arr, `piece_${arr.length + 1}.pdf`])}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-600 dark:hover:text-blue-400"
                >
                  <Upload className="h-3 w-3" />
                  Ajouter
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock className="mr-1.5 inline h-3.5 w-3.5" />
              Engagement de traitement : <span className="font-semibold">72h maximum</span> après réception des pièces complètes.
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  'Déclarer le sinistre'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
