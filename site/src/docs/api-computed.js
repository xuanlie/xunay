// computed(fn)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("computed(fn)"),
    P("从其他 signal 派生的只读信号，自动缓存。"),
    H2("签名"),
    Code("const c = computed(fn)", "js"),
    H2("参数"),
    Table(["参数","类型","说明"], [["fn","() => T","计算函数，读依赖 signal"]]),
    H2("返回值"),
    P("返回一个只读函数 c()。读它返回缓存值；依赖变化时下次读会重算。"),
    H2("示例"),
    Code("const a = signal(1)\nconst b = signal(2)\nconst sum = computed(() => a() + b())\n\nsum()      // 3\na(10)\nsum()      // 12\nb(20)\nsum()      // 30", "xuy"),
    H2("特性"),
    Ul("惰性——只在读时算，不是依赖变就立即算","缓存——依赖没变时直接返回上次结果","只读——没有写接口","可以链式——computed 里用其他 computed"),
    H2("依赖链"),
    Code("const price = signal(100)\nconst qty = signal(3)\nconst subtotal = computed(() => price() * qty())\nconst tax = computed(() => subtotal() * 0.13)\nconst total = computed(() => subtotal() + tax())\n\ntotal()   // 100*3 + 100*3*0.13 = 339", "xuy"),
    H2("vs signal"),
    Table(["","signal","computed"], [["可写","是","否"],["首次计算","立即","读时"],["缓存","无","有"],["依赖","无","自动追踪"]]),
    H2("陷阱"),
    H3("不要在 computed 里写 signal"),
    Code("const bad = computed(() => {\n  a(1)      // 错误：computed 应该纯\n  return a()\n})", "xuy"),
    H3("记得加 ()"),
    Code("const c = computed(() => n() * 2)\nc        // 函数\nc()      // 值", "xuy"),
  )
}
