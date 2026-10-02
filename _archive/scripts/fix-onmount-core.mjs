import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/render.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.onmount", s)

// 找 renderDyn：动态子节点渲染后要运行 mount 回调
const from = `function renderDyn(fn) {
  const holder = document.createElement('span')
  holder.style.display = 'contents'
  let sc = null
  effect(() => {
    if (sc) disposeScope(sc)
    holder.textContent = ''
    sc = createScope(runtime.currentScope)
    runInScope(sc, () => {
      holder.appendChild(render(fn()))
    })
  })
  return holder
}`

const to = `function renderDyn(fn) {
  const holder = document.createElement('span')
  holder.style.display = 'contents'
  let sc = null
  effect(() => {
    if (sc) disposeScope(sc)
    holder.textContent = ''
    sc = createScope(runtime.currentScope)
    runInScope(sc, () => {
      holder.appendChild(render(fn()))
      runMountFns(sc)
    })
  })
  return holder
}`

if (!s.includes(from)) throw new Error("未命中 renderDyn")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("onMount 修复完成")
