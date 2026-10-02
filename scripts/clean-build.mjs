import { readFileSync, writeFileSync } from "node:fs"
const p = "core/build.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.cleanbuild", s)

// 删 devtools-entry 那段（找到起点到下一个 await esbuild.build 或 for 循环）
const from = `await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/devtools-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-devtools.min.js'),
  target: ['es2020'], legalComments: 'none',
})

`

if (!s.includes(from)) {
  console.log("未命中完整段，尝试按行删")
  const lines = s.split("\n")
  const out = []
  let skip = false
  for (const line of lines) {
    if (line.includes("devtools-entry.js")) { skip = true; continue }
    if (skip && (line.includes("xunay-devtools.min.js"))) { skip = true; continue }
    if (skip && line.trim() === "})") { skip = false; continue }
    if (skip) { continue }
    out.push(line)
  }
  s = out.join("\n")
} else {
  s = s.replace(from, "")
}

writeFileSync(p, s)
console.log("清理完成")
