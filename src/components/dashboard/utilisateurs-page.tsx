'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Users,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Briefcase,
  UserCircle2,
  Headphones,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PartyPopper,
  Search,
  Download,
  Filter,
  Plus,
  ChevronDown,
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
import { Pagination } from '@/components/dashboard/pagination'
import { usePagination } from '@/lib/use-pagination'
import { ROLE_LABELS, type Role } from '@/lib/auth'
import { UTILISATEURS_DATA, type Utilisateur } from '@/lib/data'
import { cn } from '@/lib/utils'

const STAT_CARDS = [
  { label: 'Total utilisateurs', value: '248', icon: Users, trend: '+12', trendUp: true, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/40' },
  { label: 'Actifs', value: '187', icon: CheckCircle2, trend: '+8%', trendUp: true, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/40' },
  { label: 'Agents', value: '32', icon: Briefcase, trend: '+3', trendUp: true, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/40' },
  { label: 'Suspendus', value: '4', icon: AlertCircle, trend: '-1', trendUp: false, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/40' },
]

const ROLE_ICONS: Record<Role, typeof ShieldCheck> = {
  admin: ShieldCheck,
  agent: Briefcase,
  client: UserCircle2,
  gestionnaire: Headphones,
  correspondant: Building2,
}

const ROLE_BADGE_STYLES: Record<Role, string> = {
  admin: 'bg-purple-50 text-purple-600',
  agent: 'bg-emerald-50 text-emerald-600',
  client: 'bg-blue-50 text-blue-600',
  gestionnaire: 'bg-amber-50 text-amber-600',
  correspondant: 'bg-rose-50 text-rose-600',
}

export function UtilisateursPage() {
  const { setPrimaryAction, openPrimaryAction } = useUI()
  const { pendingAction, clearPendingAction } = useNav()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all')
  const [view, setView] = useState<Utilisateur | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Utilisateur | null>(null)

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
    let result = UTILISATEURS_DATA
    if (filterRole !== 'all') {
      result = result.filter((u) => u.role === filterRole)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.nom.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.telephone.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, filterRole])

  const { page, pageSize, total, paged, setPage, setPageSize } =
    usePagination(filtered, 5, [search, filterRole])

  return (
    <div>
      <PageHeader
        title="Gestion des Utilisateurs"
        subtitle="Comptes clients, agents, gestionnaires et correspondants partenaires"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un utilisateur..."
        primaryActionLabel="Inviter un utilisateur"
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

      {/* Role filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill
          active={filterRole === 'all'}
          onClick={() => setFilterRole('all')}
          label="Tous les profils"
        />
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => {
          const Icon = ROLE_ICONS[r]
          return (
            <FilterPill
              key={r}
              active={filterRole === r}
              onClick={() => setFilterRole(r)}
              label={ROLE_LABELS[r]}
              icon={<Icon className="h-3 w-3" />}
            />
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/30">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Liste des utilisateurs</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">{total} résultat(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-xs text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Utilisateur</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Profil RBAC</th>
                <th className="px-5 py-3 text-left font-medium">Téléphone</th>
                <th className="px-5 py-3 text-left font-medium">Statut</th>
                <th className="px-5 py-3 text-left font-medium">Dernière connexion</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                paged.map((u) => {
                  const Icon = ROLE_ICONS[u.role]
                  return (
                    <tr key={u.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${u.avatarColor}`}>
                            {u.avatar}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{u.nom}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{u.compagnie && `${u.compagnie}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold', ROLE_BADGE_STYLES[u.role])}>
                          <Icon className="h-3 w-3" />
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{u.telephone}</td>
                      <td className="px-5 py-3"><StatutBadge statut={u.statut} /></td>
                      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{u.derniereConnexion}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setView(u)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                            aria-label="Voir"
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(u)
                              setEditOpen(true)
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
                            aria-label="Modifier"
                          >
                            <Edit className="h-3.5 w-3.5" strokeWidth={2} />
                          </button>
                        </div>
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

      {/* View Modal */}
      <Dialog open={!!view} onOpenChange={(v) => !v && setView(null)}>
        <DialogContent className="max-w-md bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base">Profil de {view?.nom}</DialogTitle>
            <DialogDescription className="text-xs">
              Créé le {view?.dateCreation}
            </DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-5 text-center dark:bg-slate-800">
                <span className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold ${view.avatarColor}`}>
                  {view.avatar}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{view.nom}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{view.email}</p>
                </div>
                <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold', ROLE_BADGE_STYLES[view.role])}>
                  {ROLE_LABELS[view.role]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoField label="Téléphone" value={view.telephone} />
                <InfoField label="Statut" value={view.statut} />
                <InfoField label="Date de création" value={view.dateCreation} />
                <InfoField label="Dernière connexion" value={view.derniereConnexion} />
                {view.compagnie && <InfoField label="Compagnie" value={view.compagnie} />}
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setView(null)}>Fermer</Button>
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

      <UtilisateurEditModal
        key={editing ? `edit-${editing.id}` : 'add'}
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={editing}
      />
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
      )}
    >
      {icon}
      {label}
    </button>
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

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
  'bg-cyan-100 text-cyan-600',
  'bg-fuchsia-100 text-fuchsia-600',
  'bg-orange-100 text-orange-600',
]

const ROLES: Role[] = ['admin', 'agent', 'client', 'gestionnaire', 'correspondant']

function UtilisateurEditModal({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: Utilisateur | null
}) {
  const [form, setForm] = useState(() => ({
    nom: editing?.nom ?? '',
    email: editing?.email ?? '',
    telephone: editing?.telephone ?? '',
    role: editing?.role ?? ('client' as Role),
    statut: editing?.statut ?? ('Invité' as 'Actif' | 'Suspendu' | 'Invité'),
    avatarColor: editing?.avatarColor ?? AVATAR_COLORS[0],
    compagnie: editing?.compagnie ?? '',
  }))
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const canSubmit = form.nom && form.email

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-base">
            {completed ? 'Utilisateur enregistré' : editing ? `Modifier ${editing.nom}` : 'Inviter un utilisateur'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {completed
              ? 'L\'utilisateur a été enregistré avec succès.'
              : 'Un email d\'invitation sera envoyé à l\'utilisateur'}
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-7 w-7 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {editing ? 'Modifications enregistrées !' : 'Invitation envoyée !'}
            </h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {editing
                ? `Les informations de ${form.nom} ont été mises à jour.`
                : `Un email a été envoyé à ${form.email} avec un lien d'activation du compte.`}
            </p>
            <Button size="sm" onClick={() => handleClose(false)} className="mt-2 bg-blue-600 hover:bg-blue-700">
              Fermer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Nom complet <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Aïssata Diallo"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemple.ml"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  placeholder="+223 ..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300">
                Profil RBAC <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {ROLES.map((r) => {
                  const Icon = ROLE_ICONS[r]
                  const isActive = form.role === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r }))}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs font-medium transition',
                        isActive
                          ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {ROLE_LABELS[r]}
                    </button>
                  )
                })}
              </div>
            </div>

            {form.role === 'correspondant' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Compagnie partenaire <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.compagnie}
                  onChange={(e) => setForm((f) => ({ ...f, compagnie: e.target.value }))}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                >
                  <option value="">Sélectionner...</option>
                  <option>NSIA Assurances</option>
                  <option>SUNU Assurances</option>
                  <option>AFG Assurances</option>
                  <option>Sanlam Allianz</option>
                  <option>SONAVIE</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as typeof form.statut }))}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
              >
                <option value="Invité">Invité (en attente activation)</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => handleClose(false)}>Annuler</Button>
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
                ) : editing ? 'Enregistrer' : 'Envoyer l\'invitation'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
