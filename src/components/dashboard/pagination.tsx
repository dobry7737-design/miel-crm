'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number // 1-based
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, total)

  const goTo = (p: number) => {
    onPageChange(Math.max(1, Math.min(totalPages, p)))
  }

  // Generate page numbers to display (show up to 5)
  const pages: (number | '...')[] = []
  const maxDisplay = 5
  if (totalPages <= maxDisplay) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage, '...', totalPages)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-slate-100 px-5 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Affichage de <span className="font-semibold text-slate-700 dark:text-slate-200">{start}</span>
          {' '}à{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{end}</span>
          {' '}sur{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span>
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>·</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => goTo(1)}
          disabled={currentPage === 1}
          aria-label="Première page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </PageButton>
        <PageButton
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </PageButton>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-slate-400 dark:text-slate-500"
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => goTo(p)}
              active={p === currentPage}
            >
              {p}
            </PageButton>
          )
        )}

        <PageButton
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </PageButton>
        <PageButton
          onClick={() => goTo(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Dernière page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </PageButton>
      </div>
    </div>
  )
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  'aria-label'?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium transition',
        disabled
          ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
          : active
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
      )}
    >
      {children}
    </button>
  )
}
