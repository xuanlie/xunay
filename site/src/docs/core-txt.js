// txt 模板
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("txt 模板"),
    P("txt 是\"响应式模板字符串\"——用反引号写，内部插值里的值自动响应式。比拼接字符串更自然。"),
    H2("基础用法"),
    Code("import { txt } from 'xunay'\n\nconst n = signal(0)\n\nspan(null, txt`n = ${n}`)\n// 等价于 span(null, () => 'n = ' + n())", "xuy"),
    H2("对比拼接"),
    Table(["写法","示例"], [["拼接","() => \"n = \" + n()"],["txt","txt`n = ${n}`"]]),
    P("txt 更短，视觉更清楚。复杂插值时优势明显。"),
    H2("多个插值"),
    Code("const a = signal(1)\nconst b = signal(2)\nconst c = signal(3)\n\ndiv(null, txt`a=${a} b=${b} c=${c}`)\n// a、b、c 任一变化都会重跑", "xuy"),
    H2("插值可以是函数"),
    Code("txt`共 ${() => count().total} 条`\n// 内层函数也会被追踪", "xuy"),
    H2("文本节点最小更新"),
    P("txt 内部创建单个文本节点。任一插值变化时，只改 textContent——不重建元素。"),
    Code("// 一次渲染后\n// <span>n = 0</span>\n// n 变化 → 只改 span.textContent\n// span 元素、属性、父级都不动", "js"),
    H2("用在哪里"),
    Ul("标题里的动态数字","副标题的统计","按钮文字","任何需要拼字符串的地方"),
    H2("txt vs 函数返回字符串"),
    Code("// 两种等价\nspan(null, txt`n = ${n}`)\nspan(null, () => 'n = ' + n())\n\n// txt 适合 3 个以上插值\nspan(null, txt`${a} + ${b} = ${c}`)", "xuy"),
    H2("完整示例"),
    Code("import { div, h1, p, button, signal, txt, mount } from 'xunay'\n\nfunction Stats() {\n  const online = signal(128)\n  const total = signal(200)\n\n  return div(null,\n    h1(null, txt`在线用户 ${online} / ${total}`),\n    p(null, txt`占比 ${() => Math.round(online() / total() * 100)}%`),\n    button({ on: { click: () => online(online() + 1) } }, '+1'),\n    button({ on: { click: () => total(total() + 1) } }, '总数+1')\n  )\n}\n\nmount(() => Stats(), '#app')", "xuy"),
    H2("常见陷阱"),
    H3("陷阱 1：不用手动加 ()"),
    Code("// txt 内部自动包函数\nspan(null, txt`n = ${n}`)     // 响应式\nspan(null, txt`n = ${n()}`)   // 也可以，但没必要", "xuy"),
    H3("陷阱 2：复杂条件用三目表达式"),
    Code("// 复杂条件用模板难读\nspan(null,\n  () => n() > 0 ? '正' : '负'\n)", "xuy"),
  )
}
