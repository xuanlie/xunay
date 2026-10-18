import { test, before, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Element = dom.window.Element
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.Node = dom.window.Node
globalThis.Event = dom.window.Event
globalThis.MouseEvent = dom.window.MouseEvent
Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true, value: dom.window.navigator })
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
window.__XUNAY_COMPAT_THROW = true

const React = await import('../src/react-compat.js')
const ReactDOM = await import('../src/react-dom-compat.js')

const roots = []
const containers = []

function mount(vnode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = React.createRoot(container)
  roots.push(root)
  containers.push(container)
  root.render(vnode)
  return { root, container }
}

async function settle() {
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

function h(type, props, ...children) {
  return React.createElement(type, props, ...children)
}

function text(container) {
  return container.textContent
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    try { root.unmount() } catch {}
  }
  for (const container of containers.splice(0)) {
    container.remove()
  }
})

test('01 React Compat 核心 API 导出完整', () => {
  for (const name of [
    'createElement', 'cloneElement', 'isValidElement',
    'Fragment', 'Children', 'Component', 'PureComponent',
    'useState', 'useEffect', 'useLayoutEffect', 'useInsertionEffect',
    'useMemo', 'useCallback', 'useRef', 'useReducer', 'useContext',
    'useImperativeHandle', 'useId', 'createContext',
    'memo', 'forwardRef', 'lazy', 'Suspense', 'StrictMode',
    'createRoot', 'hydrateRoot', 'render', 'unmountComponentAtNode',
    'findDOMNode', 'createPortal', 'flushSync', 'useSyncExternalStore',
    'useTransition', 'useDeferredValue', 'useOptimistic',
    'startTransition', 'act', 'jsx', 'jsxs', 'jsxDEV',
  ]) {
    assert.notEqual(React[name], undefined, `缺少导出: ${name}`)
  }
})

test('02 React DOM Compat 暴露根渲染 API', () => {
  for (const name of [
    'createRoot', 'hydrateRoot', 'render',
    'unmountComponentAtNode', 'findDOMNode',
    'createPortal', 'flushSync', 'unstable_batchedUpdates',
  ]) {
    assert.equal(typeof ReactDOM[name], 'function', `${name} 应为函数`)
  }
})

test('03 createElement 正确处理 props、key 和 children', () => {
  const el = h('div', { id: 'x', key: 'k', title: 't' }, 'a', 'b')
  assert.equal(React.isValidElement(el), true)
  assert.equal(el.type, 'div')
  assert.equal(el.key, 'k')
  assert.equal(el.props.id, 'x')
  assert.equal(el.props.key, undefined)
  assert.deepEqual(el.props.children, ['a', 'b'])
})

test('04 cloneElement 保留原 props 并覆盖指定属性', () => {
  const original = h('div', { id: 'old', title: 'keep', key: 'a' }, 'old child')
  const cloned = React.cloneElement(original, { id: 'new', key: 'b' }, 'new child')
  assert.equal(cloned.type, 'div')
  assert.equal(cloned.key, 'b')
  assert.equal(cloned.props.id, 'new')
  assert.equal(cloned.props.title, 'keep')
  assert.equal(cloned.props.children, 'new child')
  assert.equal(original.props.id, 'old')
})

test('05 cloneElement 拒绝无效元素', () => {
  assert.throws(() => React.cloneElement(null, {}), TypeError)
  assert.throws(() => React.cloneElement({}, {}), TypeError)
})

test('06 isValidElement 拒绝普通对象和原始值', () => {
  for (const value of [null, undefined, false, 1, 'x', {}, []]) {
    assert.equal(React.isValidElement(value), false)
  }
  assert.equal(React.isValidElement(h('div')), true)
})

test('07 Children.map、count、toArray 处理嵌套数组与空节点', () => {
  const children = [h('i', { key: 'a' }, 'A'), null, false, 'B']
  assert.equal(React.Children.count(children), 2)
  assert.deepEqual(
    React.Children.map(children, child => child),
    [children[0], 'B'],
  )
  assert.deepEqual(React.Children.toArray(children), [children[0], 'B'])
})

test('08 Children.only 只接受单个有效元素', () => {
  const element = h('span', null, 'x')
  assert.equal(React.Children.only(element), element)
  assert.throws(() => React.Children.only([element]))
  assert.throws(() => React.Children.only('x'))
})

test('09 Fragment 渲染多个子节点而不增加包装元素', () => {
  const { container } = mount(h(
    React.Fragment,
    null,
    h('span', null, 'A'),
    h('span', null, 'B'),
  ))
  assert.equal(container.querySelectorAll('span').length, 2)
  assert.equal(text(container), 'AB')
})

test('10 useState 支持惰性初始化和函数式更新', async () => {
  let initCount = 0
  function Counter() {
    const [n, setN] = React.useState(() => {
      initCount++
      return 0
    })
    return h('button', { onClick: () => {
      setN(v => v + 1)
      setN(v => v + 1)
    } }, String(n))
  }

  const { container } = mount(h(Counter))
  assert.equal(text(container), '0')
  container.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await settle()
  assert.equal(text(container), '2')
  assert.equal(initCount, 1)
})

test('11 useState 的多个 Hook 状态互相独立', async () => {
  function Counter() {
    const [a, setA] = React.useState(1)
    const [b, setB] = React.useState(10)
    return h('div', null,
      h('button', { id: 'a', onClick: () => setA(v => v + 1) }, String(a)),
      h('button', { id: 'b', onClick: () => setB(v => v + 10) }, String(b)),
    )
  }

  const { container } = mount(h(Counter))
  container.querySelector('#b').click()
  await settle()
  assert.equal(container.querySelector('#a').textContent, '1')
  assert.equal(container.querySelector('#b').textContent, '20')
})

test('12 useState 使用 Object.is 阻止相同值更新', async () => {
  let renders = 0
  function App() {
    const [n, setN] = React.useState(1)
    renders++
    return h('button', { onClick: () => setN(1) }, String(n))
  }

  const { container } = mount(h(App))
  const before = renders
  container.querySelector('button').click()
  await settle()
  assert.equal(renders, before)
})

test('13 useReducer 支持惰性初始化和 dispatch', async () => {
  function App() {
    const [n, dispatch] = React.useReducer(
      (state, action) => action === 'add' ? state + 1 : state,
      4,
      initial => initial * 2,
    )
    return h('button', { onClick: () => dispatch('add') }, String(n))
  }

  const { container } = mount(h(App))
  assert.equal(text(container), '8')
  container.querySelector('button').click()
  await settle()
  assert.equal(text(container), '9')
})

