import { test } from 'node:test'
import assert from 'node:assert/strict'

// mock 浏览器
globalThis.localStorage = { _m: new Map(), getItem(k) { return this._m.get(k) ?? null }, setItem(k, v) { this._m.set(k, v) }, removeItem(k) { this._m.delete(k) }, clear() { this._m.clear() } }
globalThis.sessionStorage = globalThis.localStorage
globalThis.window = { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} }
globalThis.document = { documentElement: { setAttribute: () => {}, classList: { add: () => {}, remove: () => {} } }, cookie: '' }

test('storage 读写', async () => {
  const { storage } = await import('../core/src/storage.js')
  storage.set('k', 'v')
  assert.equal(storage.get('k'), 'v')
  storage.remove('k')
  assert.equal(storage.get('k'), null)
})

test('storage ttl 过期', async () => {
  const { storage } = await import('../core/src/storage.js')
  storage.set('tmp', 'x', 0)  // ttl=0 表示不过期
  assert.equal(storage.get('tmp'), 'x')
})

test('i18n 中英切换', async () => {
  const { i18n } = await import('../core/src/i18n.js')
  i18n.setLocale('zh')
  assert.equal(i18n.t('hello'), '你好')
  i18n.setLocale('en')
  assert.equal(i18n.t('hello'), 'Hello')
})

test('i18n 插值', async () => {
  const { i18n } = await import('../core/src/i18n.js')
  i18n.setLocale('en')
  assert.equal(i18n.t('welcome', { name: 'Leo' }), 'Welcome, Leo')
})

test('theme 切换', async () => {
  const { createTheme } = await import('../core/src/theme.js')
  const t = createTheme()
  const before = t.theme()
  t.toggle()
  assert.notEqual(t.theme(), before)
})

test('auth 读写清除', async () => {
  const { createAuth } = await import('../core/src/auth.js')
  const a = createAuth({ storage: 'memory' })
  a.set('tkn')
  assert.equal(a.token(), 'tkn')
  assert.equal(a.isValid(), true)
  a.clear()
  assert.equal(a.isEmpty(), true)
})

test('persist 自动保存', async () => {
  const { persist } = await import('../core/src/persist.js')
  const s = persist(42, { key: 'test-count', storage: 'memory' })
  assert.equal(s(), 42)
  s(100)
  assert.equal(s(), 100)
})

test('form 基础校验', async () => {
  const { createForm, rules } = await import('../core/src/form.js')
  const f = createForm({
    initial: { name: '', email: '' },
    rules: {
      name: [rules.required()],
      email: [rules.required(), rules.email()],
    },
  })
  assert.equal(f.validate(), false)
  assert.ok(f.errors().name)
  f.set('name', 'Leo')
  f.set('email', 'leo@example.com')
  assert.equal(f.validate(), true)
})

test('form field 绑定', async () => {
  const { createForm, rules } = await import('../core/src/form.js')
  const f = createForm({
    initial: { name: '' },
    rules: { name: [rules.required()] },
  })
  const binding = f.field('name')
  assert.equal(binding.value(), '')
  binding.on.input({ target: { value: 'Leo' } })
  assert.equal(f.values().name, 'Leo')
})

test('router 路径匹配', async () => {
  const { createRouter } = await import('../core/src/router.js')
  const r = createRouter({
    routes: [
      { path: '/', component: () => 'home' },
      { path: '/user/:id', component: (p) => 'user-' + p.id },
    ],
    mode: 'hash',
  })
  // 默认根路径
  assert.equal(r.path(), '/')
})

test('query 基础创建', async () => {
  const { query } = await import('../core/src/query.js')
  let called = 0
  const q = query({
    key: 'test-q',
    fetcher: async () => { called++; return { ok: true } },
    enabled: false,
  })
  assert.equal(typeof q.refetch, 'function')
  assert.equal(typeof q.data, 'function')
})

test('http 创建', async () => {
  const { createHttp } = await import('../core/src/http.js')
  const api = createHttp({ baseURL: 'https://example.com' })
  assert.equal(typeof api.get, 'function')
  assert.equal(typeof api.post, 'function')
})
