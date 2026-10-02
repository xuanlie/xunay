import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.netacts", s)

const from = `    if (n.error) {
      d.appendChild(mk('div', '__xd_dsec__', '错误'))
      d.appendChild(mk('div', '__xd_code__', n.error))
    }

    mainEl.appendChild(d)`

if (!s.includes(from)) { console.log("未命中 netDetail 结尾"); process.exit(1) }

const to = `    if (n.error) {
      d.appendChild(mk('div', '__xd_dsec__', '错误'))
      d.appendChild(mk('div', '__xd_code__', n.error))
    }

    d.appendChild(mk('div', '__xd_dsec__', '快捷操作'))
    const acts = mk('div')
    acts.style.cssText = 'display:flex;gap:8px;padding:0 16px 16px;flex-wrap:wrap'
    const mkAct = (label, text) => {
      const b = mk('button')
      b.textContent = label
      b.style.cssText = 'padding:8px 14px;background:#fff;border:1px solid #dadce0;color:#202124;border-radius:6px;cursor:pointer;font:inherit;font-size:12px;font-family:inherit;transition:background .15s,color .15s,border-color .15s'
      b.onmouseenter = () => { b.style.background = '#f5f3ff'; b.style.borderColor = '#c4b5fd' }
      b.onmouseleave = () => { b.style.background = '#fff'; b.style.borderColor = '#dadce0' }
      b.onclick = () => {
        try {
          navigator.clipboard.writeText(text)
          b.textContent = '已复制'
          b.style.color = '#137333'
          b.style.borderColor = '#137333'
          setTimeout(() => { b.textContent = label; b.style.color = ''; b.style.borderColor = '#dadce0' }, 1200)
        } catch (e) {}
      }
      return b
    }
    const url = n.url
    const method = n.method
    const reqBody = n.reqBody
    const reqH = n.reqHeaders || {}
    const curlParts = ["curl -X " + method + " '" + url + "'"]
    for (const k in reqH) curlParts.push("  -H '" + k + ": " + reqH[k] + "'")
    if (reqBody) curlParts.push("  -d '" + reqBody.replace(/'/g, "'\\\\''") + "'")
    const curl = curlParts.join(" \\\\\\n")
    const fetchLines = ["fetch('" + url + "', {", "  method: '" + method + "'"]
    if (Object.keys(reqH).length) fetchLines.push("  headers: " + JSON.stringify(reqH, null, 2).replace(/\\n/g, "\\n  "))
    if (reqBody) fetchLines.push("  body: " + JSON.stringify(reqBody))
    fetchLines.push("}).then(r => r.json()).then(console.log)")
    const fetchCode = fetchLines.join("\\n")
    let resText = n.resBody || ''
    try { resText = JSON.stringify(JSON.parse(resText), null, 2) } catch (e) {}

    acts.appendChild(mkAct('复制 URL', url))
    acts.appendChild(mkAct('复制为 cURL', curl))
    acts.appendChild(mkAct('复制为 fetch', fetchCode))
    if (resText) acts.appendChild(mkAct('复制响应体', resText))
    if (reqBody) acts.appendChild(mkAct('复制请求体', reqBody))
    d.appendChild(acts)

    mainEl.appendChild(d)`

s = s.replace(from, to)
writeFileSync(p, s)
console.log("网络快捷操作完成")
