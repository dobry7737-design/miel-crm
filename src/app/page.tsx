'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { LoginPage } from '@/components/auth/login-page'
import { Dashboard } from '@/components/dashboard/dashboard'

export default function Home() {
  const { isAuthenticated, isHydrated, hydrate } = useAuth()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vérification de la session…
          </p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard /> : <LoginPage />
}
