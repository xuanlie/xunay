import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.sigv2", s)

const startMark = "  function renderSignals() {"
const endMark = "  function collectPerf() {"
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark, i1 + startMark.length)
if (i1 < 0 || i2 < 0) throw new Error("未找到 renderSignals 段")

const newFn = `  let _sigFilter = ''

  function renderSignals() {
    // 顶部：过滤栏
    const bar = mk('div')
    bar.style.cssText = 'display:flex;gap:8px;padding:8px 16px;background:#f8f9fa;border-bottom:1px solid #dadce0;position:sticky;top:0;z-index:4;align-items:center'
    const fw = mk('div')
    fw.style.cssText = 'position:relative;display:flex;align-items:center;flex:1'
    fw.innerHTML = SVG.filter
    const fi = mk('input')
    fi.placeholder = '过滤 signal（值/类型/序号）…'
    fi.value = _sigFilter
    fi.style.cssText = 'flex:1;height:32px;padding:0 12px 0 32px;background:#fff;border:1px solid #dadce0;color:#202124;border-radius:8px;font:inherit;font-size:12.5px;outline:none;font-family:inherit'
    fi.onfocus = () => { fi.style.borderColor = '#8b5cf6'; fi.style.boxShadow = '0 0 0 3px rgba(139,92,246,.12)' }
    fi.onblur = () => { fi.style.borderColor = '#dadce0'; fi.style.boxShadow = 'none' }
    fi.oninput = () => { _sigFilter = fi.value; renderBody() }
    fw.appendChild(fi)
    bar.appendChild(fw)

    const copyAllBtn = mk('button')
    copyAllBtn.innerHTML = SVG.copy
    copyAllBtn.title = '复制全部 signal'
    copyAllBtn.style.cssText = 'height:32px;min-width:36px;padding:0 10px;background:#fff;border:1px solid #dadce0;color:#5f6368;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .15s,color .15s,border-color .15s'
    copyAllBtn.onmouseenter = () => { copyAllBtn.style.background = '#f5f3ff'; copyAllBtn.style.borderColor = '#c4b5fd'; copyAllBtn.style.color = '#8b5cf6' }
    copyAllBtn.onmouseleave = () => { copyAllBtn.style.background = '#fff'; copyAllBtn.style.borderColor = '#dadce0'; copyAllBtn.style.color = '#5f6368' }
    copyAllBtn.onclick = () => {
      const snapshot = S.signals.map((sg, i) => {
        let v
        try { v = sg() } catch (e) { v = '<err>' }
        return {
          index: i,
          type: typeof v,
          value: v,
          writes: sg.writeCount ? sg.writeCount() : 0,
          subs: sg.subsCount ? sg.subsCount() : 0
        }
      })
      copyText(JSON.stringify(snapshot, null, 2))
      copyAllBtn.innerHTML = SVG.check
      copyAllBtn.style.background = '#e6f4ea'
      copyAllBtn.style.borderColor = '#137333'
      copyAllBtn.style.color = '#137333'
      setTimeout(() => {
        copyAllBtn.innerHTML = SVG.copy
        copyAllBtn.style.background = '#fff'
        copyAllBtn.style.borderColor = '#dadce0'
        copyAllBtn.style.color = '#5f6368'
      }, 1200)
    }
    bar.appendChild(copyAllBtn)

    const stat = mk('span')
    const total = S.signals.length
    const f = _sigFilter.toLowerCase()
    const filtered = f ? S.signals.filter((sg, i) => {
      let v
      try { v = sg() } catch (e) { v = '' }
      const hay = ('#' + i + ' ' + typeof v + ' ' + (typeof v === 'string' ? v : JSON.stringify(v))).toLowerCase()
      return hay.includes(f)
    }).length : total
    stat.textContent = f ? (filtered + ' / ' + total) : (total + ' 个')
    stat.style.cssText = 'color:#9aa0a6;font-size:11px;font-family:ui-monospace,Consolas,monospace;white-space:nowrap'
    bar.appendChild(stat)
    mainEl.appendChild(bar)

    if (!S.signals.length) {
      const emp = mk('div', '__xd_empty__')
      emp.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
      emp.appendChild(document.createTextNode('还没有 signal'))
      return mainEl.appendChild(emp)
    }

    const fLower = _sigFilter.toLowerCase()
    let shown = 0
    for (let i = 0; i < S.signals.length; i++) {
      const sg = S.signals[i]
      let v
      try { v = sg() } catch (e) { v = '<err>' }
      const vs = typeof v === 'string' ? v : (typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v))
      const hay = ('#' + i + ' ' + typeof v + ' ' + vs).toLowerCase()
      if (fLower && !hay.includes(fLower)) continue
      shown++

      const m = S.sigMeta.get(sg) || { writes: [] }
      const writes = sg.writeCount ? sg.writeCount() : m.writes.length
      const subs = sg.subsCount ? sg.subsCount() : 0
      const on = S._selSig && S._selSig.i === i
      const r = mk('div', '__xd_row__' + (on ? ' on' : ''))

      const idx = mk('span', null, '#' + i)
      idx.style.cssText = 'color:#8b5cf6;width:52px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;font-weight:600'
      r.appendChild(idx)

      const tp = mk('span', null, typeof v)
      tp.style.cssText = 'color:#059669;width:64px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      r.appendChild(tp)

      const wc = mk('span', null, writes + 'w')
      wc.style.cssText = 'color:#b06000;width:48px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      wc.title = writes + ' 次写入'
      r.appendChild(wc)

      const sc = mk('span', null, subs + 's')
      sc.style.cssText = 'color:#5f6368;width:44px;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      sc.title = subs + ' 个订阅者'
      r.appendChild(sc)

      const val = mk('span', null, fmtVal(v))
      val.style.cssText = 'color:#c5221f;overflow:hidden;text-overflow:ellipsis;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;flex:1'
      r.appendChild(val)

      r.onclick = () => { S._selSig = { i, s: sg }; renderSignalDetail(sg, i) }
      mainEl.appendChild(r)
    }

    if (!shown && fLower) {
      mainEl.appendChild(mk('div', '__xd_empty__', '没有匹配的 signal'))
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
    const vs = typeof v === 'string' ? v : JSON.stringify(v)

    // ===== 头部 =====
    const dh = mk('div', '__xd_dhead__')
    const h = mk('div', '__xd_durl__')
    const b1 = mk('span', '__xd_tag__ get'); b1.textContent = '#' + i
    const b2 = mk('span', '__xd_tag__ s2'); b2.textContent = typeof v
    const cn = mk('span', 'u', ' Signal')
    h.appendChild(b1); h.appendChild(b2); h.appendChild(cn)
    dh.appendChild(h)

    const meta = mk('div', '__xd_dmeta__')
    const am = (k, val) => {
      const x = mk('span')
      x.appendChild(mk('b', null, k + ' '))
      x.appendChild(document.createTextNode(val))
      meta.appendChild(x)
    }
    am('订阅者', sg.subsCount ? sg.subsCount() : '—')
    am('写入', sg.writeCount ? sg.writeCount() : m.writes.length)
    am('创建', fmtTime(m.createdAt))
    am('类型', typeof v)
    dh.appendChild(meta)

    // 复制整个 signal
    const copyAllBtn = mk('button')
    copyAllBtn.style.cssText = 'margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#8b5cf6;color:#fff;border:0;border-radius:6px;cursor:pointer;font:inherit;font-size:12px;font-family:inherit;font-weight:600'
    copyAllBtn.innerHTML = SVG.copy + '<span>复制完整信息</span>'
    copyAllBtn.onclick = () => {
      const parts = []
      parts.push('Signal #' + i)
      parts.push('Type: ' + typeof v)
      parts.push('Subs: ' + (sg.subsCount ? sg.subsCount() : '—'))
      parts.push('Writes: ' + (sg.writeCount ? sg.writeCount() : m.writes.length))
      parts.push('Created: ' + fmtTime(m.createdAt))
      parts.push('')
      parts.push('--- 当前值 ---')
      parts.push(typeof v === 'string' ? v : JSON.stringify(v, null, 2))
      if (m.writes.length) {
        parts.push('')
        parts.push('--- 写入历史 ---')
        const ws = m.writes.slice(-30)
        for (const w of ws) {
          parts.push(fmtTime(w.t) + '  ' + fmtVal(w.from) + '  →  ' + fmtVal(w.to))
        }
      }
      copyText(parts.join('\\n'))
      copyAllBtn.style.background = '#137333'
      copyAllBtn.innerHTML = SVG.check + '<span>已复制</span>'
      setTimeout(() => {
        copyAllBtn.style.background = '#8b5cf6'
        copyAllBtn.innerHTML = SVG.copy + '<span>复制完整信息</span>'
      }, 1400)
    }
    dh.appendChild(copyAllBtn)
    mainEl.appendChild(dh)

    // ===== 当前值 =====
    mainEl.appendChild(sectionHeader('当前值', typeof v === 'string' ? v : JSON.stringify(v, null, 2)))
    const code = mk('div', '__xd_code__')
    code.style.margin = '0 16px 16px'
    let pretty
    if (typeof v === 'object' && v !== null) {
      try { pretty = JSON.stringify(v, null, 2) } catch (e) { pretty = String(v) }
    } else if (typeof v === 'string') {
      try { pretty = JSON.stringify(JSON.parse(v), null, 2) } catch (e) { pretty = v }
    } else {
      pretty = String(v)
    }
    code.textContent = pretty
    mainEl.appendChild(code)

    // ===== 写入历史 =====
    if (m.writes.length) {
      mainEl.appendChild(sectionHeader('写入历史（最近 ' + Math.min(m.writes.length, 30) + ' 条）', JSON.stringify(m.writes.slice(-30), null, 2)))
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
    } else {
      mainEl.appendChild(sectionHeader('写入历史', ''))
      mainEl.appendChild(mk('div', '__xd_empty__', '还没有写入记录'))
    }
  }

`
s = s.slice(0, i1) + newFn + s.slice(i2)
writeFileSync(p, s)
console.log("Signals v2 完成")
