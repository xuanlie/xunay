// ═══════════════════════════════════════════════════════════════
// xunay/kit/ui/codemirror.js
// CodeMirror 6 封装 · 轻量文件编辑器
// 用法：import { CodeEditor } from '/root/xunay/core/src/Kit/ui/codemirror.js'
// ═══════════════════════════════════════════════════════════════
import { px } from './util.js'
import { div } from '../../element.js'
import { effect, onCleanup } from '../../core.js'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { StreamLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { python } from '@codemirror/lang-python'
import { markdown } from '@codemirror/lang-markdown'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { sql } from '@codemirror/lang-sql'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { rust } from '@codemirror/lang-rust'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { php } from '@codemirror/lang-php'
import { shell } from '@codemirror/legacy-modes/mode/shell'

// ─── .xuy 自定义语法 ───────────────────────────────
const XUNAY_APIS = new Set([
  'signal', 'effect', 'computed', 'show', 'list', 'tag', 'frag', 'go', 'route',
  'div', 'span', 'button', 'input', 'pre', 'code', 'a', 'p',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'label',
  'select', 'option', 'textarea', 'canvas', 'video', 'audio',
  'header', 'footer', 'nav', 'main', 'section', 'article',
])

const XUYG_KEYWORDS = new Set(['cpt', 'pag', 'dt', 'xuy', 'sdu', 'psc', 'vmodel'])

const xuyLang = StreamLanguage.define({
  name: 'xuy',
  startState: () => ({ inBlockComment: false }),
  token(stream, state) {
    if (state.inBlockComment) {
      if (stream.match(/.*?\*\//)) { state.inBlockComment = false; return 'comment' }
      stream.skipToEnd(); return 'comment'
    }
    if (stream.match(/\/\*/)) { state.inBlockComment = true; return 'comment' }
    if (stream.match(/\/\/.*/)) return 'comment'

    if (stream.match(/^`(?:[^`\\]|\\.)*`/)) return 'string'
    if (stream.match(/^'(?:[^'\\]|\\.)*'/)) return 'string'
    if (stream.match(/^"(?:[^"\\]|\\.)*"/)) return 'string'

    // xuyg 变量前缀：$VAR / #VAR / cVAR
    if (stream.match(/^[$#][A-Za-z_$][\w$]*/)) return 'variableName.special'
    if (stream.match(/^c[A-Z][A-Za-z0-9_$]*/)) return 'variableName.special'

    if (stream.match(/^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)) return 'number'

    // xuyg 关键字
    if (stream.match(/^(?:cpt|pag|dt|xuy|sdu|psc|vmodel)\b/)) return 'macroName'

    // sdu5 / sdu3 标签
    if (stream.match(/^sdu\d+/)) return 'macroName'

    // JS 关键字
    if (stream.match(/^(?:import|export|from|as|default|const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|super|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|async|await|yield|true|false|null|undefined)\b/)) return 'keyword'

    // 事件属性 onClick / onInput 等
    if (stream.match(/^on[A-Z][a-zA-Z]*\b/)) return 'propertyName'

    // xunay API / 普通标识符
    if (stream.match(/^[a-zA-Z_$][\w$]*/)) {
      const word = stream.current()
      if (XUNAY_APIS.has(word)) return 'typeName'
      if (XUYG_KEYWORDS.has(word)) return 'macroName'
      if (stream.peek() === '(') return 'variableName.function'
      return 'variableName'
    }

    if (stream.match(/^[+\-*/%=<>!&|^~?:;,.(){}\[\]]/)) return 'operator'

    stream.next()
    return null
  }
})

// ─── 语言注册表 ─────────────────────────────────────
const LANG_BY_EXT = {
  js: () => javascript(), mjs: () => javascript(), cjs: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  ts: () => javascript({ typescript: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  json: () => json(),
  py: () => python(),
  md: () => markdown(), markdown: () => markdown(),
  html: () => html(), htm: () => html(),
  css: () => css(), scss: () => css(), less: () => css(),
  sql: () => sql(),
  xml: () => xml(),
  yaml: () => yaml(), yml: () => yaml(),
  rs: () => rust(),
  java: () => java(),
  cpp: () => cpp(), c: () => cpp(), h: () => cpp(), hpp: () => cpp(),
  php: () => php(),
  xuy: () => xuyLang,
  sh: () => StreamLanguage.define(shell), bash: () => StreamLanguage.define(shell),
}

function extOf(name) {
  const m = (name || '').match(/\.([^.]+)$/)
  return m ? m[1].toLowerCase() : ''
}

function langFor(name, explicit) {
  if (explicit && LANG_BY_EXT[explicit]) return LANG_BY_EXT[explicit]()
  const fn = LANG_BY_EXT[extOf(name)]
  return fn ? fn() : []
}

// ─── 主题 ───────────────────────────────────────────
const lightTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', background: '#fff', color: '#1f2328' },
  '.cm-scroller': { fontFamily: 'ui-monospace, Menlo, Consolas, monospace', lineHeight: '1.7' },
  '.cm-content': { padding: '14px 0', caretColor: '#2563eb' },
  '.cm-gutters': { background: '#fafbfc', color: '#8b949e', border: 'none', borderRight: '1px solid #eaeef2', paddingRight: '6px' },
  '.cm-activeLineGutter': { background: '#eff2f6', color: '#57606a' },
  '.cm-activeLine': { background: '#f6f8fa' },
  '.cm-selectionBackground, ::selection': { background: '#bfdbfe !important' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#2563eb', borderLeftWidth: '2px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-searchMatch': { background: '#fef3c7' },
  '.cm-searchMatch-selected': { background: '#fde68a' },
  '.cm-panels': { background: '#fafbfc', color: '#1f2328', borderBottom: '1px solid #eaeef2' },
  '.cm-panels.cm-panels-top': { borderTop: 'none' },
  '.cm-tooltip': { background: '#fff', border: '1px solid #eaeef2', borderRadius: '6px' },
  '.cm-foldPlaceholder': { background: '#eff2f6', border: 'none', color: '#57606a' },
}, { dark: false })

const darkTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', background: '#0d1117', color: '#e6edf3' },
  '.cm-scroller': { fontFamily: 'ui-monospace, Menlo, Consolas, monospace', lineHeight: '1.7' },
  '.cm-content': { padding: '14px 0', caretColor: '#58a6ff' },
  '.cm-gutters': { background: '#0d1117', color: '#6e7681', border: 'none', borderRight: '1px solid #21262d', paddingRight: '6px' },
  '.cm-activeLineGutter': { background: '#161b22', color: '#8b949e' },
  '.cm-activeLine': { background: '#161b22' },
  '.cm-selectionBackground, ::selection': { background: '#264f78 !important' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#58a6ff', borderLeftWidth: '2px' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true })

// ─── 语法高亮 · 浅色（GitHub Light） ────────────────
const lightHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: '#cf222e', fontWeight: '600' },
  { tag: [t.operator], color: '#cf222e' },
  { tag: [t.string, t.special(t.string)], color: '#0a3069' },
  { tag: [t.regexp], color: '#0a3069' },
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: '#6e7781', fontStyle: 'italic' },
  { tag: [t.number, t.bool, t.null, t.atom], color: '#0550ae' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: '#8250df' },
  { tag: [t.macroName], color: '#953800', fontWeight: '700' },
  { tag: [t.variableName, t.definition(t.variableName)], color: '#24292f' },
  { tag: [t.typeName, t.className, t.namespace], color: '#953800' },
  { tag: [t.propertyName, t.attributeName], color: '#0550ae' },
  { tag: [t.tagName], color: '#116329' },
  { tag: [t.angleBracket, t.bracket, t.brace, t.paren, t.punctuation, t.separator], color: '#57606a' },
  { tag: [t.meta, t.annotation], color: '#6e7781' },
  { tag: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6], color: '#0550ae', fontWeight: '700' },
  { tag: [t.link, t.url], color: '#0969da', textDecoration: 'underline' },
  { tag: [t.strong], fontWeight: '700' },
  { tag: [t.emphasis], fontStyle: 'italic' },
  { tag: [t.strikethrough], textDecoration: 'line-through' },
  { tag: [t.quote], color: '#57606a', fontStyle: 'italic' },
  { tag: [t.list], color: '#953800' },
  { tag: [t.contentSeparator], color: '#8b949e' },
  { tag: [t.invalid], color: '#cf222e', textDecoration: 'underline wavy' },
])

// ─── 语法高亮 · 深色（One Dark） ────────────────
const darkHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword, t.definitionKeyword, t.moduleKeyword], color: '#c678dd', fontWeight: '600' },
  { tag: [t.operator], color: '#56b6c2' },
  { tag: [t.string, t.special(t.string)], color: '#98c379' },
  { tag: [t.regexp], color: '#98c379' },
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: '#5c6370', fontStyle: 'italic' },
  { tag: [t.number, t.bool, t.null, t.atom], color: '#d19a66' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: '#61afef' },
  { tag: [t.macroName], color: '#e5c07b', fontWeight: '700' },
  { tag: [t.variableName, t.definition(t.variableName)], color: '#e6edf3' },
  { tag: [t.typeName, t.className, t.namespace], color: '#e5c07b' },
  { tag: [t.propertyName, t.attributeName], color: '#d19a66' },
  { tag: [t.tagName], color: '#e06c75' },
  { tag: [t.angleBracket, t.bracket, t.brace, t.paren, t.punctuation, t.separator], color: '#abb2bf' },
  { tag: [t.meta, t.annotation], color: '#5c6370' },
  { tag: [t.heading, t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6], color: '#e5c07b', fontWeight: '700' },
  { tag: [t.link, t.url], color: '#61afef', textDecoration: 'underline' },
  { tag: [t.strong], fontWeight: '700' },
  { tag: [t.emphasis], fontStyle: 'italic' },
  { tag: [t.strikethrough], textDecoration: 'line-through' },
  { tag: [t.quote], color: '#5c6370', fontStyle: 'italic' },
  { tag: [t.list], color: '#d19a66' },
  { tag: [t.contentSeparator], color: '#5c6370' },
  { tag: [t.invalid], color: '#e06c75', textDecoration: 'underline wavy' },
])

// ─── 自包含样式 ─────────────────────────────────────
let _styleInjected = false
function ensureStyle() {
  if (_styleInjected || typeof document === 'undefined') return
  if (document.getElementById('x-cm-style')) { _styleInjected = true; return }
  const s = document.createElement('style')
  s.id = 'x-cm-style'
  s.textContent = `
.x-cm { width:100%; height:100%; display:flex; flex-direction:column; background:#fff; overflow:hidden }
.x-cm.dark { background:#0d1117 }
.x-cm > .cm-editor { flex:1 1 0; min-height:0; height:100% }
.x-cm .cm-scroller { overflow:auto }
`
  document.head.appendChild(s)
  _styleInjected = true
}

// ─── 组件 ───────────────────────────────────────────
export function CodeEditor(props) {
  const {
    value,
    name,
    language,
    readOnly = false,
    onChange,
    onSave,
    onClose,
    theme = 'light',
    height = null,
  } = px(props)

  const val = typeof value === 'function' ? value : () => value
  let view = null
  let lastDoc = ''

  ensureStyle()

  function getTheme(themeName) {
    return themeName === 'dark' ? darkTheme : lightTheme
  }

  function mount(el) {
    if (!el || view) return

    const _tn = typeof theme === 'function' ? theme() : theme
    const extensions = [
      basicSetup,
      langFor(name, language),
      getTheme(_tn),
      syntaxHighlighting(_tn === 'dark' ? darkHighlight : lightHighlight),
      keymap.of([
        { key: 'Mod-s', run: () => { onSave && onSave(); return true } },
        { key: 'Escape', run: () => { onClose && onClose(); return true } },
      ]),
      EditorView.updateListener.of(u => {
        if (u.docChanged) {
          const next = u.state.doc.toString()
          if (next !== lastDoc) {
            lastDoc = next
            onChange && onChange(next)
          }
        }
      }),
    ]
    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true))
      extensions.push(EditorView.editable.of(false))
    }

    const state = EditorState.create({ doc: val() || '', extensions })
    view = new EditorView({ state, parent: el })
    lastDoc = state.doc.toString()

    effect(() => {
      const v = val() || ''
      if (!view) return
      const current = view.state.doc.toString()
      if (current === v) return
      view.dispatch({ changes: { from: 0, to: current.length, insert: v } })
      lastDoc = v
    })

    onCleanup(() => {
      if (view) { view.destroy(); view = null }
    })

    setTimeout(() => { if (view) view.focus() }, 30)
  }

  const themeName = typeof theme === 'function' ? theme() : theme
  const heightStyle = typeof height === 'function' ? height() : height

  return div({
    class: 'x-cm' + (themeName === 'dark' ? ' dark' : ''),
    style: heightStyle ? `height:${heightStyle}px` : '',
    ref: el => { if (el) mount(el) }
  })
}
