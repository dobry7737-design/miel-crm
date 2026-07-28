'use client'

import { useState, useMemo } from 'react'

/**
 * Hook to manage pagination state safely without setState-in-effect lint errors.
 * Auto-resets page to 1 when `deps` change (search filter, pageSize, etc.).
 *
 * Uses the "adjust state while rendering" pattern documented by React:
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function usePagination<T>(
  items: T[],
  initialPageSize = 5,
  deps: unknown[] = []
) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [prevDeps, setPrevDeps] = useState<unknown[]>(deps)

  // Adjust state during render when deps change (React-safe pattern)
  const depsChanged = deps.some(
    (d, i) => !Object.is(d, prevDeps[i])
  )
  if (depsChanged) {
    setPrevDeps(deps)
    setPage(1)
  }

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = items.slice(start, start + pageSize)

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    paged,
    setPage,
    setPageSize,
  }
}
