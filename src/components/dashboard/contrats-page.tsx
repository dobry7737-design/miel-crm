'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Eye,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatutBadge } from '@/components/dashboard/statut-badge'
import { BranchBadge } from '@/components/dashboard/avatar'
import { Pagination } from '@/components/dashboard/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CONTRATS_DATA, formatFCFA, type Contrat } from '@/lib/data'
import { usePagination } from '@/lib/use-pagination'

const STAT_CARDS = [
  { label: 'Contrats actifs', value: '856', icon: ShieldCheck, trend: '+8%', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
  { label: "Souscrits ce mois", value: '127', icon: TrendingUp, trend: '+18%', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
  { label: 'En attente', value: '23', icon: AlertCircle, trend: '-3%', trendUp: false, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
  { label: 'Renouvellements (30j)', value: '48', icon: CalendarClock, trend: '+5%', trendUp: true, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/40' },
]

export function ContratsPage() {
  const [search, setSearch] = useState('')
  const [viewContrat, setViewContrat] = useState<Contrat | null>(null)

  const filtered = useMemo(() => {
    if (!search) return CONTRATS_DATA
    const q = search.toLowerCase()
    return CONTRATS_DATA.filter(
      (c) =>
        c.reference.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.compagnie.toLowerCase().includes(q) ||
        c.branche.toLowerCase().includes(q)
    )
  }, [search])

  const { page, pageSize, total, paged, setPage, setPageSize } =
    usePagination(filtered, 5, [search])

  return (
    <div>
      <PageHeader
        title="Gestion des Contrats"
        subtitle="Contrats souscrits, renouvellements et attestations"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un contrat, un client..."
        secondaryActionLabel="Exporter"
        onSecondaryAction={() => {}}
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Liste des contrats</h3>
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
                <th className="px-5 py-3 text-left font-medium">Produit</th>
                <th className="px-5 py-3 text-right font-medium">Prime (FCFA)</th>
                <th className="px-5 py-3 text-left font-medium">Statut</th>
                <th className="px-5 py-3 text-left font-medium">Échéance</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    Aucun contrat trouvé
                  </td>
                </tr>
              ) : (
                paged.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-blue-600">{c.reference}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
                          {c.clientAvatar}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200">{c.client}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><BranchBadge branch={c.branche} /></td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{c.compagnie}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{c.produit}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">{formatFCFA(c.prime)}</td>
                    <td className="px-5 py-3"><StatutBadge statut={c.statut} /></td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{c.prochainRenouvellement}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setViewContrat(c)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        aria-label="Voir le contrat"
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

      <Dialog open={!!viewContrat} onOpenChange={(v) => !v && setViewContrat(null)}>
        <DialogContent className="max-w-xl bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Contrat {viewContrat?.reference}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {viewContrat?.produit} · {viewContrat?.compagnie}
            </DialogDescription>
          </DialogHeader>

          {viewContrat && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Client" value={viewContrat.client} />
                <InfoField label="Branche" value={viewContrat.branche} />
                <InfoField label="Compagnie" value={viewContrat.compagnie} />
                <InfoField label="Agent" value={viewContrat.agent} />
                <InfoField label="Date de début" value={viewContrat.dateDebut} />
                <InfoField label="Date de fin" value={viewContrat.dateFin} />
                <InfoField label="Prochain renouvellement" value={viewContrat.prochainRenouvellement} />
                <InfoField label="Mode de paiement" value={viewContrat.modePaiement} />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Garanties incluses</p>
                <div className="flex flex-wrap gap-2">
                  {viewContrat.garanties.map((g) => (
                    <span key={g} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Prime annuelle</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatFCFA(viewContrat.prime)}</p>
                </div>
                <StatutBadge statut={viewContrat.statut} />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" size="sm">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Attestation PDF
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Renouveler</Button>
              </div>
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
