// 发布
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("发布"),
    P("xunay 可以发布到 npm——但要注意包结构。"),
    H2("core 包结构"),
    Code("core/\n├── package.json\n├── src/           源码\n├── dist/          构建产物\n├── types/         类型声明\n└── README.md", "txt"),
    H2("package.json"),
    Code("{\n  \"name\": \"xunay\",\n  \"version\": \"1.0.1\",\n  \"type\": \"module\",\n  \"main\": \"./src/index.js\",\n  \"unpkg\": \"./dist/xunay.min.js\",\n  \"exports\": {\n    \".\": \"./src/index.js\",\n    \"./kit\": \"./src/kit-entry.js\",\n    \"./devtools\": \"./src/devtools-entry.js\",\n    \"./ssr\": \"./src/ssr-entry.js\",\n    \"./full\": \"./src/full-entry.js\"\n  },\n  \"files\": [\"src\", \"dist\", \"types\", \"README.md\", \"LICENSE\"],\n  \"license\": \"MIT\"\n}", "json"),
    H2("构建"),
    Code("cd core\nnode build.js   # 生成 dist/xunay*.js", "bash"),
    H2("发布"),
    Code("npm login\nnpm publish --access public", "bash"),
    H2("发布前的检查"),
    Ul("构建产物是最新的","README 内容准确","版本号已更新","没有敏感信息","LICENSE 存在"),
    H2("子路径入口"),
    P("用户可以用子路径："),
    Code("import { signal } from 'xunay'                // 核心\nimport { Btn } from 'xunay/kit'             // 组件\nimport { openDevtools } from 'xunay/devtools'   // 调试\nimport { renderToString } from 'xunay/ssr'      // SSR", "js"),
    H2("CDN"),
    P("unpkg / jsdelivr 会自动读 package.json 的 unpkg 字段。"),
    Code("<script src=\"https://unpkg.com/xunay/dist/xunay.min.js\"></script>\n<script src=\"https://cdn.jsdelivr.net/npm/xunay/dist/xunay.min.js\"></script>", "html"),
    H2("更新版本"),
    Code("npm version patch   # 1.0.1 → 1.0.2\nnpm version minor   # 1.0.2 → 1.1.0\nnpm version major   # 1.1.0 → 2.0.0\nnpm publish", "bash"),
  )
}
