'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Eye,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatutBadge } from '@/components/dashboard/statut-badge'
import { BranchBadge } from '@/components/dashboard/avatar'
import { DevisWizardModal } from '@/components/dashboard/devis-wizard-modal'
import { Pagination } from '@/components/dashboard/pagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { api, formatFCFA, type DevisDTO } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { useUI } from '@/lib/ui-store'
import { useNav } from '@/lib/nav'
import { usePagination } from '@/lib/use-pagination'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function DevisPage() {
  const { user } = useAuth()
  const { setPrimaryAction, openPrimaryAction } = useUI()
  const { pendingAction, clearPendingAction } = useNav()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [brancheFilter, setBrancheFilter] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [viewDevis, setViewDevis] = useState<DevisDTO | null>(null)
  const [busy, setBusy] = useState(false)
  const queryClient = useQueryClient()

  // Fetch devis from API with filters
  const { data: resp, isLoading } = useQuery({
    queryKey: ['devis', { statut: statusFilter, branche: brancheFilter, search }],
    queryFn: () => api.getDevis({ statut: statusFilter || undefined, branche: brancheFilter || undefined, search: search || undefined }),
  })

  const allDevis = resp?.data || []

  // Compute stat cards dynamically
  const statCards = [
    { label: 'Total devis', value: String(allDevis.length), icon: FileText, hint: 'tous statuts', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/40' },
    { label: 'Émis', value: String(allDevis.filter((d) => d.statut === 'Émis').length), icon: TrendingUp, hint: 'en attente', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
    { label: 'Transformés', value: String(allDevis.filter((d) => d.statut === 'Transformé').length), icon: CheckCircle2, hint: 'convertis', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
    { label: 'Taux conv.', value: allDevis.length > 0 ? `${Math.round((allDevis.filter((d) => d.statut === 'Transformé').length / allDevis.length) * 100)}%` : '0%', icon: CheckCircle2, hint: 'conversion', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/40' },
  ]

  // Register primary action
  useEffect(() => {
    setPrimaryAction(() => setWizardOpen(true))
    return () => setPrimaryAction(null)
  }, [setPrimaryAction, setWizardOpen])

  // Auto-open wizard when navigated with pending action
  useEffect(() => {
    if (pendingAction) {
      openPrimaryAction()
      clearPendingAction()
    }
  }, [pendingAction, clearPendingAction, openPrimaryAction])

  const { page, pageSize, total, paged, setPage, setPageSize } =
    usePagination(allDevis, 5, [search, statusFilter, brancheFilter])

  const filters = [
    {
      title: 'Statut',
      selected: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Tous', value: '' },
        { label: 'Brouillon', value: 'Brouillon' },
        { label: 'Émis', value: 'Émis' },
        { label: 'Transformé', value: 'Transformé' },
        { label: 'Expiré', value: 'Expiré' },
        { label: 'Refusé', value: 'Refusé' },
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
        title="Gestion des Devis"
        subtitle="Suivi des comparaisons et conversions en contrats"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une référence, un client, une compagnie..."
        primaryActionLabel={user?.role === 'client' ? 'Demander un devis' : 'Nouveau devis'}
        onPrimaryAction={() => setWizardOpen(true)}
        filters={filters}
      />

      {/* Stat cards - clickable to apply filter */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon
          const onClick =
            idx === 0
              ? () => { setStatusFilter(''); setBrancheFilter(''); setSearch('') }
              : idx === 2
                ? () => setStatusFilter('Transformé')
                : undefined
          return (
            <button
              key={s.label}
              onClick={onClick}
              className={cn(
                'flex flex-col gap-2 rounded-2xl border bg-white p-4 text-left shadow-sm shadow-slate-200/50 transition hover:shadow-md dark:bg-slate-900 dark:shadow-slate-950/30',
                onClick
                  ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/50'
                  : 'border-slate-200 cursor-default dark:border-slate-800'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{s.value}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{s.hint}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Devis table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Liste des devis</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">{total} résultat(s)</span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-sm text-slate-400">Chargement des devis…</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">Référence</th>
                    <th className="px-5 py-3 text-left font-medium">Client</th>
                    <th className="px-5 py-3 text-left font-medium">Branche</th>
                    <th className="px-5 py-3 text-left font-medium">Compagnie</th>
                    <th className="px-5 py-3 text-left font-medium">Garanties</th>
                    <th className="px-5 py-3 text-right font-medium">Prime (FCFA)</th>
                    <th className="px-5 py-3 text-left font-medium">Statut</th>
                    <th className="px-5 py-3 text-left font-medium">Date</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                        Aucun devis trouvé pour votre recherche
                      </td>
                    </tr>
                  ) : (
                    paged.map((d) => (
                      <tr key={d.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{d.reference}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500 text-[10px] font-semibold text-white">{d.clientAvatar || '?'}</span>
                            <span className="text-slate-800 dark:text-slate-200">{d.clientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3"><BranchBadge branch={d.branche} /></td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{d.companyName}</td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {d.garanties.split(',').slice(0, 2).map((g) => (
                              <span key={g} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{g}</span>
                            ))}
                            {d.garanties.split(',').length > 2 && (
                              <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-400 dark:bg-slate-800 dark:text-slate-500">+{d.garanties.split(',').length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">{formatFCFA(d.prime)}</td>
                        <td className="px-5 py-3"><StatutBadge statut={d.statut} /></td>
                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{d.dateCreation}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setViewDevis(d)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                            aria-label="Voir le devis"
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
          </>
        )}
      </div>

      <DevisWizardModal open={wizardOpen} onOpenChange={setWizardOpen} />

      <Dialog open={!!viewDevis} onOpenChange={(v) => !v && setViewDevis(null)}>
        <DialogContent className="max-w-xl bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-blue-600" />
              Devis {viewDevis?.reference}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Créé le {viewDevis?.dateCreation} · Agent : {viewDevis?.agentName}
            </DialogDescription>
          </DialogHeader>

          {viewDevis && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Client</p>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white">{viewDevis.clientAvatar || '?'}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{viewDevis.clientName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{viewDevis.branche} · {viewDevis.companyName}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Garanties incluses</p>
                <div className="flex flex-wrap gap-2">
                  {viewDevis.garanties.split(',').map((g) => (
                    <span key={g} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Prime annuelle</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatFCFA(viewDevis.prime)}</p>
                  </div>
                  <StatutBadge statut={viewDevis.statut} />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setViewDevis(null)}>Fermer</Button>
                {viewDevis.statut !== 'Transformé' && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      try {
                        const addOneYear = (dateStr: string) => {
                          const iso = /^\d{4}-\d{2}-\d{2}/.exec(dateStr)
                          if (iso) {
                            const d = new Date(dateStr)
                            d.setFullYear(d.getFullYear() + 1)
                            return d.toISOString().split('T')[0]
                          }
                          const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr)
                          if (m) return `${m[1]}/${m[2]}/${Number(m[3]) + 1}`
                          return dateStr
                        }
                        await api.createContrat({
                          clientId: viewDevis.clientId,
                          clientName: viewDevis.clientName,
                          clientAvatar: viewDevis.clientAvatar,
                          branche: viewDevis.branche,
                          compagnieId: viewDevis.compagnieId,
                          companyName: viewDevis.companyName,
                          produit: viewDevis.produitNom,
                          prime: viewDevis.prime,
                          garanties: viewDevis.garanties,
                          statut: 'Actif',
                          dateDebut: viewDevis.dateDebut,
                          dateFin: addOneYear(viewDevis.dateDebut),
                          prochainRenouvellement: addOneYear(viewDevis.dateDebut),
                          agentName: viewDevis.agentName,
                          devisId: viewDevis.id,
                        })
                        await api.updateDevis(viewDevis.id, { statut: 'Transformé' })
                        await queryClient.invalidateQueries({ queryKey: ['devis'] })
                        await queryClient.invalidateQueries({ queryKey: ['contrats'] })
                        await queryClient.invalidateQueries({ queryKey: ['stats'] })
                        toast.success('Devis transformé en contrat', {
                          description: `Devis ${viewDevis.reference} converti en contrat actif.`,
                        })
                        setViewDevis(null)
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Erreur lors de la transformation')
                      } finally {
                        setBusy(false)
                      }
                    }}
                  >
                    Transformer en contrat
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