test('14 useMemo 根据依赖缓存结果', async () => {
  let calculations = 0
  function App() {
    const [n, setN] = React.useState(1)
    const value = React.useMemo(() => {
      calculations++
      return n * 10
    }, [n])
    return h('button', { onClick: () => setN(n) }, String(value))
  }

  const { container } = mount(h(App))
  assert.equal(text(container), '10')
  container.querySelector('button').click()
  await settle()
  assert.equal(calculations, 1)
})

test('15 useCallback 在依赖不变时保持引用稳定', async () => {
  let first
  let second
  function App() {
    const [n, setN] = React.useState(0)
    const cb = React.useCallback(() => 1, [])
    if (!first) first = cb
    else second = cb
    return h('button', { onClick: () => setN(n + 1) }, String(n))
  }

  const { container } = mount(h(App))
  container.querySelector('button').click()
  await settle()
  assert.equal(second, first)
})

test('16 useRef 在组件更新中保持同一对象', async () => {
  let firstRef
  let nextRef
  function App() {
    const [n, setN] = React.useState(0)
    const ref = React.useRef('initial')
    if (!firstRef) firstRef = ref
    else nextRef = ref
    return h('button', { onClick: () => {
      ref.current = 'changed'
      setN(n + 1)
    } }, `${n}:${ref.current}`)
  }

  const { container } = mount(h(App))
  container.querySelector('button').click()
  await settle()
  assert.equal(nextRef, firstRef)
  assert.equal(text(container), '1:changed')
})

test('17 useEffect 空依赖只挂载一次，卸载清理一次', async () => {
  let setups = 0
  let cleanups = 0
  function App() {
    const [n, setN] = React.useState(0)
    React.useEffect(() => {
      setups++
      return () => cleanups++
    }, [])
    return h('button', { onClick: () => setN(n + 1) }, String(n))
  }

  const { root, container } = mount(h(App))
  await settle()
  container.querySelector('button').click()
  await settle()
  assert.equal(setups, 1)
  assert.equal(cleanups, 0)
  root.unmount()
  assert.equal(cleanups, 1)
})

test('18 useEffect 无依赖时每次渲染重新执行并先清理旧副作用', async () => {
  const log = []
  function App() {
    const [n, setN] = React.useState(0)
    React.useEffect(() => {
      log.push(`setup${n}`)
      return () => log.push(`cleanup${n}`)
    })
    return h('button', { onClick: () => setN(n + 1) }, String(n))
  }

  const { container } = mount(h(App))
  await settle()
  container.querySelector('button').click()
  await settle()
  assert.deepEqual(log.slice(0, 3), ['setup0', 'cleanup0', 'setup1'])
})

test('19 useLayoutEffect 在首次 root.render 返回前执行', () => {
  let observed = false
  function App() {
    React.useLayoutEffect(() => { observed = true }, [])
    return h('span', null, 'ready')
  }

  mount(h(App))
  assert.equal(observed, true)
})

test('20 useContext 支持默认值和 Provider 值', () => {
  const Ctx = React.createContext('default')
  function Read() {
    return h('span', null, React.useContext(Ctx))
  }

  const first = mount(h(Read))
  assert.equal(text(first.container), 'default')

  const second = mount(h(Ctx.Provider, { value: 'provided' }, h(Read)))
  assert.equal(text(second.container), 'provided')
})

test('21 Context 嵌套 Provider 使用最近的值', () => {
  const Ctx = React.createContext('default')
  function Read() {
    return h('span', null, React.useContext(Ctx))
  }

  const { container } = mount(h(
    Ctx.Provider, { value: 'outer' },
    h('div', null,
      h(Read),
      h(Ctx.Provider, { value: 'inner' }, h(Read)),
    ),
  ))

  assert.deepEqual(
    Array.from(container.querySelectorAll('span')).map(el => el.textContent),
    ['outer', 'inner'],
  )
})

test('22 memo 在 props 不变时跳过重复渲染', async () => {
  let renders = 0
  const Child = React.memo(function Child({ label }) {
    renders++
    return h('span', null, label)
  })

  function App() {
    const [n, setN] = React.useState(0)
    return h('div', null,
      h('button', { onClick: () => setN(n + 1) }, String(n)),
      h(Child, { label: 'stable' }),
    )
  }

  const { container } = mount(h(App))
  const initial = renders
  container.querySelector('button').click()
  await settle()
  assert.equal(renders, initial)
})

test('memo 多实例使用独立缓存，不串用其他实例的结果', async () => {
  let rendersA = 0
  let rendersB = 0

  const Child = React.memo(function Child({ id, value }) {
    if (id === 'a') rendersA++
    if (id === 'b') rendersB++
    return h('span', { 'data-id': id }, id + ':' + value)
  })

  function App() {
    const [n, setN] = React.useState(0)
    return h('div', null,
      h('button', { onClick: () => setN(n + 1) }, String(n)),
      h(Child, { key: 'a', id: 'a', value: 'A' }),
      h(Child, { key: 'b', id: 'b', value: 'B' }),
    )
  }

  const { container } = mount(h(App))
  await settle()

  assert.equal(container.querySelector('[data-id="a"]').textContent, 'a:A')
  assert.equal(container.querySelector('[data-id="b"]').textContent, 'b:B')
  assert.equal(rendersA, 1)
  assert.equal(rendersB, 1)

  container.querySelector('button').click()
  await settle()

  assert.equal(container.querySelector('[data-id="a"]').textContent, 'a:A')
  assert.equal(container.querySelector('[data-id="b"]').textContent, 'b:B')
  assert.equal(rendersA, 1)
  assert.equal(rendersB, 1)
})

test('memo 多实例独立更新 props，不影响兄弟实例', async () => {
  let rendersA = 0
  let rendersB = 0

  const Child = React.memo(function Child({ id, value }) {
    if (id === 'a') rendersA++
    if (id === 'b') rendersB++
    return h('span', { 'data-id': id }, id + ':' + value)
  })

  function App() {
    const [a, setA] = React.useState(0)
    const [b, setB] = React.useState(0)
    return h('div', null,
      h('button', { id: 'update-a', onClick: () => setA(n => n + 1) }, 'A'),
      h('button', { id: 'update-b', onClick: () => setB(n => n + 1) }, 'B'),
      h(Child, { key: 'a', id: 'a', value: a }),
      h(Child, { key: 'b', id: 'b', value: b }),
    )
  }

  const { container } = mount(h(App))
  await settle()

  assert.equal(container.querySelector('[data-id="a"]').textContent, 'a:0')
  assert.equal(container.querySelector('[data-id="b"]').textContent, 'b:0')
  assert.equal(rendersA, 1)
  assert.equal(rendersB, 1)

  container.querySelector('#update-a').click()
  await settle()

  assert.equal(container.querySelector('[data-id="a"]').textContent, 'a:1')
  assert.equal(container.querySelector('[data-id="b"]').textContent, 'b:0')
  assert.equal(rendersA, 2)
  assert.equal(rendersB, 1)

  container.querySelector('#update-b').click()
  await settle()

  assert.equal(container.querySelector('[data-id="a"]').textContent, 'a:1')
  assert.equal(container.querySelector('[data-id="b"]').textContent, 'b:1')
  assert.equal(rendersA, 2)
  assert.equal(rendersB, 2)
})

