'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Eye,
  Smartphone,
  CreditCard,
  Banknote,
  TrendingDown,
  Download,
  Plus,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatutBadge } from '@/components/dashboard/statut-badge'
import { Pagination } from '@/components/dashboard/pagination'
import { usePagination } from '@/lib/use-pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { api, formatFCFA, type PaiementDTO } from '@/lib/api'
import { useStats, useInvalidateDashboard } from '@/lib/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'

const MOYEN_ICON: Record<string, { icon: typeof Smartphone; color: string }> = {
  'Orange Money': { icon: Smartphone, color: 'text-orange-500' },
  'Wave': { icon: Smartphone, color: 'text-blue-500' },
  'Moov Money': { icon: Smartphone, color: 'text-emerald-500' },
  'Carte bancaire': { icon: CreditCard, color: 'text-violet-500' },
  'Virement': { icon: Banknote, color: 'text-slate-500' },
}

export function PaiementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [moyenFilter, setMoyenFilter] = useState('')
  const [view, setView] = useState<PaiementDTO | null>(null)
  const [busy, setBusy] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data: stats } = useStats()
  const { user } = useAuth()
  const canCreate = user?.role === 'admin' || user?.role === 'agent'

  const { data: resp, isLoading } = useQuery({
    queryKey: ['paiements', { statut: statusFilter, moyen: moyenFilter, search }],
    queryFn: () => api.getPaiements({ statut: statusFilter || undefined, moyen: moyenFilter || undefined, search: search || undefined }),
  })
  const filtered = resp?.data || []
  const byStatut = stats?.breakdowns?.paiementsByStatut || []
  const countStatut = (s: string) => byStatut.find((x) => x.statut === s)?._count ?? filtered.filter((p) => p.statut === s).length
  const volume =
    stats?.financials?.totalPayments ??
    filtered.filter((p) => p.statut === 'Réussi').reduce((a, p) => a + p.montant, 0)

  const statCards = [
    { label: 'Volume réussi', value: `${(volume / 1000000).toFixed(1)} M`, unit: 'FCFA', icon: Wallet, hint: 'cumul', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
    { label: 'Réussis', value: String(countStatut('Réussi')), icon: CheckCircle2, hint: 'transactions', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
    { label: 'En attente', value: String(countStatut('En attente')), icon: AlertCircle, hint: 'à encaisser', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
    { label: 'Échoués', value: String(countStatut('Échoué')), icon: TrendingDown, hint: 'à relancer', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/40' },
  ]

  const { page, pageSize, total, paged, setPage, setPageSize } =
    usePagination(filtered, 5, [search, statusFilter, moyenFilter])

  const filters = [
    {
      title: 'Statut',
      selected: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Tous', value: '' },
        { label: 'Réussi', value: 'Réussi' },
        { label: 'En attente', value: 'En attente' },
        { label: 'Échoué', value: 'Échoué' },
        { label: 'Remboursé', value: 'Remboursé' },
      ],
    },
    {
      title: 'Moyen de paiement',
      selected: moyenFilter,
      onChange: setMoyenFilter,
      options: [
        { label: 'Tous', value: '' },
        { label: 'Orange Money', value: 'Orange Money' },
        { label: 'Wave', value: 'Wave' },
        { label: 'Moov Money', value: 'Moov Money' },
        { label: 'Carte bancaire', value: 'Carte bancaire' },
        { label: 'Virement', value: 'Virement' },
      ],
    },
  ]

  return (
    <div>
      <PageHeader
        title="Gestion des Paiements"
        subtitle="Suivi des paiements, commissions et réconciliation Mobile Money"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un paiement, une transaction..."
        primaryActionLabel={canCreate ? 'Enregistrer un paiement' : undefined}
        onPrimaryAction={canCreate ? () => setCreateOpen(true) : undefined}
        secondaryActionLabel="Exporter"
        onSecondaryAction={() =>
          toast.info('Export indisponible', {
            description: "L'export Excel des paiements n'est pas encore activé.",
          })
        }
        filters={filters}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => {
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
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                  {s.value}
                  {s.unit && <span className="ml-1 text-xs text-slate-400">{s.unit}</span>}
                </span>
                <span className="text-xs text-slate-400">{s.hint}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Transactions</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">{total} résultat(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Référence</th>
                <th className="px-5 py-3 text-left font-medium">Client</th>
                <th className="px-5 py-3 text-left font-medium">Contrat</th>
                <th className="px-5 py-3 text-left font-medium">Compagnie</th>
                <th className="px-5 py-3 text-left font-medium">Moyen</th>
                <th className="px-5 py-3 text-right font-medium">Montant (FCFA)</th>
                <th className="px-5 py-3 text-right font-medium">Commission (FCFA)</th>
                <th className="px-5 py-3 text-left font-medium">Statut</th>
                <th className="px-5 py-3 text-left font-medium">Date</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-400">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                paged.map((p) => {
                  const moyenInfo = MOYEN_ICON[p.moyen]
                  const MoyenIcon = moyenInfo.icon
                  return (
                    <tr key={p.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-semibold text-blue-600">{p.reference}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">
                            {p.clientAvatar || p.clientName?.slice(0, 2)?.toUpperCase() || '??'}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200">{p.clientName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{p.contratRef}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{p.companyName}</td>
                      <td className="px-5 py-3">
                        <div className={`flex items-center gap-1.5 ${moyenInfo.color}`}>
                          <MoyenIcon className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">{p.moyen}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">{formatFCFA(p.montant)}</td>
                      <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{formatFCFA(p.commission)}</td>
                      <td className="px-5 py-3"><StatutBadge statut={p.statut} /></td>
                      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{p.date}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setView(p)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                          aria-label="Voir le paiement"
                        >
                          <Eye className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  )
                })
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

      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent className="max-w-lg bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-blue-600" />
              Paiement {view?.reference}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transaction ID : {view?.transactionId} · {view?.date}
            </DialogDescription>
          </DialogHeader>

          {view && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Client" value={view.clientName} />
                <InfoField label="Contrat" value={view.contratRef} />
                <InfoField label="Compagnie" value={view.companyName} />
                <InfoField label="Moyen de paiement" value={view.moyen} />
                <InfoField label="Date" value={view.date} />
                <InfoField label="Statut" value={view.statut} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Montant payé</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatFCFA(view.montant)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Commission courtage</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatFCFA(view.commission)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Transaction ID
                </p>
                <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{view.transactionId}</p>
              </div>

              <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setView(null)}>
                  Fermer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Génération PDF non disponible"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Reçu PDF
                </Button>
                {view.statut === 'En attente' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      try {
                        await api.updatePaiement(view.id, { statut: 'Réussi' })
                        await queryClient.invalidateQueries({ queryKey: ['paiements'] })
                        await queryClient.invalidateQueries({ queryKey: ['stats'] })
                        toast.success('Paiement marqué comme reçu', {
                          description: `Paiement ${view.reference} réconcilié manuellement.`,
                        })
                        setView(null)
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Erreur lors de la mise à jour')
                      } finally {
                        setBusy(false)
                      }
                    }}
                  >
                    Marquer comme reçu
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreatePaiementModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}

function CreatePaiementModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const invalidate = useInvalidateDashboard()
  const [contratRef, setContratRef] = useState('')
  const [moyen, setMoyen] = useState('Orange Money')
  const [montant, setMontant] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data: contratsResp } = useQuery({
    queryKey: ['contrats', 'paiement-create'],
    queryFn: () => api.getContrats(),
    enabled: open,
  })
  const contrats = (contratsResp?.data || []).filter((c) => c.statut === 'Actif')

  const selected = contrats.find((c) => c.reference === contratRef)

  const reset = () => {
    setContratRef('')
    setMoyen('Orange Money')
    setMontant('')
    setSubmitting(false)
  }

  const handleClose = (v: boolean) => {
    if (!v) setTimeout(reset, 200)
    onOpenChange(v)
  }

  const handleSubmit = async () => {
    if (!selected) {
      toast.error('Sélectionnez un contrat')
      return
    }
    const amount = Number(montant) || selected.prime
    if (!amount || amount <= 0) {
      toast.error('Montant invalide')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.createPaiement({
        clientId: selected.clientId,
        clientName: selected.clientName,
        clientAvatar: selected.clientAvatar,
        contratRef: selected.reference,
        compagnieId: selected.compagnieId,
        companyName: selected.companyName,
        montant: amount,
        commission: Math.round(amount * 0.1),
        moyen,
        statut: 'En attente',
        date: new Date().toLocaleDateString('fr-FR'),
      })
      invalidate()
      toast.success('Paiement enregistré', {
        description: `${res.data.reference} · ${formatFCFA(amount)}`,
      })
      handleClose(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-blue-600" />
            Enregistrer un paiement
          </DialogTitle>
          <DialogDescription className="text-xs">
            Liez un paiement à un contrat actif en base Prisma.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Contrat <span className="text-rose-500">*</span>
            </label>
            <select
              value={contratRef}
              onChange={(e) => {
                setContratRef(e.target.value)
                const c = contrats.find((x) => x.reference === e.target.value)
                if (c) setMontant(String(c.prime))
              }}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Sélectionner…</option>
              {contrats.map((c) => (
                <option key={c.id} value={c.reference}>
                  {c.reference} · {c.clientName} · {formatFCFA(c.prime)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Montant (FCFA)
            </label>
            <input
              type="number"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Moyen
            </label>
            <select
              value={moyen}
              onChange={(e) => setMoyen(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {Object.keys(MOYEN_ICON).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            disabled={!contratRef || submitting}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
