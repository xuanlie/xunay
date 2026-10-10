import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

function setupDOM() {
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
    runScripts: 'outside-only', pretendToBeVisual: true,
  })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.Node = dom.window.Node
  globalThis.HTMLElement = dom.window.HTMLElement
  globalThis.MouseEvent = dom.window.MouseEvent
  globalThis.Event = dom.window.Event
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16)
  return dom
}

const wait = (n = 30) => new Promise(r => setTimeout(r, n))

test('冒泡事件走委托（click）', async () => {
  const dom = setupDOM()
  const { signal, mount } = await import('../src/index.js')
  const { div, button } = await import('../src/element.js')

  const root = document.createElement('div'); root.id = 'app'
  document.body.appendChild(root)

  let clicks = 0
  mount(() => div(null, button({ on: { click: () => clicks++ } }, 'x')), '#app')
  await wait()

  const btn = document.querySelector('button')
  btn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  await wait()

  assert.equal(clicks, 1, 'click 未触发')
})

test('mouseenter 直接绑定（不冒泡）', async () => {
  const dom = setupDOM()
  const { signal, mount } = await import('../src/index.js')
  const { span } = await import('../src/element.js')

  const root = document.createElement('div'); root.id = 'app'
  document.body.appendChild(root)

  let enters = 0
  mount(() => span({ on: { mouseenter: () => enters++ } }, 'hover me'), '#app')
  await wait()

  const el = document.querySelector('span')
  el.dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: false }))
  await wait()

  assert.equal(enters, 1, 'mouseenter 未触发')
})

test('mouseleave 直接绑定', async () => {
  const dom = setupDOM()
  const { signal, mount } = await import('../src/index.js')
  const { span } = await import('../src/element.js')

  const root = document.createElement('div'); root.id = 'app'
  document.body.appendChild(root)

  let leaves = 0
  mount(() => span({ on: { mouseleave: () => leaves++ } }, 'x'), '#app')
  await wait()

  const el = document.querySelector('span')
  el.dispatchEvent(new dom.window.MouseEvent('mouseleave', { bubbles: false }))
  await wait()

  assert.equal(leaves, 1, 'mouseleave 未触发')
})

test('focus / blur 直接绑定', async () => {
  const dom = setupDOM()
  const { signal, mount } = await import('../src/index.js')
  const { input } = await import('../src/element.js')

  const root = document.createElement('div'); root.id = 'app'
  document.body.appendChild(root)

  let focuses = 0, blurs = 0
  mount(() => input({ on: { focus: () => focuses++, blur: () => blurs++ } }), '#app')
  await wait()

  const el = document.querySelector('input')
  el.dispatchEvent(new dom.window.Event('focus', { bubbles: false }))
  el.dispatchEvent(new dom.window.Event('blur', { bubbles: false }))
  await wait()

  assert.equal(focuses, 1, 'focus 未触发')
  assert.equal(blurs, 1, 'blur 未触发')
})

test('Tooltip hover 显示', async () => {
  const dom = setupDOM()
  const { signal, mount } = await import('../src/index.js')
  const { Tooltip } = await import('../src/kit-overlay.js')
  const { span } = await import('../src/element.js')

  const root = document.createElement('div'); root.id = 'app'
  document.body.appendChild(root)

  mount(() => Tooltip({ text: '提示文字', trigger: 'hover' }, span(null, 'Hover')), '#app')
  await wait(80)

  const host = root.querySelector('span')
  assert.ok(host, 'Tooltip 未渲染')

  host.dispatchEvent(new dom.window.MouseEvent('mouseenter', { bubbles: false }))
  await wait(80)

  assert.ok(root.innerHTML.includes('提示文字'), 'Tooltip 未显示')
})
