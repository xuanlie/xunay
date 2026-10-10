import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'
import { TAGS, VOID_TAGS } from '../src/tags.js'

const allTags = [...TAGS]
const nonVoid = allTags.filter(t => !VOID_TAGS.has(t))

// ===== 1. 每个标签 × 动态函数子节点（50 个）=====
for (const tag of nonVoid) {
  test(`[${tag}] 动态函数子节点`, () => {
    const out = compile(`const el = ${tag}(null, () => v())`)
    assert.match(out, /bindText/)
  })
}

// ===== 2. 每个标签 × class 动态（50 个）=====
for (const tag of allTags) {
  test(`[${tag}] class 动态函数`, () => {
    const out = compile(`const el = ${tag}({ class: () => c() })`)
    assert.match(out, /bindAttr/)
  })
}

// ===== 3. 每个标签 × style 对象（50 个）=====
for (const tag of allTags) {
  test(`[${tag}] style 对象`, () => {
    const out = compile(`const el = ${tag}({ style: { color: 'red' } })`)
    assert.match(out, /Object\.assign|applyStyle/)
  })
}

// ===== 4. 每个标签 × 事件（50 个）=====
for (const tag of allTags) {
  test(`[${tag}] 事件绑定`, () => {
    const out = compile(`const el = ${tag}({ on: { click: () => go() } })`)
    assert.match(out, /addEventListener\("click"/)
  })
}

// ===== 5. 嵌套组合（非 VOID × 3 种内层）（150 个）=====
const innerTags = ['div', 'span', 'button']
for (const outer of nonVoid) {
  for (const inner of innerTags) {
    test(`嵌套 ${outer} > ${inner}`, () => {
      const out = compile(`const el = ${outer}(null, ${inner}(null, 'x'))`)
      assert.match(out, new RegExp(`createElement\\("${inner}"\\)`))
    })
  }
}

// ===== 6. 属性 key 带引号 × VOID（20 个）=====
const VOID_KEYS = ['src', 'href', 'alt', 'width', 'height', 'type']
for (const tag of VOID_TAGS) {
  for (const key of VOID_KEYS) {
    test(`[${tag}] 属性 ${key}`, () => {
      const out = compile(`const el = ${tag}({ ${key}: 'v' })`)
      assert.match(out, /createElement/)
    })
  }
}

// ===== 7. 每个标签 × 混合属性（50 个）=====
for (const tag of allTags) {
  test(`[${tag}] 混合 id + class + event`, () => {
    const out = compile(`const el = ${tag}({ id: 'x', class: 'c', on: { click: () => go() } })`)
    assert.match(out, /setAttribute\("id"/)
    assert.match(out, /addEventListener\("click"/)
  })
}
