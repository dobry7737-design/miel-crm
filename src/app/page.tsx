import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { FAB_SESSION_COOKIE, parseSessionUserFromToken } from '@/lib/crm-session'

export default async function Home() {
  const jar = await cookies()
  const t = jar.get(FAB_SESSION_COOKIE)?.value
  if (t && parseSessionUserFromToken(t)) {
    redirect('/crm/dashboard')
  }
  redirect('/login')
}
