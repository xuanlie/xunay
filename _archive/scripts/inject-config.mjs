import { readFileSync, writeFileSync } from "node:fs"
const p = "bin/xuyc.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.cfg", s)

// 在 ROOT 定义后加：读取 package.json 的 xunay 配置
const anchor = "const ROOT = path.resolve(__dirname, '..')"
const injection = `const ROOT = path.resolve(__dirname, '..')

// 读取项目 xunay 配置
function readXunayConfig(entryDir) {
  const candidates = [
    path.join(entryDir, 'package.json'),
    path.join(ROOT, 'package.json'),
  ]
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (j.xunay) return j.xunay
    } catch (e) {}
  }
  return {}
}
const XUNAY_CFG = readXunayConfig(process.cwd())
const DEVTOOLS_ON = XUNAY_CFG.devtools !== false
const DEVTOOLS_MODE = XUNAY_CFG.devtoolsMode || 'auto'
console.log('[xuyc] devtools:', DEVTOOLS_ON ? DEVTOOLS_MODE : 'off')`

if (!s.includes(anchor)) throw new Error("未命中 ROOT")
s = s.replace(anchor, injection)

// 在 processFile 里：替换 devtools.js 的 import 为条件动态加载
const oldReplace = `  src = src.replace(/from\\s+['"]xunay['"]/g, "from '" + xunayPath.replace(/\\\\/g, '/') + "'")`

const newReplace = `  src = src.replace(/from\\s+['"]xunay['"]/g, "from '" + xunayPath.replace(/\\\\/g, '/') + "'")

  // devtools 条件加载：构建时决定
  if (src.includes("import './src/devtools.js'") || src.includes('import "./src/devtools.js"')) {
    if (!DEVTOOLS_ON) {
      // 关闭：直接删掉 import
      src = src.replace(/import\\s+['"]\\.\\/src\\/devtools\\.js['"]/g, '/* devtools disabled */')
    } else {
      // 开启：改成条件动态 import
      const mode = DEVTOOLS_MODE
      const check = mode === 'always'
        ? 'true'
        : mode === 'never'
          ? 'false'
          : "(location.hostname === 'localhost' || location.hostname === '127.0.0.1' || /^(10\\\\.|172\\\\.(1[6-9]|2\\\\d|3[01])\\\\.|192\\\\.168\\\\.)/.test(location.hostname) || new URLSearchParams(location.search).get('devtools') === '1')"
      src = src.replace(/import\\s+['"]\\.\\/src\\/devtools\\.js['"]/g,
        'if (' + check + ') import("./devtools.js")')
    }
  }`

if (!s.includes(oldReplace)) throw new Error("未命中 replace")
s = s.replace(oldReplace, newReplace)

writeFileSync(p, s)
console.log("注入完成")
