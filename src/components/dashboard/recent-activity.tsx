'use client'

import { ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ChartCard } from './chart-card'
import { useNav, type PageId } from '@/lib/nav'
import { api, type AuditLogDTO } from '@/lib/api'

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-blue-500',
  'bg-cyan-500',
]

function actionLabel(log: AuditLogDTO): string {
  const map: Record<string, string> = {
    CREATE_DEVIS: 'a créé un devis',
    UPDATE_DEVIS: 'a mis à jour un devis',
    DELETE_DEVIS: 'a supprimé un devis',
    CREATE_CONTRAT: 'a créé un contrat',
    UPDATE_CONTRAT: 'a mis à jour un contrat',
    CREATE_SINISTRE: 'a déclaré un sinistre',
    UPDATE_SINISTRE: 'a traité un sinistre',
    CREATE_PAIEMENT: 'a enregistré un paiement',
    CREATE_PRODUIT: 'a créé un produit',
    UPDATE_PRODUIT: 'a mis à jour un produit',
    CREATE_COMPAGNIE: 'a ajouté une compagnie',
    UPDATE_COMPAGNIE: 'a mis à jour une compagnie',
    CREATE_USER: 'a créé un utilisateur',
    SEED: 'a initialisé la plateforme',
    LOGIN: 's’est connecté',
  }
  if (map[log.action]) return map[log.action]
  if (log.action.startsWith('CREATE_')) return `a créé un ${log.entity}`
  if (log.action.startsWith('UPDATE_')) return `a mis à jour un ${log.entity}`
  if (log.action.startsWith('DELETE_')) return `a supprimé un ${log.entity}`
  return log.details || log.action.toLowerCase().replace(/_/g, ' ')
}

function entityPage(entity: string): PageId {
  switch (entity) {
    case 'contrat':
      return 'contrats'
    case 'sinistre':
      return 'sinistres'
    case 'paiement':
      return 'paiements'
    case 'compagnie':
      return 'compagnies'
    case 'produit':
      return 'produits'
    case 'utilisateur':
      return 'utilisateurs'
    case 'devis':
    default:
      return 'devis'
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('')
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function RecentActivity() {
  const { setPage } = useNav()
  const { data: resp, isLoading } = useQuery({
    queryKey: ['audit', 12],
    queryFn: () => api.getAudit(12),
    staleTime: 60 * 1000,
  })

  const logs = resp?.data || []

  return (
    <ChartCard
      title="Activité Récente"
      subtitle="Journal d’audit Prisma"
      className="lg:col-span-2"
      bodyClassName="flex flex-col gap-1 -mx-1"
      action={
        <button
          onClick={() => setPage('devis')}
          className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Voir devis
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      }
    >
      <div className="flex flex-col">
        {isLoading && (
          <div className="py-8 text-center text-xs text-slate-400">Chargement…</div>
        )}
        {!isLoading && logs.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">
            Aucune activité enregistrée
          </div>
        )}
        {logs.map((log, i) => {
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
          const page = entityPage(log.entity)
          const refHint =
            log.details?.match(/\b(DEV|CTR|SIN|PAY)-\d{4}-\d+\b/)?.[0] ||
            log.entity
          return (
            <button
              key={log.id}
              type="button"
              onClick={() => setPage(page)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-1 py-2.5 text-left transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white ${avatarColor}`}
              >
                {initials(log.userName) || '?'}
              </div>
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-1.5">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {log.userName}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {actionLabel(log)}
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {refHint}
                </span>
                <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                  · {formatWhen(log.createdAt)}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </ChartCard>
  )
}
