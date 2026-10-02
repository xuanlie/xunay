import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.domwatch", s)

const anchor = "  // 页面加载即启动 hook，保证数据不丢\n  startHooks()"
if (!s.includes(anchor)) throw new Error("未找到锚点")

const watcher = `  // 页面加载即启动 hook
  startHooks()

  // ===== DOM 变动监控（调试用，?nowatch 可关）=====
  if (!location.search.includes('nowatch')) {
    ;(function watchDom() {
      let pending = []
      let timer = 0
      const flush = () => {
        timer = 0
        if (!pending.length) return
        const added = pending.filter(x => x.op === '+').map(x => x.tag)
        const removed = pending.filter(x => x.op === '-').map(x => x.tag)
        const attrChanged = pending.filter(x => x.op === 'a').length
        const summary = []
        if (added.length) summary.push('+' + added.length + ' ' + added.slice(0, 5).join(','))
        if (removed.length) summary.push('-' + removed.length + ' ' + removed.slice(0, 5).join(','))
        if (attrChanged) summary.push('~attr ' + attrChanged)
        if (added.length + removed.length > 3) {
          console.log('[闪] DOM 大变动: ' + summary.join(' | '))
          pending = []
        } else {
          console.log('[变动] ' + summary.join(' | '))
          pending = []
        }
      }
      const obs = new MutationObserver(muts => {
        for (const m of muts) {
          if (m.type === 'childList') {
            for (const n of m.addedNodes) if (n.nodeType === 1) pending.push({ op: '+', tag: n.tagName + (n.className ? '.' + String(n.className).split(' ')[0] : '') })
            for (const n of m.removedNodes) if (n.nodeType === 1) pending.push({ op: '-', tag: n.tagName + (n.className ? '.' + String(n.className).split(' ')[0] : '') })
          } else if (m.type === 'attributes') {
            pending.push({ op: 'a' })
          }
        }
        clearTimeout(timer)
        timer = setTimeout(flush, 120)
      })
      obs.observe(document.getElementById('app') || document.body, {
        childList: true, subtree: true, attributes: true
      })
      console.log('[devtools] DOM 监控已开启。点 +1 后看下面日志。关闭: 地址栏加 ?nowatch')
    })()
  }`

s = s.replace(anchor, watcher)
writeFileSync(p, s)
console.log("DOM 监控已加")
