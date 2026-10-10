import { readFileSync, writeFileSync } from "node:fs"
const p = "site/gen-docs.py"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.lang", s)

// render_block 里 Code 默认语言从 'js' 改成 'xuy'
const from = `    if t == 'Code':
        lang = b[2] if len(b) > 2 else 'js'
        return '    Code(' + json.dumps(b[1], ensure_ascii=False) + ', ' + json.dumps(lang) + '),'`

const to = `    if t == 'Code':
        lang = b[2] if len(b) > 2 else 'xuy'
        return '    Code(' + json.dumps(b[1], ensure_ascii=False) + ', ' + json.dumps(lang) + '),'`

if (!s.includes(from)) throw new Error("未命中 Code 默认语言")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("gen-docs 默认语言改成 xuy")
