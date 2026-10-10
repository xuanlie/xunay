import { px, cx } from './kit-util.js'
import {div, span, button, input, h1, h2, h3, p, label as _label, code, pre, textarea} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './kit.js'

export function CodeEditor(props) {
  const { value, onChange, language = 'js', height = 300, theme = 'onedark', readOnly, lineNumbers = true } = px(props)
  const val = typeof value === 'function' ? value : () => value
  let preEl = null, codeEl = null, taEl = null, lnEl = null
  let lastText = ''
  let lastLang = ''
  let rafId = 0
  let cacheLang = ''
  const cache = new Map()

  const highlightCached = (text, lang) => {
    if (lang !== cacheLang) { cache.clear(); cacheLang = lang }
    const lines = text.split('\n')
    const out = new Array(lines.length)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let h = cache.get(line)
      if (h === undefined) {
        h = highlight(line, lang) || '&#8203;'
        cache.set(line, h)
      }
      out[i] = h
    }
    return out.join('\n')
  }

  const doRender = () => {
    if (!codeEl) return
    const text = val() || ''
    if (text === lastText && language === lastLang) return
    lastText = text
    lastLang = language
    codeEl.innerHTML = highlightCached(text, language) + '\n'
    if (lnEl) {
      const n = text.split('\n').length
      let h = ''
      for (let i = 1; i <= n; i++) h += i + '\n'
      lnEl.textContent = h
    }
  }

  const scheduleRender = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => { rafId = 0; doRender() })
  }

  const onInput = e => { onChange && onChange(e.target.value); scheduleRender() }

  const onScroll = () => {
    if (preEl && taEl) { preEl.scrollTop = taEl.scrollTop; preEl.scrollLeft = taEl.scrollLeft }
    if (lnEl && taEl) lnEl.scrollTop = taEl.scrollTop
  }

  const onKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = taEl.selectionStart, en = taEl.selectionEnd
      const v = taEl.value
      taEl.value = v.slice(0, s) + '  ' + v.slice(en)
      taEl.selectionStart = taEl.selectionEnd = s + 2
      onChange && onChange(taEl.value)
      scheduleRender()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') e.preventDefault()
  }

  return div({ class: 'x-code', 'data-theme': theme, style: { height: height + 'px' } },
    lineNumbers ? div({ class: 'x-code-ln', ref: el => { lnEl = el; scheduleRender() } }) : null,
    div({ class: 'x-code-wrap' },
      pre( { class: 'x-code-pre', ref: el => { preEl = el } },
        code( { ref: el => { codeEl = el } })
      ),
      textarea( {
        class: 'x-code-ta',
        ref: el => {
          taEl = el
          scheduleRender()
          el.addEventListener('scroll', onScroll, { passive: true })
        },
        value: val(),
        readOnly: !!readOnly,
        spellcheck: false,
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        on: { input: onInput, keydown: onKeyDown }
      })
    )
  )
}

// ===== 快捷键监听 =====

export function RichText(props) {
  const { value, onChange, placeholder = '输入内容...' } = px(props)
  const val = typeof value === 'function' ? value : () => value
  const exec = cmd => document.execCommand(cmd, false, null)
  return div({ style: { border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', overflow: 'hidden' } },
    Row({ gap: 0, style: { background: 'var(--x-bg-soft)', borderBottom: '1px solid var(--x-border)', padding: '4px' } },
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('bold') }, 'B'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('italic') }, 'I'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('underline') }, 'U'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('insertUnorderedList') }, '•'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('insertOrderedList') }, '1.'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('removeFormat') }, '清')
    ),
    div({
      contenteditable: true,
      style: { padding: '12px', minHeight: '120px', outline: 'none', fontSize: '14px', lineHeight: '1.6' },
      html: val(),
      on: { input: e => onChange && onChange(e.target.innerHTML) }
    })
  )
}

// ===== 复制按钮 =====

export function CopyButton(props) {
  const { text, label = '复制', copied = '已复制' } = px(props)
  const state = signal(label)
  const copy = () => {
    const t = typeof text === 'function' ? text() : text
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(ok, fail)
    } else {
      const ta = document.createElement('textarea')
      ta.value = t; ta.style.position = 'fixed'; ta.style.left = '-9999px'
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy') ? ok() : fail()
      document.body.removeChild(ta)
    }
  }
  const ok = () => { state(copied); setTimeout(() => state(label), 1200) }
  const fail = () => { state('失败'); setTimeout(() => state(label), 1200) }
  return Btn({ size: 'sm', onClick: copy }, () => state())
}

// ===== 密码强度 =====

