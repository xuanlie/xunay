// 编译流程
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("编译流程"),
    P("从 .xuy 到浏览器可执行 JS 的完整路径。"),
    H2("端到端"),
    Code(".xuy 源码\n  ↓ compiler3.compile()\n 纯 JS（含 createElement 或 tag()）\n  ↓ bin/xuyc3.js（esbuild 打包）\napp.js + index.html", "txt"),
    H2("示例：一个计数器"),
    P("输入 app.xuy:"),
    Code("import { signal, mount } from 'xunay'\n\nconst count = signal(0)\n\nmount(() => div(null,\n  button({ on: { click: () => count(v => v + 1) } }, '+'),\n  span(null, () => String(count())),\n), '#app')", "js"),
    P("compiled 模式下 compiler3 输出:"),
    Code("const count = signal(0)\nmount(() => (() => {\n  const _div0 = document.createElement('div')\n  const _button1 = document.createElement('button')\n  _button1.addEventListener('click', () => count(v => v + 1))\n  _button1.appendChild(document.createTextNode('+'))\n  _div0.appendChild(_button1)\n  const _span2 = document.createElement('span')\n  const _t3 = document.createTextNode('')\n  __rt__.bindText(_t3, () => String(count()))\n  _span2.appendChild(_t3)\n  _div0.appendChild(_span2)\n  return _div0\n})(), '#app')", "js"),
    P("runtime 模式下 compiler3 输出:"),
    Code("import { signal, mount } from 'xunay'\nimport { button, div, span } from './core/src/element.js'\n\nconst count = signal(0)\n\nmount(() => div(null,\n  button({ on: { click: () => count(v => v + 1) } }, '+'),\n  span(null, () => String(count())),\n), '#app')", "js"),

    H2("详细步骤"),
    Ul("读文件 —— fs.readFileSync(input, utf8)","检查文件头 —— 查找 // @runtime 或 // @compiled","决定模式 —— 文件指令 > 命令行 --mode > package.json","编译 —— compiler3.compile(src, { mode })","生成临时入口 —— 把编译产物写入 .entry.js","esbuild 打包 —— 把临时入口编译成单文件 app.js","生成 HTML —— 含 <div id=app> 和 <script src=app.js>"),
    H2("打包做了什么"),
    P("esbuild 把编译产物 + runtime + core 一起打包成 IIFE，浏览器直接 <script> 加载。"),
    Ul("把 import 全部内联","移除没用的导出（tree shaking）","转成 ES2020 兼容代码","压缩到单文件"),
    Tip("编译和打包是两个独立步骤。compiler3 只负责 .xuy → JS，esbuild 负责 JS → 可执行文件。"),
  )
}
