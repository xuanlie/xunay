import { signal, effect } from '../core/src/index.js'

const n = signal(0)
const N = 1000

// 1000 个 effect 订阅同一 signal 的成本
console.log('=== 单批 1000 effect 订阅成本 ===')
for (let batch = 0; batch < 5; batch++) {
  const t0 = performance.now()
  const ds = []
  for (let i = 0; i < N; i++) {
    ds.push(effect(() => { n() }))
  }
  const dt = performance.now() - t0
  console.log(`  第 ${batch + 1} 批: ${dt.toFixed(2)} ms  subs=${n.subsCount()}`)
  // 不 dispose，模拟 bench 里的场景
}

console.log('\n=== 每批 1000 effect + 全部 dispose ===')
const n2 = signal(0)
for (let batch = 0; batch < 5; batch++) {
  const t0 = performance.now()
  const ds = []
  for (let i = 0; i < N; i++) {
    ds.push(effect(() => { n2() }))
  }
  for (const d of ds) d()
  const dt = performance.now() - t0
  console.log(`  第 ${batch + 1} 批: ${dt.toFixed(2)} ms  subs=${n2.subsCount()}`)
}
