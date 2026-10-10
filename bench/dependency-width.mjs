import { performance } from 'node:perf_hooks'
import { signal, effect } from '../core/src/core.js'
import { runtime } from '../core/src/runtime.js'

runtime.dev = false

const median = a => {
  a.sort((x, y) => x - y)
  return a[a.length >> 1]
}

for (const n of [10, 100, 500, 1000, 2000, 5000]) {
  const signals = Array.from({ length: n }, (_, i) => signal(i))
  let sum = 0

  const dispose = effect(() => {
    let x = 0
    for (let i = 0; i < n; i++) x += signals[i]()
    sum = x
  })

  const target = signals[n - 1]
  const samples = []
  const rounds = Math.max(10, Math.min(200, Math.floor(100000 / n)))

  for (let i = 0; i < 5; i++) target(n + i)

  for (let r = 0; r < 7; r++) {
    const start = performance.now()
    for (let i = 0; i < rounds; i++) target(n + 10 + r * rounds + i)
    samples.push((performance.now() - start) * 1e6 / rounds)
  }

  console.log(
    `deps=${String(n).padStart(5)} | ` +
    `ns/update=${median(samples).toFixed(0)} | ` +
    `rounds=${rounds} | sum=${sum}`
  )

  dispose()
}