export function useHotkey(combo, handler) {
  if (typeof window === 'undefined') return
  const parts = combo.toLowerCase().split('+')
  const needCtrl = parts.includes('ctrl') || parts.includes('cmd') || parts.includes('meta')
  const needShift = parts.includes('shift')
  const needAlt = parts.includes('alt')
  const key = parts.filter(p => !['ctrl','cmd','meta','shift','alt'].includes(p))[0]
  const fn = e => {
    const ctrl = e.ctrlKey || e.metaKey
    if (needCtrl !== ctrl) return
    if (needShift !== e.shiftKey) return
    if (needAlt !== e.altKey) return
    if (e.key.toLowerCase() !== key) return
    e.preventDefault()
    handler(e)
  }
  window.addEventListener('keydown', fn)
  return () => window.removeEventListener('keydown', fn)
}

// ===== 富文本（contenteditable） =====

export function SplitButton(props) {
  const { text, onClick, items = [] } = px(props)
  const open = signal(false)
  return div({ style: { position: 'relative', display: 'inline-block' } },
    Row({ gap: 0 },
      Btn({ type: 'primary', onClick }, text),
      Btn({ type: 'primary', onClick: () => open(!open()), style: { borderLeft: '1px solid rgba(255,255,255,.2)' } }, '▾')
    ),
    show(open, () =>
      div({
        style: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--x-bg-elev)', border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', boxShadow: 'var(--x-shadow-md)', minWidth: '140px', padding: '4px', zIndex: 100 }
      },
        ...items.map(it =>
          div({
            style: { padding: '8px 12px', fontSize: '14px', cursor: 'pointer', borderRadius: '6px' },
            on: {
              click: () => { it.onClick && it.onClick(); open(false) },
              mouseenter: e => e.currentTarget.style.background = 'var(--x-bg-soft)',
              mouseleave: e => e.currentTarget.style.background = 'transparent'
            }
          }, it.label)
        )
      )
    )
  )
}

