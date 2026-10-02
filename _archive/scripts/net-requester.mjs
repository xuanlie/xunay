import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/devpanel.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak5", s)

// ① renderNetwork 顶部加"新建请求"栏
s = s.replace(
  `function renderNetwork() {
  if (!nets.length) return mainEl.appendChild(el('div', 'xd-empty', '还没有请求'))
  for (let i = nets.length - 1; i >= 0; i--) {`,
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
  for (let i = nets.length - 1; i >= 0; i--) {`)

// ② 请求构造器 modal
s = s.replace(
  `/* ============ 详情面板 ============ */`,
  `/* ============ 请求构造器 ============ */
let reqModal = null

function openRequester() {
  if (reqModal) return
  reqModal = el('div')
  reqModal.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.6);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px'
  const card = el('div')
  card.style.cssText = 'background:#1f2126;border:1px solid #2c2f36;border-radius:10px;padding:16px;width:100%;max-width:520px;max-height:90%;overflow:auto;display:flex;flex-direction:column;gap:10px'
  reqModal.appendChild(card)

  const h = el('h3', null, '发起请求')
  h.style.cssText = 'margin:0;color:#79c0ff;font-size:14px'
  card.appendChild(h)

  const mRow = el('div')
  mRow.style.cssText = 'display:flex;gap:8px'
  const method = el('select', 'xd-input')
  method.style.cssText += ';min-width:90px'
  for (const m of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']) {
    const o = el('option', null, m); o.value = m; method.appendChild(o)
  }
  const url = el('input', 'xd-input')
  url.style.flex = '1'
  url.placeholder = 'https://… 或 /api/todos'
  url.value = (typeof location !== 'undefined' ? location.origin : '') + '/api/todos'
  mRow.appendChild(method); mRow.appendChild(url)
  card.appendChild(mRow)

  card.appendChild(mkField('请求头', 'headers', 'Content-Type: application/json'))
  card.appendChild(mkField('请求体', 'body', '{"key":"value"}', 'textarea'))

  const status = el('div')
  status.style.cssText = 'color:#8b949e;font-size:11px;min-height:16px'
  card.appendChild(status)

  const btns = el('div')
  btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end'
  const cancel = el('button', 'xd-btn', '取消')
  cancel.style.cssText += ';background:#21242b'
  cancel.onclick = () => { reqModal.remove(); reqModal = null }
  const send = el('button', 'xd-btn', '发送')
  send.style.cssText += ';background:#1f6feb;color:#fff;padding:0 16px'
  send.onclick = async () => {
    send.disabled = true
    status.textContent = '发送中…'
    const hdrs = parseHeaders(headersEl.value)
    const opts = { method: method.value, headers: hdrs }
    if (bodyEl.value && method.value !== 'GET' && method.value !== 'HEAD') opts.body = bodyEl.value
    try {
      const res = await fetch(url.value, opts)
      status.style.color = '#7ee787'
      status.textContent = '完成 ' + res.status + '，记录在下方'
      setTimeout(() => { if (reqModal) { reqModal.remove(); reqModal = null } renderMain() }, 500)
    } catch (e) {
      status.style.color = '#ff7b72'
      status.textContent = '失败: ' + e.message
      send.disabled = false
    }
  }
  btns.appendChild(cancel); btns.appendChild(send)
  card.appendChild(btns)

  let headersEl, bodyEl
  function mkField(label, kind, placeholder, type) {
    const wrap = el('div')
    const l = el('div', null, label)
    l.style.cssText = 'color:#8b949e;font-size:11px;margin-bottom:4px'
    wrap.appendChild(l)
    const input = type === 'textarea' ? el('textarea', 'xd-input') : el('input', 'xd-input')
    if (type === 'textarea') {
      input.style.cssText += ';height:80px;padding:8px;resize:vertical;font-family:inherit;width:100%'
    } else {
      input.style.width = '100%'
    }
    input.placeholder = placeholder
    wrap.appendChild(input)
    if (kind === 'headers') headersEl = input
    if (kind === 'body') bodyEl = input
    return wrap
  }

  rootEl.appendChild(reqModal)
  setTimeout(() => url.focus(), 50)
}

function parseHeaders(text) {
  const h = {}
  for (const line of (text || '').split('\\n')) {
    const i = line.indexOf(':')
    if (i < 0) continue
    h[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return h
}

/* ============ 详情面板 ============ */`)

// ③ close 时清 modal
s = s.replace(
  `  if (rootEl) { rootEl.remove(); rootEl = null }`,
  `  if (reqModal) { reqModal.remove(); reqModal = null }
  if (rootEl) { rootEl.remove(); rootEl = null }`)

writeFileSync(p, s)
console.log("网络请求构造器已加入")
