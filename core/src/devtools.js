// XuNay DevTools · 白灰 + 动画版
(function () {
  'use strict'
  if (typeof window === 'undefined') return
  if (window.__XD__) return

  var XD = window.__XD__ = {
    open: false, tab: 'elements',
    nets: [], logs: [], signals: [],
    sigMeta: new WeakMap(),
    longTasks: [],
    _lcp: 0,
    _collapsed: new WeakSet(),
    _prevVals: new WeakMap()
  }

  var isMobile = function () { return window.innerWidth < 768 }
  var _id = 0
  function uid() { return '_xd' + (++_id) }

  function h(tag, attrs, children) {
    var e = document.createElement(tag)
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k]
      else if (k === 'style') e.style.cssText = attrs[k]
      else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k])
      else e.setAttribute(k, attrs[k])
    }
    if (children != null) {
      if (Array.isArray(children)) children.forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c) })
      else if (typeof children === 'string') e.textContent = children
      else e.appendChild(children)
    }
    return e
  }

  function svg(path, size) {
    size = size || 16
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    s.setAttribute('viewBox', '0 0 24 24')
    s.setAttribute('width', size)
    s.setAttribute('height', size)
    s.setAttribute('fill', 'none')
    s.setAttribute('stroke', 'currentColor')
    s.setAttribute('stroke-width', '2')
    s.setAttribute('stroke-linecap', 'round')
    s.setAttribute('stroke-linejoin', 'round')
    s.innerHTML = path
    return s
  }

  var ICONS = {
    dev: '<polyline points="8 8 4 12 8 16"/><polyline points="16 8 20 12 16 16"/><line x1="14" y1="6" x2="10" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    element: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    net: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
    signal: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    perf: '<path d="M12 20V10M18 20V4M6 20v-4"/>'
  }

  function fmt(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v === 'string') return v
    if (typeof v === 'function') return 'ƒ ' + (v.name || '')
    try { return JSON.stringify(v) } catch (e) { return String(v) }
  }
  function fmtShort(v) {
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v === 'string') return '"' + (v.length > 40 ? v.slice(0, 40) + '…' : v) + '"'
    if (typeof v === 'number') return String(v)
    if (typeof v === 'boolean') return String(v)
    if (typeof v === 'function') return 'ƒ ' + (v.name || '')
    if (Array.isArray(v)) return 'Array(' + v.length + ')'
    if (typeof v === 'object') { var s = JSON.stringify(v); return s.length > 50 ? s.slice(0, 50) + '…' : s }
    return String(v)
  }
  function typeOf(v) {
    if (v === null) return 'null'
    if (Array.isArray(v)) return 'array'
    return typeof v
  }
  function fmtMs(ms) {
    if (ms == null) return '—'
    if (ms < 1) return (ms * 1000).toFixed(0) + 'µs'
    if (ms < 1000) return ms.toFixed(0) + 'ms'
    return (ms / 1000).toFixed(2) + 's'
  }
  function fmtBytes(n) {
    if (!n) return '—'
    if (n < 1024) return n + 'B'
    if (n < 1048576) return (n / 1024).toFixed(1) + 'KB'
    return (n / 1048576).toFixed(2) + 'MB'
  }
  function fmtTime(t) {
    if (!t) return '—'
    var d = new Date(t)
    var p = function (n) { return String(n).padStart(2, '0') }
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds())
  }
  function methodClass(m) {
    if (m === 'POST') return 'post'
    if (m === 'PUT' || m === 'PATCH') return 'put'
    if (m === 'DELETE') return 'del'
    return 'get'
  }
  function statusClass(c) {
    if (!c) return 'pending'
    if (c < 300) return 's2'
    if (c < 400) return 's3'
    if (c < 500) return 's4'
    return 's5'
  }
  function copy(text) {
    var fb = function () {
      try {
        var ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;left:-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      } catch (e) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(fb)
    fb()
  }
  function searchBar(placeholder, onInput, initial) {
    var wrap = h('div', { class: 'xd-search' })
    var icon = svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 13)
    wrap.appendChild(icon)
    var inp = h('input', { class: 'xd-search-input', placeholder: placeholder })
    inp.value = initial || ''
    inp.oninput = function () { onInput(inp.value) }
    wrap.appendChild(inp)
    return { el: wrap, input: inp }
  }

  function copyBtn(getText, label) {
    var hasLabel = label !== ''
    var b = h('button', { class: 'xd-copy' + (hasLabel ? ' xd-copy-lg' : ''), type: 'button', title: hasLabel ? '' : '复制' })
    b.appendChild(svg(ICONS.copy, 12))
    if (hasLabel) b.appendChild(document.createTextNode(label))
    b.onclick = function (e) {
      e.stopPropagation()
      copy(typeof getText === 'function' ? getText() : getText)
      b.innerHTML = ''
      b.appendChild(svg(ICONS.check, 12))
      if (hasLabel) b.appendChild(document.createTextNode('已复制'))
      b.classList.add('done')
      setTimeout(function () {
        b.innerHTML = ''
        b.appendChild(svg(ICONS.copy, 12))
        if (hasLabel) b.appendChild(document.createTextNode(label))
        b.classList.remove('done')
      }, 1200)
    }
    return b
  }

  /* ============ 样式 ============ */
  var _styleInjected = false
  function injectStyle() {
    if (_styleInjected) return
    _styleInjected = true
    var style = document.createElement('style')
    style.textContent = [

    /* ============ 动画关键帧 ============ */
    '@keyframes xd-fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes xd-fade-right{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}',
    '@keyframes xd-slide-up{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes xd-pop{0%{opacity:0;transform:scale(.94) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
    '@keyframes xd-breathe{0%,100%{box-shadow:0 2px 8px rgba(99,102,241,.18),0 0 0 0 rgba(99,102,241,.3)}50%{box-shadow:0 4px 16px rgba(99,102,241,.28),0 0 0 10px rgba(99,102,241,0)}}',
    '@keyframes xd-scan{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}',
    '@keyframes xd-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}',
    '@keyframes xd-flash{0%{background:linear-gradient(90deg,transparent,rgba(99,102,241,.14),transparent);background-size:200% 100%;background-position:200% 0}100%{background:transparent}}',
    '@keyframes xd-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
    '@keyframes xd-hl-pulse{0%{box-shadow:0 0 0 0 rgba(99,102,241,.6);opacity:1}100%{box-shadow:0 0 0 14px rgba(99,102,241,0);opacity:.9}}',
    '@keyframes xd-check{0%{transform:scale(0) rotate(-45deg)}60%{transform:scale(1.15) rotate(8deg)}100%{transform:scale(1) rotate(0)}}',
    '@keyframes xd-ripple{0%{transform:scale(0);opacity:.5}100%{transform:scale(2.5);opacity:0}}',
    '@keyframes xd-bounce-in{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}',
    '@keyframes xd-copy-flash{0%{background:rgba(16,185,129,.25)}100%{background:transparent}}',
    '@keyframes xd-spin{to{transform:rotate(360deg)}}',
    '@keyframes xd-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(2px,-2px)}}',
    '@keyframes xd-slide-in-top{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}',

    /* ============ 按钮 ============ */
    '#__xd_btn__{position:fixed;right:20px;bottom:20px;width:52px;height:52px;border-radius:50%;',
    'background:#ffffff;border:1px solid #d0d5dd;color:#475467;',
    'display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;',
    'box-shadow:0 2px 8px rgba(99,102,241,.18);',
    'transition:all .3s cubic-bezier(.34,1.56,.64,1);',
    'z-index:2147483647;touch-action:none;user-select:none;-webkit-user-select:none;',
    '-webkit-tap-highlight-color:transparent;font-family:inherit;',
    'animation:xd-breathe 3.2s ease-in-out infinite}',
    '#__xd_btn__::before{content:"";position:absolute;inset:-2px;border-radius:50%;',
    'background:conic-gradient(from 0deg,transparent,rgba(99,102,241,.5),transparent);',
    'opacity:0;transition:opacity .4s;z-index:-1}',
    '#__xd_btn__:hover::before{opacity:1;animation:xd-spin 3s linear infinite}',
    '#__xd_btn__:hover{background:#fafbfc;color:#6366f1;transform:translateY(-3px) scale(1.08);',
    'box-shadow:0 16px 28px -12px rgba(99,102,241,.3),0 4px 8px -4px rgba(16,24,40,.1)}',
    '#__xd_btn__:active{transform:translateY(0) scale(.92);transition-duration:.1s}',
    '#__xd_btn__ svg{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}',
    '#__xd_btn__:hover svg{transform:rotate(-10deg) scale(1.12)}',
    '#__xd_btn__.on{background:#f2f4f7;border-color:#98a2b3;color:#101828;animation:none}',
    '#__xd_btn__.on svg{transform:rotate(90deg)}',
    '@media (max-width:768px){#__xd_btn__{width:56px;height:56px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom))}}',

    /* ============ 面板 ============ */
    '.__xd_panel{position:fixed;z-index:2147483646;background:#ffffff;color:#101828;',
    'font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;',
    'display:flex;flex-direction:column;overflow:hidden;',
    'border:1px solid #d0d5dd;border-radius:14px;',
    'box-shadow:0 32px 64px -16px rgba(16,24,40,.18),0 16px 32px -16px rgba(16,24,40,.08),0 0 0 1px rgba(255,255,255,.5) inset}',
    '.__xd_panel.desktop{right:20px;bottom:84px;width:760px;height:540px;animation:xd-pop .32s cubic-bezier(.34,1.4,.64,1)}',
    '.__xd_panel.mobile{left:0;right:0;bottom:0;width:100vw;height:72vh;border-radius:18px 18px 0 0;animation:xd-slide-up .4s cubic-bezier(.22,1,.36,1)}',
    '.__xd_panel.mobile::before{content:"";position:absolute;top:8px;left:50%;transform:translateX(-50%);',
    'width:42px;height:4px;background:#d0d5dd;border-radius:2px}',

    /* ============ 顶栏 ============ */
    '.__xd_head{display:flex;align-items:center;padding:10px 14px;background:linear-gradient(180deg,#f9fafb,#fcfcfd);',
    'border-bottom:1px solid #eaecf0;gap:8px;flex-shrink:0;position:relative;overflow:hidden}',
    '.__xd_head::after{content:"";position:absolute;bottom:0;left:0;right:0;height:1px;',
    'background:linear-gradient(90deg,transparent,#6366f1 25%,#8b5cf6 50%,#06b6d4 75%,transparent);',
    'background-size:200% 100%;opacity:.45;animation:xd-scan 5s linear infinite}',
    '.__xd_title{color:#101828;font-weight:600;font-size:12.5px;padding:0 6px;letter-spacing:.2px;',
    'display:flex;align-items:center;gap:8px}',
    '.__xd_title::before{content:"";width:6px;height:6px;border-radius:50%;background:#6366f1;',
    'box-shadow:0 0 0 3px rgba(99,102,241,.18);animation:xd-pulse 2s ease-in-out infinite}',
    '.__xd_sp{flex:1}',
    '.__xd_hbtn{background:transparent;border:0;color:#667085;width:30px;height:30px;',
    'border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;',
    'transition:all .22s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:hidden}',
    '.__xd_hbtn:hover{background:#eaecf0;color:#101828;transform:scale(1.1)}',
    '.__xd_hbtn:active{transform:scale(.88)}',
    '.__xd_hbtn.danger:hover{background:#fef3f2;color:#b42318}',

    /* ============ Tabs ============ */
    '.__xd_tabs{display:flex;padding:0 10px;background:#fff;border-bottom:1px solid #eaecf0;overflow-x:auto;flex-shrink:0;position:relative;scrollbar-width:none}',
    '.__xd_tabs::-webkit-scrollbar{display:none}',
    '.__xd_tab{background:transparent;border:0;color:#667085;padding:12px 14px;font:inherit;font-size:12px;',
    'cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:inherit;position:relative;font-weight:500;',
    'transition:color .22s,transform .22s;display:flex;align-items:center;gap:6px}',
    '.__xd_tab:hover{color:#344054;transform:translateY(-1px)}',
    '.__xd_tab.on{color:#101828;font-weight:600}',
    '.__xd_tab::after{content:"";position:absolute;bottom:-1px;left:50%;right:50%;height:2.5px;',
    'background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);',
    'border-radius:2px;transition:left .32s cubic-bezier(.34,1.56,.64,1),right .32s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd_tab.on::after{left:10px;right:10px}',

    /* ============ Body ============ */
    '.__xd_body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;position:relative}',
    '.__xd_body::-webkit-scrollbar{width:8px}',
    '.__xd_body::-webkit-scrollbar-track{background:transparent}',
    '.__xd_body::-webkit-scrollbar-thumb{background:#d0d5dd;border-radius:4px;transition:background .2s}',
    '.__xd_body::-webkit-scrollbar-thumb:hover{background:#98a2b3}',

    /* ============ 行 ============ */
    '.__xd_row{padding:8px 12px;display:flex;gap:8px;align-items:center;',
    'border-bottom:1px solid #f2f4f7;font-size:12px;white-space:nowrap;min-height:36px;',
    'position:relative}',
    '.__xd_row.anim{animation:xd-fade-in .28s backwards}',
    '.__xd_row.click{cursor:pointer;transition:background .18s,padding-left .24s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd_row.click:hover{background:linear-gradient(90deg,rgba(99,102,241,.06),rgba(6,182,212,.03));padding-left:16px}',
    '.__xd_row.click:hover::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);',
    'width:3px;height:60%;border-radius:0 2px 2px 0;',
    'background:linear-gradient(180deg,#6366f1,#06b6d4);animation:xd-fade-right .22s}',
    '.__xd_row.click:active{background:rgba(99,102,241,.1)}',
    '.__xd_row.changed{animation:xd-flash 1s ease-out}',

    '.__xd_empty{padding:56px 20px;text-align:center;color:#98a2b3;font-size:12.5px;animation:xd-fade-in .4s}',
    '.__xd_empty::before{content:"∅";display:block;font-size:32px;color:#d0d5dd;margin-bottom:12px;font-weight:300;',
    'animation:xd-drift 3s ease-in-out infinite}',

    /* ============ 标签 ============ */
    '.__xd_tag{display:inline-block;padding:3px 8px;border-radius:6px;font-size:10.5px;',
    'font-weight:600;text-align:center;flex-shrink:0;min-width:44px;letter-spacing:.2px}',
    '.__xd_tag.get{background:#eff4ff;color:#3538cd}',
    '.__xd_tag.post{background:#ecfdf3;color:#027a48}',
    '.__xd_tag.put{background:#fffaeb;color:#b54708}',
    '.__xd_tag.del{background:#fef3f2;color:#b42318}',
    '.__xd_tag.s2{background:#ecfdf3;color:#027a48}',
    '.__xd_tag.s3{background:#fffaeb;color:#b54708}',
    '.__xd_tag.s4{background:#fff6ed;color:#c4320a}',
    '.__xd_tag.s5{background:#fef3f2;color:#b42318}',
    '.__xd_tag.pending{background:#f2f4f7;color:#475467;position:relative}',
    '.__xd_tag.pending::after{content:"";position:absolute;inset:0;border-radius:6px;background:rgba(99,102,241,.15);animation:xd-pulse 1.4s ease-in-out infinite}',

    /* ============ 详情 ============ */
    '.__xd_head-detail{padding:14px;background:linear-gradient(180deg,#f9fafb,#fcfcfd);border-bottom:1px solid #eaecf0;animation:xd-fade-in .3s}',
    '.__xd_url{color:#101828;word-break:break-all;font-size:12px;margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.__xd_meta{display:flex;gap:14px;font-size:11px;color:#667085;flex-wrap:wrap}',
    '.__xd_meta b{color:#101828;font-weight:600;font-family:ui-monospace,monospace}',
    '.__xd_dtab{display:flex;padding:0 14px;background:#fff;border-bottom:1px solid #eaecf0;overflow-x:auto;flex-shrink:0;scrollbar-width:none}',
    '.__xd_dtab::-webkit-scrollbar{display:none}',
    '.__xd_dtab button{background:transparent;border:0;color:#667085;padding:10px 11px;font:inherit;font-size:11.5px;',
    'cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:inherit;position:relative;font-weight:500;transition:color .2s}',
    '.__xd_dtab button:hover{color:#344054}',
    '.__xd_dtab button.on{color:#101828;font-weight:600}',
    '.__xd_dtab button::after{content:"";position:absolute;bottom:-1px;left:50%;right:50%;height:2px;',
    'background:linear-gradient(90deg,#6366f1,#8b5cf6);transition:left .28s cubic-bezier(.34,1.56,.64,1),right .28s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd_dtab button.on::after{left:11px;right:11px}',
    '.__xd_dtitle{padding:14px 14px 8px;display:flex;align-items:center;justify-content:space-between;',
    'font-size:11px;font-weight:600;color:#475467;text-transform:uppercase;letter-spacing:.5px}',
    '.__xd_dtitle > span:first-child{display:flex;align-items:center;gap:8px}',
    '.__xd_dtitle > span:first-child::before{content:"";width:3px;height:12px;border-radius:2px;',
    'background:linear-gradient(180deg,#6366f1,#06b6d4)}',

    '.__xd_back{padding:12px 14px;color:#475467;cursor:pointer;font-size:12px;font-weight:500;',
    'border-bottom:1px solid #eaecf0;display:flex;align-items:center;gap:6px;transition:all .22s;',
    'background:#f9fafb}',
    '.__xd_back:hover{background:#f2f4f7;color:#101828;padding-left:18px}',
    '.__xd_back svg{transition:transform .24s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd_back:hover svg{transform:translateX(-3px)}',

    '.__xd_kv{margin:0 14px 14px;border:1px solid #eaecf0;border-radius:10px;overflow:hidden;animation:xd-fade-in .28s;background:#fff}',
    '.__xd_kv .r{display:grid;grid-template-columns:160px 1fr;border-bottom:1px solid #f2f4f7;font-size:11.5px;transition:background .15s}',
    '.__xd_kv .r:last-child{border-bottom:0}',
    '.__xd_kv .r:hover{background:linear-gradient(90deg,rgba(99,102,241,.04),transparent)}',
    '.__xd_kv .k{padding:9px 12px;color:#667085;background:#f9fafb;word-break:break-all;font-family:ui-monospace,monospace;font-weight:500}',
    '.__xd_kv .v{padding:9px 12px;color:#101828;word-break:break-all;font-family:ui-monospace,monospace}',

    '.__xd_code{margin:0 14px 14px;background:linear-gradient(180deg,#f9fafb,#f5f7fa);border:1px solid #eaecf0;border-radius:10px;',
    'padding:14px 16px;font-size:11.5px;line-height:1.75;white-space:pre-wrap;word-break:break-all;',
    'max-height:300px;overflow:auto;color:#101828;font-family:ui-monospace,monospace;animation:xd-fade-in .3s;',
    'box-shadow:inset 0 1px 2px rgba(16,24,40,.03)}',

    /* ============ 复制 ============ */
    '.__xd-copy{display:inline-flex;align-items:center;justify-content:center;gap:0;',
    'width:26px;height:26px;padding:0;border:0;background:transparent;',
    'color:#98a2b3;border-radius:6px;cursor:pointer;flex-shrink:0;',
    'transition:all .18s ease;opacity:.7}',
    '.__xd-copy:hover{background:rgba(99,102,241,.08);color:#6366f1;opacity:1}',
    '.__xd-copy:active{transform:scale(.9)}',
    '.__xd-copy.done{background:rgba(16,185,129,.12);color:#059669;opacity:1}',
    '.__xd-copy.done svg{animation:xd-check .4s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd-copy-lg{width:auto;height:26px;padding:0 9px;gap:5px;font-size:11px;opacity:1;',
    'color:#667085;border:0;background:#f2f4f7}',
    '.__xd-copy-lg:hover{background:#e4e7ec;color:#101828}',

    /* ============ 请求栏 ============ */
    '.__xd_req{padding:10px 12px;background:linear-gradient(180deg,#f9fafb,#fcfcfd);border-bottom:1px solid #eaecf0;display:flex;gap:8px;align-items:center;flex-shrink:0}',
    '.__xd_req select,.__xd_req input{height:32px;background:#fff;border:1px solid #d0d5dd;color:#101828;',
    'border-radius:8px;font:inherit;font-size:12px;font-family:inherit;outline:none;padding:0 12px;',
    'transition:all .2s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd_req select{cursor:pointer;font-weight:500}',
    '.__xd_req input{flex:1;min-width:80px}',
    '.__xd_req input::placeholder{color:#98a2b3}',
    '.__xd_req input:hover,.__xd_req select:hover{border-color:#98a2b3}',
    '.__xd_req input:focus,.__xd_req select:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}',
    '.__xd_req button{height:32px;padding:0 16px;background:linear-gradient(135deg,#101828,#344054);color:#fff;border:0;border-radius:8px;',
    'cursor:pointer;font:inherit;font-size:12px;font-family:inherit;font-weight:500;transition:all .22s cubic-bezier(.34,1.56,.64,1)}',
    '.__xd_req button:hover{transform:translateY(-2px);box-shadow:0 8px 16px -6px rgba(16,24,40,.35)}',
    '.__xd_req button:active{transform:translateY(0) scale(.96)}',
    '.__xd_req button:disabled{opacity:.4;cursor:not-allowed;transform:none}',

    /* ============ 搜索 ============ */
    '.xd-search{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #d0d5dd;border-radius:8px;padding:0 10px;height:32px;flex:1;min-width:0;transition:all .2s cubic-bezier(.34,1.56,.64,1)}',
    '.xd-search:hover{border-color:#98a2b3}',
    '.xd-search:focus-within{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12);transform:scale(1.005)}',
    '.xd-search svg{color:#98a2b3;flex-shrink:0;transition:color .2s}',
    '.xd-search:focus-within svg{color:#6366f1}',
    '.xd-search-input{border:0;background:transparent;outline:none;color:#101828;font:inherit;font-size:12px;font-family:inherit;flex:1;min-width:0;height:100%}',
    '.xd-search-input::placeholder{color:#98a2b3}',
    '.xd-filter-row{display:flex;align-items:center;gap:8px;padding:10px 12px;background:linear-gradient(180deg,#f9fafb,#fcfcfd);border-bottom:1px solid #eaecf0;flex-shrink:0;position:sticky;top:0;z-index:5}',
    '.xd-count{color:#6366f1;font-size:11px;font-weight:700;font-family:ui-monospace,monospace;white-space:nowrap;flex-shrink:0;',
    'background:#eff4ff;padding:3px 9px;border-radius:10px;min-width:28px;text-align:center}',
    '.xd-info-bar{padding:7px 12px;background:#f9fafb;border-bottom:1px solid #eaecf0;font-size:10.5px;color:#98a2b3;font-family:ui-monospace,monospace}',

    /* ============ 统计 ============ */
    '.__xd_stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px}',
    '.__xd_stat{background:linear-gradient(180deg,#fff,#fcfcfd);border:1px solid #eaecf0;border-radius:10px;padding:12px 14px;',
    'transition:all .3s cubic-bezier(.34,1.56,.64,1);animation:xd-bounce-in .45s backwards;position:relative;overflow:hidden}',
    '.__xd_stat::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;',
    'background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);opacity:0;transition:opacity .3s}',
    '.__xd_stat:hover::before{opacity:1}',
    '.__xd_stat:hover{transform:translateY(-3px);box-shadow:0 12px 24px -12px rgba(16,24,40,.16)}',
    '.__xd_stat .k{font-size:10.5px;color:#667085;text-transform:uppercase;letter-spacing:.4px;font-weight:600}',
    '.__xd_stat .v{font-size:22px;font-weight:700;color:#101828;margin-top:4px;font-family:ui-monospace,monospace;letter-spacing:-.5px}',
    '.__xd_stat .h{font-size:10px;color:#98a2b3;margin-top:2px}',

    /* ============ 条形图 ============ */
    '.__xd_bar{display:flex;height:14px;background:#f2f4f7;border-radius:7px;overflow:hidden;margin:0 14px 12px;',
    'box-shadow:inset 0 1px 2px rgba(16,24,40,.06);animation:xd-fade-in .4s;position:relative}',
    '.__xd_bar > div{height:100%;transition:width .9s cubic-bezier(.22,1,.36,1);transform-origin:left;',
    'position:relative}',
    '.__xd_bar > div::after{content:"";position:absolute;inset:0;',
    'background:linear-gradient(180deg,rgba(255,255,255,.3),transparent 50%,rgba(0,0,0,.05))}',
    '.__xd_legend{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;padding:0 14px 16px;font-size:11.5px;animation:xd-fade-in .45s}',
    '.__xd_legend .r{display:flex;justify-content:space-between;gap:8px;color:#667085;padding:4px 0;',
    'transition:transform .2s;cursor:default}',
    '.__xd_legend .r:hover{transform:translateX(2px)}',
    '.__xd_legend .v{color:#101828;font-weight:600;font-family:ui-monospace,monospace}',
    '.__xd_dot{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:7px;vertical-align:middle;',
    'box-shadow:0 0 0 2px rgba(255,255,255,.6)}',

    /* ============ 高亮 ============ */
    '.__xd_hl{position:fixed;pointer-events:none;z-index:2147483645;',
    'border:2px solid #6366f1;background:linear-gradient(135deg,rgba(99,102,241,.14),rgba(6,182,212,.06));border-radius:3px;',
    'animation:xd-hl-pulse 1.4s ease-out}',

    /* ============ 滚动条微光 ============ */
    '.__xd_body::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#d0d5dd,#98a2b3)}',

    /* ============ 移动端 ============ */
    '@media (max-width:768px){',
    '.__xd_panel.desktop{display:none}',
    '#__xd_btn__{right:16px;bottom:calc(16px + env(safe-area-inset-bottom));width:56px;height:56px}',
    '.__xd_row{min-height:46px;padding:12px 14px;font-size:13px;gap:10px}',
    '.__xd_row.click:hover{padding-left:14px;background:transparent}',
    '.__xd_row.click:hover::before{display:none}',
    '.__xd_row.click:active{background:rgba(99,102,241,.1)}',
    '.__xd_tab{padding:14px 14px;font-size:13px;min-height:48px}',
    '.__xd_hbtn{width:40px;height:40px}',
    '.__xd_head{padding:12px 14px;gap:10px}',
    '.__xd_title{font-size:13.5px}',
    '.__xd_dtitle{font-size:11.5px;padding:14px 14px 8px}',
    '.__xd_back{padding:14px;font-size:13px;min-height:48px}',
    '.__xd_kv{margin:0 12px 12px}',
    '.__xd_kv .r{grid-template-columns:1fr;font-size:12px}',
    '.__xd_kv .k{border-bottom:1px solid #f2f4f7;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.4px;font-weight:600;background:#f9fafb}',
    '.__xd_kv .v{padding:10px 12px;word-break:break-all}',
    '.__xd_code{margin:0 12px 12px;font-size:12px;padding:14px}',
    '.__xd_req{padding:12px;flex-wrap:wrap;gap:10px}',
    '.__xd_req select,.__xd_req input{height:44px;font-size:14px}',
    '.__xd_req select{min-width:82px}',
    '.__xd_req input{flex:1 1 100%}',
    '.__xd_req button{height:44px;flex:1;font-size:13.5px}',
    '.__xd_stats{grid-template-columns:1fr;gap:10px;padding:12px}',
    '.__xd_stat{padding:14px}',
    '.__xd_stat .v{font-size:24px}',
    '.__xd_dtab{padding:0 10px}',
    '.__xd_dtab button{padding:13px 12px;font-size:12.5px;min-height:46px}',
    '.__xd-copy{width:36px;height:36px}',
    '.__xd-copy svg{width:15px;height:15px}',
    '.__xd-copy-lg{height:36px;padding:0 14px;font-size:12.5px}',
    '.__xd_legend{grid-template-columns:1fr;gap:8px;padding:0 12px 16px;font-size:12.5px}',
    '.__xd_url{font-size:13px;line-height:1.6}',
    '.__xd_meta{font-size:12px;gap:12px}',
    '.__xd_empty{padding:60px 20px;font-size:13px}',
    '.__xd_empty::before{font-size:36px}',
    '.xd-search{height:44px;border-radius:10px;padding:0 14px}',
    '.xd-search-input{font-size:14px}',
    '.xd-filter-row{padding:12px;gap:10px}',
    '.xd-count{font-size:12px;padding:4px 11px}',
    '.xd-info-bar{padding:8px 12px;font-size:11px}',
    '}'
  ].join('')
    document.head.appendChild(style)
  }

  /* ============ 浮动按钮 ============ */
  // 按钮独立样式（不依赖主 CSS）
  var btnStyle = document.createElement('style')
  btnStyle.textContent = [
    '#__xd_btn__{position:fixed;right:20px;bottom:20px;width:48px;height:48px;border-radius:24px;',
    'background:#ffffff;border:1px solid #d0d5dd;color:#475467;',
    'display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;',
    'box-shadow:0 2px 6px rgba(16,24,40,.08),0 1px 2px rgba(16,24,40,.04);',
    'transition:all .28s cubic-bezier(.34,1.56,.64,1);',
    'z-index:2147483647;touch-action:none;user-select:none;-webkit-user-select:none;',
    '-webkit-tap-highlight-color:transparent;font-family:inherit}',
    '#__xd_btn__:active{transform:scale(.94)}',
    '#__xd_btn__.on{background:#f2f4f7;border-color:#98a2b3;color:#101828}',
    '@media (max-width:768px){#__xd_btn__{width:56px;height:56px;right:16px;bottom:calc(16px + env(safe-area-inset-bottom))}}'
  ].join('')
  document.head.appendChild(btnStyle)

  var btn = h('button', { class: '__xd_btn', id: '__xd_btn__', 'aria-label': 'DevTools' })
  btn.appendChild(svg(ICONS.dev, 22))
  document.body.appendChild(btn)

  var drag = { on: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 }
  function onDown(e) {
    var pt = e.touches ? e.touches[0] : e
    var r = btn.getBoundingClientRect()
    drag.on = true; drag.moved = false
    drag.sx = pt.clientX; drag.sy = pt.clientY
    drag.ox = r.left; drag.oy = r.top
  }
  function onMove(e) {
    if (!drag.on) return
    var pt = e.touches ? e.touches[0] : e
    var dx = pt.clientX - drag.sx, dy = pt.clientY - drag.sy
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 8) drag.moved = true
    if (!drag.moved) return
    if (e.cancelable) e.preventDefault()
    var w = btn.offsetWidth, hh = btn.offsetHeight
    var l = Math.max(0, Math.min(drag.ox + dx, window.innerWidth - w))
    var t = Math.max(0, Math.min(drag.oy + dy, window.innerHeight - hh))
    btn.style.left = l + 'px'; btn.style.top = t + 'px'
    btn.style.right = 'auto'; btn.style.bottom = 'auto'
  }
  function onUp() {
    if (!drag.on) return
    drag.on = false
    if (drag.moved) { btn.__skip = true; setTimeout(function () { btn.__skip = false }, 200) }
  }
  if (window.PointerEvent) {
    btn.addEventListener('pointerdown', onDown)
    btn.addEventListener('pointermove', onMove)
    btn.addEventListener('pointerup', onUp)
    btn.addEventListener('pointercancel', onUp)
  } else {
    btn.addEventListener('touchstart', onDown, { passive: true })
    btn.addEventListener('touchmove', onMove, { passive: false })
    btn.addEventListener('touchend', onUp)
    btn.addEventListener('mousedown', onDown)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  /* ============ 面板 ============ */
  var panel = null, bodyEl = null, tabsEl = null
  var selNet = null, selSig = null
  var netTab = 'overview'

  var TABS = [
    ['elements', '元素', ICONS.element],
    ['network', '网络', ICONS.net],
    ['signals', 'Signals', ICONS.signal],
    ['console', '控制台', ICONS.terminal],
    ['perf', '性能', ICONS.perf]
  ]

  function renderTabs() {
    if (!tabsEl) return
    tabsEl.innerHTML = ''
    var counts = { network: XD.nets.length, signals: XD.signals.length, console: XD.logs.length }
    TABS.forEach(function (t) {
      var k = t[0], name = t[1], n = counts[k]
      var b = h('button', { class: '__xd_tab' + (XD.tab === k ? ' on' : '') },
        n ? name + ' ' + n : name)
      b.onclick = function () {
        if (XD.tab === k) return
        XD.tab = k; selNet = null; selSig = null
        renderTabs()
        renderBody()
      }
      tabsEl.appendChild(b)
    })
  }

  function renderBody() {
    if (!bodyEl) return
    var st = bodyEl.scrollTop
    bodyEl.innerHTML = ''
    if (XD.tab === 'elements') renderElements()
    else if (XD.tab === 'network') renderNetwork()
    else if (XD.tab === 'signals') renderSignals()
    else if (XD.tab === 'console') renderConsole()
    else if (XD.tab === 'perf') renderPerf()
    bodyEl.scrollTop = st
  }

  /* ============ 元素 ============ */
  function renderElements() {
    if (XD._elFilter === undefined) XD._elFilter = ''
    var sb = searchBar('过滤元素（标签 / #id / .class）', function (v) {
      XD._elFilter = v.toLowerCase()
      var scrollTop = bodyEl.scrollTop
      bodyEl.innerHTML = ''
      renderElements()
      bodyEl.scrollTop = scrollTop
    }, XD._elFilter)
    bodyEl.appendChild(sb.el)
    var bar = h('div', { class: 'xd-info-bar' })
    var cnt = 0
    ;(function count(n) {
      if (!n || n === panel) return
      if (n.nodeType === 1) {
        cnt++
        var tag = n.tagName.toLowerCase()
        var id = n.id ? '#' + n.id : ''
        var cls = n.className && typeof n.className === 'string' ? '.' + n.className.trim().replace(/\s+/g, '.') : ''
        var text = (tag + id + cls).toLowerCase()
        if (XD._elFilter && text.indexOf(XD._elFilter) < 0) return
        for (var i = 0; i < n.childNodes.length; i++) count(n.childNodes[i])
      }
    })(document.body)
    bar.textContent = cnt + ' 个元素'
    bodyEl.appendChild(bar)

    function matchNode(node) {
      if (!XD._elFilter) return true
      var tag = node.tagName.toLowerCase()
      var id = node.id ? '#' + node.id : ''
      var cls = node.className && typeof node.className === 'string' ? '.' + node.className.trim().replace(/\s+/g, '.') : ''
      var text = (tag + id + cls).toLowerCase()
      if (text.indexOf(XD._elFilter) >= 0) return true
      // 子节点有匹配也算
      for (var i = 0; i < node.childNodes.length; i++) {
        var c = node.childNodes[i]
        if (c.nodeType === 1 && matchNode(c)) return true
      }
      return false
    }

    function walk(node, depth, idx) {
      if (node && node.nodeType === 1 && !matchNode(node)) return
      if (!node) return
      if (node === panel) return
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase()
        var hasKids = node.childNodes.length > 0
        var collapsed = XD._collapsed.has(node)

        var row = h('div', { class: '__xd_row click anim' })
        row.style.paddingLeft = (12 + depth * 14) + 'px'
        row.style.animationDelay = Math.min(idx * 0.008, 0.3) + 's'

        if (hasKids) {
          var arrow = h('span', null, collapsed ? '▶' : '▼')
          arrow.style.cssText = 'width:12px;font-size:9px;color:#98a2b3;flex-shrink:0;text-align:center;transition:transform .2s'
          arrow.onclick = function (e) {
            e.stopPropagation()
            if (collapsed) XD._collapsed.delete(node)
            else XD._collapsed.add(node)
            renderBody()
          }
          row.appendChild(arrow)
        } else {
          var dot = h('span', null, '·')
          dot.style.cssText = 'width:12px;font-size:12px;color:#d0d5dd;flex-shrink:0;text-align:center'
          row.appendChild(dot)
        }

        var tagEl = h('span', null, '<' + tag + '>')
        tagEl.style.cssText = 'color:#9a3412;font-weight:600;flex-shrink:0'
        row.appendChild(tagEl)

        if (node.id) {
          var idEl = h('span', null, '#' + node.id)
          idEl.style.cssText = 'color:#b54708;flex-shrink:0'
          row.appendChild(idEl)
        }

        if (node.className && typeof node.className === 'string' && node.className.trim()) {
          var cls = node.className.trim().split(/\s+/)
          var clsText = '.' + cls.slice(0, 3).join('.')
          if (cls.length > 3) clsText += ' +' + (cls.length - 3)
          var clsEl = h('span', null, clsText)
          clsEl.style.cssText = 'color:#0e7490;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0'
          row.appendChild(clsEl)
        } else {
          var sp = h('span'); sp.style.flex = '1'
          row.appendChild(sp)
        }

        var rect = node.getBoundingClientRect()
        if (rect.width || rect.height) {
          var size = h('span', null, Math.round(rect.width) + '×' + Math.round(rect.height))
          size.style.cssText = 'color:#98a2b3;font-size:10px;flex-shrink:0'
          row.appendChild(size)
        }

        var path = buildSelector(node)
        row.appendChild(copyBtn(function () { return path }, ''))
        row.onclick = function (e) {
          if (e.target && e.target.closest && e.target.closest('.__xd-copy, .xd-copy')) return
          highlightNode(node)
        }
        bodyEl.appendChild(row)

        if (!collapsed) {
          var kids = Array.prototype.slice.call(node.childNodes)
          for (var i = 0; i < kids.length; i++) walk(kids[i], depth + 1, idx + i)
        }
      } else if (node.nodeType === 3) {
        var txt = node.textContent.trim()
        if (txt) {
          var tr = h('div', { class: '__xd_row anim' })
          tr.style.paddingLeft = (26 + depth * 14) + 'px'
          tr.style.color = '#98a2b3'
          tr.style.fontStyle = 'italic'
          tr.style.animationDelay = Math.min(idx * 0.008, 0.3) + 's'
          tr.textContent = '"' + (txt.length > 50 ? txt.slice(0, 50) + '…' : txt) + '"'
          bodyEl.appendChild(tr)
        }
      }
    }
    walk(document.body, 0, 0)
  }

  function buildSelector(node) {
    if (!node || node.nodeType !== 1) return ''
    if (node.id) return '#' + node.id
    var path = []
    var cur = node
    while (cur && cur.nodeType === 1 && cur !== document.body) {
      var tag = cur.tagName.toLowerCase()
      var parent = cur.parentNode
      if (parent) {
        var sibs = []
        var kids = parent.children || []
        for (var i = 0; i < kids.length; i++) if (kids[i].tagName === cur.tagName) sibs.push(kids[i])
        if (sibs.length > 1) {
          var idx = sibs.indexOf(cur) + 1
          tag += ':nth-of-type(' + idx + ')'
        }
      }
      path.unshift(tag)
      if (cur.id) { path.unshift('#' + cur.id); break }
      cur = cur.parentNode
    }
    return path.join(' > ')
  }

  var hlEl = null
  function highlightNode(node) {
    if (hlEl && hlEl.parentNode) hlEl.parentNode.removeChild(hlEl)
    hlEl = null
    if (!node || node.nodeType !== 1 || node === document.body) return
    var r = node.getBoundingClientRect()
    var el = h('div', { class: '__xd_hl' })
    el.style.left = r.left + 'px'
    el.style.top = r.top + 'px'
    el.style.width = r.width + 'px'
    el.style.height = r.height + 'px'
    document.body.appendChild(el)
    hlEl = el
    setTimeout(function () {
      if (hlEl === el && el.parentNode) el.parentNode.removeChild(el)
      if (hlEl === el) hlEl = null
    }, 1200)
  }

  /* ============ 网络 ============ */
  function renderNetwork() {
    if (XD._netFilter === undefined) XD._netFilter = ''
    var filterBar = h('div', { class: 'xd-filter-row' })
    var sb = searchBar('过滤 URL / 方法 / 状态', function (v) {
      XD._netFilter = v.toLowerCase()
      var scrollTop = bodyEl.scrollTop
      bodyEl.innerHTML = ''
      renderNetwork()
      bodyEl.scrollTop = scrollTop
    }, XD._netFilter)
    filterBar.appendChild(sb.el)

    var filtered = XD._netFilter ? XD.nets.filter(function (n) {
      var hay = (n.url + ' ' + n.method + ' ' + (n.status || '')).toLowerCase()
      return hay.indexOf(XD._netFilter) >= 0
    }) : XD.nets
    var cnt = h('span', { class: 'xd-count' }, filtered.length + (XD._netFilter ? ' / ' + XD.nets.length : ''))
    filterBar.appendChild(cnt)

    filterBar.appendChild(copyBtn(function () {
      return JSON.stringify(filtered.map(function (n) {
        return { url: n.url, method: n.method, status: n.status, duration: Math.round(n.duration * 100) / 100, size: n.size }
      }), null, 2)
    }, '复制列表'))

    bodyEl.appendChild(filterBar)

    var bar = h('div', { class: '__xd_req' })
    var sel = h('select')
    ;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].forEach(function (m) {
      var o = h('option', { value: m }, m)
      sel.appendChild(o)
    })
    var inp = h('input', { placeholder: '/rpc/xxx 或完整 URL' })
    inp.value = XD._reqUrl || ''
    inp.oninput = function () { XD._reqUrl = inp.value }
    var goBtn = h('button', null, '发送')
    goBtn.onclick = function () {
      var url = inp.value.trim()
      if (!url) return
      goBtn.disabled = true
      window.fetch(url, { method: sel.value }).then(function () { goBtn.disabled = false }).catch(function () { goBtn.disabled = false })
    }
    bar.appendChild(sel); bar.appendChild(inp); bar.appendChild(goBtn)
    bodyEl.appendChild(bar)

    if (!filtered.length) return bodyEl.appendChild(h('div', { class: '__xd_empty' }, XD._netFilter ? '没有匹配的请求' : '还没有请求'))

    for (var i = filtered.length - 1; i >= 0; i--) {
      ;(function (n, idx) {
        var row = h('div', { class: '__xd_row click anim' })
        row.style.animationDelay = Math.min(idx * 0.015, 0.3) + 's'
        row.appendChild(h('span', { class: '__xd_tag ' + methodClass(n.method) }, n.method))
        row.appendChild(h('span', { class: '__xd_tag ' + statusClass(n.status) }, n.status ? String(n.status) : '…'))
        var u = h('span', null, n.url.replace(/^https?:\/\/[^/]+/, ''))
        u.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;color:#101828;min-width:0'
        row.appendChild(u)
        if (n.size) {
          var sz = h('span', null, fmtBytes(n.size))
          sz.style.cssText = 'color:#98a2b3;font-size:10.5px;flex-shrink:0'
          row.appendChild(sz)
        }
        var d = h('span', null, fmtMs(n.duration))
        d.style.cssText = 'color:#475467;font-weight:600;flex-shrink:0;font-size:11px'
        row.appendChild(d)
        row.appendChild(copyBtn(function () { return JSON.stringify(n, null, 2) }, ''))
        row.onclick = function () { showNetDetail(n) }
        bodyEl.appendChild(row)
      })(filtered[i], filtered.length - 1 - i)
    }
  }

  function showNetDetail(n) {
    bodyEl.innerHTML = ''
    var back = h('div', { class: '__xd_back' })
    back.appendChild(svg(ICONS.back, 13))
    back.appendChild(document.createTextNode('返回'))
    back.onclick = renderBody
    bodyEl.appendChild(back)

    var head = h('div', { class: '__xd_head-detail' })
    var url = h('div', { class: '__xd_url' })
    url.appendChild(h('span', { class: '__xd_tag ' + methodClass(n.method) }, n.method))
    url.appendChild(h('span', { class: '__xd_tag ' + statusClass(n.status) }, n.status ? String(n.status) + ' ' + (n.statusText || '') : '…'))
    url.appendChild(h('span', null, n.url))
    head.appendChild(url)
    var meta = h('div', { class: '__xd_meta' })
    var am = function (k, v) { var s = h('span'); s.innerHTML = k + ' <b>' + v + '</b>'; meta.appendChild(s) }
    am('耗时', fmtMs(n.duration))
    am('大小', n.size ? fmtBytes(n.size) : '—')
    am('类型', (n.resHeaders && n.resHeaders['content-type']) || '—')
    head.appendChild(meta)
    var copyAll = copyBtn(function () {
      var parts = [n.method + ' ' + n.url, 'Status: ' + (n.status || '—'), 'Duration: ' + fmtMs(n.duration)]
      parts.push('', '--- 请求头 ---', headersText(n.reqHeaders || {}))
      if (n.reqBody) parts.push('', '--- 请求体 ---', pretty(n.reqBody))
      parts.push('', '--- 响应头 ---', headersText(n.resHeaders || {}))
      if (n.resBody) parts.push('', '--- 响应体 ---', pretty(n.resBody))
      return parts.join('\n')
    }, '复制全部')
    copyAll.style.marginTop = '8px'
    head.appendChild(copyAll)
    bodyEl.appendChild(head)

    var subtabs = h('div', { class: '__xd_dtab' })
    ;[['overview', '概览'], ['reqHeaders', '请求头'], ['reqBody', '请求体'], ['resHeaders', '响应头'], ['resBody', '响应体']].forEach(function (t) {
      var b = h('button', { class: netTab === t[0] ? 'on' : '' }, t[1])
      b.onclick = function () { netTab = t[0]; showNetDetail(n) }
      subtabs.appendChild(b)
    })
    bodyEl.appendChild(subtabs)

    if (netTab === 'overview') {
      var kv = h('div', { class: '__xd_kv' })
      ;[['方法', n.method], ['URL', n.url], ['状态', n.status ? n.status + ' ' + (n.statusText || '') : '—'], ['耗时', fmtMs(n.duration)], ['大小', n.size ? fmtBytes(n.size) : '—'], ['类型', (n.resHeaders && n.resHeaders['content-type']) || '—']].forEach(function (r) {
        var row = h('div', { class: 'r' })
        row.appendChild(h('div', { class: 'k' }, r[0]))
        row.appendChild(h('div', { class: 'v' }, String(r[1])))
        kv.appendChild(row)
      })
      bodyEl.appendChild(kv)
    } else if (netTab === 'reqHeaders') renderKv(n.reqHeaders || {}, '请求头')
    else if (netTab === 'reqBody') renderBodyTab(n.reqBody, '请求体')
    else if (netTab === 'resHeaders') renderKv(n.resHeaders || {}, '响应头')
    else if (netTab === 'resBody') renderBodyTab(n.resBody, '响应体')
  }

  function headersText(h) { var out = []; for (var k in h) out.push(k + ': ' + h[k]); return out.join('\n') }
  function pretty(t) { if (!t) return ''; try { return JSON.stringify(JSON.parse(t), null, 2) } catch (e) { return t } }

  function renderKv(obj, title) {
    var keys = Object.keys(obj)
    var head = h('div', { class: '__xd_dtitle' })
    head.appendChild(h('span', null, title + '（' + keys.length + '）'))
    head.appendChild(copyBtn(function () { return headersText(obj) }))
    bodyEl.appendChild(head)
    if (!keys.length) return bodyEl.appendChild(h('div', { class: '__xd_empty' }, '无'))
    var kv = h('div', { class: '__xd_kv' })
    keys.forEach(function (k) {
      var row = h('div', { class: 'r' })
      row.appendChild(h('div', { class: 'k' }, k))
      row.appendChild(h('div', { class: 'v' }, String(obj[k])))
      kv.appendChild(row)
    })
    bodyEl.appendChild(kv)
  }

  function renderBodyTab(text, title) {
    var head = h('div', { class: '__xd_dtitle' })
    head.appendChild(h('span', null, title))
    if (text) head.appendChild(copyBtn(text))
    bodyEl.appendChild(head)
    if (!text) return bodyEl.appendChild(h('div', { class: '__xd_empty' }, '无'))
    bodyEl.appendChild(h('div', { class: '__xd_code' }, pretty(text)))
  }

  /* ============ Signals ============ */
  function renderSignals() {
    if (!XD.signals.length) return bodyEl.appendChild(h('div', { class: '__xd_empty' }, '还没有 signal'))
    if (XD._sigFilter === undefined) XD._sigFilter = ''

    var filterBar = h('div', { class: 'xd-filter-row' })
    var sb = searchBar('过滤（序号 / 类型 / 值）', function (v) {
      XD._sigFilter = v.toLowerCase()
      var scrollTop = bodyEl.scrollTop
      bodyEl.innerHTML = ''
      renderSignals()
      bodyEl.scrollTop = scrollTop
    }, XD._sigFilter)
    filterBar.appendChild(sb.el)

    var filtered = XD.signals.filter(function (sg, i) {
      if (!XD._sigFilter) return true
      var v; try { v = sg() } catch (e) { v = '' }
      var t = typeOf(v)
      var hay = ('#' + i + ' ' + t + ' ' + String(v)).toLowerCase()
      return hay.indexOf(XD._sigFilter) >= 0
    })
    var cnt = h('span', { class: 'xd-count' }, filtered.length + (XD._sigFilter ? ' / ' + XD.signals.length : ''))
    filterBar.appendChild(cnt)

    filterBar.appendChild(copyBtn(function () {
      return JSON.stringify(filtered.map(function (s) {
        var v; try { v = s() } catch (e) { v = '<err>' }
        return { type: typeOf(v), value: v, writes: s.writeCount ? s.writeCount() : 0, subs: s.subsCount ? s.subsCount() : 0 }
      }), null, 2)
    }, '复制列表'))

    bodyEl.appendChild(filterBar)

    var head = h('div', { class: '__xd_dtitle' })
    head.appendChild(h('span', null, '全部 ' + XD.signals.length + ' 个'))
    head.appendChild(copyBtn(function () {
      return JSON.stringify(XD.signals.map(function (s, i) {
        var v; try { v = s() } catch (e) { v = '<err>' }
        return { index: i, type: typeOf(v), value: v, writes: s.writeCount ? s.writeCount() : 0, subs: s.subsCount ? s.subsCount() : 0 }
      }), null, 2)
    }, '复制全部'))
    bodyEl.appendChild(head)

    if (!filtered.length) return bodyEl.appendChild(h('div', { class: '__xd_empty' }, '没有匹配的 signal'))

    for (var fi = 0; fi < filtered.length; fi++) {
      ;(function (sg, idx) {
        var realIdx = XD.signals.indexOf(sg)
        var v; try { v = sg() } catch (e) { v = '<err>' }
        var t = typeOf(v)
        var prev = XD._prevVals.get(sg)
        var changed = prev !== undefined && prev !== v
        XD._prevVals.set(sg, v)

        var row = h('div', { class: '__xd_row click anim' })
        row.style.animationDelay = Math.min(idx * 0.015, 0.3) + 's'
        if (changed) {
          row.style.background = 'rgba(99,102,241,.12)'
          setTimeout(function () { row.style.transition = 'background .8s'; row.style.background = '' }, 50)
        }
        var idxEl = h('span', null, '#' + (typeof realIdx !== 'undefined' ? realIdx : idx))
        idxEl.style.cssText = 'color:#475467;font-weight:600;width:40px;flex-shrink:0'
        row.appendChild(idxEl)
        var tc = h('span', { class: '__xd_tag ' + (t === 'string' ? 's2' : t === 'number' ? 'get' : t === 'boolean' ? 's3' : t === 'object' || t === 'array' ? 's4' : 'pending') }, t)
        row.appendChild(tc)
        var vEl = h('span', null, fmtShort(v))
        vEl.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;color:#101828;min-width:0'
        row.appendChild(vEl)
        var wr = sg.writeCount ? sg.writeCount() : 0
        if (wr) {
          var wEl = h('span', null, wr + 'w')
          wEl.style.cssText = 'color:#b54708;font-size:10.5px;flex-shrink:0;font-weight:600'
          row.appendChild(wEl)
        }
        var sb = sg.subsCount ? sg.subsCount() : 0
        if (sb) {
          var sEl = h('span', null, sb + 's')
          sEl.style.cssText = 'color:#027a48;font-size:10.5px;flex-shrink:0;font-weight:600'
          row.appendChild(sEl)
        }
        row.appendChild(copyBtn(function () { return JSON.stringify({ index: idx, type: t, value: v }, null, 2) }, ''))
        row.onclick = function () { showSigDetail(sg, idx) }
        bodyEl.appendChild(row)
      })(filtered[fi], fi)
    }
  }

  function showSigDetail(sg, i) {
    bodyEl.innerHTML = ''
    var back = h('div', { class: '__xd_back' })
    back.appendChild(svg(ICONS.back, 13))
    back.appendChild(document.createTextNode('返回'))
    back.onclick = renderBody
    bodyEl.appendChild(back)

    var v; try { v = sg() } catch (e) { v = '<err>' }
    var t = typeOf(v)
    var meta = XD.sigMeta.get(sg) || { writes: [] }
    var writes = meta.writes || []

    var head = h('div', { class: '__xd_head-detail' })
    var l1 = h('div', { class: '__xd_url' })
    l1.appendChild(h('span', { class: '__xd_tag ' + (t === 'string' ? 's2' : t === 'number' ? 'get' : t === 'boolean' ? 's3' : 'pending') }, '#' + i + ' ' + t))
    var sp = h('span'); sp.style.flex = '1'
    l1.appendChild(sp)
    l1.appendChild(copyBtn(function () {
      return JSON.stringify({ index: i, type: t, value: v, writes: sg.writeCount ? sg.writeCount() : 0, subs: sg.subsCount ? sg.subsCount() : 0, history: writes.slice(-30) }, null, 2)
    }, '复制全部'))
    head.appendChild(l1)
    var m2 = h('div', { class: '__xd_meta' })
    m2.innerHTML = '<span>写入 <b>' + (sg.writeCount ? sg.writeCount() : writes.length) + '</b></span><span>订阅 <b>' + (sg.subsCount ? sg.subsCount() : 0) + '</b></span>'
    head.appendChild(m2)
    bodyEl.appendChild(head)

    var title1 = h('div', { class: '__xd_dtitle' })
    title1.appendChild(h('span', null, '当前值'))
    title1.appendChild(copyBtn(function () { return typeof v === 'string' ? v : JSON.stringify(v, null, 2) }))
    bodyEl.appendChild(title1)
    var code = h('div', { class: '__xd_code' })
    if (typeof v === 'object' && v !== null) { try { code.textContent = JSON.stringify(v, null, 2) } catch (e) { code.textContent = String(v) } }
    else { code.textContent = String(v) }
    bodyEl.appendChild(code)

    if (writes.length) {
      var title2 = h('div', { class: '__xd_dtitle' })
      title2.appendChild(h('span', null, '写入历史（' + Math.min(writes.length, 20) + '）'))
      title2.appendChild(copyBtn(function () { return JSON.stringify(writes.slice(-20), null, 2) }))
      bodyEl.appendChild(title2)
      var list = h('div', { class: '__xd_kv' })
      writes.slice(-20).reverse().forEach(function (w) {
        var row = h('div', { class: 'r' })
        row.appendChild(h('div', { class: 'k' }, fmtTime(w.t)))
        row.appendChild(h('div', { class: 'v' }, fmtShort(w.from) + '  →  ' + fmtShort(w.to)))
        list.appendChild(row)
      })
      bodyEl.appendChild(list)
    }
  }

  /* ============ 控制台 ============ */
  function renderConsole() {
    var bar = h('div', { class: '__xd_req' })
    var inp = h('input', { placeholder: '输入 JS 表达式，回车执行' })
    inp.onkeydown = function (e) {
      if (e.key === 'Enter' && inp.value.trim()) {
        var code = inp.value
        inp.value = ''
        XD.logs.push({ level: 'info', text: '> ' + code })
        try { var r = (0, eval)(code); XD.logs.push({ level: 'log', text: typeof r === 'object' ? JSON.stringify(r) : String(r) }) }
        catch (err) { XD.logs.push({ level: 'error', text: String(err) }) }
        renderTabs(); renderBody()
      }
    }
    var goBtn = h('button', null, '执行')
    goBtn.onclick = function () { inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })) }
    bar.appendChild(inp); bar.appendChild(goBtn)
    bodyEl.appendChild(bar)

    if (!XD.logs.length) return bodyEl.appendChild(h('div', { class: '__xd_empty' }, '暂无输出'))
    XD.logs.slice(-200).forEach(function (l, idx) {
      var row = h('div', { class: 'anim' })
      row.style.cssText = 'padding:8px 14px;font-size:12px;border-bottom:1px solid #f2f4f7;' +
        'display:flex;gap:8px;align-items:flex-start;' +
        'animation-delay:' + Math.min(idx * 0.01, 0.2) + 's;' +
        'color:' + (l.level === 'error' ? '#b42318' : l.level === 'warn' ? '#b54708' : l.level === 'info' ? '#3538cd' : '#101828')
      var txt = h('div')
      txt.style.cssText = 'flex:1;min-width:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,monospace;line-height:1.6'
      txt.textContent = l.text
      row.appendChild(txt)
      row.appendChild(copyBtn(function () { return l.text }, ''))
      bodyEl.appendChild(row)
    })
  }

  /* ============ 性能 ============ */
  function renderPerf() {
    var m = collectPerf()
    var head = h('div', { class: '__xd_dtitle' })
    head.appendChild(h('span', null, '性能快照'))
    head.appendChild(copyBtn(function () { return JSON.stringify(m, null, 2) }, '复制 JSON'))
    bodyEl.appendChild(head)

    var stats = h('div', { class: '__xd_stats' })
    ;[
      ['FCP', m.fcp ? fmtMs(m.fcp) : '—', '首次内容绘制'],
      ['LCP', m.lcp ? fmtMs(m.lcp) : '—', '最大内容绘制'],
      ['DOM Ready', m.domReady ? fmtMs(m.domReady) : '—', ''],
      ['Load', m.load ? fmtMs(m.load) : '—', ''],
      ['DOM 节点', String(m.domNodes || 0), ''],
      ['资源数', String(m.resources || 0), ''],
      ['JS 堆', m.jsHeap ? fmtBytes(m.jsHeap) : '—', ''],
      ['长任务', String(XD.longTasks.length), '>50ms']
    ].forEach(function (p, i) {
      var c = h('div', { class: '__xd_stat' })
      c.style.animationDelay = (i * 0.04) + 's'
      c.appendChild(h('div', { class: 'k' }, p[0]))
      c.appendChild(h('div', { class: 'v' }, p[1]))
      if (p[2]) c.appendChild(h('div', { class: 'h' }, p[2]))
      stats.appendChild(c)
    })
    bodyEl.appendChild(stats)

    var stageTitle = h('div', { class: '__xd_dtitle' })
    stageTitle.appendChild(h('span', null, '请求分解'))
    bodyEl.appendChild(stageTitle)

    var stages = [['DNS', m.dns || 0, '#6366f1'], ['TCP', m.tcp || 0, '#8b5cf6'], ['TTFB', m.ttfb || 0, '#a78bfa'], ['下载', m.download || 0, '#0e7490'], ['DOM 解析', m.domParse || 0, '#027a48']]
    var total = 0
    stages.forEach(function (s) { total += s[1] })
    if (total <= 0) total = 1
    var bar = h('div', { class: '__xd_bar' })
    stages.forEach(function (s) {
      if (s[1] <= 0) return
      var seg = h('div')
      seg.style.background = s[2]
      seg.style.width = '0'
      setTimeout(function () { seg.style.width = (s[1] / total * 100) + '%' }, 50)
      bar.appendChild(seg)
    })
    bodyEl.appendChild(bar)

    var leg = h('div', { class: '__xd_legend' })
    stages.forEach(function (s) {
      if (s[1] <= 0) return
      var r = h('div', { class: 'r' })
      var l = h('span')
      l.innerHTML = '<span class="__xd_dot" style="background:' + s[2] + '"></span>' + s[0]
      r.appendChild(l)
      r.appendChild(h('span', { class: 'v' }, fmtMs(s[1])))
      leg.appendChild(r)
    })
    bodyEl.appendChild(leg)

    if (XD.longTasks.length) {
      var t2 = h('div', { class: '__xd_dtitle' })
      t2.appendChild(h('span', null, '长任务'))
      bodyEl.appendChild(t2)
      var list = h('div', { class: '__xd_kv' })
      XD.longTasks.slice().sort(function (a, b) { return b.duration - a.duration }).slice(0, 15).forEach(function (t) {
        var r = h('div', { class: 'r' })
        r.appendChild(h('div', { class: 'k' }, fmtMs(t.start) + ' 时刻'))
        var v = h('div', { class: 'v' }, fmtMs(t.duration))
        if (t.duration > 200) v.style.color = '#b42318'
        else if (t.duration > 100) v.style.color = '#b54708'
        r.appendChild(v)
        list.appendChild(r)
      })
      bodyEl.appendChild(list)
    }
  }

  function collectPerf() {
    var m = {}
    try {
      var nav = performance.getEntriesByType('navigation')[0]
      if (nav) {
        m.dns = nav.domainLookupEnd - nav.domainLookupStart
        m.tcp = nav.connectEnd - nav.connectStart
        m.ttfb = nav.responseStart - nav.requestStart
        m.download = nav.responseEnd - nav.responseStart
        m.domParse = nav.domInteractive - nav.responseEnd
        m.domReady = nav.domContentLoadedEventEnd - nav.startTime
        m.load = nav.loadEventEnd - nav.startTime
      }
    } catch (e) {}
    try { performance.getEntriesByType('paint').forEach(function (p) { if (p.name === 'first-contentful-paint') m.fcp = p.startTime }) } catch (e) {}
    if (XD._lcp) m.lcp = XD._lcp
    try { if (performance.memory) { m.jsHeap = performance.memory.usedJSHeapSize; m.jsHeapLimit = performance.memory.jsHeapSizeLimit } } catch (e) {}
    try { m.domNodes = document.getElementsByTagName('*').length; m.resources = performance.getEntriesByType('resource').length } catch (e) {}
    return m
  }

  try { if (window.PerformanceObserver) { new PerformanceObserver(function (list) { var es = list.getEntries(); if (es.length) XD._lcp = es[es.length - 1].startTime }).observe({ entryTypes: ['largest-contentful-paint'] }) } } catch (e) {}
  try { if (window.PerformanceObserver) { new PerformanceObserver(function (list) { var es = list.getEntries(); for (var i = 0; i < es.length; i++) { XD.longTasks.push({ start: es[i].startTime, duration: es[i].duration }); if (XD.longTasks.length > 100) XD.longTasks.shift() } }).observe({ entryTypes: ['longtask'] }) } } catch (e) {}

  /* ============ 打开/关闭 ============ */
  function open() {
    if (XD.open) return
    XD.open = true
    injectStyle()
    startHooks()
    panel = h('div', { class: '__xd_panel ' + (isMobile() ? 'mobile' : 'desktop') })

    var head = h('div', { class: '__xd_head' })
    head.appendChild(h('span', { class: '__xd_title' }, 'DevTools'))
    head.appendChild(h('span', { class: '__xd_sp' }))
    var clr = h('button', { class: '__xd_hbtn', title: '清空' })
    clr.appendChild(svg(ICONS.trash, 14))
    clr.onclick = function () { XD.nets.length = 0; XD.logs.length = 0; XD.signals.length = 0; XD.longTasks.length = 0; renderTabs(); renderBody() }
    head.appendChild(clr)
    var x = h('button', { class: '__xd_hbtn', title: '关闭' })
    x.appendChild(svg(ICONS.close, 15))
    x.onclick = close
    head.appendChild(x)
    panel.appendChild(head)

    tabsEl = h('div', { class: '__xd_tabs' })
    panel.appendChild(tabsEl)
    bodyEl = h('div', { class: '__xd_body' })
    panel.appendChild(bodyEl)

    document.body.appendChild(panel)
    btn.classList.add('on')
    btn.innerHTML = ''
    btn.appendChild(svg(ICONS.close, 20))
    if (isMobile()) btn.style.bottom = 'calc(72vh + 16px)'

    renderTabs()
    renderBody()
  }

  function close() {
    if (!XD.open) return
    XD.open = false
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel)
    if (hlEl && hlEl.parentNode) hlEl.parentNode.removeChild(hlEl)
    hlEl = null
    panel = null; bodyEl = null; tabsEl = null
    btn.classList.remove('on')
    btn.innerHTML = ''
    btn.appendChild(svg(ICONS.dev, 22))
    btn.style.bottom = '20px'
  }

  btn.addEventListener('click', function () {
    if (btn.__skip) return
    if (XD.open) close()
    else open()
  })

  /* ============ 数据采集 ============ */
  function startHooks() {
    try {
      if (window.fetch && !window.fetch.__xd) {
        var origFetch = window.fetch
        var wrap = function (input, init) {
          var url = typeof input === 'string' ? input : (input && input.url) || ''
          var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase()
          var start = performance.now()
          var entry = { url: url, method: method, start: start, status: 0, statusText: '', duration: 0,
            reqHeaders: (init && init.headers) || {}, reqBody: init && init.body ? String(init.body) : '',
            resHeaders: {}, resBody: '', size: 0, error: null }
          XD.nets.push(entry)
          if (XD.nets.length > 200) XD.nets.shift()
          if (XD.open && XD.tab === 'network') { renderTabs(); renderBody() }
          return origFetch.apply(this, arguments).then(function (r) {
            entry.status = r.status
            entry.statusText = r.statusText || ''
            entry.duration = performance.now() - start
            try { r.headers.forEach(function (v, k) { entry.resHeaders[k] = v }) } catch (e) {}
            try { r.clone().text().then(function (t) { entry.resBody = t.slice(0, 16000); entry.size = t.length }) } catch (e) {}
            if (XD.open && XD.tab === 'network') { renderTabs(); renderBody() }
            return r
          }).catch(function (err) {
            entry.error = String(err && err.message || err)
            entry.duration = performance.now() - start
            if (XD.open && XD.tab === 'network') { renderTabs(); renderBody() }
            throw err
          })
        }
        wrap.__xd = true
        window.fetch = wrap
      }
    } catch (e) {}
    try {
      if (!window.__xd_console) {
        window.__xd_console = true
        var oLog = console.log, oWarn = console.warn, oErr = console.error
        var push = function (level, text) {
          XD.logs.push({ level: level, text: text })
          if (XD.logs.length > 300) XD.logs.shift()
          if (XD.open && XD.tab === 'console') { renderTabs(); renderBody() }
        }
        console.log = function () { push('log', Array.prototype.map.call(arguments, fmt).join(' ')); oLog.apply(console, arguments) }
        console.warn = function () { push('warn', Array.prototype.map.call(arguments, fmt).join(' ')); oWarn.apply(console, arguments) }
        console.error = function () { push('error', Array.prototype.map.call(arguments, fmt).join(' ')); oErr.apply(console, arguments) }
      }
    } catch (e) {}
    try {
      var rt = window.__XUNAY_RUNTIME__
      if (rt && rt.hooks && !rt.hooks.__xd) {
        rt.hooks.__xd = true
        var origCreate = rt.hooks.onSignalCreate
        rt.hooks.onSignalCreate = function (s) {
          XD.signals.push(s)
          if (XD.signals.length > 500) XD.signals.shift()
          XD.sigMeta.set(s, { writes: [] })
          if (XD.open && XD.tab === 'signals') { renderTabs(); renderBody() }
          if (origCreate) origCreate(s)
        }
        var origSet = rt.hooks.onSignalSet
        rt.hooks.onSignalSet = function (sg, o, n, c) {
          var m = XD.sigMeta.get(sg)
          if (m) { m.writes.push({ from: o, to: n, t: Date.now() }); if (m.writes.length > 50) m.writes.shift() }
          if (origSet) origSet(sg, o, n, c)
        }
      }
    } catch (e) {}
  }

  // hooks 延迟到 open() 时挂载 —— 页面加载零开销

  window.openDevtools = open
  window.closeDevtools = close
})()
