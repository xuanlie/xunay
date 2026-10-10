import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'

// 嵌套深度
for (let depth = 1; depth <= 20; depth++) {
  test(`嵌套深度 ${depth}`, () => {
    let code = `'leaf'`
    for (let i = 0; i < depth; i++) code = `div(null, ${code})`
    const out = compile(`const el = ${code}`)
    const count = (out.match(/createElement/g) || []).length
    assert.equal(count, depth)
  })
}

// 多 children
for (let n = 1; n <= 10; n++) {
  test(`div 有 ${n} 个子节点`, () => {
    const children = Array.from({ length: n }, (_, i) => `'c${i}'`).join(', ')
    const out = compile(`const el = div(null, ${children})`)
    const count = (out.match(/createTextNode/g) || []).length
    assert.equal(count, n)
  })
}

// map 里的标签
for (const arr of ['items', '[1,2,3]', 'getList()']) {
  test(`map 内联标签 from ${arr}`, () => {
    const out = compile(`const el = ul(null, ${arr}.map(i => li(null, i)))`)
    assert.match(out, /createElement\("ul"\)/)
    assert.match(out, /createElement\("li"\)/)
  })
}

// 三元里的标签
for (const cond of ['ok()', 'x > 0', 'a && b']) {
  test(`三元条件 ${cond}`, () => {
    const out = compile(`const el = div(null, ${cond} ? span(null, 'y') : span(null, 'n'))`)
    assert.match(out, /createElement\("span"\)/)
  })
}

// 逻辑短路
for (const op of ['&&', '||', '??']) {
  test(`短路运算符 ${op}`, () => {
    const out = compile(`const el = div(null, cond() ${op} span(null, 'x'))`)
    assert.ok(out.length > 0)
  })
}

// 字符串里的标签名不该被编译
for (const s of [
  `'div()'`,
  `"span()"`,
  '`p()`',
  `'<div>'`,
]) {
  test(`字符串 ${s} 不该触发编译`, () => {
    const out = compile(`const x = ${s}\nconst el = 1`)
    assert.equal((out.match(/createElement/g) || []).length, 0)
  })
}

// 注释单独跑（修正：注释要单独一行或作为合法语句位置）
test('行注释里的标签名不该编译', () => {
  const src = 'const x = 1\n// div(null)\nconst el = 2'
  const out = compile(src)
  assert.equal((out.match(/createElement/g) || []).length, 0)
})

test('块注释里的标签名不该编译', () => {
  const src = '/* span(null) */\nconst el = 1'
  const out = compile(src)
  assert.equal((out.match(/createElement/g) || []).length, 0)
})

// 变量遮蔽
for (const name of ['div', 'span', 'p', 'button', 'input']) {
  test(`变量遮蔽 ${name}`, () => {
    const out = compile(`const ${name} = something; const el = ${name}()`)
    assert.equal((out.match(/createElement/g) || []).length, 0)
  })
}

// 属性访问 / 方法调用不该误编译
for (const s of [
  `obj.div()`,
  `this.span()`,
  `foo?.p()`,
  `arr[0]()`,
]) {
  test(`不该误编译: ${s}`, () => {
    const out = compile(`const el = ${s}`)
    assert.equal((out.match(/createElement/g) || []).length, 0)
  })
}
