// 代码编辑器
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("代码编辑器"),
    P("带行号的编辑器 + 实时预览。"),
    H2("代码"),
    Code("import { div, textarea, pre, code, signal, computed, effect, mount } from 'xunay'\nimport { highlight } from '../core/src/hl.js'\n\nconst code_ = signal(localStorage.getItem('editor-code') || 'const n = signal(0)\\nconst double = computed(() => n() * 2)\\n\\ndiv(null, () => String(double()))')\nconst lang = signal('js')\n\neffect(() => localStorage.setItem('editor-code', code_()))\n\nconst lineCount = computed(() => code_().split('\\n').length)\nconst highlighted = computed(() => highlight(code_(), lang()))\n\nmount(() => div({ class: 'editor' },\n  div({ class: 'editor-header' },\n    div({ class: 'editor-lang' },\n      ['js', 'ts', 'html', 'css'].map(l =>\n        button({\n          class: () => 'lang-btn' + (lang() === l ? ' on' : ''),\n          on: { click: () => lang(l) }\n        }, l)\n      )\n    ),\n    div({ class: 'editor-info' }, () => lineCount() + ' 行 · ' + code_().length + ' 字符')\n  ),\n  div({ class: 'editor-body' },\n    div({ class: 'editor-gutter' },\n      ...Array.from({ length: lineCount() }, (_, i) => div({ class: 'ln' }, String(i + 1)))\n    ),\n    textarea({\n      class: 'editor-input',\n      value: () => code_(),\n      on: {\n        input: e => code_(e.target.value),\n        scroll: e => {\n          const g = document.querySelector('.editor-gutter')\n          if (g) g.scrollTop = e.target.scrollTop\n        }\n      },\n      spellcheck: 'false'\n    })\n  ),\n  div({ class: 'editor-preview' },\n    pre(null, code({ html: () => highlighted() }))\n  )\n), '#app')", "xuy"),
  )
}
