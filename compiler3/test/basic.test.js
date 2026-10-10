import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'

test('静态文本', () => {
  const out = compile(`const el = div(null, 'hello')`)
  assert.match(out, /document\.createElement\("div"\)/)
  assert.match(out, /createTextNode\('hello'\)/)
})

test('嵌套标签', () => {
  const out = compile(`const el = div(null, span(null, 'x'))`)
  assert.match(out, /document\.createElement\("div"\)/)
  assert.match(out, /document\.createElement\("span"\)/)
})

test('事件绑定', () => {
  const out = compile(`const el = button({ on: { click: () => count(1) } }, '+')`)
  assert.match(out, /addEventListener\("click"/)
})

test('响应式 value（关键回归）', () => {
  const out = compile(`const el = input({ value: () => name() })`)
  assert.match(out, /bindAttr\([^,]+,\s*"value"/)
  assert.doesNotMatch(out, /\.value = \(\) =>/)
})

test('变量名遮蔽', () => {
  const out = compile(`const div = x; div()`)
  assert.equal(out, `const div = x; div()`)
})

test('map 里的标签', () => {
  const out = compile(`const el = ul(null, items.map(i => li(null, i.name)))`)
  assert.match(out, /document\.createElement\("ul"\)/)
  assert.match(out, /document\.createElement\("li"\)/)
})

test('三元里的标签', () => {
  const out = compile(`const el = div(null, ok() ? span(null, 'a') : span(null, 'b'))`)
  assert.match(out, /document\.createElement\("span"\)/)
})

test('属性 key 带引号', () => {
  const out = compile(`const el = div({ 'data-id': 123 })`)
  assert.match(out, /setAttribute\("data-id", 123\)/)
})

test('class 对象', () => {
  const out = compile(`const el = div({ class: { active: isOn(), hidden: false } })`)
  assert.match(out, /classNames/)
})

test('深层嵌套', () => {
  const out = compile(`const el = div(null, section(null, article(null, p(null, 'deep'))))`)
  assert.equal((out.match(/createElement/g) || []).length, 4)
})

test('数组 children', () => {
  const out = compile(`const el = div(null, [span(null, 'a'), span(null, 'b')])`)
  assert.match(out, /renderChild/)
})

test('list 函数里的标签', () => {
  const out = compile(`const el = ul(null, list(items, i => i.id, i => li(null, i.name)))`)
  assert.match(out, /createElement\("ul"\)/)
  assert.match(out, /createElement\("li"\)/)
})

test('show 函数里的标签', () => {
  const out = compile(`const el = div(null, show(() => ok(), () => p(null, 'yes')))`)
  assert.match(out, /createElement\("p"\)/)
})

test('字符串里的标签名不该被编译', () => {
  const out = compile(`const s = 'div(null) is code'; const el = 1`)
  assert.doesNotMatch(out, /createElement/)
})

test('注释里的标签名不该被编译', () => {
  const out = compile(`// div(null)\nconst el = 1`)
  assert.doesNotMatch(out, /createElement/)
})

test('style 是函数时走 bindStyle', () => {
  const out = compile(`const el = div({ style: () => ({ color: c() }) })`)
  assert.match(out, /bindStyle/)
})

test('混合属性：静态 + 事件 + 动态', () => {
  const out = compile(`const el = button({ class: 'btn', disabled: () => busy(), on: { click: () => go() } }, 'Go')`)
  assert.match(out, /className = 'btn'/)
  assert.match(out, /bindAttr\([^,]+,\s*"disabled"/)
  assert.match(out, /addEventListener\("click"/)
})
