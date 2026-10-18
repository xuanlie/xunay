import { performance } from 'node:perf_hooks'
import { compileReact as oldCompile } from '/root/xunay/compiler3/src/react.before-parent-map.mjs'
import { compileReact as newCompile } from '/root/xunay/compiler3/src/react.after-parent-map.mjs'

function makeSource(count) {
  const items = Array.from({ length: count }, (_, i) => `
    <section className="item-${i}" data-id={items[${i}].id}>
      <h3>{items[${i}].name}</h3>
      <span>{count + ${i}}</span>
      {items[${i}].active ? <b>Active</b> : <i>Inactive</i>}
      <button onClick={() => setCount(count + ${i})}>Select ${i}</button>
    </section>
  `).join('\n')

  return `
    function App({ items }) {
      const [count, setCount] = useState(0)
      return <main>${items}</main>
    }
  `
}

function measure(fn, source, iterations) {
  for (let i = 0; i < 10; i++) fn(source)

  const samples = []
  for (let round = 0; round < 3; round++) {
    const start = performance.now()
    for (let i = 0; i < iterations; i++) fn(source)
    samples.push((performance.now() - start) / iterations)
  }

  samples.sort((a, b) => a - b)
  return samples[2]
}

console.log('Node:', process.version)
console.log('单次 compileReact 耗时，中位数；不代表运行时渲染性能')

for (const count of [10, 40, 80, 160]) {
  const source = makeSource(count)
  const iterations = count <= 10 ? 5 : count <= 40 ? 2 : 1

  const oldA = measure(oldCompile, source, iterations)
  const newA = measure(newCompile, source, iterations)
  const newB = measure(newCompile, source, iterations)
  const oldB = measure(oldCompile, source, iterations)

  const oldMs = (oldA + oldB) / 2
  const newMs = (newA + newB) / 2

  console.log(
    `${count} 组 JSX | 旧版 ${oldMs.toFixed(3)} ms | ` +
    `新版 ${newMs.toFixed(3)} ms | 加速 ${(oldMs / newMs).toFixed(2)}x`
  )
}
