import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.clog", s)

const startMark = "  function renderConsole() {"
const endMark = "  async function doSend("
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark, i1 + startMark.length)
if (i1 < 0 || i2 < 0) { console.log("未找到 renderConsole 段"); process.exit(1) }

const newRender = `  function renderConsole() {
    if (!S.logs.length) {
      const emp = mk('div', '__xd_empty__')
      emp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>'
      emp.appendChild(document.createTextNode('暂无输出'))
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

  function renderLogDetail(l, i) {
    mainEl.innerHTML = ''
    const back = mk('div', '__xd_back__')
    back.innerHTML = SVG.back
    back.appendChild(document.createTextNode('返回列表'))
    back.onclick = () => renderBody()
    mainEl.appendChild(back)

    const dh = mk('div', '__xd_dhead__')
    const h = mk('div', '__xd_durl__')
    const tag = mk('span', '__xd_tag__ ' + (l.level === 'error' ? 's5' : l.level === 'warn' ? 's3' : 'get'))
    tag.textContent = l.level.toUpperCase()
    h.appendChild(tag)
    const cn = mk('span', 'u', ' 控制台消息')
    h.appendChild(cn)
    dh.appendChild(h)
    const meta = mk('div', '__xd_dmeta__')
    const am = (k, val) => { const x = mk('span'); x.appendChild(mk('b', null, k + ' ')); x.appendChild(document.createTextNode(val)); meta.appendChild(x) }
    am('序号', '#' + i)
    am('时间', fmtTime(Date.now()))
    am('长度', String(l.text.length) + ' 字符')
    am('级别', l.level)
    dh.appendChild(meta)
    mainEl.appendChild(dh)

    mainEl.appendChild(mk('div', '__xd_dsec__', '内容'))
    const wrap = mk('div')
    wrap.style.cssText = 'position:relative;margin:0 16px 16px'
    const code = mk('div', '__xd_code__')
    code.style.margin = '0'
    code.style.color = l.level === 'error' ? '#c5221f' : l.level === 'warn' ? '#b06000' : '#202124'
    code.textContent = l.text
    wrap.appendChild(code)
    addCopy(wrap, l.text)
    mainEl.appendChild(wrap)
  }

`
s = s.slice(0, i1) + newRender + s.slice(i2)
writeFileSync(p, s)
console.log("控制台详情页完成")
