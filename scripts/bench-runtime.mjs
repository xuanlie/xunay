import { readFileSync } from "node:fs"
import { gzipSync } from "node:zlib"
import { signal, computed, effect, batch } from "../core/src/core.js"

const N = 100000
function bench(name, fn, n = N) {
  for (let i = 0; i < 1000; i++) fn(i)
  const t0 = performance.now()
  for (let i = 0; i < n; i++) fn(i)
  const dt = performance.now() - t0
  const us = (dt / n) * 1000
  console.log(name.padEnd(34) + us.toFixed(3).padStart(9) + " µs/op" +
              (n / (dt / 1000) / 1e6).toFixed(2).padStart(10) + "M ops/s")
}

console.log("=== signal / effect 核心 ===")
bench("signal 创建", () => signal(0))
{
  const s = signal(0)
  bench("signal 读", () => s())
  bench("signal 写 (无订阅者)", i => s(i))
}
{
  const s = signal(0)
  let sink = 0
  effect(() => { sink = s() })
  bench("signal 写 → 触发 1 effect", i => s(i))
}
{
  const a = signal(0), b = signal(0)
  const c = computed(() => a() + b())
  bench("computed 读", () => c())
  bench("computed 写触发", i => a(i))
}
{
  const a = signal(0), b = signal(0)
  bench("batch 两写合并", i => batch(() => { a(i); b(i) }), 10000)
}

console.log()
console.log("=== 模拟大列表：1000 个独立 signal+effect ===")
{
  const sigs = Array.from({ length: 1000 }, (_, i) => signal(i))
  const sum = { v: 0 }
  for (const s of sigs) effect(() => { sum.v += s() })
  const t0 = performance.now()
  for (let round = 0; round < 100; round++) {
    for (let i = 0; i < 1000; i++) sigs[i](round)
  }
  const dt = performance.now() - t0
  console.log("  1000 signal × 100 轮全量更新: " + dt.toFixed(1) + " ms")
  console.log("  单次更新: " + (dt / (1000 * 100) * 1000).toFixed(3) + " µs")
}

console.log()
console.log("=== 包体积 ===")
for (const f of ["xunay.min.js", "xunay.esm.js", "xunay-kit.min.js", "xunay-devtools.min.js", "xunay-full.min.js"]) {
  try {
    const buf = readFileSync(new URL("../core/dist/" + f, import.meta.url))
    const gz = gzipSync(buf, { level: 9 }).length
    console.log("  " + f.padEnd(22) + (buf.length / 1024).toFixed(1).padStart(7) + " KB" +
                "   gzip " + (gz / 1024).toFixed(2).padStart(6) + " KB")
  } catch (e) { console.log("  " + f + " 缺失") }
}
