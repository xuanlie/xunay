// 条件渲染 + 响应式
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Xuyg · if / @media"),
    H2("if 条件渲染"),
    Code("sdu<12> Card($LIST)({\n  if: LIST.length > 0        // false 时整块不渲染\n  h3: @name\n})", "js"),
    P("编译成："),
    Code("((function(){\n  var _c = (LIST.length > 0)\n  if (!_c) return null\n  return (function(){ /* 循环渲染 */ })()\n})())", "js"),
    H2("@media 响应式"),
    Code("sdu<12> Card($LIST)({\n  @media (max-width: 600px): { width: 100%; margin: 8px 0; display: block; }\n  h3: @name\n})", "js"),
    P("编译时向 <head> 注入 <style id=\"sdu-xxx-css\">，只注入一次。"),
    Tip("可以写多个 @media，会自动合并。"),
  )
}
