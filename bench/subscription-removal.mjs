import { performance } from 'node:perf_hooks'
import { signal, effect } from '../core/dist/xunay.esm.js'

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function runCase(count, reverse = false) {
  const source = signal(0)

  const disposers = Array.from({ length: count }, () =>
    effect(() => {
      source()
    })
  )

  if (source.subsCount && source.subsCount() !== count) {
    throw new Error(`订阅数错误：${source.subsCount()}，预期 ${count}`)
  }

  const ordered = reverse ? [...disposers].reverse() : disposers

  const start = performance.now()
  for (const dispose of ordered) {
    dispose()
  }
  const elapsedUs = (performance.now() - start) * 1000

  const remaining = source.subsCount?.() ?? -1
  if (remaining !== 0) {
    throw new Error(`清理后仍有订阅：${remaining}`)
  }

  return elapsedUs
}

function benchmark(count, reverse) {
  // 预热，降低首次执行和 JIT 编译的干扰
  for (let i = 0; i < 5; i++) {
    runCase(count, reverse)
  }

  const samples = []
  for (let i = 0; i < 15; i++) {
    samples.push(runCase(count, reverse))
  }

  const med = median(samples)
  console.log(
    `N=${String(count).padStart(4)} | ` +
    `order=${reverse ? 'reverse' : 'forward'} | ` +
    `total=${med.toFixed(1)} µs | ` +
    `per-effect=${(med / count).toFixed(3)} µs`
  )
}

console.log('XuNay subscription removal benchmark')
console.log(`Node ${process.version}`)
console.log('销毁耗时包含 Effect dispose 和依赖移除，不包含创建时间')
console.log('')

for (const count of [100, 200, 400, 800, 1000, 2000, 5000]) {
  benchmark(count, false)
  benchmark(count, true)
}
