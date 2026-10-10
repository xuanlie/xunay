import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'

const KEYS = [
  'id', 'name', 'title', 'href', 'src', 'alt', 'type',
  'placeholder', 'aria-label', 'data-id', 'data-test',
  'role', 'tabindex', 'for', 'lang', 'dir', 'target', 'rel',
]

const STATIC_VALUES = [
  `'str'`, `"str2"`, `123`, `3.14`, `true`, `false`, `null`,
]

for (const key of KEYS) {
  for (const val of STATIC_VALUES) {
    test(`属性 ${key} = ${val}`, () => {
      const out = compile(`const el = div({ ${JSON.stringify(key)}: ${val} })`)
      assert.match(out, /createElement\("div"\)/)
      assert.ok(out.length > 0)
    })
  }
}

// 属性值：动态函数
for (const key of KEYS) {
  test(`属性 ${key} 动态函数`, () => {
    const out = compile(`const el = div({ ${JSON.stringify(key)}: () => v() })`)
    assert.match(out, /bindAttr/)
  })
}

// 属性值：表达式
for (const key of KEYS) {
  test(`属性 ${key} 表达式`, () => {
    const out = compile(`const el = div({ ${JSON.stringify(key)}: a + b })`)
    assert.ok(out.length > 0)
  })
}

// 多属性组合
for (let n = 2; n <= 8; n++) {
  test(`div 有 ${n} 个属性`, () => {
    const props = Array.from({ length: n }, (_, i) => `k${i}: ${i}`).join(', ')
    const out = compile(`const el = div({ ${props} })`)
    assert.match(out, /createElement\("div"\)/)
  })
}

// class 各种形式
const CLASS_FORMS = [
  `'a'`, `'a b c'`, `() => 'dyn'`,
  `{ active: true }`, `{ active: false }`,
  `{ a: x(), b: y() }`,
  `{ a: true, b: false, c: true }`,
]
for (const v of CLASS_FORMS) {
  test(`class 形式: ${v}`, () => {
    const out = compile(`const el = div({ class: ${v} })`)
    assert.ok(out.length > 0)
  })
}

// className 别名
for (const v of [`'x'`, `() => 'y'`, `{ a: true }`]) {
  test(`className 形式: ${v}`, () => {
    const out = compile(`const el = div({ className: ${v} })`)
    assert.ok(out.length > 0)
  })
}

// style 各种形式
const STYLE_FORMS = [
  `{ color: 'red' }`,
  `{ color: 'red', fontSize: '14px' }`,
  `{ padding: 0, margin: 0 }`,
  `() => ({ color: c() })`,
  `{ display: 'flex', gap: 8 }`,
]
for (const v of STYLE_FORMS) {
  test(`style 形式: ${v}`, () => {
    const out = compile(`const el = div({ style: ${v} })`)
    assert.ok(out.length > 0)
  })
}

// 事件名
const EVENTS = [
  'click', 'dblclick', 'input', 'change', 'submit',
  'keydown', 'keyup', 'keypress', 'focus', 'blur',
  'mouseover', 'mouseout', 'mousedown', 'mouseup',
  'touchstart', 'touchend', 'scroll', 'resize', 'load',
]
for (const ev of EVENTS) {
  test(`事件 ${ev}`, () => {
    const out = compile(`const el = button({ on: { ${ev}: () => go() } }, 'x')`)
    assert.match(out, new RegExp(`addEventListener\\("${ev}"`))
  })
}

// 多事件
for (let n = 2; n <= 5; n++) {
  test(`div 注册 ${n} 个事件`, () => {
    const evs = EVENTS.slice(0, n).map(e => `${e}: () => go()`).join(', ')
    const out = compile(`const el = div({ on: { ${evs} } })`)
    for (let i = 0; i < n; i++) {
      assert.match(out, new RegExp(`addEventListener\\("${EVENTS[i]}"`))
    }
  })
}

// 混合属性
test('静态 + 动态 + 事件', () => {
  const out = compile(`const el = button({ id: 'x', disabled: () => busy(), on: { click: () => go() } }, 'Go')`)
  assert.match(out, /setAttribute\("id"/)
  assert.match(out, /bindAttr\([^,]+,\s*"disabled"/)
  assert.match(out, /addEventListener\("click"/)
})

// ref
test('ref 属性', () => {
  const out = compile(`const el = div({ ref: myRef })`)
  assert.match(out, /typeof \(myRef\) === 'function'/)
})

// html
test('html 属性', () => {
  const out = compile(`const el = div({ html: '<b>x</b>' })`)
  assert.match(out, /innerHTML/)
})
