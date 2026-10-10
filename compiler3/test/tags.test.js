import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'
import { TAGS, VOID_TAGS } from '../src/tags.js'

const allTags = [...TAGS]

for (const tag of allTags) {
  test(`[${tag}] 单标签无子节点`, () => {
    const out = compile(`const el = ${tag}(null)`)
    assert.match(out, new RegExp(`createElement\\("${tag}"\\)`))
  })

  test(`[${tag}] 有属性对象`, () => {
    const out = compile(`const el = ${tag}({ id: 'x' })`)
    assert.match(out, new RegExp(`createElement\\("${tag}"\\)`))
    assert.match(out, /setAttribute\("id", 'x'\)/)
  })

  test(`[${tag}] 静态字符串子节点`, () => {
    if (VOID_TAGS.has(tag)) return
    const out = compile(`const el = ${tag}(null, 'hello')`)
    assert.match(out, /createTextNode\('hello'\)/)
  })

  test(`[${tag}] 动态函数子节点`, () => {
    if (VOID_TAGS.has(tag)) return
    const out = compile(`const el = ${tag}(null, () => 'x')`)
    assert.match(out, /bindText/)
  })

  test(`[${tag}] class 静态`, () => {
    const out = compile(`const el = ${tag}({ class: 'c' })`)
    assert.match(out, /className = 'c'/)
  })

  test(`[${tag}] class 动态函数`, () => {
    const out = compile(`const el = ${tag}({ class: () => 'c' })`)
    assert.match(out, /bindAttr\([^,]+,\s*'class'/)
  })

  test(`[${tag}] 事件绑定`, () => {
    const out = compile(`const el = ${tag}({ on: { click: () => go() } })`)
    assert.match(out, /addEventListener\("click"/)
  })

  test(`[${tag}] style 对象`, () => {
    const out = compile(`const el = ${tag}({ style: { color: 'red' } })`)
    assert.match(out, /Object\.assign/)
  })
}

// 非 void 标签的嵌套测试
const nonVoid = allTags.filter(t => !VOID_TAGS.has(t))
for (const outer of nonVoid) {
  for (const inner of ['div', 'span', 'p']) {
    test(`嵌套 ${outer} > ${inner}`, () => {
      const out = compile(`const el = ${outer}(null, ${inner}(null, 'x'))`)
      assert.match(out, new RegExp(`createElement\\("${inner}"\\)`))
    })
  }
}
