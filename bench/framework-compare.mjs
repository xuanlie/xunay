import { performance } from 'node:perf_hooks'
import { signal as xSignal, computed as xComputed, effect as xEffect } from '../core/src/core.js'
import { runtime } from '../core/src/runtime.js'
runtime.dev = false
import * as Vue from '@vue/reactivity'
import * as Preact from '@preact/signals-core'
import * as Solid from 'solid-js/dist/solid.js'

const adapters = {
  XuNay: {
    signal: (v) => {
      const s = xSignal(v)
      return [s, (v) => s(v)]
    },
    effect: (fn) => xEffect(fn),
    computed: (fn) => xComputed(fn),
  },
  Vue: {
    signal: (v) => {
      const s = Vue.ref(v)
      return [() => s.value, (v) => { s.value = v }]
    },
    effect: (fn) => {
      const runner = Vue.effect(fn)
      return () => Vue.stop(runner)
    },
    computed: (fn) => {
      const c = Vue.computed(fn)
      return () => c.value
    },
  },
  Preact: {
    signal: (v) => {
      const s = Preact.signal(v)
      return [() => s.value, (v) => { s.value = v }]
    },
    effect: (fn) => Preact.effect(fn),
    computed: (fn) => {
      const c = Preact.computed(fn)
      return () => c.value
    },
  },
  Solid: {
    signal: (v) => {
      const [get, set] = Solid.createSignal(v)
      return [get, set]
    },
    effect: (fn) => {
      let disposeRoot
      Solid.createRoot((dispose) => {
        disposeRoot = dispose
        Solid.createComputed(fn)
      })
      return disposeRoot
    },
    computed: (fn) => {
      let get
      Solid.createRoot(() => {
        get = Solid.createMemo(fn)
      })
      return get
    },
  },
}

const names = Object.keys(adapters)
const rounds = 7
const results = []

function median(xs) {
  const a = [...xs].sort((x, y) => x - y)
  return a[Math.floor(a.length / 2)]
}

function measure(adapter, scenario, iterations) {
  let dispose = () => {}
  let operation
  let validate = () => true

  if (scenario === 'signal read') {
    const [get] = adapter.signal(1)
    operation = () => {
      let n = 0
      for (let i = 0; i < iterations; i++) n += get()
      if (n !== iterations) throw Error('读取结果错误')
    }
  }

  if (scenario === 'signal write') {
    const [get, set] = adapter.signal(0)
    operation = () => {
      for (let i = 1; i <= iterations; i++) set(i)
    }
    validate = () => get() === iterations
  }

  if (scenario.startsWith('subscribers ')) {
  const count = Number(scenario.split(' ')[1])
  const [get, set] = adapter.signal(0)
  let runs = 0
  let completedOperations = 0
  const stops = []

  for (let i = 0; i < count; i++) {
    stops.push(adapter.effect(() => {
      get()
      runs++
    }))
  }

  dispose = () => stops.forEach((stop) => stop?.())

  const initialRuns = runs

  operation = () => {
    for (let i = 1; i <= iterations; i++) {
      set(i)
    }
    completedOperations++
  }

  validate = () =>
    runs === initialRuns + count * iterations * completedOperations
}

  if (scenario === 'computed chain') {
    const [get, set] = adapter.signal(0)
    const a = adapter.computed(() => get() + 1)
    const b = adapter.computed(() => a() * 2)
    let observed = 0
    const stop = adapter.effect(() => { observed = b() })
    dispose = () => stop?.()
    operation = () => {
      for (let i = 1; i <= iterations; i++) set(i)
    }
    validate = () => observed === (iterations + 1) * 2
  }

  // 预热不计时，避免把首次 JIT 编译混进结果。
  operation()
  if (!validate()) throw Error(`${scenario}: 预热验证失败`)

  const start = performance.now()
  operation()
  const elapsed = performance.now() - start
  const valid = validate()
  dispose()

  if (!valid) {
    console.error('结果验证失败:', {
      scenario,
      adapter: adapter.name ?? 'unknown',
      iterations,
    })
    throw Error(`${scenario}: 结果验证失败`)
  }
  return elapsed * 1e6 / iterations
}

const cases = [
  ['signal read', 300000],
  ['signal write', 50000],
  ['subscribers 1', 10000],
  ['subscribers 10', 2000],
  ['subscribers 100', 300],
  ['subscribers 1000', 30],
  ['computed chain', 5000],
]

console.log('Reactive core benchmark')
console.log('Node:', process.version)
console.log(`Rounds: ${rounds}; statistic: median`)
console.log('Units: ns per source operation')
console.log('')

for (const [scenario, iterations] of cases) {
  const samples = Object.fromEntries(names.map((n) => [n, []]))

  for (let round = 0; round < rounds; round++) {
    // 每轮轮换顺序，减轻固定顺序带来的热机偏差。
    const order = names.map((_, i) => names[(i + round) % names.length])
    for (const name of order) {
      let value
      try {
        value = measure(adapters[name], scenario, iterations)
      } catch (error) {
        console.error(`失败的适配器: ${name}`)
        throw error
      }
      samples[name].push(value)
    }
  }

  const medians = Object.fromEntries(
    names.map((n) => [n, median(samples[n])])
  )
  const fastest = Math.min(...Object.values(medians))

  results.push({ scenario, iterations, medians, fastest })
}

console.table(results.map((r) => ({
  scenario: r.scenario,
  iterations: r.iterations,
  XuNay_ns: r.medians.XuNay.toFixed(1),
  Vue_ns: r.medians.Vue.toFixed(1),
  Preact_ns: r.medians.Preact.toFixed(1),
  Solid_ns: r.medians.Solid.toFixed(1),
})))

console.log('\n相对最快者（每项独立比较）:')
for (const r of results) {
  const sorted = Object.entries(r.medians).sort((a, b) => a[1] - b[1])
  console.log(
    `${r.scenario}: ${sorted.map(([n, v]) =>
      `${n}=${(v / sorted[0][1]).toFixed(2)}x`
    ).join(' | ')}`
  )
}
