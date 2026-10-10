import { performance } from 'node:perf_hooks'
import { signal, effect } from '../core/dist/xunay.esm.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function test(count) {
  const source = signal(0)
  let runs = 0

  const disposers = Array.from({ length: count }, () =>
    effect(() => {
      source()
      runs++
    })
  )

  // 预热，让 JIT 和运行时先进入稳定状态
  for (let i = 1; i <= 5; i++) {
    source(-i)
  }

  const samples = []
  const runsBefore = runs
  let value = -5

  for (let round = 0; round < 15; round++) {
    const start = performance.now()
    source(++value)
    samples.push((performance.now() - start) * 1000)
    await sleep(5)
  }

  const expectedRuns = count * 15
  const actualRuns = runs - runsBefore
  const result = {
    count,
    medianUs: median(samples),
    minUs: Math.min(...samples),
    maxUs: Math.max(...samples),
    expectedRuns,
    actualRuns,
    subscribersBeforeDispose: source.subsCount?.() ?? 'n/a',
  }

  for (const dispose of disposers) dispose()

  result.subscribersAfterDispose = source.subsCount?.() ?? 'n/a'

  console.log(
    `N=${String(count).padStart(4)} | ` +
    `median=${result.medianUs.toFixed(1)} µs | ` +
    `min=${result.minUs.toFixed(1)} | ` +
    `max=${result.maxUs.toFixed(1)} | ` +
    `runs=${actualRuns}/${expectedRuns} | ` +
    `subs=${result.subscribersBeforeDispose}->${result.subscribersAfterDispose}`
  )
}

console.log('XuNay subscriber scaling benchmark')
console.log(`Node ${process.version}; 5 warmups + 15 measured writes per size`)
console.log('')

for (const count of [10, 25, 50, 100, 200, 400, 800, 1000]) {
  await test(count)
}