test('memo 支持自定义比较函数并按其实例 props 决定是否跳过', async () => {
  let renders = 0
  const Child = React.memo(
    function Child({ value, label }) {
      renders++
      return h('span', { id: 'memo-custom' }, value + ':' + label)
    },
    (prev, next) => prev.value === next.value,
  )

  function App() {
    const [label, setLabel] = React.useState('first')
    return h('div', null,
      h('button', { onClick: () => setLabel('second') }, 'change'),
      h(Child, { value: 1, label }),
    )
  }

  const { container } = mount(h(App))
  await settle()
  assert.equal(container.querySelector('#memo-custom').textContent, '1:first')
  assert.equal(renders, 1)

  container.querySelector('button').click()
  await settle()

  // 自定义比较只比较 value，因此 label 改变不触发 Child 重渲染。
  assert.equal(container.querySelector('#memo-custom').textContent, '1:first')
  assert.equal(renders, 1)
})

test('memo 组件自身的 useState 更新不会被 props 比较拦截', async () => {
  let renders = 0

  const Child = React.memo(function Child() {
    const [count, setCount] = React.useState(0)
    renders++
    return h('button', {
      id: 'memo-state',
      onClick: () => setCount(n => n + 1),
    }, String(count))
  })

  const { container } = mount(h(Child))
  await settle()

  assert.equal(container.querySelector('#memo-state').textContent, '0')
  assert.equal(renders, 1)

  container.querySelector('#memo-state').click()
  await settle()

  assert.equal(
    container.querySelector('#memo-state').textContent,
    '1',
    '内部状态更新后 DOM 应显示最新值',
  )
  assert.equal(renders, 2)
})

test('23 forwardRef 将 ref 传给渲染函数', () => {
  let receivedRef
  const Input = React.forwardRef((props, ref) => {
    receivedRef = ref
    return h('input', { ref })
  })
  const ref = React.createRef ? ({ current: null }) : { current: null }
  mount(h(Input, { ref }))
  assert.equal(receivedRef, ref)
  assert.equal(ref.current?.tagName, 'INPUT')
})

test('24 useImperativeHandle 在卸载时清空对象 ref', async () => {
  const ref = { current: null }
  function App() {
    React.useImperativeHandle(ref, () => ({ ping: () => 'pong' }), [])
    return h('span', null, 'mounted')
  }

  const { root } = mount(h(App))
  await settle()
  assert.equal(ref.current?.ping(), 'pong')
  root.unmount()
  assert.equal(ref.current, null)
})

test('25 useId 在同一组件更新时保持稳定', async () => {
  let firstId
  let nextId
  function App() {
    const [n, setN] = React.useState(0)
    const id = React.useId()
    if (!firstId) firstId = id
    else nextId = id
    return h('button', { id, onClick: () => setN(n + 1) }, String(n))
  }

  const { container } = mount(h(App))
  container.querySelector('button').click()
  await settle()
  assert.equal(nextId, firstId)
})

test('26 函数组件 ref 传递不会导致普通渲染崩溃', () => {
  const ref = { current: null }
  function App() {
    return h('input', { ref })
  }
  const { container } = mount(h(App))
  assert.equal(container.querySelector('input') !== null, true)
})

test('27 原生 DOM 支持 className、htmlFor、布尔属性和文本', () => {
  const { container } = mount(h('div', null,
    h('label', { htmlFor: 'field', className: 'label' }, 'Name'),
    h('input', { id: 'field', disabled: true, title: 'test' }),
    h('input', { id: 'enabled', disabled: false }),
  ))

  assert.equal(container.querySelector('label').getAttribute('for'), 'field')
  assert.equal(container.querySelector('label').className, 'label')
  assert.equal(container.querySelector('#field').hasAttribute('disabled'), true)
  assert.equal(container.querySelector('#enabled').hasAttribute('disabled'), false)
})

test('28 style 对象正确转换驼峰 CSS 属性', () => {
  const { container } = mount(h('div', {
    style: { backgroundColor: 'red', marginTop: '4px' },
  }))
  const el = container.querySelector('div')
  assert.equal(el.style.backgroundColor, 'red')
  assert.equal(el.style.marginTop, '4px')
})

test('29 SVG 使用正确命名空间并保留 viewBox', () => {
  const { container } = mount(h('svg', { viewBox: '0 0 10 10' },
    h('circle', { cx: 5, cy: 5, r: 4 }),
  ))
  const svg = container.querySelector('svg')
  assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg')
  assert.equal(svg.getAttribute('viewBox'), '0 0 10 10')
  assert.equal(svg.querySelector('circle').getAttribute('r'), '4')
})

test('30 dangerouslySetInnerHTML 能写入 HTML', () => {
  const { container } = mount(h('div', {
    dangerouslySetInnerHTML: { __html: '<b>trusted</b>' },
  }))
  assert.equal(container.querySelector('b')?.textContent, 'trusted')
})

test('31 DOM 事件处理器只触发一次', () => {
  let calls = 0
  const { container } = mount(h('button', {
    onClick: () => calls++,
  }, 'click'))
  container.querySelector('button').dispatchEvent(
    new MouseEvent('click', { bubbles: true }),
  )
  assert.equal(calls, 1)
})

test('32 createPortal 将节点渲染到目标容器并在卸载时清理', () => {
  const portalTarget = document.createElement('div')
  document.body.appendChild(portalTarget)

  function App() {
    return h('main', null,
      React.createPortal(h('span', null, 'portal'), portalTarget),
    )
  }

  const { root, container } = mount(h(App))
  assert.equal(portalTarget.textContent, 'portal')
  assert.equal(container.querySelector('span'), null)
  root.unmount()
  assert.equal(portalTarget.childNodes.length, 0)
  portalTarget.remove()
})

test('33 createFactory 返回的工厂能创建元素', () => {
  const makeSpan = React.createFactory('span')
  const element = makeSpan({ className: 'x' }, 'factory')
  assert.equal(element.type, 'span')
  assert.equal(element.props.className, 'x')
  assert.equal(element.props.children, 'factory')
})

