import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
})

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Node = dom.window.Node
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

const React = await import('../src/react-compat.js')
const { createElement: h, createRoot, useState, useEffect } = React

test('父组件更新后，子组件 useState 应保留', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  function Child() {
    const [count, setCount] = useState(0)
    return h('button', {
      id: 'child',
      onClick: () => setCount(n => n + 1),
    }, `child:${count}`)
  }

  function App() {
    const [parentCount, setParentCount] = useState(0)
    return h('div', null,
      h('button', {
        id: 'parent',
        onClick: () => setParentCount(n => n + 1),
      }, `parent:${parentCount}`),
      h(Child),
    )
  }

  const root = createRoot(container)
  root.render(h(App))

  container.querySelector('#child').click()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(container.querySelector('#child').textContent, 'child:1')

  container.querySelector('#parent').click()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(container.querySelector('#parent').textContent, 'parent:1')
  assert.equal(
    container.querySelector('#child').textContent,
    'child:1',
    '父组件更新不应重置子组件状态',
  )

  root.unmount()
  container.remove()
})

test('重复 root.render 同类型组件应保留 useState', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  function App({ label }) {
    const [count, setCount] = useState(0)
    return h('button', {
      id: 'counter',
      onClick: () => setCount(n => n + 1),
    }, `${label}:${count}`)
  }

  const root = createRoot(container)
  root.render(h(App, { label: 'A' }))
  container.querySelector('#counter').click()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(container.querySelector('#counter').textContent, 'A:1')

  root.render(h(App, { label: 'B' }))
  assert.equal(
    container.querySelector('#counter').textContent,
    'B:1',
    '同一个 root 更新 props 不应重置组件状态',
  )

  root.unmount()
  container.remove()
})

test('useEffect 依赖变化应清理旧副作用，卸载应清理当前副作用', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const events = []

  function App({ value }) {
    useEffect(() => {
      events.push(`setup:${value}`)
      return () => events.push(`cleanup:${value}`)
    }, [value])

    return h('span', null, String(value))
  }

  const root = createRoot(container)
  root.render(h(App, { value: 1 }))
  await new Promise(resolve => setTimeout(resolve, 10))

  root.render(h(App, { value: 2 }))
  await new Promise(resolve => setTimeout(resolve, 10))

  root.unmount()
  await new Promise(resolve => setTimeout(resolve, 10))

  assert.deepEqual(events, [
    'setup:1',
    'cleanup:1',
    'setup:2',
    'cleanup:2',
  ])
  container.remove()
})

test('条件卸载子组件应只清理一次 effect', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const events = []

  function Child() {
    useEffect(() => {
      events.push('setup')
      return () => events.push('cleanup')
    }, [])
    return h('span', { id: 'conditional-child' }, 'child')
  }

  function App() {
    const [show, setShow] = useState(true)
    return h('div', null,
      h('button', {
        id: 'toggle-child',
        onClick: () => setShow(v => !v),
      }, String(show)),
      show ? h(Child) : null,
    )
  }

  const root = createRoot(container)
  root.render(h(App))
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(container.querySelector('#conditional-child')?.textContent, 'child')
  assert.deepEqual(events, ['setup'])

  container.querySelector('#toggle-child').click()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(container.querySelector('#conditional-child'), null)
  assert.deepEqual(events, ['setup', 'cleanup'])

  root.unmount()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.deepEqual(events, ['setup', 'cleanup'])

  container.remove()
})

test('key 改变应卸载旧组件并挂载新组件', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const events = []

  function Child({ name }) {
    const [count, setCount] = useState(0)
    useEffect(() => {
      events.push(`setup:${name}`)
      return () => events.push(`cleanup:${name}`)
    }, [])

    return h('button', {
      id: 'key-child',
      onClick: () => setCount(n => n + 1),
    }, `${name}:${count}`)
  }

  function App() {
    const [name, setName] = useState('A')
    return h('div', null,
      h('button', {
        id: 'switch-key',
        onClick: () => setName(v => v === 'A' ? 'B' : 'A'),
      }, 'switch'),
      h(Child, { name, key: name }),
    )
  }

  const root = createRoot(container)
  root.render(h(App))
  await new Promise(resolve => setTimeout(resolve, 20))

  container.querySelector('#key-child').click()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(container.querySelector('#key-child').textContent, 'A:1')

  container.querySelector('#switch-key').click()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(container.querySelector('#key-child').textContent, 'B:0')
  assert.deepEqual(events, ['setup:A', 'cleanup:A', 'setup:B'])

  root.unmount()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.deepEqual(events, ['setup:A', 'cleanup:A', 'setup:B', 'cleanup:B'])

  container.remove()
})

test('嵌套组件卸载应递归清理所有 effect', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const events = []

  function Grandchild() {
    useEffect(() => {
      events.push('grandchild:setup')
      return () => events.push('grandchild:cleanup')
    }, [])
    return h('span', null, 'grandchild')
  }

  function Child() {
    useEffect(() => {
      events.push('child:setup')
      return () => events.push('child:cleanup')
    }, [])
    return h('div', null, h(Grandchild))
  }

  function App() {
    const [show, setShow] = useState(true)
    return h('div', null,
      h('button', {
        id: 'remove-tree',
        onClick: () => setShow(false),
      }, 'remove'),
      show ? h(Child) : null,
    )
  }

  const root = createRoot(container)
  root.render(h(App))
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.deepEqual(events.slice().sort(), ['child:setup', 'grandchild:setup'].sort())

  container.querySelector('#remove-tree').click()
  await new Promise(resolve => setTimeout(resolve, 30))
  assert.deepEqual(
    events.slice(2).sort(),
    ['child:cleanup', 'grandchild:cleanup'].sort(),
  )

  root.unmount()
  await new Promise(resolve => setTimeout(resolve, 20))
  assert.equal(events.filter(x => x === 'child:cleanup').length, 1)
  assert.equal(events.filter(x => x === 'grandchild:cleanup').length, 1)

  container.remove()
})
