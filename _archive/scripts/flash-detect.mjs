import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.flashdetect", s)

const anchor = "  // 页面加载即启动 hook"
if (!s.includes(anchor)) throw new Error("未找到锚点")

const detector = `  // ===== 页面重载检测 =====
  try {
    const c = parseInt(sessionStorage.getItem('__reload_count__') || '0', 10) + 1
    sessionStorage.setItem('__reload_count__', String(c))
    // 5 秒内重载超过 2 次 = 非正常重载
    if (c > 1 && !sessionStorage.getItem('__reload_reported__')) {
      sessionStorage.setItem('__reload_reported__', '1')
      setTimeout(() => {
        alert('检测到页面重载！\\n\\n这是第 ' + c + ' 次加载。\\n点确定后如果又弹出来，说明页面在无限刷新。\\n\\n如果要重置计数，刷新一次即可。')
      }, 100)
    }
    // 5 秒后清掉"已报告"，避免永久屏蔽
    setTimeout(() => sessionStorage.removeItem('__reload_reported__'), 5000)
  } catch (e) {}

  // 页面加载即启动 hook`

s = s.replace(anchor, detector)
writeFileSync(p, s)
console.log("重载检测已加")
