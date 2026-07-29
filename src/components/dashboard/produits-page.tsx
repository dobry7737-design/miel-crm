'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { api, formatFCFA, type ProduitDTO } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { Pagination } from '@/components/dashboard/pagination'
import { usePagination } from '@/lib/use-pagination'

const BRANCHES = ['Auto', 'Santé', 'Habitation', 'Voyage', 'Vie']

function parsePrime(p: ProduitDTO): number {
  if (p.tarifs && typeof p.tarifs.basePrime === 'number') return p.tarifs.basePrime
  try {
    return (JSON.parse(p.tarifsJson || '{}') as { basePrime?: number }).basePrime || 0
  } catch {
    return 0
  }
}

export function ProduitsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [brancheFilter, setBrancheFilter] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<ProduitDTO | null>(null)

  const { data: resp, isLoading } = useQuery({
    queryKey: ['produits', { branche: brancheFilter }],
    queryFn: () =>
      api.getProduits({
        branche: brancheFilter || undefined,
      }),
  })

  const filtered = (resp?.data || []).filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.nom.toLowerCase().includes(q) ||
      p.compagnie?.nom?.toLowerCase().includes(q) ||
      p.branche.toLowerCase().includes(q)
    )
  })

  const { page, pageSize, total, paged, setPage, setPageSize } = usePagination(
    filtered,
    10,
    [search, brancheFilter]
  )

  const canManage = user?.role === 'admin' || user?.role === 'correspondant'

  const handleDelete = async (p: ProduitDTO) => {
    if (!confirm(`Supprimer le produit « ${p.nom} » ?`)) return
    try {
      await api.deleteProduit(p.id)
      await queryClient.invalidateQueries({ queryKey: ['produits'] })
      toast.success('Produit supprimé')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur suppression')
    }
  }

  return (
    <div>
      <PageHeader
        title="Catalogue Produits"
        subtitle="Grilles tarifaires et garanties issues de la base Prisma"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un produit…"
        primaryActionLabel={canManage ? 'Nouveau produit' : undefined}
        onPrimaryAction={
          canManage
            ? () => {
                setEditing(null)
                setEditOpen(true)
              }
            : undefined
        }
        filters={[
          {
            title: 'Branche',
            selected: brancheFilter,
            onChange: setBrancheFilter,
            options: [
              { label: 'Toutes', value: '' },
              ...BRANCHES.map((b) => ({ label: b, value: b })),
            ],
          },
        ]}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3 font-semibold">Produit</th>
              <th className="px-4 py-3 font-semibold">Branche</th>
              <th className="px-4 py-3 font-semibold">Compagnie</th>
              <th className="px-4 py-3 font-semibold">Prime</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              {canManage && <th className="px-4 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Chargement…
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Aucun produit en base
                </td>
              </tr>
            ) : (
              paged.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {p.nom}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(Array.isArray(p.garanties)
                            ? p.garanties
                            : String(p.garanties || '').split(',')
                          )
                            .filter(Boolean)
                            .slice(0, 3)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <BranchBadge branch={p.branche} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {p.compagnie?.nom || '—'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatFCFA(parsePrime(p))}
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={p.statut} />
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p)
                            setEditOpen(true)
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                          aria-label="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <ProduitFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        produit={editing}
        companyName={user?.company}
      />
    </div>
  )
}

function ProduitFormModal({
  open,
  onOpenChange,
  produit,
  companyName,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  produit: ProduitDTO | null
  companyName?: string
}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [nom, setNom] = useState('')
  const [branche, setBranche] = useState('Auto')
  const [compagnieId, setCompagnieId] = useState('')
  const [basePrime, setBasePrime] = useState('100000')
  const [garanties, setGaranties] = useState('')
  const [statut, setStatut] = useState('Actif')
  const [saving, setSaving] = useState(false)

  const { data: compagniesResp } = useQuery({
    queryKey: ['compagnies', 'produit-form'],
    queryFn: () => api.getCompagnies(),
    enabled: open,
  })
  const compagnies = compagniesResp?.data || []

  useEffect(() => {
    if (!open) return
    if (produit) {
      setNom(produit.nom)
      setBranche(produit.branche)
      setCompagnieId(produit.compagnieId)
      setBasePrime(String(parsePrime(produit)))
      setGaranties(
        Array.isArray(produit.garanties)
          ? produit.garanties.join(', ')
          : String(produit.garanties || '')
      )
      setStatut(produit.statut)
    } else {
      setNom('')
      setBranche('Auto')
      const match = companyName
        ? compagnies.find((c) => c.nom === companyName)
        : undefined
      setCompagnieId(match?.id || compagnies[0]?.id || '')
      setBasePrime('100000')
      setGaranties('')
      setStatut('Actif')
    }
  }, [open, produit, compagnies, companyName])

  const handleSubmit = async () => {
    if (!nom.trim() || !compagnieId) {
      toast.error('Nom et compagnie requis')
      return
    }
    setSaving(true)
    try {
      const body = {
        nom: nom.trim(),
        branche,
        compagnieId,
        basePrime: Number(basePrime) || 0,
        garanties: garanties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        statut,
      }
      if (produit) {
        await api.updateProduit(produit.id, body)
        toast.success('Produit mis à jour')
      } else {
        await api.createProduit(body)
        toast.success('Produit créé')
      }
      await queryClient.invalidateQueries({ queryKey: ['produits'] })
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-blue-600" />
            {produit ? 'Modifier le produit' : 'Nouveau produit'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Enregistré dans Prisma — utilisé par le comparateur de devis.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Nom">
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Branche">
              <select
                value={branche}
                onChange={(e) => setBranche(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prime de base (FCFA)">
              <input
                type="number"
                value={basePrime}
                onChange={(e) => setBasePrime(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </Field>
          </div>
          <Field label="Compagnie">
            <select
              value={compagnieId}
              onChange={(e) => setCompagnieId(e.target.value)}
              disabled={user?.role === 'correspondant'}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">Sélectionner…</option>
              {compagnies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Garanties (séparées par des virgules)">
            <textarea
              value={garanties}
              onChange={(e) => setGaranties(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="RC, Vol, Incendie…"
            />
          </Field>
          <Field label="Statut">
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  )
}
