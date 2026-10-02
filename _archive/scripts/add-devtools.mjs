import { readFileSync, writeFileSync } from "node:fs"

function patch(p, from, to) {
  const s = readFileSync(p, "utf8")
  if (!s.includes(from)) throw new Error("未命中: " + p)
  writeFileSync(p + ".bak", s)
  writeFileSync(p, s.replace(from, to))
  console.log("patch", p)
}

// ① xuyc.js：复制可选入口产物 + 子路径替换
patch("bin/xuyc.js",
  `const xunayPath = path.join(outDir, 'xunay.js')
fs.copyFileSync(esm, xunayPath)`,
  `const xunayPath = path.join(outDir, 'xunay.js')
fs.copyFileSync(esm, xunayPath)

// 可选入口：core/dist/xunay-*.min.js → outDir/xunay-*.js
const optionals = ['kit', 'devtools', 'ssr', 'anim', 'dev']
const optPaths = {}
for (const name of optionals) {
  const src = path.join(ROOT, 'core/dist/xunay-' + name + '.min.js')
  if (fs.existsSync(src)) {
    const dst = path.join(outDir, 'xunay-' + name + '.js')
    fs.copyFileSync(src, dst)
    optPaths[name] = dst
  }
}`)

patch("bin/xuyc.js",
  `  src = src.replace(/from\\s+['"]xunay['"]/g, "from '" + xunayPath.replace(/\\\\/g, '/') + "'")`,
  `  for (const [name, p] of Object.entries(optPaths)) {
    const re = new RegExp("from\\\\s+['\\"]xunay\\\\/" + name + "['\\"]", 'g')
    src = src.replace(re, "from '" + p.replace(/\\\\/g, '/') + "'")
  }
  src = src.replace(/from\\s+['"]xunay['"]/g, "from '" + xunayPath.replace(/\\\\/g, '/') + "'")`)

// ② myapp/app.xuy：引 devtools 并开启
patch("myapp/app.xuy",
  `import { div, mount } from 'xunay'\nimport { Nav } from './src/components/Nav.xuy'`,
  `import { div, mount } from 'xunay'\nimport { openDevtools } from 'xunay/devtools'\nimport { Nav } from './src/components/Nav.xuy'`)

patch("myapp/app.xuy",
  `mount(() => div({ class: 'app' },`,
  `if (typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {\n  openDevtools()\n}\n\nmount(() => div({ class: 'app' },`)

console.log("done")
