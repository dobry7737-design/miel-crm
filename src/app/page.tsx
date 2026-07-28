'use client'

import { useAuth } from '@/lib/auth'
import { LoginPage } from '@/components/auth/login-page'
import { Dashboard } from '@/components/dashboard/dashboard'

export default function Home() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Dashboard /> : <LoginPage />
}
