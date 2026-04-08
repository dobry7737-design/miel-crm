"use client"

import { useMemo, useCallback } from 'react'
import {
  canAddClient,
  canModifyData,
  canModifyCommandes,
  canExportReports,
  canUseReportGlobalFilters,
  canViewTeam,
  canAccessRoleSimulation,
  canEditClientRow,
  isFullDataAccess,
} from '@/lib/permissions'
import { useEffectiveRole } from '@/hooks/use-effective-role'
import { useAuthStore } from '@/store/auth-store'

export function usePermissions(): {
  mockMode: import('@/hooks/use-effective-role').MockRoleMode
  setMockMode: (m: import('@/hooks/use-effective-role').MockRoleMode) => void
  effectiveRole: import('@/lib/permissions').AppRole | ''
  accountRole: import('@/lib/permissions').AppRole | undefined
  dataUserName: string
  hydrated: boolean
  canViewTeam: boolean
  canModifyData: boolean
  canModifyCommandes: boolean
  canExportReports: boolean
  canUseReportGlobalFilters: boolean
  canAddClient: boolean
  isDirectorOrAdmin: boolean
  canAccessRoleSimulation: boolean
  canEditThisClient: (rowCommercial: string) => boolean
} {
  const { mockMode, setMockMode, effectiveRole, dataUserName, hydrated } =
    useEffectiveRole()
  const accountRole = useAuthStore((s) => s.user?.role)

  const canEditThisClient = useCallback(
    (rowCommercial: string) =>
      canEditClientRow(effectiveRole, dataUserName, rowCommercial),
    [effectiveRole, dataUserName],
  )

  return useMemo(
    () => ({
      mockMode,
      setMockMode,
      effectiveRole,
      accountRole,
      dataUserName,
      hydrated,
      canViewTeam: canViewTeam(effectiveRole),
      canModifyData: canModifyData(effectiveRole),
      canModifyCommandes: canModifyCommandes(effectiveRole),
      canExportReports: canExportReports(effectiveRole),
      canUseReportGlobalFilters: canUseReportGlobalFilters(effectiveRole),
      canAddClient: canAddClient(effectiveRole),
      isDirectorOrAdmin: isFullDataAccess(effectiveRole),
      canAccessRoleSimulation: canAccessRoleSimulation(accountRole),
      canEditThisClient,
    }),
    [
      mockMode,
      setMockMode,
      effectiveRole,
      accountRole,
      dataUserName,
      hydrated,
      canEditThisClient,
    ],
  )
}
