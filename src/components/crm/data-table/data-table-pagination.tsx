'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const DEFAULT_PAGE_SIZES = [5, 10, 20]

function pageNumbersWithEllipsis(pageIndex: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 0) return []
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }
  const set = new Set<number>()
  set.add(0)
  set.add(pageCount - 1)
  for (let i = pageIndex - 1; i <= pageIndex + 1; i++) {
    if (i >= 0 && i < pageCount) set.add(i)
  }
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) out.push('ellipsis')
    out.push(sorted[i]!)
  }
  return out
}

export type DataTablePaginationProps = {
  pageIndex: number
  pageSize: number
  totalRows: number
  pageCount: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalRows,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  className,
}: DataTablePaginationProps) {
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalRows)
  const pages = pageNumbersWithEllipsis(pageIndex, pageCount)
  const canPrev = pageIndex > 0
  const canNext = pageIndex < pageCount - 1

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border/80 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <p className="text-xs text-muted-foreground tabular-nums">
          {totalRows === 0 ? (
            <>Aucune ligne</>
          ) : (
            <>
              Affichage <span className="font-medium text-foreground">{from}</span>
              {'–'}
              <span className="font-medium text-foreground">{to}</span> sur{' '}
              <span className="font-medium text-foreground">{totalRows}</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Lignes par page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[4.5rem] text-xs" aria-label="Nombre de lignes par page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageCount > 1 && (
        <nav className="flex items-center justify-center gap-1 sm:justify-end" aria-label="Pagination">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canPrev}
            onClick={() => onPageChange(pageIndex - 1)}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span
                key={`e-${i}`}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === pageIndex ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p + 1}`}
                aria-current={p === pageIndex ? 'page' : undefined}
              >
                {p + 1}
              </Button>
            )
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={!canNext}
            onClick={() => onPageChange(pageIndex + 1)}
            aria-label="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  )
}
