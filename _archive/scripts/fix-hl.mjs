import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/hl.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.fixhl", s)

const from = `    [/[{}()\\[\\];,.]/g, 'm'],
  ],
    [/\\b(div|span|p|a|button|input|form|label|ul|ol|li|h1|h2|h3|h4|h5|h6|table|thead|tbody|tr|td|th|img|header|footer|nav|main|section|article|select|option|textarea|pre|code|br|hr)(?=\\s*\\()/g, 'd'],
  ],`

const to = `    [/[{}()\\[\\];,.]/g, 'm'],
    [/\\b(div|span|p|a|button|input|form|label|ul|ol|li|h1|h2|h3|h4|h5|h6|table|thead|tbody|tr|td|th|img|header|footer|nav|main|section|article|select|option|textarea|pre|code|br|hr)(?=\\s*\\()/g, 'd'],
  ],`

if (!s.includes(from)) throw new Error("未命中 fix-hl")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("修好")
