'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/crm/login-form'
import { useAuth, syncCrmSessionCookieFromStorage } from '@/hooks/use-auth'
import { BrandLogo } from '@/components/crm/brand-logo'
import { Skeleton } from '@/components/ui/skeleton'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') || '/crm/dashboard'
  const { login, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const go = async () => {
        await syncCrmSessionCookieFromStorage()
        router.replace(nextPath.startsWith('/') ? nextPath : '/crm/dashboard')
      }
      void go()
    }
  }, [isLoading, isAuthenticated, router, nextPath])

  const handleLogin = async (name: string, password: string) => {
    await login(name, password)
    await syncCrmSessionCookieFromStorage()
    router.replace(nextPath.startsWith('/') ? nextPath : '/crm/dashboard')
  }

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/[0.07] via-emerald-50/40 to-background dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
        suppressHydrationWarning
      >
        <div className="flex flex-col items-center gap-5" suppressHydrationWarning>
          <BrandLogo
            priority
            className="h-20 w-auto max-w-[min(92vw,320px)] object-contain animate-pulse sm:h-28 sm:max-w-[min(92vw,400px)]"
          />
          <Skeleton className="mx-auto h-5 w-28" />
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <LoginForm onLogin={handleLogin} />
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Skeleton className="h-32 w-64" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  )
}