// ===== 代码编辑器 =====
if (typeof document !== 'undefined' && !document.getElementById('x-code-style')) {
  const THEMES = {
    onedark: { bg:'#282c34', ln:'#21252b', lnfg:'#495162', fg:'#abb2bf', k:'#c678dd', s:'#98c379', c:'#5c6370', n:'#d19a66', f:'#61afef', t:'#e5c07b', m:'#56b6c2', caret:'#528bff', bd:'#3e4451', sel:'rgba(82,139,255,.25)' },
    dracula: { bg:'#282a36', ln:'#21222c', lnfg:'#6272a4', fg:'#f8f8f2', k:'#ff79c6', s:'#f1fa8c', c:'#6272a4', n:'#bd93f9', f:'#50fa7b', t:'#8be9fd', m:'#ffb86c', caret:'#f8f8f0', bd:'#44475a', sel:'rgba(255,121,198,.25)' },
    monokai: { bg:'#272822', ln:'#1e1f1c', lnfg:'#75715e', fg:'#f8f8f2', k:'#f92672', s:'#e6db74', c:'#75715e', n:'#ae81ff', f:'#a6e22e', t:'#66d9ef', m:'#fd971f', caret:'#f8f8f0', bd:'#3e3d32', sel:'rgba(249,38,114,.25)' },
    'github-dark': { bg:'#0d1117', ln:'#161b22', lnfg:'#484f58', fg:'#c9d1d9', k:'#ff7b72', s:'#a5d6ff', c:'#8b949e', n:'#79c0ff', f:'#d2a8ff', t:'#ffa657', m:'#7ee787', caret:'#58a6ff', bd:'#30363d', sel:'rgba(88,166,255,.25)' },
    'github-light': { bg:'#ffffff', ln:'#f6f8fa', lnfg:'#8c959f', fg:'#24292f', k:'#cf222e', s:'#0a3069', c:'#6e7781', n:'#0550ae', f:'#8250df', t:'#953800', m:'#116329', caret:'#0969da', bd:'#d0d7de', sel:'rgba(9,105,218,.15)' },
    nord: { bg:'#2e3440', ln:'#3b4252', lnfg:'#616e88', fg:'#d8dee9', k:'#81a1c1', s:'#a3be8c', c:'#616e88', n:'#b48ead', f:'#88c0d0', t:'#ebcb8b', m:'#8fbcbb', caret:'#88c0d0', bd:'#434c5e', sel:'rgba(136,192,208,.25)' },
    'solarized-dark': { bg:'#002b36', ln:'#073642', lnfg:'#586e75', fg:'#839496', k:'#859900', s:'#2aa198', c:'#586e75', n:'#d33682', f:'#268bd2', t:'#b58900', m:'#cb4b16', caret:'#93a1a1', bd:'#073642', sel:'rgba(38,139,210,.25)' },
    'solarized-light': { bg:'#fdf6e3', ln:'#eee8d5', lnfg:'#93a1a1', fg:'#657b83', k:'#859900', s:'#2aa198', c:'#93a1a1', n:'#d33682', f:'#268bd2', t:'#b58900', m:'#cb4b16', caret:'#586e75', bd:'#eee8d5', sel:'rgba(38,139,210,.15)' },
    'tokyo-night': { bg:'#1a1b26', ln:'#16161e', lnfg:'#3b4261', fg:'#a9b1d6', k:'#bb9af7', s:'#9ece6a', c:'#565f89', n:'#ff9e64', f:'#7aa2f7', t:'#e0af68', m:'#7dcfff', caret:'#c0caf5', bd:'#292e42', sel:'rgba(122,162,247,.25)' },
    catppuccin: { bg:'#1e1e2e', ln:'#181825', lnfg:'#45475a', fg:'#cdd6f4', k:'#cba6f7', s:'#a6e3a1', c:'#6c7086', n:'#fab387', f:'#89b4fa', t:'#f9e2af', m:'#94e2d5', caret:'#f5e0dc', bd:'#313244', sel:'rgba(203,166,247,.25)' }
  }
  let themesCSS = ''
  for (const name in THEMES) {
    const t = THEMES[name]
    themesCSS += '.x-code[data-theme="' + name + '"]{--bg:' + t.bg + ';--ln:' + t.ln + ';--lnfg:' + t.lnfg + ';--fg:' + t.fg + ';--k:' + t.k + ';--s:' + t.s + ';--c:' + t.c + ';--n:' + t.n + ';--f:' + t.f + ';--t:' + t.t + ';--m:' + t.m + ';--caret:' + t.caret + ';--bd:' + t.bd + ';--sel:' + t.sel + '}\n'
  }
  const s = document.createElement('style')
  s.id = 'x-code-style'
  s.textContent = `
.x-code{
  --bg:#282c34;--ln:#21252b;--lnfg:#495162;--fg:#abb2bf;
  --k:#c678dd;--s:#98c379;--c:#5c6370;--n:#d19a66;
  --f:#61afef;--t:#e5c07b;--m:#56b6c2;--caret:#528bff;
  --bd:#3e4451;--sel:rgba(82,139,255,.25);
  display:flex;border:1px solid var(--bd);border-radius:12px;overflow:hidden;
  font-family:"JetBrains Mono","Fira Code",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:13.5px;background:var(--bg);color:var(--fg);
  box-shadow:0 8px 32px rgba(0,0,0,.25);line-height:1.65;
  transition:background .2s,border-color .2s;
}
.x-code-wrap{position:relative;flex:1;min-width:0}
.x-code-pre{
  position:absolute;inset:0;margin:0;padding:14px 16px;
  overflow:auto;pointer-events:none;background:transparent;
  line-height:1.65;white-space:pre;counter-reset:xln;
  font-family:inherit;font-size:inherit;color:var(--fg);
  transition:color .2s;
}
.x-code-pre code{
  display:block;background:transparent!important;border:none!important;padding:0!important;
  font-family:inherit;font-size:inherit;color:inherit;
}
.x-line{
  display:block;
  min-height:1.65em;
  counter-increment:xln;
  padding-left:56px;
  position:relative;
  white-space:pre;
}
.x-line::before{
  content:counter(xln);
  position:absolute;
  left:0;
  width:40px;
  text-align:right;
  color:var(--lnfg);
  user-select:none;
  font-size:12.5px;
  padding-right:14px;
  border-right:1px solid var(--bd);
  margin-right:12px;
  height:100%;
  top:0;
}
.x-code-ta{
  position:absolute;inset:0;margin:0;padding:14px 16px;
  padding-left:72px;
  background:transparent;color:transparent;
  caret-color:var(--caret);
  border:none;outline:none;resize:none;
  font-family:inherit;font-size:inherit;line-height:1.65;
  white-space:pre;overflow:auto;tab-size:2;
}
.x-code-ta::selection{background:var(--sel)}
.h-k{color:var(--k);transition:color .2s}
.h-s{color:var(--s);transition:color .2s}
.h-c{color:var(--c);font-style:italic;transition:color .2s}
.h-n{color:var(--n);transition:color .2s}
.h-f{color:var(--f);transition:color .2s}
.h-t{color:var(--t);transition:color .2s}
.h-m{color:var(--m);transition:color .2s}
` + themesCSS
  document.head.appendChild(s)
}

import { highlight } from './hl.js'
