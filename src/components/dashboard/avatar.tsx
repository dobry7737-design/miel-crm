'use client'

import { cn } from '@/lib/utils'

interface AvatarProps {
  initials: string
  colorClass?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({
  initials,
  colorClass = 'bg-slate-500',
  size = 'md',
  className,
}: AvatarProps) {
  const sizeClass =
    size === 'sm'
      ? 'h-8 w-8 text-[11px]'
      : size === 'lg'
        ? 'h-12 w-12 text-base'
        : 'h-10 w-10 text-sm'

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm',
        sizeClass,
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  )
}

const BRANCH_COLORS: Record<string, string> = {
  Auto: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  Santé: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  Habitation: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
  Voyage: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
  Vie: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
}

const BRANCH_INITIALS: Record<string, string> = {
  Auto: 'A',
  Santé: 'S',
  Habitation: 'H',
  Voyage: 'V',
  Vie: 'VIE',
}

export function BranchBadge({ branch }: { branch: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        BRANCH_COLORS[branch] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
      )}
    >
      <span className="font-bold">{BRANCH_INITIALS[branch] || branch[0]}</span>
      <span>{branch}</span>
    </span>
  )
}

// Generate avatar color from name initials deterministically
const AVATAR_PALETTE = [
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-pink-500',
]

export function avatarColorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

export function initialsFor(name: string): string {
  return name
    .split(' ')
    .filter((s) => s.length > 0)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')
}
