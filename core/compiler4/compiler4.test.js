import test from 'node:test'
import assert from 'node:assert/strict'
import { needsCompile4, compile4 } from './index.js'
import { transformCpt } from './cpt.js'
import { transformXuy } from './xuy.js'

test('分流：注释和普通字符串里的 sdu 不触发 compile4', () => {
  assert.equal(needsCompile4('// sdu NavBar({ title: "x" })'), false)
  assert.equal(needsCompile4('const text = "sdu NavBar(";'), false)
  assert.equal(needsCompile4("const text = '普通字符串';"), false)
})

test('分流：cpt/pag/dt/xuy 极简声明可识别', () => {
  assert.equal(needsCompile4('cpt Card(props) { div(null, props.name) }'), true)
  assert.equal(needsCompile4('pag Home() { div(null, "home") }'), true)
  assert.equal(needsCompile4('dt Goods(10) { name: "x" }'), true)
  assert.equal(needsCompile4('xuy Goods = (div, $items, 10)'), true)
})

test('分流：自定义 sdu 语法可识别', () => {
  assert.equal(needsCompile4('sdu<3> Card($items)({\n div: @name\n})'), true)
})

test('cpt：单行表达式添加隐式 return', () => {
  const out = transformCpt('cpt Sum(a) { a + 1 }')
  assert.match(out, /export function Sum\(a\)/)
  assert.match(out, /return\s+a\s*\+\s*1/)
})

test('cpt：显式 return 不重复添加', () => {
  const out = transformCpt('cpt Sum(a) { return a + 1 }')
  assert.equal((out.match(/\breturn\b/g) || []).length, 1)
})

test('cpt：声明中的注释文本不会被当作 cpt 语法', () => {
  const source = '// cpt Fake() { 1 }\nconst s = "cpt Ghost() {"'
  const out = transformCpt(source)
  assert.equal(out, source)
})

test('xuy：基本生成器可以转换', () => {
  const out = transformXuy('xuy Cards = (Card, $items, 10)')
  assert.match(out, /export function Cards\(\)/)
  assert.match(out, /Card\(_i0\)/)
})

test('compile4：普通 JavaScript 不应被修改', () => {
  const source = 'export const value = 1\n'
  assert.equal(compile4(source), source)
})
