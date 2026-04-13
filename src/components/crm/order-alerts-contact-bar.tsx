'use client'

import { Mail } from 'lucide-react'
import { ORDER_ALERTS_EMAIL, orderAlertsMailtoHref } from '@/lib/order-alerts-contact'
import { cn } from '@/lib/utils'

type OrderAlertsContactBarProps = {
  className?: string
  /** Texte d’introduction au-dessus du lien */
  label?: string
}

export function OrderAlertsContactBar({
  className,
  label = 'Pour les commandes, écrivez-nous :',
}: OrderAlertsContactBarProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2.5 dark:border-primary/30 dark:bg-primary/10',
        className,
      )}
    >
      <p className="mb-2 text-[11px] font-medium leading-snug text-muted-foreground">{label}</p>
      <a
        href={orderAlertsMailtoHref()}
        className="inline-flex items-center gap-1.5 rounded-md bg-muted/80 px-2.5 py-1.5 text-xs font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted"
      >
        <Mail className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        {ORDER_ALERTS_EMAIL}
      </a>
    </div>
  )
}
