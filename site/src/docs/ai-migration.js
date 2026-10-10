// 迁移对照
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("迁移对照"),
    P("从 React / Vue 到 xunay 的完整对照表。"),
    H2("React → XuNay"),
    H3("状态"),
    Table(["React","XuNay"], [["useState(0)","signal(0)"],["n","n()"],["setN(1)","n(1)"],["setN(v => v + 1)","n(v => v + 1)"],["useMemo(fn, deps)","computed(fn)"],["useRef()","ref()"],["useContext(Ctx)","Ctx.get()"]]),
    H3("副作用"),
    Table(["React","XuNay"], [["useEffect(fn, deps)","effect(fn)"],["useEffect(fn, [])","onMount(fn)"],["useEffect(() => fn, [])","onUnmount(fn)"],["useEffect 清理函数","effect 里 return"]]),
    H3("渲染"),
    Table(["React JSX","XuNay"], [["<div>hello</div>","div(null, \"hello\")"],["<div className=\"x\">","div({ class: \"x\" })"],["<div onClick={h}>","div({ on: { click: h } })"],["{n}","() => n()"],["{cond && <A />}","show(() => cond, () => A())"],["{cond ? A : B}","() => cond ? A() : B()"],["arr.map(fn)","list(arr, keyFn, fn)"],["<>{a}{b}</>","frag(a, b)"],["key={i.id}","list(arr, i => i.id, fn)"]]),
    H3("不需要的"),
    Table(["React","XuNay"], [["useCallback","删掉"],["React.memo","删掉"],["useReducer","signal + 手写"],["Suspense","show(loading, ...)"],["Portals","直接操作 DOM"],["StrictMode","不需要"],["Hooks 顺序规则","不存在"]]),
    H2("Vue 3 → XuNay"),
    H3("状态"),
    Table(["Vue 3","XuNay"], [["ref(0)","signal(0)"],["n.value","n()"],["n.value = 1","n(1)"],["reactive({})","signal({})"],["computed(fn)","computed(fn)"],["watch(fn)","effect(fn)"],["watchEffect(fn)","effect(fn)"]]),
    H3("生命周期"),
    Table(["Vue 3","XuNay"], [["onMounted(fn)","onMount(fn)"],["onUnmounted(fn)","onUnmount(fn)"],["provide/inject","ctx"]]),
    H3("模板"),
    Table(["Vue 3","XuNay"], [["v-if=\"x\"","show(() => x, () => ...)"],["v-else","三目或 if"],["v-show=\"x\"","style: () => ({ display: x ? \"block\" : \"none\" })"],["v-for=\"t in list\"","list(list, t => t.id, fn)"],["v-model=\"x\"","手写或 model(sig)"],["@click=\"h\"","on: { click: h }"],[":value=\"x\"","value: () => x"],["{{ x }}","() => x"],["<template>","frag(...)"],["<slot>","children 参数"]]),
    H2("通用规则"),
    Table(["旧习惯","新习惯"], [["手动依赖数组","自动收集"],["组件重渲染","组件执行一次"],["虚拟 DOM","直接 DOM"],["组件级更新","节点级更新"],["状态管理库","全局 signal"],["路由库","20 行自己写"]]),
    H2("完整示例对照"),
    H3("React 计数器"),
    Code("function Counter() {\n  const [n, setN] = useState(0)\n  return (\n    <div>\n      <button onClick={() => setN(n - 1)}>-</button>\n      <span>{n}</span>\n      <button onClick={() => setN(n + 1)}>+</button>\n    </div>\n  )\n}", "jsx"),
    H3("XuNay 计数器"),
    Code("function Counter() {\n  const n = signal(0)\n  return div(null,\n    button({ on: { click: () => n(v => v - 1) } }, '-'),\n    span(null, () => String(n())),\n    button({ on: { click: () => n(v => v + 1) } }, '+')\n  )\n}", "xuy"),
    H3("XuNay 同上"),
    Code("function Counter() {\n  const n = signal(0)\n  return div(null,\n    button({ on: { click: () => n(v => v - 1) } }, '-'),\n    span(null, () => String(n())),\n    button({ on: { click: () => n(v => v + 1) } }, '+')\n  )\n}", "xuy"),
  )
}
