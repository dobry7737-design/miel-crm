'use client'

import { useState } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Smartphone,
  CreditCard,
  Banknote,
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
import { toast } from 'sonner'

const STAT_CARDS = [
  { label: 'Volume total (30j)', value: '142,5 M', unit: 'FCFA', icon: Wallet, trend: '+18%', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
  { label: 'Réussis', value: '1 248', icon: CheckCircle2, trend: '+8%', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
  { label: 'En attente', value: '23', icon: AlertCircle, trend: '-3', trendUp: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
  { label: 'Échoués', value: '7', icon: TrendingDown, trend: '-5', trendUp: true, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/40' },
]

const MOYEN_ICON: Record<Paiement['moyen'], { icon: typeof Smartphone; color: string }> = {
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

  const { data: resp, isLoading } = useQuery({
    queryKey: ['paiements', { statut: statusFilter, moyen: moyenFilter, search }],
    queryFn: () => api.getPaiements({ statut: statusFilter || undefined, moyen: moyenFilter || undefined, search: search || undefined }),
  })
  const filtered = resp?.data || []

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
        secondaryActionLabel="Exporter"
        onSecondaryAction={() => {}}
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
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                  {s.value}
                  {s.unit && <span className="ml-1 text-xs text-slate-400">{s.unit}</span>}
                </span>
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
                            {p.clientNameAvatar}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200">{p.clientNameName}</span>
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
                  onClick={() =>
                    toast.success('Reçu PDF généré', {
                      description: `Reçu de ${view.reference} téléchargé.`,
                    })
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Reçu PDF
                </Button>
                {view.statut === 'En attente' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      toast.success('Paiement marqué comme reçu', {
                        description: `Paiement ${view.reference} réconcilié manuellement.`,
                      })
                      setView(null)
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
