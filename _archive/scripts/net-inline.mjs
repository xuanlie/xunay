import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/devpanel.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak6", s)

// ① 把 renderNetwork 的"+ 发请求"按钮改成常驻表单
s = s.replace(
  `function renderNetwork() {
  // 顶部：主动发请求
  const bar = el('div')
  bar.style.cssText = 'display:flex;gap:6px;padding:8px 10px;border-bottom:1px solid #2c2f36;background:#1f2126;position:sticky;top:0;z-index:2'
  const plus = el('button', 'xd-btn', '+ 发请求')
  plus.style.cssText += ';background:#1f6feb;color:#fff;padding:0 12px;min-height:30px'
  plus.onclick = openRequester
  bar.appendChild(plus)
  const note = el('span', null, nets.length + ' 条记录')
  note.style.cssText = 'color:#6e7681;font-size:11px;margin-left:auto;align-self:center'
  bar.appendChild(note)
  mainEl.appendChild(bar)

  if (!nets.length) return mainEl.appendChild(el('div', 'xd-empty', '还没有请求，点「+ 发请求」测试'))
  for (let i = nets.length - 1; i >= 0; i--) {`,
  `let reqState = { method: 'GET', url: '/api/tree', headers: '', body: '', sending: false, lastResult: null, expanded: false }

function saveReqState() {
  try { localStorage.setItem('__xunay_devtools_req', JSON.stringify(reqState)) } catch {}
}
function loadReqState() {
  try { const s = localStorage.getItem('__xunay_devtools_req'); if (s) reqState = { ...reqState, ...JSON.parse(s), sending: false } } catch {}
}

function renderNetwork() {
  loadReqStateOnce()

  // 请求构造区
  const form = el('div')
  form.style.cssText = 'padding:10px;border-bottom:1px solid #2c2f36;background:#1f2126;position:sticky;top:0;z-index:2;display:flex;flex-direction:column;gap:6px'

  // 第一行：方法 + URL + 发送
  const row1 = el('div')
  row1.style.cssText = 'display:flex;gap:6px'
  const method = el('select', 'xd-input')
  method.style.cssText += ';min-width:82px;flex-shrink:0'
  for (const m of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']) {
    const o = el('option', null, m); o.value = m; method.appendChild(o)
  }
  method.value = reqState.method
  method.onchange = () => { reqState.method = method.value; saveReqState() }
  row1.appendChild(method)

  const url = el('input', 'xd-input')
  url.style.flex = '1'
  url.placeholder = '/api/todos 或 https://…'
  url.value = reqState.url
  url.oninput = () => { reqState.url = url.value; saveReqState() }
  url.onkeydown = e => { if (e.key === 'Enter') doSend() }
  row1.appendChild(url)

  const send = el('button', 'xd-btn', reqState.sending ? '…' : '发送')
  send.style.cssText += ';background:#1f6feb;color:#fff;padding:0 14px;flex-shrink:0;min-height:26px'
  send.disabled = reqState.sending
  send.onclick = doSend
  row1.appendChild(send)
  form.appendChild(row1)

  // 第二行：展开/收起高级
  const row2 = el('div')
  row2.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:11px;color:#8b949e;cursor:pointer;user-select:none'
  row2.textContent = (reqState.expanded ? '▾' : '▸') + ' 请求头 / 请求体'
  row2.onclick = () => { reqState.expanded = !reqState.expanded; saveReqState(); renderMain() }
  form.appendChild(row2)

  // 高级区
  if (reqState.expanded) {
    const hdrs = el('textarea', 'xd-input')
    hdrs.placeholder = 'Content-Type: application/json\\nAuthorization: Bearer xxx'
    hdrs.value = reqState.headers
    hdrs.style.cssText += ';height:52px;padding:6px 8px;resize:vertical;font-family:inherit;width:100%'
    hdrs.oninput = () => { reqState.headers = hdrs.value; saveReqState() }
    form.appendChild(hdrs)

    if (reqState.method !== 'GET' && reqState.method !== 'HEAD') {
      const body = el('textarea', 'xd-input')
      body.placeholder = '{"title":"hello"}'
      body.value = reqState.body
      body.style.cssText += ';height:64px;padding:6px 8px;resize:vertical;font-family:inherit;width:100%'
      body.oninput = () => { reqState.body = body.value; saveReqState() }
      form.appendChild(body)
    }
  }

  // 结果提示
  if (reqState.lastResult) {
    const lr = reqState.lastResult
    const r = el('div')
    r.style.cssText = 'display:flex;gap:8px;align-items:center;padding:6px 8px;background:#0f1115;border-radius:6px;font-size:11px'
    const cls = lr.ok ? '#7ee787' : '#ff7b72'
    r.innerHTML = '<span style="color:' + cls + ';font-weight:600">' + (lr.status || 'ERR') + '</span>' +
      '<span style="color:#8b949e">' + fmtMs(lr.duration) + '</span>' +
      '<span style="color:#6e7681;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">' + esc(lr.preview || '') + '</span>'
    form.appendChild(r)
  }

  mainEl.appendChild(form)

  // 请求记录列表
  if (!nets.length) {
    const empty = el('div', 'xd-empty', '还没有请求，上面输入 URL 点发送')
    mainEl.appendChild(empty)
    return
  }

  for (let i = nets.length - 1; i >= 0; i--) {`)

// ② 加 doSend 函数 + 状态加载
s = s.replace(
  `/* ============ 请求构造器 ============ */`,
  `/* ============ 请求发送 ============ */
let __reqLoaded = false
function loadReqStateOnce() {
  if (__reqLoaded) return
  __reqLoaded = true
  try {
    const s = localStorage.getItem('__xunay_devtools_req')
    if (s) { const parsed = JSON.parse(s); reqState = { ...reqState, ...parsed, sending: false, lastResult: null } }
  } catch {}
}

async function doSend() {
  if (reqState.sending) return
  const url = reqState.url.trim()
  if (!url) return
  reqState.sending = true
  reqState.lastResult = null
  renderMain()

  const headers = {}
  for (const line of (reqState.headers || '').split('\\n')) {
    const i = line.indexOf(':')
    if (i < 0) continue
    headers[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  const opts = { method: reqState.method, headers }
  if (reqState.body && reqState.method !== 'GET' && reqState.method !== 'HEAD') opts.body = reqState.body

  const t0 = performance.now()
  try {
    const res = await fetch(url, opts)
    const dt = performance.now() - t0
    let preview = ''
    try {
      const clone = res.clone()
      const txt = await clone.text()
      preview = txt.length > 120 ? txt.slice(0, 120) + '…' : txt
    } catch {}
    reqState.lastResult = { ok: res.ok, status: res.status + ' ' + res.statusText, duration: dt, preview }
  } catch (e) {
    const dt = performance.now() - t0
    reqState.lastResult = { ok: false, status: 'ERR', duration: dt, preview: String(e.message || e) }
  } finally {
    reqState.sending = false
    saveReqState()
    renderMain()
  }
}

/* ============ 请求构造器 ============ */`)

// ③ 删掉旧的 modal openRequester 调用（不再需要）
s = s.replace(
  `  const plus = el('button', 'xd-btn', '+ 发请求')
  plus.style.cssText += ';background:#1f6feb;color:#fff;padding:0 12px;min-height:30px'
  plus.onclick = openRequester`,
  `  const plus = el('button', 'xd-btn', '+ 发请求')
  plus.style.cssText += ';background:#1f6feb;color:#fff;padding:0 12px;min-height:30px'
  plus.onclick = () => {}`)

writeFileSync(p, s)
console.log("网络请求区已内嵌")
