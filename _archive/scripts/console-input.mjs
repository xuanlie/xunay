import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.cinput", s)

// 找 renderConsole 函数段
const startMark = "  function renderConsole() {"
const endMark = "  function renderLogDetail("
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark, i1 + startMark.length)
if (i1 < 0 || i2 < 0) throw new Error("未找到 renderConsole 段")

const newRender = `  function renderConsole() {
    // 顶部：输入框
    const bar = mk('div')
    bar.style.cssText = 'display:flex;gap:8px;padding:10px 16px;background:#f8f9fa;border-bottom:1px solid #dadce0;position:sticky;top:0;z-index:5'
    const inp = mk('input')
    inp.placeholder = '输入 JS 表达式，回车执行'
    inp.style.cssText = 'flex:1;height:34px;padding:0 12px;background:#fff;border:1px solid #dadce0;color:#202124;border-radius:8px;font:inherit;font-size:12.5px;outline:none;font-family:inherit'
    inp.onfocus = () => { inp.style.borderColor = '#8b5cf6'; inp.style.boxShadow = '0 0 0 3px rgba(139,92,246,.12)' }
    inp.onblur = () => { inp.style.borderColor = '#dadce0'; inp.style.boxShadow = 'none' }
    inp.onkeydown = e => {
      if (e.key === 'Enter' && inp.value.trim()) {
        const code = inp.value
        inp.value = ''
        pushConsoleLog('info', '> ' + code)
        try {
          const result = (0, eval)(code)
          pushConsoleLog('log', formatResult(result))
        } catch (err) {
          pushConsoleLog('error', String(err))
        }
        renderBody()
      }
    }
    const go = mk('button')
    go.textContent = '执行'
    go.style.cssText = 'height:34px;padding:0 18px;background:#8b5cf6;color:#fff;border:0;border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;font-family:inherit'
    go.onmouseenter = () => { go.style.background = '#7c3aed' }
    go.onmouseleave = () => { go.style.background = '#8b5cf6' }
    go.onclick = () => inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    bar.appendChild(inp)
    bar.appendChild(go)
    mainEl.appendChild(bar)

    if (!S.logs.length) {
      const emp = mk('div', '__xd_empty__')
      emp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>'
      emp.appendChild(document.createTextNode('暂无输出，上面输入 JS 试试'))
      return mainEl.appendChild(emp)
    }
    const tail = S.logs.slice(-200)
    for (let i = 0; i < tail.length; i++) {
      const l = tail[i]
      const r = mk('div', '__xd_log__ ' + l.level)
      r.textContent = l.text
      r.style.cursor = 'pointer'
      r.onclick = () => renderLogDetail(l, i)
      mainEl.appendChild(r)
    }
  }

  function formatResult(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonymous')
    try { return JSON.stringify(v, null, 2) } catch (e) { return String(v) }
  }

  function pushConsoleLog(level, text) {
    S.logs.push({ level, text })
    if (S.logs.length > 300) S.logs.shift()
  }

`
s = s.slice(0, i1) + newRender + s.slice(i2)
writeFileSync(p, s)
console.log("控制台输入已加")
