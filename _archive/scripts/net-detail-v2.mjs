import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.netdetail2", s)

const startMark = "  function renderNetDetail(n) {"
const endMark = "  function addCopy(container, text) {"
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark, i1 + startMark.length)
if (i1 < 0 || i2 < 0) throw new Error("未找到 renderNetDetail")

const newFn = `  let _netTab = 'overview'

  function sectionHeader(title, copyText) {
    const h = mk('div', '__xd_dsec__', title)
    h.style.display = 'flex'
    h.style.alignItems = 'center'
    h.style.justifyContent = 'space-between'
    h.style.paddingRight = '16px'
    const btn = mk('button')
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:transparent;border:1px solid #dadce0;color:#5f6368;border-radius:6px;cursor:pointer;font:inherit;font-size:11px;font-family:inherit;transition:background .15s,color .15s,border-color .15s;text-transform:none;letter-spacing:0'
    btn.innerHTML = SVG.copy + '<span>复制</span>'
    btn.onmouseenter = () => { btn.style.background = '#f5f3ff'; btn.style.borderColor = '#c4b5fd'; btn.style.color = '#8b5cf6' }
    btn.onmouseleave = () => { btn.style.background = 'transparent'; btn.style.borderColor = '#dadce0'; btn.style.color = '#5f6368' }
    btn.onclick = e => {
      e.stopPropagation()
      copyText(String(copyText == null ? '' : copyText))
      btn.innerHTML = SVG.check + '<span>已复制</span>'
      btn.style.background = '#e6f4ea'
      btn.style.borderColor = '#137333'
      btn.style.color = '#137333'
      setTimeout(() => {
        btn.innerHTML = SVG.copy + '<span>复制</span>'
        btn.style.background = 'transparent'
        btn.style.borderColor = '#dadce0'
        btn.style.color = '#5f6368'
      }, 1200)
    }
    h.appendChild(btn)
    return h
  }

  function copyText(text) {
    const doCopy = () => {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;left:-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      } catch (e) { console.error('copy failed', e) }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(doCopy)
    }
    doCopy()
  }

  function headersToText(h) {
    const lines = []
    for (const k in h) lines.push(k + ': ' + h[k])
    return lines.join('\\n')
  }

  function prettyBody(text) {
    if (!text) return ''
    try { return JSON.stringify(JSON.parse(text), null, 2) } catch (e) { return text }
  }

  function renderNetDetail(n) {
    mainEl.innerHTML = ''
    const back = mk('div', '__xd_back__')
    back.innerHTML = SVG.back
    back.appendChild(document.createTextNode('返回列表'))
    back.onclick = () => { S._selNet = null; renderBody() }
    mainEl.appendChild(back)

    // ===== 头部 =====
    const dh = mk('div', '__xd_dhead__')
    const url = mk('div', '__xd_durl__')
    url.appendChild(mk('span', '__xd_tag__ ' + mCls(n.method), n.method))
    url.appendChild(mk('span', '__xd_tag__ ' + sCls(n.status), n.status ? String(n.status) + ' ' + (n.statusText || '') : (n.error ? 'ERROR' : '进行中')))
    const urlText = mk('span', 'u', n.url)
    url.appendChild(urlText)
    dh.appendChild(url)

    const meta = mk('div', '__xd_dmeta__')
    const am = (k, v) => {
      const x = mk('span')
      x.appendChild(mk('b', null, k + ' '))
      x.appendChild(document.createTextNode(v))
      meta.appendChild(x)
    }
    am('耗时', fmtMs(n.duration))
    am('大小', n.size ? fmtBytes(n.size) : '—')
    am('类型', typeShort(n.resHeaders['content-type']))
    am('开始', fmtTime(n.start))
    dh.appendChild(meta)

    // 复制整个请求
    const copyAllBtn = mk('button')
    copyAllBtn.style.cssText = 'margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:#8b5cf6;color:#fff;border:0;border-radius:6px;cursor:pointer;font:inherit;font-size:12px;font-family:inherit;font-weight:600'
    copyAllBtn.innerHTML = SVG.copy + '<span>复制完整信息</span>'
    copyAllBtn.onclick = () => {
      const parts = []
      parts.push(n.method + ' ' + n.url)
      parts.push('Status: ' + (n.status || '—') + ' ' + (n.statusText || ''))
      parts.push('Duration: ' + fmtMs(n.duration))
      parts.push('Size: ' + (n.size ? fmtBytes(n.size) : '—'))
      parts.push('')
      parts.push('--- 请求头 ---')
      parts.push(headersToText(n.reqHeaders || {}))
      if (n.reqBody) { parts.push(''); parts.push('--- 请求体 ---'); parts.push(prettyBody(n.reqBody)) }
      parts.push('')
      parts.push('--- 响应头 ---')
      parts.push(headersToText(n.resHeaders || {}))
      if (n.resBody) { parts.push(''); parts.push('--- 响应体 ---'); parts.push(prettyBody(n.resBody)) }
      if (n.error) { parts.push(''); parts.push('--- 错误 ---'); parts.push(n.error) }
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

    // ===== 子 tab 导航 =====
    const subTabs = mk('div', '__xd_dtabs__')
    const tabs = [
      ['overview', '概览'],
      ['reqHeaders', '请求头'],
      ['reqBody', '请求体'],
      ['resHeaders', '响应头'],
      ['resBody', '响应体'],
      ['timing', '时间']
    ]
    for (const t of tabs) {
      const b = mk('button', _netTab === t[0] ? 'on' : '', t[1])
      b.onclick = () => { _netTab = t[0]; renderNetDetail(n) }
      subTabs.appendChild(b)
    }
    mainEl.appendChild(subTabs)

    // ===== 子 tab 内容 =====
    const body = mk('div')
    body.style.cssText = 'padding:4px 0 20px'
    mainEl.appendChild(body)

    if (_netTab === 'overview') {
      body.appendChild(sectionHeader('基本', ''))
      const kv = mk('div', '__xd_dkv__')
      const rows = [
        ['方法', n.method],
        ['URL', n.url],
        ['状态', n.status ? n.status + ' ' + (n.statusText || '') : (n.error ? '失败' : '进行中')],
        ['耗时', fmtMs(n.duration)],
        ['大小', n.size ? fmtBytes(n.size) : '—'],
        ['类型', n.resHeaders['content-type'] || '—'],
        ['开始时间', fmtTime(n.start)],
        ['结束时间', n.endTime ? fmtTime(n.endTime) : '—']
      ]
      for (const r of rows) {
        const row = mk('div', 'r')
        row.appendChild(mk('div', 'k', r[0]))
        row.appendChild(mk('div', 'v', r[1]))
        kv.appendChild(row)
      }
      body.appendChild(kv)
      if (n.error) {
        body.appendChild(sectionHeader('错误', n.error))
        body.appendChild(mk('div', '__xd_code__', n.error))
      }
    } else if (_netTab === 'reqHeaders') {
      const h = n.reqHeaders || {}
      const keys = Object.keys(h)
      body.appendChild(sectionHeader('请求头（' + keys.length + '）', headersToText(h)))
      if (!keys.length) {
        body.appendChild(mk('div', '__xd_empty__', '无请求头'))
      } else {
        const kv = mk('div', '__xd_dkv__')
        for (const k of keys) {
          const row = mk('div', 'r')
          row.appendChild(mk('div', 'k', k))
          row.appendChild(mk('div', 'v', String(h[k])))
          kv.appendChild(row)
        }
        body.appendChild(kv)
      }
    } else if (_netTab === 'reqBody') {
      if (!n.reqBody) {
        body.appendChild(mk('div', '__xd_empty__', '无请求体'))
      } else {
        const pretty = prettyBody(n.reqBody)
        body.appendChild(sectionHeader('请求体（' + n.reqBody.length + ' 字符）', n.reqBody))
        const code = mk('div', '__xd_code__')
        code.textContent = pretty
        body.appendChild(code)
      }
    } else if (_netTab === 'resHeaders') {
      const h = n.resHeaders || {}
      const keys = Object.keys(h)
      body.appendChild(sectionHeader('响应头（' + keys.length + '）', headersToText(h)))
      if (!keys.length) {
        body.appendChild(mk('div', '__xd_empty__', '无响应头'))
      } else {
        const kv = mk('div', '__xd_dkv__')
        for (const k of keys) {
          const row = mk('div', 'r')
          row.appendChild(mk('div', 'k', k))
          row.appendChild(mk('div', 'v', String(h[k])))
          kv.appendChild(row)
        }
        body.appendChild(kv)
      }
    } else if (_netTab === 'resBody') {
      if (!n.resBody) {
        body.appendChild(mk('div', '__xd_empty__', '无响应体'))
      } else {
        const pretty = prettyBody(n.resBody)
        body.appendChild(sectionHeader('响应体（' + n.resBody.length + ' 字符）', n.resBody))
        const code = mk('div', '__xd_code__')
        code.textContent = pretty.slice(0, 30000)
        body.appendChild(code)
      }
    } else if (_netTab === 'timing') {
      body.appendChild(sectionHeader('时间分解', ''))
      const total = n.duration || 0
      const ttfb = n.ttfb || total
      const download = Math.max(0, total - ttfb)
      const stages = [
        ['等待响应', ttfb, '#8b5cf6'],
        ['下载内容', download, '#059669']
      ]
      const totalStage = stages.reduce((a, x) => a + x[1], 0) || 1
      const bar = mk('div')
      bar.style.cssText = 'display:flex;height:12px;border-radius:6px;overflow:hidden;background:#f1f3f4;margin:0 16px 16px'
      for (const st of stages) {
        if (st[1] <= 0) continue
        const seg = mk('div')
        seg.style.cssText = 'height:100%;background:' + st[2]
        seg.style.width = (st[1] / totalStage * 100) + '%'
        bar.appendChild(seg)
      }
      body.appendChild(bar)
      const kv = mk('div', '__xd_dkv__')
      const timeRows = [
        ['请求开始', fmtTime(n.start)],
        ['等待响应（TTFB）', fmtMs(ttfb)],
        ['下载内容', fmtMs(download)],
        ['响应到达', n.endTime ? fmtTime(n.endTime) : '—'],
        ['总耗时', fmtMs(total)]
      ]
      for (const r of timeRows) {
        const row = mk('div', 'r')
        row.appendChild(mk('div', 'k', r[0]))
        row.appendChild(mk('div', 'v', r[1]))
        kv.appendChild(row)
      }
      body.appendChild(kv)
    }
  }

`
s = s.slice(0, i1) + newFn + s.slice(i2)
writeFileSync(p, s)
console.log("网络详情 v2 完成")
