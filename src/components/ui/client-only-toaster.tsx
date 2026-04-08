"use client"

import { useSyncExternalStore } from "react"
import { Toaster } from "@/components/ui/toaster"

const noopSubscribe = () => () => {}

/** Monte les toasts après l’hydratation pour éviter les mismatches si une extension modifie le DOM (ex. bis_skin_checked). */
export function ClientOnlyToaster() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )

  if (!mounted) return null

  return <Toaster />
}
