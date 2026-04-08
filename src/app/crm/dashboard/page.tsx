'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { useCrmNavigate } from '@/hooks/use-crm-navigate'
import { Skeleton } from '@/components/ui/skeleton'

function Skel() {
  return (
    <div className="min-w-0 flex-1 space-y-4 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="min-h-[220px] w-full rounded-lg bg-muted/40" />
    </div>
  )
}

const DashboardView = dynamic(
  () => import('@/components/crm/dashboard-view').then((m) => m.DashboardView),
  { loading: () => <Skel /> },
)

export default function CrmDashboardPage() {
  const { user } = useAuth()
  const { effectiveRole, isDirectorOrAdmin, dataUserName } = usePermissions()
  const onNavigate = useCrmNavigate()
  const statsUserName =
    effectiveRole === 'COMMERCIAL' ? dataUserName : (user?.name ?? '')

  return (
    <DashboardView
      isAdmin={isDirectorOrAdmin}
      userRole={effectiveRole}
      userName={user?.name ?? ''}
      statsUserName={statsUserName}
      onNavigate={onNavigate}
    />
  )
}
