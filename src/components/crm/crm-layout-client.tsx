'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { AppSidebar, type AppView } from '@/components/crm/app-sidebar'
import { AppHeader } from '@/components/crm/app-header'
import { CommandPalette } from '@/components/crm/command-palette'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { LogOut } from 'lucide-react'
import { BrandLogo } from '@/components/crm/brand-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { pathForView, viewFromPathname, canAccessCrmView } from '@/lib/crm-routes'
import { useToast } from '@/hooks/use-toast'
import { syncSupabaseData } from '@/lib/crm-data'

export function CrmLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const { effectiveRole } = usePermissions()
  const [logoutDialog, setLogoutDialog] = useState(false)

  useEffect(() => {
    const open = () => setLogoutDialog(true)
    window.addEventListener('crm-open-logout-dialog', open)
    
    // Launch background synchronization with Supabase on start
    syncSupabaseData()
    
    return () => window.removeEventListener('crm-open-logout-dialog', open)
  }, [])

  const currentView = viewFromPathname(pathname)
  const role = effectiveRole || undefined
  const canSeeCurrent = canAccessCrmView(role, currentView)
  const safeView: AppView = canSeeCurrent ? currentView : 'dashboard'

  useEffect(() => {
    if (searchParams.get('error') === 'forbidden') {
      toast({
        title: 'Accès refusé',
        description: 'Vous n’avez pas les droits pour accéder à cette page.',
        variant: 'destructive',
      })
      router.replace(pathname)
    }
  }, [searchParams, pathname, router, toast])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, isAuthenticated, router, pathname])

  useEffect(() => {
    if (!isLoading && isAuthenticated && !canAccessCrmView(role, currentView)) {
      router.replace('/crm/dashboard?error=forbidden')
    }
  }, [isLoading, isAuthenticated, currentView, role, router])

  const handleLogout = useCallback(() => {
    setLogoutDialog(true)
  }, [])

  const confirmLogout = useCallback(async () => {
    setLogoutDialog(false)
    await logout()
    router.replace('/login')
  }, [logout, router])

  const handleNavigate = useCallback(
    (view: AppView) => {
      if (!canAccessCrmView(role, view)) {
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
    [router, role, toast],
  )

  if (isLoading) {
    return (
      <div
        className="flex min-h-[100dvh] min-h-screen items-center justify-center bg-gradient-to-br from-primary/[0.07] via-emerald-50/40 to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
        suppressHydrationWarning
      >
        <div className="flex flex-col items-center gap-5" suppressHydrationWarning>
          <BrandLogo
            priority
            className="h-20 w-auto max-w-[min(92vw,320px)] object-contain animate-pulse sm:h-28 sm:max-w-[min(92vw,400px)]"
          />
          <Skeleton className="mx-auto h-5 w-28" />
          <Skeleton className="mx-auto h-3 w-44" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider key={user?.id ?? 'anon'}>
      <AppSidebar
        currentView={safeView}
        onViewChange={handleNavigate}
        onLogout={handleLogout}
      />
      <SidebarInset className="min-h-0">
        <AppHeader
          currentView={safeView}
          userId={user?.id ?? ''}
          userName={user?.name || ''}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="mx-auto flex min-h-0 min-w-0 w-full max-w-[1600px] flex-col pb-[max(0.75rem,env(safe-area-inset-bottom))] xl:max-w-[1800px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>

      <CommandPalette onNavigate={handleNavigate} />

      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent className="max-w-[min(24rem,calc(100vw-2rem))] sm:max-w-sm">
          <DialogHeader className="gap-3">
            <DialogTitle className="flex items-center gap-3 text-left leading-snug">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50">
                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="min-w-0 pt-0.5">Se déconnecter ?</span>
            </DialogTitle>
            <DialogDescription className="text-left">
              Vous êtes sur le point de quitter votre session. Vos données sauvegardées seront conservées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setLogoutDialog(false)} className="w-full sm:flex-1">
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => void confirmLogout()} className="w-full sm:flex-1">
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              Se déconnecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
