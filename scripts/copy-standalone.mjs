/**
 * Après `next build` (output: standalone), copie `.next/static` et `public`
 * vers `.next/standalone/` — équivalent Unix : cp -r (compatible Windows).
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const standalone = join(root, '.next', 'standalone')
const staticSrc = join(root, '.next', 'static')
const staticDest = join(standalone, '.next', 'static')
const publicSrc = join(root, 'public')
const publicDest = join(standalone, 'public')

if (!existsSync(standalone)) {
  console.warn('[copy-standalone] .next/standalone absent — étape ignorée.')
  process.exit(0)
}

mkdirSync(join(standalone, '.next'), { recursive: true })

if (existsSync(staticSrc)) {
  cpSync(staticSrc, staticDest, { recursive: true })
  console.log('[copy-standalone] .next/static → .next/standalone/.next/static')
} else {
  console.warn('[copy-standalone] .next/static absent.')
}

if (existsSync(publicSrc)) {
  cpSync(publicSrc, publicDest, { recursive: true })
  console.log('[copy-standalone] public → .next/standalone/public')
}
