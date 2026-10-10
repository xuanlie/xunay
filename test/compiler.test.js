import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../compiler2/src/index.js'

// ============================================================
// 基础：编译 vs 原样
// ============================================================

test('空源码 / 无 tag 源码原样返回', () => {
  const src = 'const x = 1\nconst y = x + 2\n'
  assert.equal(compile(src), src)
})

test('顶层 tag 编译成 IIFE + createElement', () => {
  const src = 'const x = div(null, "hi")'
  const out = compile(src)
  assert.ok(out.includes('document.createElement("div")'), out)
  assert.ok(out.includes('(() =>'), out)
})

test('嵌套 tag 递归编译', () => {
  const src = 'const x = div(null, span(null, "hi"))'
  const out = compile(src)
  assert.ok(out.includes('document.createElement("div")'), out)
  assert.ok(out.includes('document.createElement("span")'), out)
})

test('静态文本走 createTextNode', () => {
  const src = 'const x = div(null, "hello")'
  const out = compile(src)
  assert.ok(out.includes('document.createTextNode("hello")'), out)
})

// ============================================================
// 回归：本周修复的 bug
// ============================================================

test('[bug] 字符串里的 tag 不被编译', () => {
  const src = 'const s = "example: div(hello)"'
  const out = compile(src)
  assert.ok(out.includes('"example: div(hello)"'), out)
  assert.ok(!out.includes('document.createElement'), out)
})

test('[bug] 注释里的 tag 不被编译', () => {
  const src = '// div(x) 是例子\nconst y = 1'
  const out = compile(src)
  assert.ok(out.includes('// div(x) 是例子'), out)
  assert.ok(!out.includes('document.createElement'), out)
})

test('[bug] .name( 方法调用不被当标签', () => {
  const src = 'ta.select()'
  const out = compile(src)
  assert.ok(out.includes('ta.select()'), out)
  assert.ok(!out.includes('document.createElement'), out)
})

test('[bug] 无 children 的单标签', () => {
  const src = 'const x = hr({ class: "line" })'
  const out = compile(src)
  assert.ok(out.includes('document.createElement("hr")'), out)
  assert.ok(out.includes('.className = "line"'), out)
})

test('[bug] 词边界：Col 不被拆成 C + ol(', () => {
  const src = 'export function Col(props) { return null }'
  const out = compile(src)
  assert.ok(out.includes('function Col'), out)
  assert.ok(!out.includes('document.createElement("ol")'), out)
})

test('[bug] 多事件 on: { a: f, b: g }', () => {
  const src = 'const x = button({ on: { click: f, mouseenter: g } }, "hi")'
  const out = compile(src)
  assert.ok(out.includes('addEventListener("click", f)'), out)
  assert.ok(out.includes('addEventListener("mouseenter", g)'), out)
})

test('[bug] html 属性走 innerHTML', () => {
  const src = 'const x = code({ html: "<b>hi</b>" })'
  const out = compile(src)
  assert.ok(out.includes('.innerHTML = "<b>hi</b>"'), out)
  assert.ok(!out.includes('setAttribute("html"'), out)
})

test('[bug] 动态 class 走 bindAttr', () => {
  const src = 'const x = div({ class: () => "a" }, "hi")'
  const out = compile(src)
  assert.ok(out.includes('__rt__.bindAttr'), out)
  assert.ok(out.includes('"class"'), out)
})

test('[bug] 动态 disabled 走 bindAttr', () => {
  const src = 'const x = button({ disabled: () => flag() }, "hi")'
  const out = compile(src)
  assert.ok(out.includes('__rt__.bindAttr'), out)
  assert.ok(out.includes('"disabled"'), out)
})

test('[feature] ref 调函数', () => {
  const src = 'const x = div({ ref: el => el.focus() }, "hi")'
  const out = compile(src)
  assert.ok(out.includes("typeof (el => el.focus()) === 'function'"), out)
})

// ============================================================
// A 阶段：嵌套扫描
// ============================================================

test('[A] map 里的 tag 编译', () => {
  const src = 'const x = arr.map(a => div(null, a.id))'
  const out = compile(src)
  assert.ok(out.includes('document.createElement("div")'), out)
})

test('[A] 三元里的 tag 编译', () => {
  const src = 'const x = cond ? span(null, "A") : p(null, "B")'
  const out = compile(src)
  assert.ok(out.includes('document.createElement("span")'), out)
  assert.ok(out.includes('document.createElement("p")'), out)
})

test('[feature] 动态子节点走 bindText', () => {
  const src = 'const x = span(null, () => n())'
  const out = compile(src)
  assert.ok(out.includes('createElement("span")'), out)
  assert.ok(out.includes('__rt__.bindText'), out)
})

test('[feature] 表达式子节点走 renderChild', () => {
  const src = 'const x = div(null, items.map(i => span(null, i)))'
  const out = compile(src)
  assert.ok(out.includes('__rt__.renderChild'), out)
})

// ============================================================
// 标签表
// ============================================================

test('TAGS 覆盖常用 HTML + kit 标签', async () => {
  const { TAGS } = await import('../compiler2/src/tokenizer.js')
  for (const t of ['div', 'span', 'button', 'canvas', 'video', 'audio', 'summary', 'details']) {
    assert.ok(TAGS.has(t), 'TAGS 缺少 ' + t)
  }
  assert.ok(TAGS.size >= 50, 'TAGS 数量: ' + TAGS.size)
})
