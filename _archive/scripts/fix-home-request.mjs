import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/pages/Home.xuy"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.homereq", s)

// 把模块顶层的 onMount 改成在 Home() 里直接调用
const from = "onMount(() => { loadServerTodos() })\n\nexport function Home() {\n  return div({ class: 'page' },"
if (!s.includes(from)) {
  console.log("未命中标准写法，尝试其他模式")
  // 尝试别的写法
  if (s.includes("onMount(() => { loadServerTodos() })")) {
    s = s.replace(
      "onMount(() => { loadServerTodos() })\n",
      ""
    )
    s = s.replace(
      "export function Home() {\n  return div(",
      "export function Home() {\n  // 每次进入首页时刷新后端数据\n  setTimeout(loadServerTodos, 0)\n  return div("
    )
    writeFileSync(p, s)
    console.log("已改（模式 B）")
  } else {
    throw new Error("找不到 onMount 调用")
  }
} else {
  s = s.replace(from,
    "export function Home() {\n  // 每次进入首页时刷新后端数据\n  setTimeout(loadServerTodos, 0)\n  return div({ class: 'page' },")
  writeFileSync(p, s)
  console.log("已改（模式 A）")
}
