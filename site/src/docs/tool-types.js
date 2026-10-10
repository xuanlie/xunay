// 类型声明
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("类型声明"),
    P("xunay 提供 TypeScript 类型声明文件，编辑器能自动补全。"),
    H2("位置"),
    Code("types/xunay.d.ts", "txt"),
    H2("核心类型"),
    Code("export type Signal<T> = {\n  (): T\n  (v: T | ((prev: T) => T)): T\n}\n\nexport type Accessor<T> = () => T\n\nexport interface VNode {\n  [ELEMENT]: true\n  type: string\n  props: Record<string, unknown>\n  children: unknown[]\n}", "ts"),
    H2("API 签名"),
    Code("export function signal<T>(init: T): Signal<T>\nexport function computed<T>(fn: () => T): Accessor<T>\nexport function effect(fn: () => void): () => void\nexport function batch(fn: () => void): void\nexport function mount(comp: () => VNode, target: string | Element): () => void\nexport function list<T>(\n  arr: T[] | Accessor<T[]>,\n  keyFn: (item: T) => string | number,\n  renderFn: (item: T) => VNode\n): () => { __xunay_list: true }", "ts"),
    H2("配置"),
    Code("// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"types\": [\"./types/xunay.d.ts\"]\n  }\n}", "json"),
    H2("使用"),
    Code("import { signal, computed, div, span } from 'xunay'\n\n// 编辑器会自动推导类型\nconst n = signal(0)          // Signal<number>\nconst s = computed(() => n().toString())   // Accessor<string>\nconst el = div(null, span(null, () => n()))   // VNode", "ts"),
    H2("在 .xuy 里"),
    P(".xuy 是 JS，不写类型注解。但编辑器读 d.ts 后依然能给 API 补全。"),
    H2("设计哲学"),
    P("xunay 明确\"不写 TS\"——类型声明只是给使用方的便利，不是框架内部的要求。"),
  )
}
