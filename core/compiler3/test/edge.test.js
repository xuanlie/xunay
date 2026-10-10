import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'
import { TAGS, VOID_TAGS } from '../src/tags.js'

const allTags = [...TAGS]
const nonVoid = allTags.filter(t => !VOID_TAGS.has(t))

// 空 children 各种写法
for (const tag of nonVoid) {
  test(`[${tag}] 空 children null`, () => {
    const out = compile(`const el = ${tag}(null)`)
    assert.match(out, new RegExp(`createElement\\("${tag}"\\)`))
    assert.doesNotMatch(out, /appendChild/)
  })
}

// VOID 标签即使传子节点也不 appendChild
for (const tag of VOID_TAGS) {
  test(`[${tag}] VOID 不 appendChild`, () => {
    const out = compile(`const el = ${tag}(null, 'ignored')`)
    assert.match(out, new RegExp(`createElement\\("${tag}"\\)`))
    assert.doesNotMatch(out, /appendChild/)
  })
}

// 引号属性 key
const QUOTED_KEYS = ['data-id', 'aria-label', 'x-custom', 'foo-bar', 'data-test-x']
for (const key of QUOTED_KEYS) {
  test(`引号 key ${key}`, () => {
    const out = compile(`const el = div({ '${key}': 1 })`)
    assert.match(out, new RegExp(`setAttribute\\("${key}"`))
  })
}

// 数字 / 布尔字面量作为 children
for (const v of ['0', '1', '42', '3.14', 'true', 'false', 'null', 'undefined']) {
  for (const tag of ['div', 'span', 'p']) {
    test(`[${tag}] 子节点 ${v}`, () => {
      const out = compile(`const el = ${tag}(null, ${v})`)
      assert.ok(out.length > 0)
    })
  }
}

// 空源码 / 空语句
test('空源码', () => { assert.equal(compile(''), '') })
test('纯空白', () => { assert.equal(compile('   \n\n  '), '   \n\n  ') })
test('只有分号', () => { assert.equal(compile(';'), ';') })

// 纯 JS 不被动
for (const src of [
  `const x = 1 + 2`,
  `function f() { return 3 }`,
  `const arr = [1, 2, 3]`,
  `if (x > 0) { y = 1 }`,
  `for (let i = 0; i < 10; i++) {}`,
]) {
  test(`纯 JS 不变: ${src.slice(0, 20)}`, () => {
    assert.equal(compile(src), src)
  })
}

// 每个标签 × 静态字符串子节点 × 数字子节点
for (const tag of nonVoid) {
  test(`[${tag}] 静态 + 数字`, () => {
    const out = compile(`const el = ${tag}(null, 'text', 42)`)
    assert.match(out, /createTextNode\('text'\)/)
    assert.match(out, /createTextNode\(42\)/)
  })
}

// 属性同时有：class + style + event + id
for (const tag of allTags.slice(0, 20)) {
  test(`[${tag}] 全属性混合`, () => {
    const out = compile(`const el = ${tag}({ id: 'x', class: 'c', style: { color: 'red' }, on: { click: () => go() } })`)
    assert.ok(out.length > 0)
  })
}

// 深层属性嵌套
test('深层属性链', () => {
  const props = Array.from({ length: 20 }, (_, i) => `p${i}: ${i}`).join(', ')
  const out = compile(`const el = div({ ${props} })`)
  assert.match(out, /createElement\("div"\)/)
})

// 50 个静态子节点
test('50 个静态子节点', () => {
  const children = Array.from({ length: 50 }, (_, i) => `'c${i}'`).join(', ')
  const out = compile(`const el = div(null, ${children})`)
  const count = (out.match(/createTextNode/g) || []).length
  assert.equal(count, 50)
})

// 每个标签的常见子节点组合
for (const tag of nonVoid.slice(0, 30)) {
  test(`[${tag}] 三个子节点`, () => {
    const out = compile(`const el = ${tag}(null, span(null, 'a'), span(null, 'b'), span(null, 'c'))`)
    const count = (out.match(/createElement/g) || []).length
    assert.equal(count, 4)
  })
}
