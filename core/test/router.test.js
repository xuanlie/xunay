import { test } from 'node:test'
import assert from 'node:assert/strict'

// 每次测试独立重置全局环境
function setupEnv(hash = '#/', pathname = '/', search = '') {
  globalThis.location = { hash, pathname, search }
  globalThis.window = { addEventListener: () => {}, scrollTo: () => {} }
  globalThis.history = {
    pushState: () => {}, replaceState: () => {},
    back: () => {}, forward: () => {}, go: () => {},
  }
}

const { createRouter } = await import('../src/router.js')

// ===== 1. matchPath 基础 =====
setupEnv()
const base = createRouter({ routes: [] })

// 静态路由
for (const [pattern, path, expect] of [
  ['/', '/', {}],
  ['/about', '/about', {}],
  ['/a/b', '/a/b', {}],
  ['/a/b/c', '/a/b/c', {}],
]) {
  test(`matchPath 静态: ${pattern} vs ${path}`, () => {
    const r = createRouter({ routes: [{ path: pattern, component: () => 'x' }] })
    setupEnv('#' + path)
    const r2 = createRouter({ routes: [{ path: pattern, component: () => 'x' }] })
    const m = r2.matched()
    assert.ok(m)
    assert.deepEqual(m.params, expect)
  })
}

// 参数路由
for (const [pattern, path, key, val] of [
  ['/user/:id', '/user/1', 'id', '1'],
  ['/user/:id', '/user/abc', 'id', 'abc'],
  ['/post/:slug', '/post/hello-world', 'slug', 'hello-world'],
  ['/a/:x/b/:y', '/a/1/b/2', 'x', '1'],
]) {
  test(`matchPath 参数: ${pattern} vs ${path}`, () => {
    setupEnv('#' + path)
    const r = createRouter({ routes: [{ path: pattern, component: () => 'x' }] })
    const m = r.matched()
    assert.ok(m, `未匹配: ${pattern} vs ${path}`)
    assert.equal(m.params[key], val)
  })
}

// 通配符
for (const [pattern, path, expected] of [
  ['/files/*rest', '/files/a', 'a'],
  ['/files/*rest', '/files/a/b', 'a/b'],
  ['/files/*rest', '/files/a/b/c', 'a/b/c'],
  ['/*rest', '/a/b/c', 'a/b/c'],
  ['/p/*', '/p/a/b', 'a/b'],
]) {
  test(`matchPath 通配符: ${pattern} vs ${path}`, () => {
    setupEnv('#' + path)
    const r = createRouter({ routes: [{ path: pattern, component: () => 'x' }] })
    const m = r.matched()
    assert.ok(m, `通配符未匹配: ${pattern} vs ${path}`)
    const val = m.params.rest || m.params.wildcard
    assert.equal(val, expected)
  })
}

// 不匹配
for (const [pattern, path] of [
  ['/a', '/b'],
  ['/a/b', '/a'],
  ['/a', '/a/b'],
  ['/user/:id', '/admin/1'],
]) {
  test(`matchPath 不匹配: ${pattern} vs ${path}`, () => {
    setupEnv('#' + path)
    const r = createRouter({ routes: [{ path: pattern, component: () => 'x' }] })
    assert.equal(r.matched(), null)
  })
}

// ===== 2. hash 模式 + query 剥离 =====
for (const [hash, expectedPath, expectedQ] of [
  ['#/user/1', '/user/1', {}],
  ['#/user/1?name=x', '/user/1', { name: 'x' }],
  ['#/search?q=a&p=2', '/search', { q: 'a', p: '2' }],
  ['#/', '/', {}],
  ['#/a/b?x=1&y=2', '/a/b', { x: '1', y: '2' }],
]) {
  test(`hash 模式: ${hash}`, () => {
    setupEnv(hash)
    const r = createRouter({ mode: 'hash', routes: [] })
    assert.equal(r.path(), expectedPath)
    assert.deepEqual(r.query(), expectedQ)
  })
}

// ===== 3. 参数解码 =====
for (const [hash, expected] of [
  ['#/u/a%20b', 'a b'],
  ['#/u/%E4%B8%AD%E6%96%87', '中文'],
  ['#/u/simple', 'simple'],
]) {
  test(`参数解码: ${hash}`, () => {
    setupEnv(hash)
    const r = createRouter({ mode: 'hash', routes: [{ path: '/u/:id', component: () => 'x' }] })
    const m = r.matched()
    assert.equal(m.params.id, expected)
  })
}

test('非法编码不崩溃', () => {
  setupEnv('#/u/%ZZ')
  const r = createRouter({ mode: 'hash', routes: [{ path: '/u/:id', component: () => 'x' }] })
  assert.doesNotThrow(() => r.matched())
})

