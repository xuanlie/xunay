import { readFileSync, writeFileSync, existsSync } from "node:fs"

function write(p, c) { writeFileSync(p, c); console.log("write", p) }
function patch(p, from, to) {
  const s = readFileSync(p, "utf8")
  if (!s.includes(from)) { console.log("跳过", p); return }
  writeFileSync(p + ".bak", s)
  writeFileSync(p, s.replace(from, to))
  console.log("patch", p)
}

// ① index.js：删掉 ssr / dev / anim 三组导出
{
  const p = "core/src/index.js"
  const s = readFileSync(p, "utf8")
  writeFileSync(p + ".bak", s)
  const cleaned = s
    .replace(/export \{ renderToString, hydrate \} from '\.\/ssr\.js'\n/, "")
    .replace(/export \{ enableDevtool[^\n]*\n/, "")
    .replace(/\nexport \* from '\.\/anim\.js'/, "")
    .replace(/\nexport \* from '\.\/anim-kit\.js'/, "")
  writeFileSync(p, cleaned)
  console.log("patch core/src/index.js (去 ssr/dev/anim)")
}

// ② 新入口
write("core/src/ssr-entry.js",
  "export { renderToString, hydrate } from './ssr.js'\n")
write("core/src/dev-entry.js",
  "export { enableDevtool, disableDevtool, getEvents, clearEvents, recordEvent } from './dev.js'\n")
write("core/src/anim-entry.js",
  "export * from './anim.js'\nexport * from './anim-kit.js'\n")

// ③ package.json
patch("core/package.json",
  '    "./devtools": "./src/devtools-entry.js",',
  '    "./devtools": "./src/devtools-entry.js",\n    "./ssr": "./src/ssr-entry.js",\n    "./anim": "./src/anim-entry.js",\n    "./dev": "./src/dev-entry.js",')

// ④ build.js：加三个可选入口的产物
{
  const p = "core/build.js"
  const s = readFileSync(p, "utf8")
  if (!s.includes("ssr-entry")) {
    writeFileSync(p + ".bak", s)
    const marker = "const a = fs.readFileSync(path.join(__dirname, 'dist/xunay.min.js'))"
    const block =
      "for (const [entry, out] of [\n" +
      "  ['ssr-entry.js', 'xunay-ssr.min.js'],\n" +
      "  ['anim-entry.js', 'xunay-anim.min.js'],\n" +
      "  ['dev-entry.js', 'xunay-dev.min.js'],\n" +
      "]) {\n" +
      "  await esbuild.build({\n" +
      "    entryPoints: [path.join(__dirname, 'src/' + entry)],\n" +
      "    bundle: true, minify: true, format: 'esm',\n" +
      "    outfile: path.join(__dirname, 'dist/' + out),\n" +
      "    target: ['es2020'], legalComments: 'none',\n" +
      "  })\n" +
      "}\n\n"
    writeFileSync(p, s.replace(marker, block + marker))
    console.log("patch core/build.js (+ssr/anim/dev)")
  }
}

console.log("done")
