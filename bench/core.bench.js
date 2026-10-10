import { performance } from 'node:perf_hooks'
import assert from 'node:assert/strict'
import { signal, computed, effect, batch } from '../core/src/core.js'

const results = []

function bench(name, setup, operations, iterations = 20000) {
  const state = setup()
  const warmup = Math.min(2000, Math.max(100, Math.floor(iterations / 10)))

  operations(state, warmup)

  const start = performance.now()
  operations(state, iterations)
  const elapsed = performance.now() - start

  results.push({
    name,
    iterations,
    elapsed,
    nsPerOp: elapsed * 1e6 / iterations,
    opsPerSec: iterations / (elapsed / 1000),
  })
}

console.log('\nXuNay Core Benchmark')
console.log('Node:', process.version)
console.log('Warm-up: enabled\n')

// 1. Signal 读写
bench(
  'signal: read',
  () => {
    const s = signal(1)
    return { s }
  },
  ({ s }, n) => {
    for (let i = 0; i < n; i++) s()
  },
  500000
)

bench(
  'signal: write',
  () => {
    const s = signal(0)
    return { s, value: 0 }
  },
  (state, n) => {
    for (let i = 0; i < n; i++) {
      state.s(++state.value)
    }
  },
  100000
)

// 2. 单个 effect 订阅
bench(
  'effect: 1 subscriber',
  () => {
    const s = signal(0)
    let runs = 0
    effect(() => {
      s()
      runs++
    })
    return { s, runs: () => runs, value: 0 }
  },
  (state, n) => {
    for (let i = 0; i < n; i++) {
      state.s(++state.value)
    }
  },
  20000
)

// 3. 多订阅者通知
for (const subscribers of [10, 100, 1000]) {
  const iterations = subscribers === 1000 ? 200 : 2000

  bench(
    `signal: ${subscribers} subscribers`,
    () => {
      const s = signal(0)
      let runs = 0

      for (let i = 0; i < subscribers; i++) {
        effect(() => {
          s()
          runs++
        })
      }

      return { s, runs: () => runs, value: 0 }
    },
    (state, n) => {
      for (let i = 0; i < n; i++) {
        state.s(++state.value)
      }
    },
    iterations
  )
}

// 4. Computed 派生
bench(
  'computed: source -> derived -> effect',
  () => {
    const source = signal(0)
    const derived = computed(() => source() * 2)
    let observed = 0

    effect(() => {
      observed = derived()
    })

    return { source, observed: () => observed, value: 0 }
  },
  (state, n) => {
    for (let i = 0; i < n; i++) {
      state.source(++state.value)
    }
  },
  20000
)

// 5. Batch 合并更新
bench(
  'batch: 100 writes per batch',
  () => {
    const s = signal(0)
    let runs = 0

    effect(() => {
      s()
      runs++
    })

    return { s, runs: () => runs, value: 0 }
  },
  (state, n) => {
    for (let i = 0; i < n; i++) {
      batch(() => {
        for (let j = 0; j < 100; j++) {
          state.s(++state.value)
        }
      })
    }
  },
  1000
)

// 输出结果
console.table(
  results.map((r) => ({
    scenario: r.name,
    iterations: r.iterations,
    'total ms': r.elapsed.toFixed(3),
    'ns/op': r.nsPerOp.toFixed(1),
    'ops/sec': Math.round(r.opsPerSec).toLocaleString('en-US'),
  }))
)

console.log('\n基准运行完成。以上是当前 Node.js 环境的实测值。')
