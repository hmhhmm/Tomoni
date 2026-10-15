// Verifies that every t('...') key used in src exists in both en.ts and ja.ts.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// fileURLToPath keeps Windows paths valid (URL.pathname gives /E:/... there).
const root = fileURLToPath(new URL('../src/', import.meta.url))
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))
const files = walk(root).filter((f) => /\.tsx?$/.test(f) && !/[\\/]i18n[\\/]/.test(f))

const load = (f) => {
  const src = readFileSync(join(root, 'i18n', f), 'utf8')
    .replace(/import .*\n/g, '')
    .replace(/type Widen[^\n]*\n/, '')
    .replace(/export const (en|ja)(: [^=]+)? =/, 'return ')
  return new Function(src)()
}
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'string' ? [p + k] : flat(v, p + k + '.')))
const en = new Set(flat(load('en.ts')))
const ja = new Set(flat(load('ja.ts')))

let bad = 0
for (const k of en)
  if (!ja.has(k)) {
    console.log('missing in ja:', k)
    bad++
  }
for (const k of ja)
  if (!en.has(k)) {
    console.log('missing in en:', k)
    bad++
  }

const used = new Set()
const plural = (k) => en.has(k + '_one') || en.has(k + '_other')
for (const f of files) {
  const s = readFileSync(f, 'utf8')
  for (const m of s.matchAll(/\bt\(\s*['"`]([^'"`]+)['"`]/g)) used.add(m[1])
}
for (const k of used) {
  if (k.includes('${')) continue // dynamic keys are checked by hand
  if (!en.has(k) && !plural(k)) {
    console.log('used but undefined:', k)
    bad++
  }
}
console.log(bad ? `${bad} problem(s)` : `i18n OK: ${en.size} keys, ${used.size} literal keys used`)
process.exit(bad ? 1 : 0)
