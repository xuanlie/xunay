const DEFAULT_CODE = `// 编辑代码，点运行查看效果
const { div, h1, p, button, span, signal, mount } = XuNay

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

const codeEl = document.getElementById('code')
const previewEl = document.getElementById('preview')
const runBtn = document.getElementById('run')
const resetBtn = document.getElementById('reset')
const shareBtn = document.getElementById('share')

function getInitial() {
  const hash = location.hash.slice(1)
  if (hash) {
    try { return decodeURIComponent(escape(atob(hash))) } catch (e) {}
  }
  return DEFAULT_CODE
}

codeEl.value = getInitial()

function run() {
  const code = codeEl.value
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>body { margin: 0; font-family: -apple-system, sans-serif; }</style>
</head>
<body>
<div id="app"></div>
<script src="/playground/xunay.js"><\/script>
<script>
window.addEventListener('error', e => {
  document.body.innerHTML = '<pre style="padding:20px;color:#e33;font-family:monospace;white-space:pre-wrap">' + e.message + '\\n' + (e.filename||'') + ':' + (e.lineno||'') + '</pre>'
})
try {
${code}
} catch (e) {
  document.body.innerHTML = '<pre style="padding:20px;color:#e33;font-family:monospace;white-space:pre-wrap">' + e.message + '\\n' + e.stack + '</pre>'
}
<\/script>
</body>
</html>`
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
  }).catch(() => {
    prompt('复制此链接：', url)
  })
}

codeEl.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    run()
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    const start = codeEl.selectionStart
    codeEl.value = codeEl.value.slice(0, start) + '  ' + codeEl.value.slice(codeEl.selectionEnd)
    codeEl.selectionStart = codeEl.selectionEnd = start + 2
  }
})

run()
