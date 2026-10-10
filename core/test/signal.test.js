import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signal, effect, computed, batch, untrack, onCleanup } from '../src/index.js'

const INITIALS = [0, 1, -1, 42, 3.14, 'str', '', true, false, null, undefined, [], {}, [1,2,3], {a:1}]
for (const v of INITIALS) {
  test(`signal 初始值 ${JSON.stringify(v)}`, () => {
    const s = signal(v)
    assert.deepEqual(s(), v)
  })
}

for (const v of [0, 1, 'new', true, null, [], {}]) {
  test(`signal 写入 ${JSON.stringify(v)}`, () => {
    const s = signal('init')
    s(v)
    assert.deepEqual(s(), v)
  })
}

for (let i = 0; i < 20; i++) {
  test(`函数式更新 +${i}`, () => {
    const s = signal(i)
    s(v => v + 1)
    assert.equal(s(), i + 1)
  })
}

test('NaN 相等不触发', () => {
  const s = signal(NaN)
  let runs = 0
  effect(() => { runs++; s() })
  s(NaN)
  assert.equal(runs, 1)
})

test('Object.is: -0 与 +0 不等 → 会触发', () => {
  const s = signal(0)
  let runs = 0
  effect(() => { runs++; s() })
  s(-0)
  assert.equal(runs, 2)
})

test('自定义 equals', () => {
  const s = signal({ a: 1 }, { equals: (x, y) => x.a === y.a })
  let runs = 0
  effect(() => { runs++; s() })
  s({ a: 1 })
  assert.equal(runs, 1)
})

for (let n = 1; n <= 10; n++) {
  test(`batch 内写 ${n} 次只触发一次`, () => {
    const s = signal(-1)
    let runs = 0
    effect(() => { runs++; s() })
    batch(() => { for (let i = 0; i < n; i++) s(i) })
    assert.equal(runs, 2)
  })
}

test('untrack 不订阅', () => {
  const s = signal(0)
  let runs = 0
  effect(() => { runs++; untrack(() => s()) })
  s(1)
  assert.equal(runs, 1)
})

test('onCleanup 前一次跑前调用', () => {
  const s = signal(0)
  let cleanups = 0
  effect(() => { s(); onCleanup(() => cleanups++) })
  s(1); s(2)
  assert.equal(cleanups, 2)
})