test('34 JSX runtime 正确处理 key 和 props', () => {
  const element = React.jsx('span', { id: 'x', children: 'jsx' }, 'item-1')
  assert.equal(element.type, 'span')
  assert.equal(element.key, 'item-1')
  assert.equal(element.props.id, 'x')
  assert.equal(element.props.children, 'jsx')
})

test('35 useSyncExternalStore 订阅更新并在卸载时退订', async () => {
  let value = 1
  let listener
  let unsubscribed = 0
  const subscribe = callback => {
    listener = callback
    return () => { unsubscribed++ }
  }
  const getSnapshot = () => value

  function App() {
    const snapshot = React.useSyncExternalStore(subscribe, getSnapshot)
    return h('span', null, String(snapshot))
  }

  const { root, container } = mount(h(App))
  await settle()
  assert.equal(text(container), '1')
  value = 2
  listener()
  await settle()
  assert.equal(text(container), '2')
  root.unmount()
  assert.equal(unsubscribed, 1)
})


test('35A useSyncExternalStore 在订阅建立后检查最新快照', async () => {
  let value = 1
  let listener
  let firstRead = true

  const subscribe = callback => {
    listener = callback
    value = 2
    return () => {}
  }

  const getSnapshot = () => {
    if (firstRead) {
      firstRead = false
      return 1
    }
    return value
  }

  function App() {
    return h('span', null, String(
      React.useSyncExternalStore(subscribe, getSnapshot)
    ))
  }

  const { root, container } = mount(h(App))
  await settle()
  assert.equal(text(container), '2')
  root.unmount()
})

test('35B useSyncExternalStore 使用 Object.is 判断快照是否变化', async () => {
  let value = 1
  let listener
  let renders = 0

  const subscribe = callback => {
    listener = callback
    return () => {}
  }

  function App() {
    renders++
    return h('span', null, String(
      React.useSyncExternalStore(subscribe, () => value)
    ))
  }

  const { root, container } = mount(h(App))
  await settle()
  assert.equal(text(container), '1')

  const before = renders
  listener()
  await settle()
  assert.equal(renders, before)

  value = 2
  listener()
  await settle()
  assert.equal(text(container), '2')
  root.unmount()
})

test('36 flushSync 在返回前刷新排队状态更新', async () => {
  let setValue
  function App() {
    const [n, setter] = React.useState(0)
    setValue = setter
    return h('span', null, String(n))
  }

  const { container } = mount(h(App))
  React.flushSync(() => setValue(5))
  assert.equal(text(container), '5')
})

test('37 startTransition 执行回调', async () => {
  let called = false
  React.startTransition(() => { called = true })
  await new Promise(resolve => requestAnimationFrame(resolve))
  assert.equal(called, true)
})

test('38 useTransition 返回 pending 状态和可调用的 start 函数', async () => {
  let start
  function App() {
    const [pending, begin] = React.useTransition()
    start = begin
    return h('span', null, String(pending))
  }

  const { container } = mount(h(App))
  assert.equal(text(container), 'false')
  start(() => {})
  await new Promise(resolve => requestAnimationFrame(resolve))
  await settle()
  assert.equal(text(container), 'false')
})

test('39 类组件支持 setState 与生命周期', async () => {
  const log = []
  class Counter extends React.Component {
    constructor(props) {
      super(props)
      this.state = { n: 0 }
    }
    componentDidMount() { log.push('mount') }
    componentWillUnmount() { log.push('unmount') }
    render() {
      return h('button', {
        onClick: () => this.setState(s => ({ n: s.n + 1 })),
      }, String(this.state.n))
    }
  }

  const { root, container } = mount(h(Counter))
  assert.equal(text(container), '0')
  assert.ok(log.includes('mount'))
  container.querySelector('button').click()
  await settle()
  assert.equal(text(container), '1')
  root.unmount()
  assert.ok(log.includes('unmount'))
})

test('40 createRoot 卸载后禁止继续 render', () => {
  const container = document.createElement('div')
  const root = React.createRoot(container)
  root.render(h('span', null, 'x'))
  root.unmount()
  assert.throws(() => root.render(h('span', null, 'y')))
})

test('41 多个 root 的状态互不干扰', async () => {
  function Counter({ initial }) {
    const [n, setN] = React.useState(initial)
    return h('button', { onClick: () => setN(n + 1) }, String(n))
  }

  const a = mount(h(Counter, { initial: 1 }))
  const b = mount(h(Counter, { initial: 10 }))
  a.container.querySelector('button').click()
  await settle()
  assert.equal(text(a.container), '2')
  assert.equal(text(b.container), '10')
})

test('42 key 改变时组件状态重置', async () => {
  function Counter({ name }) {
    const [n, setN] = React.useState(0)
    return h('button', { onClick: () => setN(n + 1) }, `${name}:${n}`)
  }

  function App() {
    const [key, setKey] = React.useState('a')
    return h('div', null,
      h('button', { id: 'switch', onClick: () => setKey('b') }, 'switch'),
      h(Counter, { key, name: key }),
    )
  }

  const { container } = mount(h(App))
  container.querySelector('button:not(#switch)').click()
  await settle()
  assert.equal(
    container.querySelector('button:not(#switch)').textContent,
    'a:1'
  )
  container.querySelector('#switch').click()
  await settle()
  assert.equal(
    container.querySelector('button:not(#switch)').textContent,
    'b:0'
  )
})

test('43 root.render 重复渲染同一根组件保留状态', async () => {
  function Counter({ label }) {
    const [n, setN] = React.useState(0)
    return h('button', { onClick: () => setN(n + 1) }, `${label}:${n}`)
  }

  const { root, container } = mount(h(Counter, { label: 'A' }))
  container.querySelector('button').click()
  await settle()
  root.render(h(Counter, { label: 'B' }))
  assert.equal(text(container), 'B:1')
})

test('44 lazy 组件加载完成后应能显示组件内容', async () => {
  const Lazy = React.lazy(() => Promise.resolve({
    default: () => h('span', null, 'loaded'),
  }))

  const { container } = mount(h(React.Suspense, {
    fallback: h('span', null, 'loading'),
  }, h(Lazy)))

  await settle()
  await settle()
  assert.equal(text(container), 'loaded')
})

test('45 hydrateRoot 返回可用的 render 和 unmount', () => {
  const container = document.createElement('div')
  container.innerHTML = '<span>server</span>'
  document.body.appendChild(container)

  const root = React.hydrateRoot(container, h('span', null, 'client'))
  assert.equal(typeof root.render, 'function')
  assert.equal(typeof root.unmount, 'function')
  assert.equal(text(container), 'client')
  root.unmount()
  assert.equal(container.childNodes.length, 0)
  container.remove()
})

