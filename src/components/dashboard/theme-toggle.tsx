'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        'border-slate-200 bg-white text-slate-500',
        isDark && 'border-slate-700 bg-slate-900 text-slate-300',
        className
      )}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      suppressHydrationWarning
    >
      <Sun className="h-[18px] w-[18px] hidden dark:block" strokeWidth={2} />
      <Moon className="h-[18px] w-[18px] block dark:hidden" strokeWidth={2} />
    </button>
  )
}
