#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { performance } from 'node:perf_hooks'
import { cpus } from 'node:os'
import { signal, computed, effect, batch } from '../core/src/index.js'

const results = []

function bench(group, name, fn, opts = {}) {
  const iters = opts.iters || 10000
  const warmup = opts.warmup || 1000
  try { fn(0) } catch (e) {
    results.push({ group, name, error: String((e && e.message) || e) })
    return
  }
  for (let i = 0; i < warmup; i++) fn(i)
  const t0 = performance.now()
  for (let i = 0; i < iters; i++) fn(i)
  const ms = performance.now() - t0
  results.push({
    group, name, iters,
    ms: +ms.toFixed(3),
    usPerOp: +((ms / iters) * 1000).toFixed(4),
    opsPerSec: Math.round(iters / (ms / 1000))
  })
}

bench('Signal', 'signal.create', (i) => signal(i), { iters: 100000 })
{ const s = signal(0); bench('Signal', 'signal.read', () => s(), { iters: 100000 }) }
{ const s = signal(0); bench('Signal', 'signal.write (无订阅)', (i) => s(i), { iters: 100000 }) }
{
  const s = signal(0); let sink = 0
  const d = effect(() => { sink = s() })
  bench('Signal', 'signal.write (1 effect)', (i) => s(i), { iters: 100000 })
  d()
}
{
  const a = signal(0); const c = computed(() => a() + 1); c()
  bench('Computed', 'computed.read (缓存命中)', () => c(), { iters: 100000 })
}
{
  const a = signal(0); const c = computed(() => a() + 1); c()
  bench('Computed', 'computed.recompute', (i) => { a(i); c() }, { iters: 10000, warmup: 500 })
}
bench('Effect', 'effect.create + dispose', (i) => {
  const s = signal(i); const d = effect(() => { s() }); d()
}, { iters: 10000, warmup: 500 })
{
  const a = signal(0), b = signal(0); let sink = 0
  const d = effect(() => { sink = a() + b() })
  bench('Batch', 'batch (2 写合并)', (i) => batch(() => { a(i); b(i) }), { iters: 10000, warmup: 500 })
  d()
}
{
  const sigs = Array.from({ length: 1000 }, (_, i) => signal(i))
  let sink = 0; const ds = []
  for (const s of sigs) ds.push(effect(() => { sink += s() }))
  bench('1000 Signals', '1000 signal × 100 轮全量更新', (round) => {
    for (let i = 0; i < 1000; i++) sigs[i](round)
  }, { iters: 100, warmup: 5 })
  for (const d of ds) d()
}

const sizes = []
for (const f of ['xunay.min.js','xunay.esm.js','xunay-kit.min.js','xunay-devtools.min.js','xunay-full.min.js','xunay-ssr.min.js','xunay-anim.min.js']) {
  try {
    const buf = readFileSync(new URL('../core/dist/' + f, import.meta.url))
    const gz = gzipSync(buf, { level: 9 }).length
    sizes.push({ name: f, bytes: buf.length, kb: +(buf.length/1024).toFixed(2), gzipKB: +(gz/1024).toFixed(2) })
  } catch (e) { sizes.push({ name: f, error: '缺失' }) }
}

const output = {
  meta: { timestamp: new Date().toISOString(), runtime: 'node ' + process.version, platform: process.platform, arch: process.arch, cpus: cpus().length },
  results, sizes
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(output, null, 2))
} else {
  console.log('=== XuNay Benchmark (Node ' + process.version + ') ===\n')
  let last = ''
  for (const r of results) {
    if (r.group !== last) { console.log('\n[' + r.group + ']'); last = r.group }
    if (r.error) { console.log('  ' + r.name.padEnd(34) + ' ERR: ' + r.error); continue }
    console.log('  ' + r.name.padEnd(34) +
      r.ms.toFixed(2).padStart(9) + ' ms' +
      r.usPerOp.toFixed(4).padStart(10) + ' µs/op' +
      (r.opsPerSec/1e6).toFixed(2).padStart(8) + 'M ops/s')
  }
  console.log('\n[包体积]')
  for (const s of sizes) {
    if (s.error) { console.log('  ' + s.name + ' ERR: ' + s.error); continue }
    console.log('  ' + s.name.padEnd(24) + s.kb.toFixed(1).padStart(7) + ' KB' +
      '   gzip ' + s.gzipKB.toFixed(2).padStart(6) + ' KB')
  }
}
