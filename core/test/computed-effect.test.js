import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signal, effect, computed } from '../src/index.js'

for (let n = 1; n <= 20; n++) {
  test(`链式 computed 深度 ${n}`, () => {
    const a = signal(0)
    let cur = computed(() => a() + 1)
    for (let i = 1; i < n; i++) {
      const prev = cur
      cur = computed(() => prev() + 1)
    }
    let last
    effect(() => { last = cur() })
    a(1)
    assert.equal(last, 1 + n)
  })
}

for (let w = 2; w <= 10; w++) {
  test(`diamond 宽度 ${w}`, () => {
    const a = signal(1)
    const branches = Array.from({ length: w }, (_, i) => computed(() => a() * (i + 1)))
    let sum
    effect(() => { sum = branches.reduce((acc, b) => acc + b(), 0) })
    a(2)
    const expected = Array.from({ length: w }, (_, i) => 2 * (i + 1)).reduce((a, b) => a + b, 0)
    assert.equal(sum, expected)
  })
}

for (let w = 2; w <= 10; w++) {
  test(`diamond 宽度 ${w}：effect 只跑一次`, () => {
    const a = signal(1)
    const branches = Array.from({ length: w }, () => computed(() => a()))
    let runs = 0
    effect(() => { runs++; branches.forEach(b => b()) })
    runs = 0
    a(2)
    assert.equal(runs, 1)
  })
}

for (let n = 1; n <= 10; n++) {
  test(`${n} 个 effect 共享 computed`, () => {
    const a = signal(0)
    const b = computed(() => a() * 2)
    const logs = Array.from({ length: n }, () => [])
    logs.forEach(log => effect(() => log.push(b())))
    a(5)
    for (const log of logs) {
      assert.equal(log[log.length - 1], 10)
    }
  })
}

test('effect 内写另一个 signal', () => {
  const a = signal(0)
  const b = signal(0)
  effect(() => { b(a() * 2) })
  a(3)
  assert.equal(b(), 6)
})

for (let n = 1; n <= 10; n++) {
  test(`连续写 ${n} 次，final 正确`, () => {
    const s = signal(0)
    for (let i = 1; i <= n; i++) s(i)
    assert.equal(s(), n)
  })
}

for (let n = 1; n <= 10; n++) {
  test(`computed 缓存命中 ${n} 次`, () => {
    const a = signal(1)
    let computes = 0
    const b = computed(() => { computes++; return a() * 2 })
    for (let i = 0; i < n; i++) b()
    assert.equal(computes, 1)
  })
}

test('computed dispose 不崩', () => {
  const a = signal(1)
  const b = computed(() => a() * 2)
  b()
  b.dispose()
  a(2)
  assert.ok(true)
})
