import sharp from 'sharp'

const path = 'public/logo-miel.png'
const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const w = info.width
const h = info.height
const ch = info.channels

const buckets = new Map()
function quantKey(r, g, b) {
  return [Math.round(r / 6) * 6, Math.round(g / 6) * 6, Math.round(b / 6) * 6].join(',')
}

for (let i = 0; i < data.length; i += ch) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const a = ch === 4 ? data[i + 3] : 255
  if (a < 128) continue
  if (r > 248 && g > 248 && b > 248) continue
  const k = quantKey(r, g, b)
  buckets.set(k, (buckets.get(k) || 0) + 1)
}

const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50)

function toHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((x) =>
        Math.min(255, Math.max(0, Math.round(x)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  )
}

const parsed = sorted.map(([k, c]) => {
  const [r, g, b] = k.split(',').map(Number)
  return { r, g, b, count: c, hex: toHex(r, g, b) }
})

const clusters = []
for (const p of parsed) {
  let found = false
  for (const cl of clusters) {
    const d = Math.hypot(p.r - cl.r, p.g - cl.g, p.b - cl.b)
    if (d < 28) {
      cl.weightedR += p.r * p.count
      cl.weightedG += p.g * p.count
      cl.weightedB += p.b * p.count
      cl.total += p.count
      found = true
      break
    }
  }
  if (!found) {
    clusters.push({
      weightedR: p.r * p.count,
      weightedG: p.g * p.count,
      weightedB: p.b * p.count,
      total: p.count,
    })
  }
}

clusters.sort((a, b) => b.total - a.total)
const totalPx = w * h
const final = clusters.map((c) => {
  const r = Math.round(c.weightedR / c.total)
  const g = Math.round(c.weightedG / c.total)
  const b = Math.round(c.weightedB / c.total)
  return {
    hex: toHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    coveragePct: ((c.total / totalPx) * 100).toFixed(2),
  }
})

/** Pixels « rouges » (R dominant, peu de G/B) */
function isRedish(r, g, b) {
  return r > 160 && r > g + 40 && r > b + 40 && g < 200 && b < 200
}
/** Pixels « jaunes » */
function isYellowish(r, g, b) {
  return r > 200 && g > 180 && b < 120 && Math.abs(r - g) < 80
}
/** Pixels « verts » (hors jaune) */
function isGreenish(r, g, b) {
  return g > r + 15 && g > b + 15 && !isYellowish(r, g, b)
}

const redBuckets = new Map()
const yellowBuckets = new Map()
const greenBuckets = new Map()

for (let i = 0; i < data.length; i += ch) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const a = ch === 4 ? data[i + 3] : 255
  if (a < 128) continue
  if (r > 248 && g > 248 && b > 248) continue

  if (isRedish(r, g, b)) {
    const k = quantKey(r, g, b)
    redBuckets.set(k, (redBuckets.get(k) || 0) + 1)
  } else if (isYellowish(r, g, b)) {
    const k = quantKey(r, g, b)
    yellowBuckets.set(k, (yellowBuckets.get(k) || 0) + 1)
  } else if (isGreenish(r, g, b)) {
    const k = quantKey(r, g, b)
    greenBuckets.set(k, (greenBuckets.get(k) || 0) + 1)
  }
}

function topWeighted(map, label) {
  const arr = [...map.entries()].sort((a, b) => b[1] - a[1])
  if (arr.length === 0) return null
  let wr = 0,
    wg = 0,
    wb = 0,
    t = 0
  const top = arr.slice(0, 15)
  for (const [k, c] of top) {
    const [r, g, b] = k.split(',').map(Number)
    wr += r * c
    wg += g * c
    wb += b * c
    t += c
  }
  const r = Math.round(wr / t)
  const g = Math.round(wg / t)
  const b = Math.round(wb / t)
  return {
    label,
    hex: toHex(r, g, b),
    rgb: `rgb(${r}, ${g}, ${b})`,
    samples: t,
  }
}

const accent = {
  green: topWeighted(greenBuckets, 'Vert principal (oiseau, texte, queue)'),
  yellow: topWeighted(yellowBuckets, 'Jaune (aile, médaillon)'),
  red: topWeighted(redBuckets, 'Rouge (médaillon haut)'),
}

console.log(
  JSON.stringify(
    {
      paletteFromFile: accent,
      dominantMergedGreen: final[0],
      note: 'Mesuré sur public/logo-miel.png (échantillonnage pixels non blancs)',
    },
    null,
    2,
  ),
)
