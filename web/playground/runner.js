const DEFAULT_CODE = `import { div, h1, p, button, span, signal, mount } from 'xunay'

const n = signal(0)

mount(() => div({ style: { padding: '20px', fontFamily: 'sans-serif' } },
  h1(null, 'Hello XuNay'),
  p(null, '这是一个在线 Playground'),
  div({ style: { display: 'flex', gap: '12px', alignItems: 'center' } },
    button({ on: { click: () => n(v => v - 1) } }, '-'),
    span(null, () => n()),
    button({ on: { click: () => n(v => v + 1) } }, '+')
  )
), '#app')
`

const SUBMAP = {
  kit: 'xunay-kit', anim: 'xunay-anim', tags: 'xunay-tags', alias: 'xunay-alias',
  ssr: 'xunay-ssr', devtools: 'xunay-devtools', advanced: 'xunay-advanced',
  dev: 'xunay-dev', form: 'xunay-form', http: 'xunay-http', i18n: 'xunay-i18n',
  theme: 'xunay-theme', query: 'xunay-query', persist: 'xunay-persist',
  router: 'xunay-router', storage: 'xunay-storage', mobile: 'xunay-mobile',
  auth: 'xunay-auth', audio: 'xunay-audio', music: 'xunay-music',
  game: 'xunay-game', 'game-mobile': 'xunay-game-mobile', babylon: 'xunay-babylon',
}

function rewriteImports(code) {
  return code.replace(/from\s+(['"])xunay(\/[^'"]*)?\1/g, (m, q, sub) => {
    if (!sub) return 'from ' + q + '/xunay.js' + q
    const name = sub.slice(1).split('/')[0]
    const file = SUBMAP[name]
    if (!file) return m
    return 'from ' + q + '/' + file + '.js' + q
  })
}

const codeEl = document.getElementById('code')
const previewEl = document.getElementById('preview')
const runBtn = document.getElementById('run')
const resetBtn = document.getElementById('reset')
const shareBtn = document.getElementById('share')

function getInitial() {
  const hash = location.hash.slice(1)
  if (hash) { try { return decodeURIComponent(escape(atob(hash))) } catch (e) {} }
  return DEFAULT_CODE
}

codeEl.value = getInitial()

function run() {
  const userCode = rewriteImports(codeEl.value)
  const html = [
    '<!DOCTYPE html>',
    '<html><head><meta charset="UTF-8">',
    '<link rel="stylesheet" href="/tw.css">',
    '<link rel="stylesheet" href="/ui.css">',
    '<style>body{margin:0;font-family:-apple-system,sans-serif;padding:16px}#err{display:none;padding:14px;background:#fff0f0;color:#cf222e;font-family:ui-monospace,monospace;font-size:12px;white-space:pre-wrap;border-bottom:1px solid #ffb3b3;max-height:60vh;overflow:auto}</style>',
    '</head><body>',
    '<pre id="err"></pre>',
    '<div id="app"></div>',
    '<scr' + 'ipt>',
    '(function(){',
    '  function show(msg){',
    '    var e = document.getElementById("err");',
    '    e.style.display = "block";',
    '    e.textContent += msg + "\\n\\n";',
    '  }',
    '  window.addEventListener("error", function(e){',
    '    show("[ERROR] " + (e.filename || "") + ":" + (e.lineno || "") + "\\n" + ((e.error && e.error.stack) || e.message || "unknown"));',
    '  }, true);',
    '  window.addEventListener("unhandledrejection", function(e){',
    '    var r = e.reason;',
    '    show("[REJECT] " + ((r && (r.stack || r.message)) || String(r)));',
    '  });',
    '  window.addEventListener("load", function(){',
    '    setTimeout(function(){',
    '      if (!document.getElementById("app").children.length && !document.getElementById("err").textContent) {',
    '        document.getElementById("err").style.display = "block";',
    '        document.getElementById("err").textContent = "[空] module 已执行但 #app 没有内容。检查代码里 mount 的目标选择器。";',
    '      }',
    '    }, 300);',
    '  });',
    '})();',
    '</scr' + 'ipt>',
    '<scr' + 'ipt type="module">',
    userCode,
    '</scr' + 'ipt>',
    '</body></html>'
  ].join('\n')
  previewEl.srcdoc = html
}

runBtn.onclick = run
resetBtn.onclick = () => { codeEl.value = DEFAULT_CODE; run() }
shareBtn.onclick = () => {
  const encoded = btoa(unescape(encodeURIComponent(codeEl.value)))
  location.hash = encoded
  const url = location.href
  navigator.clipboard.writeText(url).then(() => {
    shareBtn.textContent = '已复制'
    setTimeout(() => shareBtn.textContent = '分享', 1500)
  }).catch(() => { prompt('复制此链接：', url) })
}

codeEl.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run() }
  if (e.key === 'Tab') {
    e.preventDefault()
    const s = codeEl.selectionStart
    codeEl.value = codeEl.value.slice(0, s) + '  ' + codeEl.value.slice(codeEl.selectionEnd)
    codeEl.selectionStart = codeEl.selectionEnd = s + 2
  }
})

run()
