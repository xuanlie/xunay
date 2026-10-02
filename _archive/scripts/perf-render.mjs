import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.perfrender", s)

const anchor = "    else if (S.tab === 'console') renderConsole()"
if (!s.includes(anchor)) throw new Error("4. 未找到 renderBody 分发")
s = s.replace(anchor, anchor + "\n    else if (S.tab === 'perf') renderPerf()")

const insertAnchor = "  function renderConsole() {"
if (!s.includes(insertAnchor)) throw new Error("5. 未找到 renderConsole")

const perfCode = `  function collectPerf() {
    const m = {}
    try {
      const nav = performance.getEntriesByType('navigation')[0]
      if (nav) {
        m.dns = nav.domainLookupEnd - nav.domainLookupStart
        m.tcp = nav.connectEnd - nav.connectStart
        m.ttfb = nav.responseStart - nav.requestStart
        m.download = nav.responseEnd - nav.responseStart
        m.domParse = nav.domInteractive - nav.responseEnd
        m.domReady = nav.domContentLoadedEventEnd - nav.startTime
        m.load = nav.loadEventEnd - nav.startTime
        m.total = nav.duration
      }
    } catch (e) {}
    try {
      const paints = performance.getEntriesByType('paint')
      for (const p of paints) {
        if (p.name === 'first-paint') m.fp = p.startTime
        if (p.name === 'first-contentful-paint') m.fcp = p.startTime
      }
    } catch (e) {}
    try {
      const lcp = performance.getEntriesByType('largest-contentful-paint')
      if (lcp.length) m.lcp = lcp[lcp.length - 1].startTime
    } catch (e) {}
    try {
      if (performance.memory) {
        m.jsHeap = performance.memory.usedJSHeapSize
        m.jsHeapLimit = performance.memory.jsHeapSizeLimit
      }
    } catch (e) {}
    try {
      m.domNodes = document.getElementsByTagName('*').length
      m.resources = performance.getEntriesByType('resource').length
    } catch (e) {}
    return m
  }

  function renderPerf() {
    try {
      if (!S._perfObserver && window.PerformanceObserver) {
        S._perfObserver = true
        const obs = new PerformanceObserver(list => {
          for (const e of list.getEntries()) {
            S.longTasks.push({ start: e.startTime, duration: e.duration })
            if (S.longTasks.length > 50) S.longTasks.shift()
          }
        })
        obs.observe({ entryTypes: ['longtask'] })
      }
    } catch (e) {}
    S.perfMetrics = collectPerf()
    const m = S.perfMetrics

    const section = (title) => mainEl.appendChild(mk('div', '__xd_dsec__', title))
    const grid = (pairs) => {
      const g = mk('div')
      g.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px 16px'
      for (const p of pairs) {
        const c = mk('div')
        c.style.cssText = 'background:#f8f9fa;border:1px solid #dadce0;border-radius:10px;padding:12px 14px'
        const kk = mk('div', null, p[0])
        kk.style.cssText = 'color:#5f6368;font-size:11px;margin-bottom:4px'
        const vv = mk('div', null, p[1])
        vv.style.cssText = 'color:#202124;font-size:18px;font-weight:600;font-family:ui-monospace,Consolas,monospace;letter-spacing:-.5px'
        c.appendChild(kk); c.appendChild(vv)
        if (p[2]) {
          const hh = mk('div', null, p[2])
          hh.style.cssText = 'color:#9aa0a6;font-size:10.5px;margin-top:3px'
          c.appendChild(hh)
        }
        g.appendChild(c)
      }
      mainEl.appendChild(g)
    }

    section('核心指标')
    grid([
      ['FCP 首次内容绘制', m.fcp ? fmtMs(m.fcp) : '—', '页面第一个内容出现'],
      ['LCP 最大内容绘制', m.lcp ? fmtMs(m.lcp) : '（刷新后采集）', '页面最大元素完成'],
      ['DOM Ready', m.domReady ? fmtMs(m.domReady) : '—', 'DOM 解析完成'],
      ['Load 完全加载', m.load ? fmtMs(m.load) : '—', '所有资源加载完']
    ])

    section('请求分解')
    const bar = mk('div')
    bar.style.cssText = 'display:flex;height:10px;border-radius:5px;overflow:hidden;background:#f1f3f4;margin:0 16px 12px'
    const stages = [
      ['DNS', m.dns || 0, '#8b5cf6'],
      ['TCP', m.tcp || 0, '#a78bfa'],
      ['TTFB', m.ttfb || 0, '#c4b5fd'],
      ['下载', m.download || 0, '#059669'],
      ['DOM 解析', m.domParse || 0, '#34a853']
    ]
    let totalStage = 0
    for (const st of stages) totalStage += st[1]
    if (totalStage <= 0) totalStage = 1
    for (const st of stages) {
      if (st[1] <= 0) continue
      const seg = mk('div')
      seg.style.cssText = 'height:100%;background:' + st[2]
      seg.style.width = (st[1] / totalStage * 100) + '%'
      seg.title = st[0] + ': ' + fmtMs(st[1])
      bar.appendChild(seg)
    }
    mainEl.appendChild(bar)

    const legend = mk('div')
    legend.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;padding:0 16px 16px;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;color:#5f6368'
    for (const st of stages) {
      if (st[1] <= 0) continue
      const r = mk('div')
      r.style.cssText = 'display:flex;justify-content:space-between;gap:10px'
      const l = mk('span')
      l.style.cssText = 'display:inline-flex;align-items:center;gap:6px'
      const d = mk('span')
      d.style.cssText = 'width:8px;height:8px;border-radius:2px;background:' + st[2]
      l.appendChild(d); l.appendChild(document.createTextNode(st[0]))
      const v = mk('span', null, fmtMs(st[1]))
      v.style.cssText = 'color:#202124;font-weight:600'
      r.appendChild(l); r.appendChild(v)
      legend.appendChild(r)
    }
    mainEl.appendChild(legend)

    section('运行时')
    grid([
      ['JS 堆内存', m.jsHeap ? fmtBytes(m.jsHeap) : '—', m.jsHeapLimit ? '上限 ' + fmtBytes(m.jsHeapLimit) : ''],
      ['DOM 节点数', String(m.domNodes || '—'), ''],
      ['资源数', String(m.resources || '—'), ''],
      ['长任务数', String(S.longTasks.length), S.longTasks.length ? '最慢 ' + fmtMs(Math.max.apply(null, S.longTasks.map(function(t){return t.duration}))) : '无阻塞']
    ])

    if (S.longTasks.length) {
      section('长任务（>50ms）')
      const list = mk('div', '__xd_dkv__')
      const sorted = S.longTasks.slice().sort(function(a,b){return b.duration - a.duration}).slice(0, 20)
      for (const t of sorted) {
        const r = mk('div', 'r')
        r.appendChild(mk('div', 'k', fmtMs(t.start) + ' 时刻'))
        const vv = mk('div', 'v', fmtMs(t.duration))
        vv.style.color = t.duration > 200 ? '#c5221f' : t.duration > 100 ? '#b06000' : '#202124'
        r.appendChild(vv)
        list.appendChild(r)
      }
      mainEl.appendChild(list)
    }
  }

`
s = s.replace(insertAnchor, perfCode + insertAnchor)
writeFileSync(p, s)
console.log("性能面板完成")