test('46 legacy render 与 unmountComponentAtNode 能工作', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  React.render(h('span', null, 'legacy'), container)
  assert.equal(text(container), 'legacy')
  assert.equal(React.unmountComponentAtNode(container), true)
  assert.equal(container.childNodes.length, 0)
  container.remove()
})


test('46A legacy render 重复渲染保留组件状态', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  function App() {
    const [n, setN] = React.useState(0)
    return h('button', {
      onClick: () => setN(v => v + 1),
    }, String(n))
  }

  React.render(h(App), container)
  await settle()
  container.querySelector('button').click()
  await settle()
  assert.equal(text(container), '1')

  React.render(h(App), container)
  await settle()
  assert.equal(text(container), '1')

  React.unmountComponentAtNode(container)
  container.remove()
})

test('46B legacy unmount 执行 useEffect 清理并允许重新挂载', async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  let setups = 0
  let cleanups = 0

  function App() {
    React.useEffect(() => {
      setups++
      return () => cleanups++
    }, [])
    return h('span', null, 'mounted')
  }

  React.render(h(App), container)
  await settle()
  assert.equal(setups, 1)

  React.unmountComponentAtNode(container)
  assert.equal(cleanups, 1)
  assert.equal(container.childNodes.length, 0)

  React.render(h(App), container)
  await settle()
  assert.equal(setups, 2)

  React.unmountComponentAtNode(container)
  assert.equal(cleanups, 2)
  container.remove()
})

test('47 findDOMNode 能识别 DOM 节点', () => {
  const { container } = mount(h('span', null, 'node'))
  const node = container.querySelector('span')
  assert.equal(React.findDOMNode(node), node)
})

test('48 useInsertionEffect 能在挂载时运行并在卸载时清理', () => {
  const log = []
  function App() {
    React.useInsertionEffect(() => {
      log.push('setup')
      return () => log.push('cleanup')
    }, [])
    return h('span', null, 'x')
  }

  const { root } = mount(h(App))
  assert.ok(log.includes('setup'))
  root.unmount()
  assert.ok(log.includes('cleanup'))
})

test('49 Provider 更新后消费者应获得最新 Context 值', () => {
  const Ctx = React.createContext('initial')
  function Read() {
    return h('span', null, React.useContext(Ctx))
  }

  function App({ value }) {
    return h(Ctx.Provider, { value }, h(Read))
  }

  const { root, container } = mount(h(App, { value: 'first' }))
  assert.equal(text(container), 'first')
  root.render(h(App, { value: 'second' }))
  assert.equal(text(container), 'second')
})

test('49b memo 消费 Context 时 Provider 更新必须重新渲染', () => {
  const Ctx = React.createContext('initial')
  let renders = 0
  const Read = React.memo(function Read() {
    renders++
    return h('span', null, React.useContext(Ctx))
  })
  function App({ value }) {
    return h(Ctx.Provider, { value }, h(Read))
  }
  const { root, container } = mount(h(App, { value: 'first' }))
  assert.equal(text(container), 'first')
  const before = renders
  root.render(h(App, { value: 'second' }))
  assert.equal(text(container), 'second')
  assert.ok(renders > before, 'Context 改变时 memo 消费者必须重新渲染')
})

test('50 act 会执行同步回调并返回回调结果', () => {
  const result = React.act(() => 42)
  assert.equal(result, 42)
})

test('51 StrictMode 不阻止正常组件渲染', () => {
  const { container } = mount(h(
    React.StrictMode,
    null,
    h('span', null, 'strict'),
  ))
  assert.equal(text(container), 'strict')
})

test('52 forwardRef 组件能接收普通 props', () => {
  const Field = React.forwardRef((props, ref) =>
    h('input', { ref, placeholder: props.placeholder }),
  )
  const ref = { current: null }
  const { container } = mount(h(Field, { ref, placeholder: 'enter' }))
  assert.equal(container.querySelector('input').placeholder, 'enter')
  assert.equal(ref.current, container.querySelector('input'))
})

test('53 PureComponent 的 props 浅比较会跳过渲染且保留 DOM', async () => {
  let childRenders = 0

  class Child extends React.PureComponent {
    render() {
      childRenders++
      return h('span', null, 'child:' + this.props.value)
    }
  }

  class Parent extends React.Component {
    constructor(props) {
      super(props)
      this.state = { n: 0 }
    }
    render() {
      return h('div', null,
        h('button', {
          onClick: () => this.setState(s => ({ n: s.n + 1 })),
        }, String(this.state.n)),
        h(Child, { value: 7 })
      )
    }
  }

  const { root, container } = mount(h(Parent))
  await settle()
  assert.equal(childRenders, 1)

  container.querySelector('button').click()
  await settle()

  assert.equal(text(container), '1child:7')
  assert.equal(childRenders, 1)
  root.unmount()
})

test('54 PureComponent 的 state 浅比较会跳过无变化渲染', async () => {
  let renders = 0
  const ref = ({ current: null })

  class Counter extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = { n: 0 }
    }
    render() {
      renders++
      return h('span', null, String(this.state.n))
    }
  }

  const { root, container } = mount(h(Counter, { ref }))
  await settle()
  assert.equal(renders, 1)

  ref.current.setState({ n: 0 })
  await settle()

  assert.equal(text(container), '0')
  assert.equal(renders, 1)
  root.unmount()
})

test('55 componentDidUpdate 接收更新前的 props 和 state', async () => {
  const updates = []
  const ref = ({ current: null })

  class Counter extends React.Component {
    constructor(props) {
      super(props)
      this.state = { n: 0 }
    }
    componentDidUpdate(prevProps, prevState) {
      updates.push({
        prevLabel: prevProps.label,
        prevN: prevState.n,
        nextLabel: this.props.label,
        nextN: this.state.n,
      })
    }
    render() {
      return h('span', null, this.props.label + ':' + this.state.n)
    }
  }

  const { root, container } = mount(h(Counter, { ref, label: 'a' }))
  await settle()

  ref.current.setState({ n: 1 })
  await settle()

  assert.equal(text(container), 'a:1')
  assert.deepEqual(updates[0], {
    prevLabel: 'a',
    prevN: 0,
    nextLabel: 'a',
    nextN: 1,
  })

  root.render(h(Counter, { ref, label: 'b' }))
  await settle()

  assert.equal(text(container), 'b:1')
  assert.deepEqual(updates[1], {
    prevLabel: 'a',
    prevN: 1,
    nextLabel: 'b',
    nextN: 1,
  })
  root.unmount()
})

