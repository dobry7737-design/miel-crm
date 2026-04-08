'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClientHistoryView } from '@/components/crm/client-history-view'
import { usePermissions } from '@/hooks/use-permissions'
import { CRM_DATA_CHANGED_EVENT, getClients } from '@/lib/crm-data'
import { pathForView } from '@/lib/crm-routes'

export default function ClientHistoriquePage() {
  const params = useParams()
  const router = useRouter()
  const { isDirectorOrAdmin, dataUserName } = usePermissions()
  const [dataVersion, setDataVersion] = useState(0)

  const clientId = typeof params.clientId === 'string' ? params.clientId : params.clientId?.[0] ?? ''

  useEffect(() => {
    const bump = () => setDataVersion((v) => v + 1)
    window.addEventListener(CRM_DATA_CHANGED_EVENT, bump)
    return () => window.removeEventListener(CRM_DATA_CHANGED_EVENT, bump)
  }, [])

  const client = useMemo(
    () => (clientId ? getClients().find((c) => c.id === clientId) : undefined),
    [clientId, dataVersion],
  )

  const allowed =
    !!client && (isDirectorOrAdmin || client.commercial === dataUserName)

  if (!clientId) {
    return null
  }

  if (!client || !allowed) {
    return (
      <div className="flex min-h-[min(60vh,32rem)] w-full flex-col items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Card className="border-destructive/20 shadow-lg">
            <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="h-7 w-7" aria-hidden />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">Accès impossible</p>
                <p className="text-sm text-muted-foreground">
                  Client introuvable ou vous n&apos;avez pas l&apos;autorisation de consulter cet historique.
                </p>
              </div>
              <Button
                className="mt-2 gap-2 bg-gradient-to-r from-primary to-emerald-700 text-primary-foreground"
                onClick={() => router.push(pathForView('clients'))}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux clients
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col space-y-6 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-10 gap-2 rounded-xl text-muted-foreground hover:bg-primary/8 hover:text-foreground dark:hover:bg-primary/15"
          onClick={() => router.push(pathForView('clients'))}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste des clients
        </Button>
      </motion.div>
      <ClientHistoryView client={client} />
    </div>
  )
}
