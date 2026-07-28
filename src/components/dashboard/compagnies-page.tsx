'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Eye,
  Edit,
  Building2,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PartyPopper,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatutBadge } from '@/components/dashboard/statut-badge'
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
import { COMPAGNIES_DATA, type Compagnie } from '@/lib/data'

const STAT_CARDS = [
  { label: 'Total compagnies', value: '11', icon: Building2, trend: '+1', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Actives', value: '8', icon: CheckCircle2, trend: '+1', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'À valider', value: '3', icon: AlertCircle, trend: '0', trendUp: false, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Délai moyen (h)', value: '29', icon: Clock, trend: '-12%', trendUp: true, color: 'text-violet-600', bg: 'bg-violet-50' },
]

export function CompagniesPage() {
  const { setPrimaryAction, openPrimaryAction } = useUI()
  const { pendingAction, clearPendingAction } = useNav()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<Compagnie | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Compagnie | null>(null)

  useEffect(() => {
    setPrimaryAction(() => {
      setEditing(null)
      setEditOpen(true)
    })
    return () => setPrimaryAction(null)
  }, [setPrimaryAction])

  useEffect(() => {
    if (pendingAction) {
      openPrimaryAction()
      clearPendingAction()
    }
  }, [pendingAction, clearPendingAction, openPrimaryAction])

  const filtered = useMemo(() => {
    if (!search) return COMPAGNIES_DATA
    const q = search.toLowerCase()
    return COMPAGNIES_DATA.filter(
      (c) => c.nom.toLowerCase().includes(q) || c.agrement.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div>
      <PageHeader
        title="Compagnies Partenaires"
        subtitle="Référentiel des 11 compagnies agréées CIMA"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une compagnie..."
        primaryActionLabel="Ajouter une compagnie"
        onPrimaryAction={() => {
          setEditing(null)
          setEditOpen(true)
        }}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`h-4 w-4 ${s.color}`} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900 sm:text-2xl">{s.value}</span>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {s.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50 transition hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white ${c.iconColor}`}>
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">{c.nom}</h3>
                <p className="truncate text-xs text-slate-400">{c.agrement}</p>
              </div>
              <StatutBadge statut={c.statut} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                <p className="text-slate-400">Note</p>
                <p className="flex items-center gap-1 font-semibold text-slate-800">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {c.rating > 0 ? c.rating : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                <p className="text-slate-400">Délai sinistres</p>
                <p className="font-semibold text-slate-800">{c.delaiTraitement}h</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                <p className="text-slate-400">Produits</p>
                <p className="font-semibold text-slate-800">{c.produits}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                <p className="text-slate-400">Sinistres actifs</p>
                <p className="font-semibold text-slate-800">{c.sinistresActifs}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {c.branches.map((b) => (
                <span key={b} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-1 border-t border-slate-100 pt-3">
              <button
                onClick={() => setView(c)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                aria-label="Voir"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <button
                onClick={() => {
                  setEditing(c)
                  setEditOpen(true)
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-emerald-600"
                aria-label="Modifier"
              >
                <Edit className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              {view?.nom}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {view?.agrement} · Partenaire depuis {view?.datePartenariat}
            </DialogDescription>
          </DialogHeader>

          {view && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <InfoField label="Contact référent" value={view.contact} />
                <InfoField label="Email" value={view.email} />
                <InfoField label="Téléphone" value={view.telephone} />
                <InfoField label="Statut" value={view.statut} />
                <InfoField label="Note moyenne" value={`${view.rating} / 5`} />
                <InfoField label="Délai de traitement" value={`${view.delaiTraitement}h`} />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Branches couvertes
                </p>
                <div className="flex flex-wrap gap-2">
                  {view.branches.map((b) => (
                    <span key={b} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Produits actifs</p>
                  <p className="text-2xl font-bold text-slate-900">{view.produits}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Sinistres en cours</p>
                  <p className="text-2xl font-bold text-slate-900">{view.sinistresActifs}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => setView(null)}>
                  Fermer
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditing(view)
                    setView(null)
                    setEditOpen(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal - keyed so form state resets on each open/editing change */}
      <CompagnieEditModal
        key={editing ? `edit-${editing.id}` : 'add'}
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={editing}
      />
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

const ICON_COLORS = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-fuchsia-500',
  'bg-lime-500',
]

const ALL_BRANCHES = ['Auto', 'Santé', 'Habitation', 'Voyage', 'Vie']

function CompagnieEditModal({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: Compagnie | null
}) {
  const [form, setForm] = useState(() => ({
    nom: editing?.nom ?? '',
    agrement: editing?.agrement ?? '',
    contact: editing?.contact ?? '',
    email: editing?.email ?? '',
    telephone: editing?.telephone ?? '',
    iconColor: editing?.iconColor ?? ICON_COLORS[0],
    statut: editing?.statut ?? ('À valider' as 'Actif' | 'À valider' | 'Inactif'),
    branches: editing?.branches ?? ([] as string[]),
  }))
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const canSubmit = form.nom && form.agrement && form.contact && form.email

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setCompleted(true)
    }, 800)
  }

  const handleClose = (v: boolean) => {
    onOpenChange(v)
    if (!v) setTimeout(() => setCompleted(false), 200)
  }

  const toggleBranch = (b: string) => {
    setForm((f) => ({
      ...f,
      branches: f.branches.includes(b)
        ? f.branches.filter((x) => x !== b)
        : [...f.branches, b],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-base">
            {completed
              ? 'Compagnie enregistrée'
              : editing
                ? `Modifier ${editing.nom}`
                : 'Ajouter une compagnie'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {completed
              ? 'Les modifications ont été enregistrées avec succès.'
              : 'Renseignez les informations de la compagnie partenaire'}
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-7 w-7 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-slate-900">Compagnie enregistrée !</h3>
            <p className="max-w-sm text-sm text-slate-500">
              {editing ? 'Les informations ont été mises à jour.' : `${form.nom} a été ajoutée au référentiel des compagnies partenaires.`}
            </p>
            <Button size="sm" onClick={() => handleClose(false)} className="mt-2 bg-blue-600 hover:bg-blue-700">
              Fermer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Nom de la compagnie <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder="ex: NSIA Assurances"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Agrément CIMA <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.agrement}
                onChange={(e) => setForm((f) => ({ ...f, agrement: e.target.value }))}
                placeholder="ex: CIMA-NSIA-2018"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Contact <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  placeholder="Nom du référent"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contact@compagnie.ml"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  placeholder="+223 ..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as typeof form.statut }))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="À valider">À valider</option>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Couleur d&apos;affichage
              </label>
              <div className="flex flex-wrap gap-2">
                {ICON_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, iconColor: c }))}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${c} ${form.iconColor === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                  >
                    {form.iconColor === c && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Branches couvertes
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_BRANCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBranch(b)}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
                      form.branches.includes(b)
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4">
              <Button variant="outline" size="sm" onClick={() => handleClose(false)}>
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={!canSubmit || submitting}
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : editing ? (
                  'Enregistrer les modifications'
                ) : (
                  'Ajouter la compagnie'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