test('56 forceUpdate 会绕过 PureComponent 的浅比较', async () => {
  let renders = 0
  const ref = ({ current: null })

  class Counter extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = { n: 0 }
    }
    render() {
      renders++
      return h('span', null, String(this.state.n))
    }
  }

  const { root, container } = mount(h(Counter, { ref }))
  await settle()
  assert.equal(renders, 1)

  ref.current.forceUpdate()
  await settle()

  assert.equal(text(container), '0')
  assert.equal(renders, 2)
  root.unmount()
})

test('49 state 更新后 layout effect 在 flushSync 返回前执行', () => {
  const log = []
  function App() {
    const [n, setN] = React.useState(0)
    React.useLayoutEffect(() => {
      log.push(`layout:${n}`)
      return () => log.push(`cleanup:${n}`)
    }, [n])
    return h('button', {
      onClick: () => React.flushSync(() => setN(1)),
    }, String(n))
  }

  const { container } = mount(h(App))
  log.length = 0

  container.querySelector('button').click()

  assert.equal(text(container), '1')
  assert.deepEqual(log, ['cleanup:0', 'layout:1'])
})

test('49B 首次挂载失败回滚后可以恢复并正确执行 Effect', async () => {
  let shouldFail = true
  let setups = 0
  let cleanups = 0

  function Child() {
    React.useEffect(() => {
      setups++
      return () => cleanups++
    }, [])
    return h('span', null, 'child')
  }

  function Bomb() {
    if (shouldFail) throw new Error('initial-mount-failure')
    return h('b', null, 'safe')
  }

  function App() {
    return h('section', null, h(Child), h(Bomb))
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = React.createRoot(container)
  roots.push(root)
  containers.push(container)

  assert.throws(
    () => root.render(h(App)),
    /initial-mount-failure/,
  )

  assert.equal(container.textContent, '')
  assert.equal(setups, 0)
  assert.equal(cleanups, 0)

  shouldFail = false
  root.render(h(App))
  await settle()

  assert.equal(container.textContent, 'childsafe')
  assert.equal(setups, 1)
  assert.equal(cleanups, 0)

  root.unmount()
  assert.equal(cleanups, 1)
})

test('49C 更新失败后保留旧 DOM 与 Effect 并允许恢复', async () => {
  let shouldFail = false
  const effects = []

  function Child({ value }) {
    React.useEffect(() => {
      effects.push(`setup:${value}`)
      return () => effects.push(`cleanup:${value}`)
    }, [value])

    return h('span', null, `value:${value}`)
  }

  function Bomb() {
    if (shouldFail) throw new Error('update-render-failure')
    return h('b', null, 'safe')
  }

  function App({ value }) {
    return h('section', null, h(Child, { value }), h(Bomb))
  }

  const { root, container } = mount(h(App, { value: 0 }))
  await settle()

  assert.equal(container.textContent, 'value:0safe')
  assert.deepEqual(effects, ['setup:0'])

  shouldFail = true
  assert.throws(
    () => root.render(h(App, { value: 1 })),
    /update-render-failure/,
  )

  assert.equal(container.textContent, 'value:0safe')
  assert.deepEqual(effects, ['setup:0'])

  shouldFail = false
  root.render(h(App, { value: 2 }))
  await settle()

  assert.equal(container.textContent, 'value:2safe')
  assert.deepEqual(effects, [
    'setup:0',
    'cleanup:0',
    'setup:2',
  ])

  root.unmount()
  assert.deepEqual(effects, [
    'setup:0',
    'cleanup:0',
    'setup:2',
    'cleanup:2',
  ])
})

test('49D 更新失败后保留子组件 Hook 状态', async () => {
  let shouldFail = false
  let setCount

  function Child({ value }) {
    const [count, updateCount] = React.useState(0)
    setCount = updateCount
    return h('span', null, `${value}:${count}`)
  }

  function Bomb() {
    if (shouldFail) throw new Error('hook-rollback-failure')
    return h('b', null, 'safe')
  }

  function App({ value }) {
    return h('section', null, h(Child, { value }), h(Bomb))
  }

  const { root, container } = mount(h(App, { value: 0 }))
  await settle()

  setCount(7)
  await settle()
  assert.equal(container.textContent, '0:7safe')

  shouldFail = true
  assert.throws(
    () => root.render(h(App, { value: 1 })),
    /hook-rollback-failure/,
  )

  assert.equal(container.textContent, '0:7safe')

  shouldFail = false
  root.render(h(App, { value: 2 }))
  await settle()

  assert.equal(container.textContent, '2:7safe')
})

test('49E 更新失败后保留类组件实例与生命周期状态', async () => {
  let shouldFail = false
  let constructions = 0
  const lifecycle = []

  class Child extends React.Component {
    constructor(props) {
      super(props)
      constructions++
      this.state = { count: 7 }
    }

    componentDidMount() {
      lifecycle.push('mount')
    }

    componentDidUpdate(prevProps) {
      lifecycle.push(`update:${prevProps.value}->${this.props.value}`)
    }

    componentWillUnmount() {
      lifecycle.push('unmount')
    }

    render() {
      return h('span', null, `${this.props.value}:${this.state.count}`)
    }
  }

  function Bomb() {
    if (shouldFail) throw new Error('class-rollback-failure')
    return h('b', null, 'safe')
  }

  function App({ value }) {
    return h('section', null, h(Child, { value }), h(Bomb))
  }

  const { root, container } = mount(h(App, { value: 0 }))
  await settle()

  assert.equal(container.textContent, '0:7safe')
  assert.equal(constructions, 1)
  assert.deepEqual(lifecycle, ['mount'])

  shouldFail = true
  assert.throws(
    () => root.render(h(App, { value: 1 })),
    /class-rollback-failure/,
  )

  assert.equal(container.textContent, '0:7safe')
  assert.equal(constructions, 1)
  assert.deepEqual(lifecycle, ['mount'])

  shouldFail = false
  root.render(h(App, { value: 2 }))
  await settle()

  assert.equal(container.textContent, '2:7safe')
  assert.equal(constructions, 1)
  assert.deepEqual(lifecycle, [
    'mount',
    'update:0->2',
  ])

  root.unmount()
  assert.deepEqual(lifecycle, [
    'mount',
    'update:0->2',
    'unmount',
  ])
})

test('50 连续状态更新不会丢失最终 Effect', async () => {
  const log = []
  function App() {
    const [n, setN] = React.useState(0)
    React.useEffect(() => {
      log.push(`effect:${n}`)
      return () => log.push(`cleanup:${n}`)
    }, [n])
    return h('button', {
      onClick: () => {
        setN(1)
        setN(2)
      },
    }, String(n))
  }

  const { container } = mount(h(App))
  await settle()
  log.length = 0

  container.querySelector('button').click()
  await settle()

  assert.equal(text(container), '2')
  assert.deepEqual(log, ['cleanup:0', 'effect:2'])
})

test('51 更新时 layout effect 先于普通 effect', async () => {
  const log = []

  function App() {
    const [n, setN] = React.useState(0)

    React.useLayoutEffect(() => {
      log.push(`layout:${n}`)
      return () => log.push(`layout-cleanup:${n}`)
    }, [n])

    React.useEffect(() => {
      log.push(`effect:${n}`)
      return () => log.push(`effect-cleanup:${n}`)
    }, [n])

    return h('button', {
      onClick: () => setN(1),
    }, String(n))
  }

  const { container } = mount(h(App))
  await settle()
  log.length = 0

  container.querySelector('button').click()
  await settle()

  assert.equal(text(container), '1')
  assert.deepEqual(log, [
    'layout-cleanup:0',
    'layout:1',
    'effect-cleanup:0',
    'effect:1',
  ])
})

test('52 layout effect 更新时能读取提交后的 DOM', async () => {
  const observed = []

  function App() {
    const [n, setN] = React.useState(0)

    React.useLayoutEffect(() => {
      const button = document.querySelector('#layout-effect-probe')
      observed.push({
        state: n,
        dom: button?.textContent ?? null,
      })
    }, [n])

    return h('button', {
      id: 'layout-effect-probe',
      onClick: () => setN(1),
    }, String(n))
  }

  const { container } = mount(h(App))
  observed.length = 0

  container.querySelector('button').click()
  await settle()

  assert.deepEqual(observed, [{ state: 1, dom: '1' }])
})

test('49F Portal 子树渲染失败时保留旧 Portal 并允许恢复', () => {
  const portalTarget = document.createElement('div')
  document.body.appendChild(portalTarget)

  let shouldThrow = false

  function PortalChild({ value }) {
    if (shouldThrow) throw new Error('portal-render-failure')
    return h('span', null, `portal:${value}`)
  }

  function App({ value }) {
    return h('main', null,
      h('p', null, `main:${value}`),
      React.createPortal(h(PortalChild, { value }), portalTarget),
    )
  }

  const { root, container } = mount(h(App, { value: 0 }))

  assert.equal(container.textContent, 'main:0')
  assert.equal(portalTarget.textContent, 'portal:0')

  shouldThrow = true
  root.render(h(App, { value: 1 }))

  assert.equal(
    container.textContent,
    'main:0',
    'Portal 渲染失败时主 DOM 应保持旧内容',
  )
  assert.equal(
    portalTarget.textContent,
    'portal:0',
    'Portal 渲染失败时目标容器应保留旧节点',
  )

  shouldThrow = false
  root.render(h(App, { value: 2 }))

  assert.equal(container.textContent, 'main:2')
  assert.equal(portalTarget.textContent, 'portal:2')

  root.unmount()
  assert.equal(portalTarget.childNodes.length, 0)
  portalTarget.remove()
})

test('49G Portal 更新失败后保留 Hook 状态并正确恢复 Effect', async () => {
  const portalTarget = document.createElement('div')
  document.body.appendChild(portalTarget)

  let shouldThrow = false
  let setCount
  const effects = []

  function PortalChild({ value }) {
    const [count, updateCount] = React.useState(0)
    setCount = updateCount

    React.useEffect(() => {
      effects.push(`setup:${value}:${count}`)
      return () => effects.push(`cleanup:${value}:${count}`)
    }, [value, count])

    if (shouldThrow) throw new Error('portal-hook-failure')

    return h('span', null, `${value}:${count}`)
  }

  function App({ value }) {
    return h('main', null,
      h('p', null, `main:${value}`),
      React.createPortal(h(PortalChild, { value }), portalTarget),
    )
  }

  const { root, container } = mount(h(App, { value: 0 }))
  assert.equal(container.textContent, 'main:0')
  assert.equal(portalTarget.textContent, '0:0')
  await settle()
  assert.deepEqual(effects, ['setup:0:0'])

  setCount(7)
  React.flushSync()
  assert.equal(portalTarget.textContent, '0:7')
  await settle()
  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:7',
  ])

  shouldThrow = true
  root.render(h(App, { value: 1 }))
  await settle()

  assert.equal(container.textContent, 'main:0')
  assert.equal(portalTarget.textContent, '0:7')
  assert.deepEqual(
    effects,
    ['setup:0:0', 'cleanup:0:0', 'setup:0:7'],
    '失败更新不能提交新 Effect 或清理旧 Effect',
  )

  shouldThrow = false
  root.render(h(App, { value: 2 }))
  await settle()

  assert.equal(container.textContent, 'main:2')
  assert.equal(portalTarget.textContent, '2:7')
  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:7',
    'cleanup:0:7',
    'setup:2:7',
  ])

  root.unmount()
  await settle()
  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:7',
    'cleanup:0:7',
    'setup:2:7',
    'cleanup:2:7',
  ])

  assert.equal(portalTarget.childNodes.length, 0)
  portalTarget.remove()
})

