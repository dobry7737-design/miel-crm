/**
 * Exécution : `npx tsx src/lib/auth-policy.test.ts` (ou intégrer à votre runner de tests).
 */
import assert from 'node:assert/strict'
import {
  canModifyCommandes,
  canExportReports,
  canEditClientRow,
  canAccessRoleSimulation,
} from './auth-policy'
import { canAccessCrmView } from './crm-routes'

assert.equal(canModifyCommandes('COMMERCIAL'), false)
assert.equal(canModifyCommandes('DG'), true)
assert.equal(canExportReports('ADMIN'), true)
assert.equal(canExportReports('COMMERCIAL'), false)
assert.equal(canEditClientRow('COMMERCIAL', 'Amadou Diallo', 'Amadou Diallo'), true)
assert.equal(canEditClientRow('COMMERCIAL', 'Amadou Diallo', 'Fatou Sy'), false)
assert.equal(canEditClientRow('DG', 'x', 'y'), true)
assert.equal(canAccessRoleSimulation('COMMERCIAL'), false)
assert.equal(canAccessRoleSimulation('DG'), true)

assert.equal(canAccessCrmView('COMMERCIAL', 'dashboard'), true)
assert.equal(canAccessCrmView('COMMERCIAL', 'clients'), true)
assert.equal(canAccessCrmView('COMMERCIAL', 'profil'), true)
assert.equal(canAccessCrmView('COMMERCIAL', 'commandes'), false)
assert.equal(canAccessCrmView('COMMERCIAL', 'rapports'), false)
assert.equal(canAccessCrmView('COMMERCIAL', 'equipe'), true)
assert.equal(canAccessCrmView('DG', 'equipe'), true)
assert.equal(canAccessCrmView('DG', 'commandes'), true)
assert.equal(canAccessCrmView(undefined, 'dashboard'), true)
assert.equal(canAccessCrmView(undefined, 'profil'), true)
assert.equal(canAccessCrmView(undefined, 'clients'), false)

console.log('auth-policy: ok')
