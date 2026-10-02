import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.noauto", s)

// 只在显式 ?watch=1 时启用，其他一律关
const from = `    const h = location.hostname
    const isLocal = h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' ||
      /^10\\./.test(h) || /^172\\.(1[6-9]|2\\d|3[01])\\./.test(h) || /^192\\.168\\./.test(h)
    const wantWatch = location.search.includes('watch=1')
    if (!isLocal && !wantWatch) return`

const to = `    if (!location.search.includes('watch=1')) return`

if (!s.includes(from)) throw new Error("未命中 autoReload 判断")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("自动刷新已改成仅 ?watch=1 启用")
