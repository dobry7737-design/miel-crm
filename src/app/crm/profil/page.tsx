'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import type { AppRole } from '@/lib/permissions'
import { Skeleton } from '@/components/ui/skeleton'

function openLogoutDialog() {
  window.dispatchEvent(new CustomEvent('crm-open-logout-dialog'))
}

function Skel() {
  return (
    <div className="min-w-0 flex-1 space-y-4 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="min-h-[220px] w-full rounded-lg bg-muted/40" />
    </div>
  )
}

const ProfilView = dynamic(
  () => import('@/components/crm/profil-view').then((m) => m.ProfilView),
  { loading: () => <Skel /> },
)

export default function CrmProfilPage() {
  const { user } = useAuth()
  const { mockMode, effectiveRole, canModifyData, dataUserName } = usePermissions()
  const effectiveRoleTyped = effectiveRole as AppRole | ''

  return (
    <ProfilView
      userName={user?.name ?? ''}
      accountRole={user?.role ?? 'COMMERCIAL'}
      effectiveRole={effectiveRoleTyped}
      roleSimulationActive={mockMode !== 'real'}
      canModifyData={canModifyData}
      dataUserName={dataUserName}
      onLogout={openLogoutDialog}
    />
  )
}
