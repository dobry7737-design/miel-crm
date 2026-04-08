import {
  differenceInDays,
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns'
import { fr } from 'date-fns/locale'

/** Libellé relatif + date complète en français (plus d’ISO brut dans l’UI). */
export function formatNotificationDates(iso: string): { primary: string; secondary: string } {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return { primary: '—', secondary: iso }
  }
  const now = new Date()
  let primary: string
  if (isToday(d)) {
    primary = `Aujourd'hui · ${format(d, 'HH:mm', { locale: fr })}`
  } else if (isYesterday(d)) {
    primary = `Hier · ${format(d, 'HH:mm', { locale: fr })}`
  } else if (differenceInDays(now, d) >= 7) {
    primary = format(d, 'd MMM yyyy', { locale: fr })
  } else {
    primary = formatDistanceToNow(d, { addSuffix: true, locale: fr })
  }
  const secondary = format(d, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
  return { primary, secondary }
}
