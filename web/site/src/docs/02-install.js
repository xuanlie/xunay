// 安装
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("安装"),
    P("XuNay 有两种引入方式——CDN（无构建）和 npm（推荐，配合 xuyc 编译器）。"),
    H2("方式 1：CDN（最快）"),
    P("直接引脚本，全局暴露 XuNay 对象："),
    Code("<!DOCTYPE html>\n<html>\n<body>\n  <div id=\"app\"></div>\n  <script src=\"https://unpkg.com/xunay/dist/xunay.min.js\"></script>\n  <script>\n    const { div, button, span, signal, mount } = XuNay\n    const n = signal(0)\n    mount(() => div(null,\n      button({ on: { click: () => n(v => v - 1) } }, \"-\"),\n      span(null, () => String(n())),\n      button({ on: { click: () => n(v => v + 1) } }, \"+\")\n    ), \"#app\")\n  </script>\n</body>\n</html>", "html"),
    Tip("CDN 适合 demo。生产项目推荐方式 2。"),
    H2("方式 2：npm + xuyc（推荐）"),
    Code("# ⚠ xunay 尚未发布到 npm，以下为规划中用法\nnpm install xunay\nnpm install -g xunay", "bash"),
    P("xuyc 编译 .xuy 文件——标签名直接当函数用，不用 import："),
    Code("// app.xuy\nconst n = signal(0)\n\nmount(() => div({ class: 'app' },\n  button({ on: { click: () => n(v => v - 1) } }, '-'),\n  span(null, () => 'n = ' + n()),\n  button({ on: { click: () => n(v => v + 1) } }, '+')\n), '#app')", "xuy"),
    Code("# 编译 + 打包\nxuyc build app.xuy --out dist\n\n# 产物：dist/index.html + dist/app.js + dist/xunay.js", "bash"),
    H2("可选的模块"),
    Code("// kit 组件（按需加载子路径）\nimport { Btn } from '/root/xunay/core/src/Kit/ui/index.js'\nimport { Input } from '/root/xunay/core/src/Kit/ui/index.js'\nimport { LineChart } from '/tmp/xuyg-test/xunay-kit.js'\n\n// devtools / SSR / 动画\nimport { openDevtools } from '/tmp/xuyg-test/xunay-devtools.js'\nimport { renderToString, hydrateMount } from '/tmp/xuyg-test/xunay-ssr.js'\nimport { animate, spring, transition } from '/tmp/xuyg-test/xunay-anim.js'", "js"),
    H2("体积参考"),
    Table(["模块","gzip"], [["xunay.min.js（CDN）","7.06 KB"],["xunay.esm.js（npm）","6.84 KB"],["/tmp/xuyg-test/xunay-kit.js","29.58 KB"],["xunay/anim（228 动画）","15.06 KB"],["/tmp/xuyg-test/xunay-devtools.js","15.89 KB"],["/tmp/xuyg-test/xunay-ssr.js","5.45 KB"]]),
  )
}
