// 迁移工具
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("迁移工具"),
    P("从 React / Vue 迁移到 xunay 的辅助工具。"),
    H2("为什么不用自动化工具"),
    P("迁移涉及代码风格和心智模型——纯自动化会生成不伦不类的代码。手动迁移 + 参考对照表更快。"),
    H2("辅助脚本：React → XuNay"),
    Code("// migrate.js —— 简单替换，不处理复杂情况\nimport fs from 'node:fs'\n\nlet src = fs.readFileSync('component.jsx', 'utf8')\n\n// useState → signal\nsrc = src.replace(/const \\[(\\w+), set(\\w+)\\] = useState\\(([^)]+)\\)/g,\n  'const $1 = signal($3)')\n\n// setN(x) → n(x)\nsrc = src.replace(/set([A-Z]\\w*)\\(/g, (m, n) => n[0].toLowerCase() + n.slice(1) + '(')\n\n// 读值：n → n()\nsrc = src.replace(/\\{([a-z]\\w*)\\}/g, '{() => $1()}')\n\nfs.writeFileSync('component.js', src)", "js"),
    Warn("自动脚本只能处理 60% 场景。剩下的手动改——尤其是 JSX 结构。"),
    H2("手动迁移清单"),
    Table(["步骤","操作"], [["1","npm install xunay"],["2","把 JSX 改成函数调用 div(...)"],["3","把 useState 改成 signal"],["4","把读值加 ()"],["5","把 useEffect 改成 effect"],["6","把 useMemo 改成 computed"],["7","删掉 useCallback / React.memo"],["8","把 .map 改成 list"]]),
    H2("逐文件迁移"),
    P("大项目不要一次改完——一个组件一个组件迁移，新旧并存。"),
    Code("// 旧组件（React）\nexport function OldButton() { ... }\n\n// 新组件（XuNay）\nexport function NewButton() { ... }\n\n// 桥接：容器组件挂载 React\nmount(() => div(null,\n  h1(null, '新页面'),\n  // React 组件用 ref 挂载\n  div({ ref: el => mountReact(<OldButton />, el) })\n), '#app')", "xuy"),
    H2("项目结构迁移"),
    Code("src/\n├── legacy/        React 旧代码\n├── components/    XuNay 新组件\n├── pages/         XuNay 页面\n└── app.xuy        新的入口", "txt"),
    H2("测试迁移"),
    P("先写行为测试，再迁移——保证迁移后行为不变。"),
    Code("test('按钮点击 +1', () => {\n  const n = signal(0)\n  const btn = button({ on: { click: () => n(v => v + 1) } })\n  document.body.appendChild(render(btn))\n  btn.click()\n  assert.equal(n(), 1)\n})", "js"),
    H2("常见卡点"),
    Table(["卡点","建议"], [["第三方组件库","保留 React 版本，桥接挂载"],["复杂 Hooks 逻辑","改写成 signal + computed"],["Context 深层传递","用 ctx"],["Suspense","改用手动 loading"],["Portals","直接操作 DOM"]]),
  )
}
