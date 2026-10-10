import { performance } from 'node:perf_hooks'
import { signal, effect, batch } from '../core/dist/xunay.esm.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

function test(writes, useBatch) {
  const s = signal(0)
  let runs = 0
  const dispose = effect(() => {
    s()
    runs++
  })

  const durations = []
  const executions = []

  // 预热
  for (let r = 0; r < 3; r++) {
    const update = () => {
      for (let i = 0; i < writes; i++) s(r * writes + i + 1)
    }
    if (useBatch) batch(update)
    else update()
  }

  for (let r = 0; r < 15; r++) {
    const beforeRuns = runs
    const start = performance.now()

    const update = () => {
      for (let i = 0; i < writes; i++) {
        s((r + 10) * writes + i + 1)
      }
    }

    if (useBatch) batch(update)
    else update()

    durations.push(performance.now() - start)
    executions.push(runs - beforeRuns)
  }

  dispose()

  durations.sort((a, b) => a - b)
  executions.sort((a, b) => a - b)

  return {
    medianMs: durations[Math.floor(durations.length / 2)],
    p95Ms: durations[Math.ceil(durations.length * 0.95) - 1],
    medianEffectRuns: executions[Math.floor(executions.length / 2)],
  }
}

for (const writes of [10, 100, 1000]) {
  for (const useBatch of [false, true]) {
    const result = test(writes, useBatch)
    console.log(
      `${useBatch ? 'batch' : 'no batch'} ${writes} writes: ` +
      `median=${result.medianMs.toFixed(3)} ms, ` +
      `p95=${result.p95Ms.toFixed(3)} ms, ` +
      `effect runs=${result.medianEffectRuns}`
    )
  }
}
