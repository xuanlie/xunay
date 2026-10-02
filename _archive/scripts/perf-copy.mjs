import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.perfcopy", s)

const anchor = "    section('核心指标')"
if (!s.includes(anchor)) throw new Error("未找到核心指标锚点")

const toolbar = `    // 顶部工具条：复制 JSON
    const topBar = mk('div')
    topBar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 16px 4px;gap:10px'
    const tl = mk('div', null, '性能数据')
    tl.style.cssText = 'color:#5f6368;font-size:11px;text-transform:uppercase;letter-spacing:.6px;font-weight:700'
    topBar.appendChild(tl)
    const copyBtn = mk('button')
    copyBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#8b5cf6;color:#fff;border:0;border-radius:6px;cursor:pointer;font:inherit;font-size:12px;font-family:inherit;font-weight:600;transition:background .15s'
    copyBtn.innerHTML = SVG.copy + '<span>复制 JSON</span>'
    copyBtn.onmouseenter = () => { copyBtn.style.background = '#7c3aed' }
    copyBtn.onmouseleave = () => { copyBtn.style.background = '#8b5cf6' }
    copyBtn.onclick = () => {
      const payload = {
        capturedAt: new Date().toISOString(),
        url: location.href,
        ua: navigator.userAgent,
        core: {
          fcp: m.fcp || null,
          lcp: m.lcp || null,
          domReady: m.domReady || null,
          load: m.load || null
        },
        stages: {
          dns: m.dns || 0,
          tcp: m.tcp || 0,
          ttfb: m.ttfb || 0,
          download: m.download || 0,
          domParse: m.domParse || 0
        },
        runtime: {
          jsHeap: m.jsHeap || null,
          jsHeapLimit: m.jsHeapLimit || null,
          domNodes: m.domNodes || null,
          resources: m.resources || null
        },
        longTasks: S.longTasks.map(t => ({ start: Math.round(t.start * 100) / 100, duration: Math.round(t.duration * 100) / 100 })),
        requests: S.nets.map(n => ({
          url: n.url, method: n.method,
          status: n.status, duration: Math.round(n.duration * 100) / 100,
          size: n.size, error: n.error || null
        })),
        signals: S.signals.map((sg, i) => {
          let v
          try { v = sg() } catch (e) { v = '<err>' }
          return {
            index: i,
            type: typeof v,
            value: typeof v === 'object' ? v : String(v),
            writes: sg.writeCount ? sg.writeCount() : 0,
            subs: sg.subsCount ? sg.subsCount() : 0
          }
        })
      }
      const json = JSON.stringify(payload, null, 2)
      const done = () => {
        copyBtn.style.background = '#137333'
        copyBtn.innerHTML = SVG.check + '<span>已复制</span>'
        setTimeout(() => {
          copyBtn.style.background = '#8b5cf6'
          copyBtn.innerHTML = SVG.copy + '<span>复制 JSON</span>'
        }, 1400)
      }
      const fallback = () => {
        try {
          const ta = document.createElement('textarea')
          ta.value = json
          ta.style.cssText = 'position:fixed;left:-9999px'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          ta.remove()
          done()
        } catch (e) { console.error('[devtools] 复制失败', e) }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(done).catch(fallback)
      } else {
        fallback()
      }
    }
    topBar.appendChild(copyBtn)
    mainEl.appendChild(topBar)

    section('核心指标')`

s = s.replace(anchor, toolbar)
writeFileSync(p, s)
console.log("复制按钮完成")
