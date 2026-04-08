'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

function Skel() {
  return (
    <div className="min-w-0 flex-1 space-y-4 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="min-h-[220px] w-full rounded-lg bg-muted/40" />
    </div>
  )
}

const ClientsView = dynamic(
  () => import('@/components/crm/clients-view').then((m) => m.ClientsView),
  { loading: () => <Skel /> },
)

export default function CrmClientsPage() {
  return <ClientsView />
}
