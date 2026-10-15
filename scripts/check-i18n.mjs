// Verifies that every t('...') key used in src exists in English, and that every other language file
// has exactly the same keys and the same {{placeholders}} as English.
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
    .replace(/export const [a-z]+(: [^=]+)? =/, 'return ')
  return new Function(src)()
}
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'string' ? [[p + k, v]] : flat(v, p + k + '.')))
const vars = (s) =>
  [...s.matchAll(/{{\s*(\w+)\s*}}/g)]
    .map((m) => m[1])
    .sort()
    .join(',')
const enMap = new Map(flat(load('en.ts')))
const en = new Set(enMap.keys())
const OTHERS = ['ja', 'ms', 'vi', 'zh']

let bad = 0
for (const lang of OTHERS) {
  const map = new Map(flat(load(`${lang}.ts`)))
  for (const k of en)
    if (!map.has(k)) {
      console.log(`missing in ${lang}:`, k)
      bad++
    } else if (vars(map.get(k)) !== vars(enMap.get(k))) {
      console.log(`placeholders differ in ${lang}:`, k, `(en: ${vars(enMap.get(k)) || 'none'}, ${lang}: ${vars(map.get(k)) || 'none'})`)
      bad++
    }
  for (const k of map.keys())
    if (!en.has(k)) {
      console.log(`extra key in ${lang}:`, k)
      bad++
    }
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
console.log(bad ? `${bad} problem(s)` : `i18n OK: ${en.size} keys in en + ${OTHERS.join(', ')}, ${used.size} literal keys used`)
process.exit(bad ? 1 : 0)
