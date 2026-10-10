import { performance } from 'node:perf_hooks'
import { signal, computed, effect, batch } from '../core/dist/xunay.esm.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function stats(values) {
  const a = [...values].sort((x, y) => x - y)
  return {
    median: a[Math.floor(a.length / 2)],
    p95: a[Math.min(a.length - 1, Math.ceil(a.length * 0.95) - 1)],
    min: a[0],
    max: a[a.length - 1],
  }
}

async function bench(name, fn, {
  warmup = 2,
  rounds = 7,
  iterations = 10000,
} = {}) {
  for (let i = 0; i < warmup; i++) fn(iterations)
  const times = []

  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now()
    fn(iterations)
    times.push((performance.now() - t0) / iterations * 1000)
    await sleep(10)
  }

  const s = stats(times)
  console.log(
    `${name.padEnd(34)} ` +
    `median=${s.median.toFixed(3)} µs/op ` +
    `p95=${s.p95.toFixed(3)} µs/op ` +
    `min=${s.min.toFixed(3)} max=${s.max.toFixed(3)}`
  )
}

console.log('XuNay Deep Benchmark')
console.log(`Node: ${process.version} | ${process.platform}/${process.arch}`)
console.log(`CPU count: ${process.env.UV_THREADPOOL_SIZE ?? 'default threadpool'}`)
console.log('每项预热 2 轮、正式测量 7 轮；报告每轮单次平均耗时的中位数')
console.log('')

{
  const s = signal(0)
  await bench('Signal read', n => {
    for (let i = 0; i < n; i++) s()
  }, { iterations: 100000 })

  let value = 0
  await bench('Signal write / no subscribers', n => {
    for (let i = 0; i < n; i++) s(++value)
  }, { iterations: 100000 })
}

for (const count of [1, 10, 100, 1000]) {
  const s = signal(0)
  let executions = 0
  const disposers = Array.from({ length: count }, () =>
    effect(() => {
      s()
      executions++
    })
  )

  const before = executions
  await bench(`Notify ${count} subscribers`, n => {
    for (let i = 0; i < n; i++) s(i + 1)
  }, { iterations: count >= 1000 ? 10 : count >= 100 ? 50 : 500 })

  console.log(
    `  subscribers=${s.subsCount?.() ?? 'n/a'}, ` +
    `effect executions during measurement=${executions - before}`
  )
  for (const dispose of disposers) dispose()
  console.log(`  after dispose: subscribers=${s.subsCount?.() ?? 'n/a'}`)
}

for (const count of [1, 10, 100]) {
  const sigs = Array.from({ length: count }, (_, i) => signal(i))
  let runs = 0
  const dispose = effect(() => {
    let sum = 0
    for (const s of sigs) sum += s()
    runs++
    return sum
  })

  await bench(`Effect rebuild ${count} dependencies`, n => {
    for (let i = 0; i < n; i++) sigs[0](i + 1)
  }, { iterations: count >= 100 ? 20 : count >= 10 ? 100 : 1000 })

  dispose()
}

for (const depth of [1, 10, 100]) {
  const source = signal(0)
  let current = source

  for (let i = 0; i < depth; i++) {
    const previous = current
    current = computed(() => previous() + 1)
  }

  let sink = 0
  const dispose = effect(() => {
    sink = current()
  })

  await bench(`Computed chain depth ${depth}`, n => {
    for (let i = 0; i < n; i++) source(i + 1)
  }, { iterations: depth >= 100 ? 20 : depth >= 10 ? 100 : 1000 })

  console.log(`  final value=${sink}`)
  dispose()
}

for (const writes of [10, 100, 1000]) {
  for (const useBatch of [false, true]) {
    const a = signal(0)
    const b = signal(0)
    let runs = 0
    const dispose = effect(() => {
      a()
      b()
      runs++
    })

    const before = runs
    await bench(`${useBatch ? 'batch' : 'no batch'} / ${writes} writes`, n => {
      for (let i = 0; i < n; i++) {
        const update = () => {
          a(i * 2 + 1)
          b(i * 2 + 2)
        }
        if (useBatch) batch(update)
        else update()
      }
    }, { iterations: 100 })

    console.log(`  effect executions=${runs - before}`)
    dispose()
  }
}

console.log('')
console.log('Benchmark completed.')