test('49H 兄弟组件更新失败时一起回滚状态与 Effect', async () => {
  const effects = []
  let setCount
  let shouldThrow = false

  function StatefulSibling({ value }) {
    const [count, updateCount] = React.useState(0)
    setCount = updateCount

    React.useEffect(() => {
      effects.push(`setup:${value}:${count}`)
      return () => effects.push(`cleanup:${value}:${count}`)
    }, [value, count])

    return h('span', null, `${value}:${count}`)
  }

  function Bomb({ value }) {
    if (shouldThrow) throw new Error('sibling-transaction-failure')
    return h('b', null, `safe:${value}`)
  }

  function App({ value }) {
    return h('div', null,
      h(StatefulSibling, { value }),
      h(Bomb, { value }),
    )
  }

  const { root, container } = mount(h(App, { value: 0 }))
  await settle()

  assert.equal(container.textContent, '0:0safe:0')
  assert.deepEqual(effects, ['setup:0:0'])

  setCount(5)
  React.flushSync()
  await settle()

  assert.equal(container.textContent, '0:5safe:0')
  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:5',
  ])

  shouldThrow = true
  assert.throws(
    () => root.render(h(App, { value: 1 })),
    /sibling-transaction-failure/,
  )
  await settle()

  assert.equal(container.textContent, '0:5safe:0')
  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:5',
  ], '失败事务不能提交兄弟组件的 Effect')

  shouldThrow = false
  root.render(h(App, { value: 2 }))
  await settle()

  assert.equal(container.textContent, '2:5safe:2')
  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:5',
    'cleanup:0:5',
    'setup:2:5',
  ])

  root.unmount()
  await settle()

  assert.deepEqual(effects, [
    'setup:0:0',
    'cleanup:0:0',
    'setup:0:5',
    'cleanup:0:5',
    'setup:2:5',
    'cleanup:2:5',
  ])
})

