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

const EquipeCommercialeView = dynamic(
  () => import('@/components/crm/equipe-commerciale-view').then((m) => m.EquipeCommercialeView),
  { loading: () => <Skel /> },
)

export default function CrmEquipePage() {
  return <EquipeCommercialeView />
}
