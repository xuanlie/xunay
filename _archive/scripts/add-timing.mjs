import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.timing", s)

// 1. fetch hook 里记录更多时间点
const from1 = `        const start = performance.now()
        const e = {
          url, method, start, status: 0, duration: 0,
          reqHeaders: (init && init.headers) || {},
          reqBody: init && init.body ? String(init.body) : '',
          resHeaders: {}, resBody: '', size: 0, error: null, endTime: 0
        }`
const to1 = `        const start = performance.now()
        const e = {
          url, method, start, status: 0, duration: 0,
          reqHeaders: (init && init.headers) || {},
          reqBody: init && init.body ? String(init.body) : '',
          resHeaders: {}, resBody: '', size: 0, error: null,
          endTime: 0, headersTime: 0, bodyTime: 0, ttfb: 0
        }`
if (!s.includes(from1)) throw new Error("1. fetch 字段未命中")
s = s.replace(from1, to1)

// 2. 响应到达时记录 headersTime
const from2 = `          e.status = r.status
          e.statusText = r.statusText || ''
          e.endTime = performance.now()
          e.duration = e.endTime - start
          try { r.headers.forEach((v, k) => { e.resHeaders[k] = v }) } catch (x) {}
          try {
            r.clone().text().then(t => {
              e.resBody = t.slice(0, 16000)
              e.size = t.length
              if (S.open && S._selNet === e) renderNetDetail(e)
            })
          } catch (x) {}`
const to2 = `          e.headersTime = performance.now()
          e.ttfb = e.headersTime - start
          e.status = r.status
          e.statusText = r.statusText || ''
          e.endTime = e.headersTime
          e.duration = e.endTime - start
          try { r.headers.forEach((v, k) => { e.resHeaders[k] = v }) } catch (x) {}
          try {
            r.clone().text().then(t => {
              e.resBody = t.slice(0, 16000)
              e.size = t.length
              e.bodyTime = performance.now()
              e.duration = e.bodyTime - start
              if (S.open && S._selNet === e) renderNetDetail(e)
            })
          } catch (x) {}`
if (!s.includes(from2)) throw new Error("2. 响应时间未命中")
s = s.replace(from2, to2)

writeFileSync(p, s)
console.log("fetch 计时字段完成")
