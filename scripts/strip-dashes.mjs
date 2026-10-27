// One-off scrubbing tool: removes em (U+2014) and en (U+2013) dashes from
// source files so no invisible dash glyphs survive anywhere (comments included).
// Em dash -> two ASCII hyphens; en dash -> one ASCII hyphen. Text only; it does
// not touch any other characters or whitespace.
// Usage: node scripts/strip-dashes.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join, extname } from 'path'

const SKIP = new Set(['node_modules', 'dist', '.dahl', '.git'])
const EXT = new Set(['.js', '.jsx', '.css', '.html', '.ts', '.tsx'])

function walk(dir, acc) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (SKIP.has(entry)) continue
    if (statSync(p).isDirectory()) walk(p, acc)
    else if (EXT.has(extname(p))) acc.push(p)
  }
  return acc
}

const files = walk('.', [])
let cleaned = 0
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  if (!/[—–]/.test(src)) continue
  const out = src.replace(/\u2014/g, '--').replace(/\u2013/g, '-')
  writeFileSync(f, out)
  cleaned += 1
  console.log('cleaned', f)
}
console.log('files cleaned:', cleaned)
