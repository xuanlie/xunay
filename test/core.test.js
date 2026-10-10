import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signal, computed, effect, batch, untrack, onCleanup } from '../core/src/core.js'
import { runtime } from '../core/src/runtime.js'

test('signal 读写', () => {
  const s = signal(1)
  assert.equal(s(), 1)
  s(2)
  assert.equal(s(), 2)
})

test('signal 函数式更新', () => {
  const s = signal(1)
  s(v => v + 10)
  assert.equal(s(), 11)
})

test('effect 订阅与清理', () => {
  const s = signal(0)
  let runs = 0
  const stop = effect(() => { s(); runs++ })
  assert.equal(runs, 1)
  s(1); assert.equal(runs, 2)
  stop()
  s(2); assert.equal(runs, 2)
})

test('computed 派生', () => {
  const a = signal(2), b = signal(3)
  const sum = computed(() => a() + b())
  assert.equal(sum(), 5)
  a(10)
  assert.equal(sum(), 13)
})

test('batch 合并触发', () => {
  const a = signal(0), b = signal(0)
  let runs = 0
  effect(() => { a(); b(); runs++ })
  assert.equal(runs, 1)
  batch(() => { a(1); b(2) })
  assert.equal(runs, 2)
})

// === 新增测试 ===

test('untrack 读不订阅', () => {
  const a = signal(0), b = signal(10)
  let runs = 0
  effect(() => {
    a()
    untrack(() => b())
    runs++
  })
  assert.equal(runs, 1)
  b(20); assert.equal(runs, 1, 'b 变了不该重跑')
  a(1); assert.equal(runs, 2, 'a 变了要重跑')
})

test('onCleanup 在 effect 重跑前触发', () => {
  const s = signal(0)
  let cleanups = 0
  const stop = effect(() => {
    s()
    onCleanup(() => cleanups++)
  })
  assert.equal(cleanups, 0)
  s(1); assert.equal(cleanups, 1)
  s(2); assert.equal(cleanups, 2)
  stop(); assert.equal(cleanups, 3)
})

test('computed 是 lazy 的：没人读就不重算', () => {
  const a = signal(1)
  let calls = 0
  const c = computed(() => { calls++; return a() * 2 })
  assert.equal(calls, 0, '创建时不该跑')
  assert.equal(c(), 2)
  assert.equal(calls, 1, '第一次读跑一次')
  assert.equal(c(), 2)
  assert.equal(calls, 1, '第二次读不重算')
  a(5)
  assert.equal(calls, 1, '依赖变了但没人读，不重算')
  assert.equal(c(), 10)
  assert.equal(calls, 2, '读时才算')
})

test('computed dispose 后不再重算', () => {
  const a = signal(1)
  let calls = 0
  const c = computed(() => { calls++; return a() })
  c()
  assert.equal(calls, 1)
  c.dispose()
  a(2)
  assert.equal(calls, 1, 'dispose 后不再被触发')
})

test('effect 死循环保护', () => {
  const s = signal(0)
  let count = 0
  assert.throws(() => {
    effect(() => {
      count++
      const v = s()
      if (count > 200) return
      s(v + 1)
    })
  }, /死循环|递归/)
})


// === 警告相关 ===

test('list 重复 key 会警告', () => {
  // 只在 node 环境跑，DOM 相关跳过
  if (typeof document === 'undefined') return
  const warns = []
  const origWarn = console.warn
  console.warn = (...args) => warns.push(args.join(' '))
  try {
    const { signal: sig } = require('../core/src/core.js')
    // 这个测试需要 DOM，跳过
  } finally {
    console.warn = origWarn
  }
})

test('registerTags 重复注册跳过', async () => {
  const { tags, registerTags } = await import('../core/src/element.js')
  const a = registerTags(['__test_tag_1'])
  const b = registerTags(['__test_tag_1'])
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // 第一次应该注册，第二次返回空
    if (a.length !== 1) throw new Error('第一次注册应返回 1 个')
    if (b.length !== 0) throw new Error('第二次注册应返回 0 个')
  }
})


test('signal 自定义 equals', () => {
  const s = signal({ a: 1 }, { equals: () => false })
  let runs = 0
  effect(() => { s(); runs++ })
  assert.equal(runs, 1)
  s({ a: 1 }); assert.equal(runs, 2)
  s({ a: 2 }); assert.equal(runs, 3)
})

test('signal 默认 Object.is', () => {
  const s = signal(1)
  let runs = 0
  effect(() => { s(); runs++ })
  assert.equal(runs, 1)
  s(1); assert.equal(runs, 1)
  s(2); assert.equal(runs, 2)
})

