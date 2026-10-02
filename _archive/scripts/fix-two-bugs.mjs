import { readFileSync, writeFileSync } from "node:fs"

// ===== 修 1：hl.js 的占位符改用 PUA 编码，让数字规则匹配不到 =====
{
  const p = "core/src/hl.js"
  let s = readFileSync(p, "utf8")
  writeFileSync(p + ".bak.hl2", s)

  s = s.replace(
    "return '\\uE000' + idx.toString(36) + '\\uE001'",
    "return '\\uE000' + String.fromCharCode(0xE100 + idx) + '\\uE001'"
  )
  s = s.replace(
    /out = out\.replace\(\/\\uE000\(\[0-9a-z\]\+\)\\uE001\/g, \(_, i\) => marks\[parseInt\(i, 36\)\]\)/,
    "out = out.replace(/\\uE000([\\uE100-\\uE8FF]+)\\uE001/g, (_, ch) => marks[ch.charCodeAt(0) - 0xE100])"
  )
  writeFileSync(p, s)
  console.log("hl.js 修复")
}

// ===== 修 2：xuyc.js 只在行首真 import 上替换 'xunay' =====
{
  const p = "bin/xuyc.js"
  let s = readFileSync(p, "utf8")
  writeFileSync(p + ".bak.impfix", s)

  const lines = s.split("\n")
  let done = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("xunayPath.replace") && lines[i].includes("src = src.replace")) {
      lines[i] = `  src = src.replace(/^(\\\\s*import\\\\s+[^\\\\n]*?\\\\s+from\\\\s+)['"]xunay['"]/gm, (m, prefix) => prefix + "'" + xunayPath.replace(/\\\\\\\\/g, '/') + "'")`
      done = true
      break
    }
  }
  if (!done) throw new Error("未找到 xuyc 的 replace 行")
  writeFileSync(p, lines.join("\n"))
  console.log("xuyc.js 修复")
}
