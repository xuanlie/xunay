import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/render.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.probe", s)

const from = `  for (const c of children) {
    if (typeof c === 'function') {
      const r = c()`

const to = `  for (const c of children) {
    if (typeof c === 'function') {
      const __saved = runtime.currentEffect
      runtime.currentEffect = null
      let r
      try { r = c() } finally { runtime.currentEffect = __saved }`

if (!s.includes(from)) throw new Error("未命中 el() 探针")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("探针修复完成")
