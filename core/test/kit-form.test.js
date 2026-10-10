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
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16)
  return dom
}

async function waitMs(n = 30) {
  return new Promise(r => setTimeout(r, n))
}

test('kit-form 组件响应式回归', async () => {
  setupDOM()

  const { signal, mount } = await import('../src/index.js')
  const { Input, Textarea, Checkbox, Radio, Switch,
          Select, NumberInput, DatePicker, TimePicker, SearchInput } = await import('../src/kit-form.js')

  const cases = [
    { name: 'Input',       Comp: Input,       prop: 'value',   tag: 'input',    init: 'A',            next: 'B' },
    { name: 'Textarea',    Comp: Textarea,    prop: 'value',   tag: 'textarea', init: 'X',            next: 'Y' },
    { name: 'Checkbox',    Comp: Checkbox,    prop: 'checked', tag: 'input',    init: false,          next: true },
    { name: 'Radio',       Comp: Radio,       prop: 'checked', tag: 'input',    init: false,          next: true },
    { name: 'Switch',      Comp: Switch,      prop: 'checked', tag: 'input',    init: false,          next: true },
    { name: 'DatePicker',  Comp: DatePicker,  prop: 'value',   tag: 'input',    init: '2024-01-01',   next: '2024-12-31' },
    { name: 'TimePicker',  Comp: TimePicker,  prop: 'value',   tag: 'input',    init: '10:00',        next: '20:30' },
    { name: 'SearchInput', Comp: SearchInput, prop: 'value',   tag: 'input',    init: 'foo',          next: 'bar' },
    { name: 'Select',      Comp: Select,      prop: 'value',   tag: 'select',   init: 'a',            next: 'b',
      extra: { options: [{value:'a',label:'A'},{value:'b',label:'B'}] } },
  ]

  for (const c of cases) {
    const root = document.createElement('div')
    root.id = 'app'
    document.body.innerHTML = ''
    document.body.appendChild(root)

    const s = signal(c.init)
    const props = { ...(c.extra || {}) }
    props[c.prop] = s

    mount(() => c.Comp(props), '#app')
    await waitMs()

    const el = document.querySelector(c.tag)
    assert.ok(el, `${c.name}: 没有渲染出 <${c.tag}>`)

    s(c.next)
    await waitMs()

    const actual = c.prop === 'value' ? el.value : el.checked
    assert.equal(actual, c.next, `${c.name}: signal 改变后 DOM 未更新`)
  }
})

test('kit-form Input 保持原始输入能力', async () => {
  setupDOM()
  const { signal, mount } = await import('../src/index.js')
  const { Input } = await import('../src/kit-form.js')

  const root = document.createElement('div')
  root.id = 'app'
  document.body.appendChild(root)

  const s = signal('hello')
  let lastChange = null
  mount(() => Input({ value: s, onChange: v => { lastChange = v } }), '#app')
  await waitMs()

  const el = document.querySelector('input')
  el.value = 'world'
  el.dispatchEvent(new window.Event('input', { bubbles: true }))
  await waitMs()

  assert.equal(lastChange, 'world', 'onChange 未被触发')
})
