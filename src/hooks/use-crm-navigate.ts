'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { pathForView, canAccessCrmView } from '@/lib/crm-routes'
import type { AppView } from '@/lib/crm-routes'
import { usePermissions } from '@/hooks/use-permissions'
import { useToast } from '@/hooks/use-toast'

export function useCrmNavigate() {
  const router = useRouter()
  const { effectiveRole } = usePermissions()
  const { toast } = useToast()
  return useCallback(
    (view: AppView) => {
      const r = effectiveRole || undefined
      if (!canAccessCrmView(r, view)) {
        toast({
          title: 'Accès refusé',
          description: 'Vous n’avez pas les droits pour accéder à cette page.',
          variant: 'destructive',
        })
        return
      }
      router.push(pathForView(view))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [router, effectiveRole, toast],
  )
}
