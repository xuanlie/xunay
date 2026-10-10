// 项目结构
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("项目结构"),
    P("一个标准的 xunay 项目。"),
    H2("目录"),
    Code("myapp/\n├── app.xuy                入口\n├── index.html\n├── src/\n│   ├── components/        通用组件\n│   ├── pages/             页面\n│   ├── store/             状态\n│   ├── api/               接口封装\n│   └── router.xuy         路由\n├── public/                静态资源\n├── dist/                  构建产物\n└── xunay.config.json      可选配置", "txt"),
    H2("最小项目"),
    Code("// app.xuy\nimport { signal } from 'xunay'\n\nconst count = signal(0)\n\nmount(() => div(null,\n  h1(null, 'Hello'),\n  button({ on: { click: () => count(v => v + 1) } },\n    () => '点了 ' + count() + ' 次'\n  )\n), '#app')", "xuy"),
    Code("<!-- index.html -->\n<!DOCTYPE html>\n<html>\n<body>\n  <div id=\"app\"></div>\n  <script type=\"module\" src=\"./dist/app.js\"></script>\n</body>\n</html>", "html"),
    H2("构建命令"),
    Code("xuyc build app.xuy --out dist               # 生产构建\nxuyc dev app.xuy                            # 开发模式\nxuyc build app.xuy --out dist --splitting   # 代码分割\nxunay create myapp                          # 脚手架", "bash"),
    H2("xunay.config.json（可选）"),
    Code("{\n  \"title\": \"我的应用\",\n  \"minify\": true,\n  \"devtools\": false,\n  \"css\": [\"tw\", \"ui\"],\n  \"alias\": { \"@\": \"./src\" },\n  \"pwa\": { \"name\": \"我的应用\", \"themeColor\": \"#1f6feb\" }\n}", "json"),
    H2("组件子路径（按需加载）"),
    Code("import { Btn, Row, Col } from 'xunay/kit/base'      // ~2 KB\nimport { Input, Select } from 'xunay/kit/form'\nimport { LineChart } from 'xunay/kit/charts'\nimport { Btn, Input, Table } from 'xunay/kit'         // 全量 ~29 KB", "js"),
    Tip("大项目只 import 用到的子路径，体积从 29KB 降到 2-5KB。"),
  )
}
