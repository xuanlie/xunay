import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.sigdetail", s)

// 用 indexOf 找 renderSignals 段
const startMark = "  function renderSignals() {"
const endMark = "  function renderConsole() {"
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark, i1 + startMark.length)
if (i1 < 0 || i2 < 0) { console.log("未找到 renderSignals 段"); process.exit(1) }

const newRender = `  function renderSignals() {
    if (!S.signals.length) {
      const emp = mk('div', '__xd_empty__')
      emp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
      emp.appendChild(document.createTextNode('还没有 signal'))
      return mainEl.appendChild(emp)
    }
    for (let i = 0; i < S.signals.length; i++) {
      const sg = S.signals[i]
      let v
      try { v = sg() } catch (e) { v = '<err>' }
      const m = S.sigMeta.get(sg) || { writes: [] }
      const on = S._selSig && S._selSig.i === i
      const r = mk('div', '__xd_row__' + (on ? ' on' : ''))
      const idx = mk('span', null, '#' + i)
      idx.style.cssText = 'color:#8b5cf6;width:44px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;font-weight:600'
      r.appendChild(idx)
      const tp = mk('span', null, typeof v)
      tp.style.cssText = 'color:#059669;width:64px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      r.appendChild(tp)
      const wc = mk('span', null, (sg.writeCount ? sg.writeCount() : m.writes.length) + 'w')
      wc.style.cssText = 'color:#b06000;width:42px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      r.appendChild(wc)
      const val = mk('span', null, fmtVal(v))
      val.style.cssText = 'color:#c5221f;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;flex:1'
      r.appendChild(val)
      r.onclick = () => { S._selSig = { i, s: sg }; renderSignalDetail(sg, i) }
      mainEl.appendChild(r)
    }
  }

  function renderSignalDetail(sg, i) {
    mainEl.innerHTML = ''
    const back = mk('div', '__xd_back__')
    back.innerHTML = SVG.back
    back.appendChild(document.createTextNode('返回列表'))
    back.onclick = () => { S._selSig = null; renderBody() }
    mainEl.appendChild(back)

    let v
    try { v = sg() } catch (e) { v = '<err>' }
    const m = S.sigMeta.get(sg) || { createdAt: Date.now(), writes: [] }

    const dh = mk('div', '__xd_dhead__')
    const h = mk('div', '__xd_durl__')
    const b1 = mk('span', '__xd_tag__ get'); b1.textContent = '#' + i
    const b2 = mk('span', '__xd_tag__ s2'); b2.textContent = typeof v
    const cn = mk('span', 'u', ' Signal')
    h.appendChild(b1); h.appendChild(b2); h.appendChild(cn)
    dh.appendChild(h)
    const meta = mk('div', '__xd_dmeta__')
    const am = (k, val) => { const x = mk('span'); x.appendChild(mk('b', null, k + ' ')); x.appendChild(document.createTextNode(val)); meta.appendChild(x) }
    am('订阅', sg.subsCount ? sg.subsCount() : '—')
    am('写入', sg.writeCount ? sg.writeCount() : m.writes.length)
    am('创建', fmtTime(m.createdAt))
    dh.appendChild(meta)
    mainEl.appendChild(dh)

    mainEl.appendChild(mk('div', '__xd_dsec__', '当前值'))
    const wrap = mk('div')
    wrap.style.cssText = 'position:relative;margin:0 16px 16px'
    const code = mk('div', '__xd_code__')
    code.style.margin = '0'
    let pretty
    if (typeof v === 'object' && v !== null) { try { pretty = JSON.stringify(v, null, 2) } catch (e) { pretty = String(v) } }
    else if (typeof v === 'string') { try { pretty = JSON.stringify(JSON.parse(v), null, 2) } catch (e) { pretty = v } }
    else pretty = String(v)
    code.textContent = pretty
    wrap.appendChild(code)
    addCopy(wrap, typeof v === 'string' ? v : JSON.stringify(v))
    mainEl.appendChild(wrap)

    if (m.writes.length) {
      mainEl.appendChild(mk('div', '__xd_dsec__', '写入历史（最近 ' + Math.min(m.writes.length, 30) + ' 条）'))
      const list = mk('div', '__xd_dkv__')
      const ws = m.writes.slice(-30).reverse()
      for (const w of ws) {
        const r = mk('div', 'r')
        r.appendChild(mk('div', 'k', fmtTime(w.t)))
        const vv = mk('div', 'v')
        vv.textContent = fmtVal(w.from) + '  →  ' + fmtVal(w.to)
        r.appendChild(vv)
        list.appendChild(r)
      }
      mainEl.appendChild(list)
    }
  }

`
s = s.slice(0, i1) + newRender + s.slice(i2)
writeFileSync(p, s)
console.log("Signals 详情页完成")