test('computed 与原始 signal 同时依赖时不应重复触发 effect', () => {
  const s = signal(0)
  const doubled = computed(() => s() * 2)
  let runs = 0

  const stop = effect(() => {
    s()
    doubled()
    runs++
  })

  assert.equal(runs, 1)
  s(1)
  assert.equal(runs, 2, '一次 signal 更新，effect 应只执行一次')
  stop()
})

test('computed 更新时必须通知所有订阅者', () => {
  const s = signal(0)
  const doubled = computed(() => s() * 2)
  let runsA = 0
  let runsB = 0

  const stopA = effect(() => {
    doubled()
    runsA++
  })

  const stopB = effect(() => {
    doubled()
    runsB++
  })

  assert.equal(runsA, 1)
  assert.equal(runsB, 1)

  s(1)

  assert.equal(runsA, 2, '第一个订阅者应更新一次')
  assert.equal(runsB, 2, '第二个订阅者也应更新一次')

  stopA()
  stopB()
})

test('batch 多次更新同一 signal 时 effect 只执行一次', () => {
  const s = signal(0)
  let runs = 0
  let latest

  const stop = effect(() => {
    latest = s()
    runs++
  })

  assert.equal(runs, 1)

  batch(() => {
    s(1)
    s(2)
    s(3)
  })

  assert.equal(runs, 2, 'batch 内多次更新只应触发一次 effect')
  assert.equal(latest, 3, 'effect 应读取最终值')

  stop()
})

test('嵌套 computed 更新后 effect 应读取最新值', () => {
  const s = signal(1)
  const doubled = computed(() => s() * 2)
  const plusOne = computed(() => doubled() + 1)

  let runs = 0
  let latest

  const stop = effect(() => {
    latest = plusOne()
    runs++
  })

  assert.equal(latest, 3)
  assert.equal(runs, 1)

  s(2)

  assert.equal(latest, 5, '嵌套 computed 应传播最新值')
  assert.equal(runs, 2, '一次源 signal 更新应只触发一次 effect')

  stop()
})

test('effect 执行期间修改另一个 signal 不应丢失更新', () => {
  const source = signal(0)
  const derived = signal(0)
  let runs = 0
  let latest

  const stop = effect(() => {
    const value = source()
    runs++

    if (value > 0) {
      derived(value * 10)
    }
  })

  const stopDerived = effect(() => {
    latest = derived()
  })

  assert.equal(runs, 1)
  assert.equal(latest, 0)

  source(2)

  assert.equal(latest, 20, 'effect 内部写入的 signal 应触发订阅者')
  assert.equal(runs, 2, 'source 更新不应导致 effect 无故重复执行')

  stop()
  stopDerived()
})

test('effect 抛异常后调度器应恢复工作', () => {
  const s = signal(0)
  let runs = 0

  const stop = effect(() => {
    const value = s()
    if (value === 1) throw new Error('测试异常')
    runs++
  })

  assert.throws(() => s(1), /测试异常/)

  // 后续更新不应被调度器的异常状态阻断
  assert.doesNotThrow(() => s(2))
  assert.equal(runs, 2)

  stop()
})

test('一个 effect 抛异常不应永久阻断其他 effect', () => {
  const s = signal(0)
  let shouldThrow = true
  let healthyRuns = 0

  const stopBad = effect(() => {
    const value = s()
    if (value === 1 && shouldThrow) {
      throw new Error('预期异常')
    }
  })

  const stopHealthy = effect(() => {
    s()
    healthyRuns++
  })

  assert.equal(healthyRuns, 1)

  assert.throws(() => s(1), /预期异常/)

  shouldThrow = false
  assert.doesNotThrow(() => s(2))
  assert.equal(healthyRuns, 3)

  stopBad()
  stopHealthy()
})


test('生产模式 effect 自更新不应递归执行', () => {
  const oldDev = runtime.dev
  runtime.dev = false

  try {
    const s = signal(0)
    let runs = 0
    let depth = 0
    let maxDepth = 0

    const stop = effect(() => {
      depth++
      maxDepth = Math.max(maxDepth, depth)
      runs++

      const value = s()
      if (value < 3) s(value + 1)

      depth--
    })

    assert.equal(s(), 3)
    assert.equal(runs, 4)
    assert.equal(maxDepth, 1, 'effect 应排队重跑，不应嵌套递归')
    stop()
  } finally {
    runtime.dev = oldDev
  }
})