// ===== 4. history 模式 base 前缀 =====
for (const [pathname, base, expected] of [
  ['/', '', '/'],
  ['/about', '', '/about'],
  ['/app', '/app', '/'],
  ['/app/user', '/app', '/user'],
  ['/application', '/app', '/'],
  ['/other', '/app', '/'],
]) {
  test(`history base: pathname=${pathname} base=${base}`, () => {
    setupEnv('#', pathname, '')
    const r = createRouter({ mode: 'history', base, routes: [] })
    assert.equal(r.path(), expected)
  })
}

// ===== 5. matched 结果 =====
test('matched 返回 route + params', () => {
  setupEnv('#/user/42')
  const comp = () => 'user'
  const r = createRouter({
    mode: 'hash',
    routes: [{ path: '/user/:id', component: comp }],
  })
  const m = r.matched()
  assert.equal(m.route.component, comp)
  assert.equal(m.params.id, '42')
})

test('多个路由按顺序匹配', () => {
  setupEnv('#/b')
  const r = createRouter({
    mode: 'hash',
    routes: [
      { path: '/a', component: () => 'a' },
      { path: '/b', component: () => 'b' },
      { path: '/c', component: () => 'c' },
    ],
  })
  assert.ok(r.matched())
  assert.equal(r.route().component(), 'b')
})

test('参数路由优先匹配靠前的', () => {
  setupEnv('#/x')
  const r = createRouter({
    mode: 'hash',
    routes: [
      { path: '/:id', component: () => 'param' },
    ],
  })
  assert.equal(r.params().id, 'x')
})

// ===== 6. 守卫 =====
test('守卫拦截 push', () => {
  setupEnv('#/a')
  const r = createRouter({ mode: 'hash', routes: [] })
  let calls = 0
  r.beforeEach((to) => { calls++; if (to === '/blocked') return false })
  r.push('/blocked')
  assert.equal(calls, 1)
  assert.equal(r.path(), '/a')
})

test('守卫放行 push', () => {
  setupEnv('#/a')
  const r = createRouter({ mode: 'hash', routes: [] })
  r.beforeEach(() => true)
  r.push('/b')
  assert.equal(r.path(), '/b')
})

test('守卫重定向', () => {
  setupEnv('#/a')
  const r = createRouter({ mode: 'hash', routes: [] })
  r.beforeEach((to) => to === '/old' ? '/new' : true)
  r.push('/old')
  assert.equal(r.path(), '/new')
})

test('多个守卫按顺序执行', () => {
  setupEnv('#/start')
  const r = createRouter({ mode: 'hash', routes: [] })
  const order = []
  r.beforeEach(() => { order.push(1); return true })
  r.beforeEach(() => { order.push(2); return true })
  r.beforeEach(() => { order.push(3); return true })
  r.push('/end')
  assert.deepEqual(order, [1, 2, 3])
})

test('守卫取消订阅', () => {
  setupEnv('#/a')
  const r = createRouter({ mode: 'hash', routes: [] })
  let calls = 0
  const unsub = r.beforeEach(() => { calls++; return true })
  r.push('/b')
  unsub()
  r.push('/c')
  assert.equal(calls, 1)
})

test('守卫 replace 也被拦截', () => {
  setupEnv('#/a')
  const r = createRouter({ mode: 'hash', routes: [] })
  let blocked = 0
  r.beforeEach((to) => { if (to === '/x') { blocked++; return false } })
  r.replace('/x')
  assert.equal(blocked, 1)
  assert.equal(r.path(), '/a')
})

// ===== 7. view =====
test('view 返回组件结果', () => {
  setupEnv('#/home')
  const r = createRouter({
    mode: 'hash',
    routes: [{ path: '/home', component: (p) => 'rendered' }],
  })
  assert.equal(r.view(), 'rendered')
})

test('view 无匹配返回 null', () => {
  setupEnv('#/nowhere')
  const r = createRouter({ mode: 'hash', routes: [] })
  assert.equal(r.view(), null)
})

test('view 用 notFound', () => {
  setupEnv('#/nowhere')
  const r = createRouter({
    mode: 'hash',
    routes: [],
    notFound: () => 'NF',
  })
  assert.equal(r.view(), 'NF')
})

// ===== 8. 集成：多次切换 =====
test('连续 push 5 次', () => {
  setupEnv('#/start')
  const r = createRouter({ mode: 'hash', routes: [] })
  const paths = []
  for (const p of ['/a', '/b', '/c', '/d', '/e']) {
    r.push(p)
    paths.push(r.path())
  }
  assert.deepEqual(paths, ['/a', '/b', '/c', '/d', '/e'])
})

test('push 后 query 同步更新', () => {
  setupEnv('#/')
  const r = createRouter({ mode: 'hash', routes: [] })
  r.push('/search?q=hello')
  assert.deepEqual(r.query(), { q: 'hello' })
})
