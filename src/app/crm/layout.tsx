import { Suspense } from 'react'
import { CrmLayoutClient } from '@/components/crm/crm-layout-client'

function CrmFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
      Chargement…
    </div>
  )
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CrmFallback />}>
      <CrmLayoutClient>{children}</CrmLayoutClient>
    </Suspense>
  )
}