test('49I 更新失败后直接卸载只清理已提交的 Effect', async () => {
  const effects = []
  let shouldThrow = false

  function Child({ value }) {
    React.useEffect(() => {
      effects.push(`setup:${value}`)
      return () => effects.push(`cleanup:${value}`)
    }, [value])

    if (shouldThrow) throw new Error('unmount-after-failure')
    return h('span', null, `child:${value}`)
  }

  function App({ value }) {
    return h('div', null, h(Child, { value }))
  }

  const { root, container } = mount(h(App, { value: 0 }))
  await settle()

  assert.equal(container.textContent, 'child:0')
  assert.deepEqual(effects, ['setup:0'])

  shouldThrow = true
  assert.throws(
    () => root.render(h(App, { value: 1 })),
    /unmount-after-failure/,
  )
  await settle()

  assert.equal(container.textContent, 'child:0')
  assert.deepEqual(effects, ['setup:0'])

  root.unmount()
  await settle()

  assert.equal(container.textContent, '')
  assert.deepEqual(effects, ['setup:0', 'cleanup:0'])

  await settle()
  assert.deepEqual(
    effects,
    ['setup:0', 'cleanup:0'],
    '卸载后不应再执行旧 Effect 或重复清理',
  )
})

test('57 lazy 加载失败后由错误边界显示降级 UI', async () => {
  const failure = new Error('lazy-loader-failure')
  const Lazy = React.lazy(() => Promise.reject(failure))
  let caught = null

  class Boundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { failed: false }
    }

    static getDerivedStateFromError() {
      return { failed: true }
    }

    componentDidCatch(error) {
      caught = error
    }

    render() {
      if (this.state.failed) {
        return h('span', null, 'lazy-error-fallback')
      }
      return this.props.children
    }
  }

  const { root, container } = mount(
    h(Boundary, null,
      h(React.Suspense, {
        fallback: h('span', null, 'loading'),
      }, h(Lazy)),
    ),
  )

  await settle()
  await settle()

  assert.equal(
    container.textContent,
    'lazy-error-fallback',
    'lazy 加载失败后应显示错误边界降级 UI',
  )
  assert.equal(caught, failure, '错误边界应收到原始加载错误')

  root.unmount()
  await settle()
})

test('58 错误边界捕获子组件渲染错误并显示降级 UI', async () => {
  let caught = null

  class Boundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { failed: false }
    }

    static getDerivedStateFromError(error) {
      return { failed: true }
    }

    componentDidCatch(error) {
      caught = error
    }

    render() {
      if (this.state.failed) {
        return h('span', null, 'error-fallback')
      }
      return this.props.children
    }
  }

  function Bomb() {
    throw new Error('boundary-capture-test')
  }

  const { root, container } = mount(
    h(Boundary, null, h(Bomb)),
  )

  await settle()

  assert.equal(
    container.textContent,
    'error-fallback',
    '错误边界应显示降级 UI',
  )
  assert.equal(caught?.message, 'boundary-capture-test')

  root.unmount()
})


test('49c Context 更新后相同 props 应恢复 memo 跳过', () => {
  const Ctx = React.createContext('initial')
  let renders = 0
  const Read = React.memo(function Read({ label }) {
    renders++
    return h('span', null, label + ':' + React.useContext(Ctx))
  })
  function App({ value }) {
    return h(Ctx.Provider, { value }, h(Read, { label: 'x' }))
  }

  const { root, container } = mount(h(App, { value: 'first' }))
  assert.equal(text(container), 'x:first')
  const beforeContextUpdate = renders

  root.render(h(App, { value: 'second' }))
  assert.equal(text(container), 'x:second')
  assert.ok(renders > beforeContextUpdate)

  const afterContextUpdate = renders
  root.render(h(App, { value: 'second' }))
  assert.equal(text(container), 'x:second')
  assert.equal(renders, afterContextUpdate, 'Context 未变化且 props 相同，应跳过 memo 重渲染')
})

test('49d 嵌套 Provider 更新不应污染外层 Context', () => {
  const Ctx = React.createContext('default')
  let outerRenders = 0
  let innerRenders = 0

  const OuterRead = React.memo(function OuterRead() {
    outerRenders++
    return h('span', null, 'outer:' + React.useContext(Ctx))
  })
  const InnerRead = React.memo(function InnerRead() {
    innerRenders++
    return h('span', null, 'inner:' + React.useContext(Ctx))
  })

  function App({ outer, inner }) {
    return h(Ctx.Provider, { value: outer },
      h('div', null,
        h(OuterRead),
        h(Ctx.Provider, { value: inner }, h(InnerRead))
      )
    )
  }

  const { root, container } = mount(h(App, { outer: 'A', inner: 'X' }))
  assert.match(text(container), /outer:A/)
  assert.match(text(container), /inner:X/)

  root.render(h(App, { outer: 'A', inner: 'Y' }))
  assert.match(text(container), /outer:A/)
  assert.match(text(container), /inner:Y/)
})

test('49e memo Context 依赖在渲染失败回滚后仍能正确更新', () => {
  const Ctx = React.createContext('default')
  let shouldFail = false
  let renders = 0

  const Read = React.memo(function Read() {
    renders++
    return h('span', null, React.useContext(Ctx))
  })

  function Bomb() {
    if (shouldFail) throw new Error('context-rollback-failure')
    return h('b', null, 'safe')
  }

  function App({ value }) {
    return h(Ctx.Provider, { value },
      h('section', null, h(Read), h(Bomb)),
    )
  }

  const { root, container } = mount(h(App, { value: 'A' }))
  assert.equal(container.textContent, 'Asafe')

  shouldFail = true
  assert.throws(
    () => root.render(h(App, { value: 'B' })),
    /context-rollback-failure/,
  )

  assert.equal(container.textContent, 'Asafe')

  shouldFail = false
  root.render(h(App, { value: 'A' }))
  assert.equal(container.textContent, 'Asafe')

  root.render(h(App, { value: 'C' }))
  assert.equal(
    container.textContent,
    'Csafe',
    '回滚后 Context 消费者必须继续响应新的 Provider 值',
  )
  assert.ok(renders >= 2, 'Context 消费者应至少完成初次渲染和一次更新')
})
