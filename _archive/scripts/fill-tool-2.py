#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

swap("    ('tool-types', '类型声明', []),", r"""    ('tool-types', '类型声明', [
      ('H1','类型声明'),
      ('P','xunay 提供 TypeScript 类型声明文件，编辑器能自动补全。'),
      ('H2','位置'),
      ('Code','types/xunay.d.ts','txt'),
      ('H2','核心类型'),
      ('Code',"export type Signal<T> = {\n  (): T\n  (v: T | ((prev: T) => T)): T\n}\n\nexport type Accessor<T> = () => T\n\nexport interface VNode {\n  [ELEMENT]: true\n  type: string\n  props: Record<string, unknown>\n  children: unknown[]\n}",'ts'),
      ('H2','API 签名'),
      ('Code',"export function signal<T>(init: T): Signal<T>\nexport function computed<T>(fn: () => T): Accessor<T>\nexport function effect(fn: () => void): () => void\nexport function batch(fn: () => void): void\nexport function mount(comp: () => VNode, target: string | Element): () => void\nexport function list<T>(\n  arr: T[] | Accessor<T[]>,\n  keyFn: (item: T) => string | number,\n  renderFn: (item: T) => VNode\n): () => { __xunay_list: true }",'ts'),
      ('H2','配置'),
      ('Code',"// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"types\": [\"./types/xunay.d.ts\"]\n  }\n}",'json'),
      ('H2','使用'),
      ('Code',"import { signal, computed, div, span } from 'xunay'\n\n// 编辑器会自动推导类型\nconst n = signal(0)          // Signal<number>\nconst s = computed(() => n().toString())   // Accessor<string>\nconst el = div(null, span(null, () => n()))   // VNode",'ts'),
      ('H2','在 .xuy 里'),
      ('P','.xuy 是 JS，不写类型注解。但编辑器读 d.ts 后依然能给 API 补全。'),
      ('H2','设计哲学'),
      ('P','xunay 明确"不写 TS"——类型声明只是给使用方的便利，不是框架内部的要求。'),
    ]),""", "tool-types")

swap("    ('tool-lint', '代码检查', []),", r"""    ('tool-lint', '代码检查', [
      ('H1','代码检查'),
      ('P','xunay 没有内置 lint——可以用 ESLint 或自己写规则。'),
      ('H2','用 ESLint'),
      ('Code',"npm install -D eslint\nnpx eslint src/",'bash'),
      ('H2','配置'),
      ('Code',"// .eslintrc.json\n{\n  \"env\": { \"browser\": true, \"es2022\": true },\n  \"parserOptions\": { \"ecmaVersion\": \"latest\", \"sourceType\": \"module\" },\n  \"rules\": {\n    \"no-unused-vars\": \"warn\",\n    \"no-undef\": \"error\"\n  }\n}",'json'),
      ('H2','常见问题检查'),
      ('P','手动检查清单——避免常见坑：'),
      ('Table',['检查','说明'],[
        ['effect 里读写同一 signal','会导致死循环'],
        ['动态值忘记包函数','不响应变化'],
        ['list 用索引做 key','重排时状态错乱'],
        ['忘记 onUnmount 清理','内存泄漏'],
        ['style 用函数返回同一对象','引用相等不更新']),
      ('H2','自己写规则'),
      ('P','用正则搜代码——简单有效：'),
      ('Code',"# 查找忘记加 () 的 signal\nrg 'span\\(null, [a-zA-Z_]+\\)' src/",'bash'),
      ('H2','编译时检查'),
      ('P','xuyc 本身会检查语法——编译失败就是 lint 失败。'),
    ]),""", "tool-lint")

swap("    ('tool-build', '构建配置', []),", r"""    ('tool-build', '构建配置', [
      ('H1','构建配置'),
      ('P','xuyc 的构建行为可以通过 package.json 和命令行参数控制。'),
      ('H2','package.json 配置'),
      ('Code',"{\n  \"scripts\": {\n    \"build\": \"node ../bin/xuyc.js build app.xuy --out dist\",\n    \"dev\": \"npm run build && cd dist && python3 -m http.server 8080\",\n    \"deploy\": \"bash deploy.sh\"\n  },\n  \"xunay\": {\n    \"devtools\": true\n  }\n}",'json'),
      ('H2','命令行参数'),
      ('Code',"node bin/xuyc.js build app.xuy --out public",'bash'),
      ('H2','产物结构'),
      ('Code',"dist/\n├── index.html\n├── app.js\n├── xunay.js\n├── tw.css\n├── ui.css\n└── src/",'txt'),
      ('H2','构建流程'),
      ('Ul',
        '1. 生成 .xuy → .js',
        '2. esbuild 打包 + minify',
        '3. 复制 xunay.js',
        '4. 收集 CSS',
        '5. 生成 index.html'),
      ('H2','环境区分'),
      ('Code',"# 开发\nNODE_ENV=development node bin/xuyc.js build app.xuy\n\n# 生产\nNODE_ENV=production node bin/xuyc.js build app.xuy",'bash'),
      ('H2','多入口'),
      ('P','xuyc 一次只处理一个入口。多入口自己写脚本：'),
      ('Code',"#!/bin/bash\nnode bin/xuyc.js build app.xuy --out dist/app\nnode bin/xuyc.js build admin.xuy --out dist/admin",'bash'),
      ('H2','构建时长'),
      ('Table',['项目大小','构建耗时'],[
        ['1 个 .xuy','~200ms'],
        ['10 个 .xuy','~500ms'],
        ['100 个 .xuy','~2s']),
    ]),""", "tool-build")

swap("    ('tool-publish', '发布', []),", r"""    ('tool-publish', '发布', [
      ('H1','发布'),
      ('P','xunay 可以发布到 npm——但要注意包结构。'),
      ('H2','core 包结构'),
      ('Code',"core/\n├── package.json\n├── src/           源码\n├── dist/          构建产物\n├── types/         类型声明\n└── README.md",'txt'),
      ('H2','package.json'),
      ('Code',"{\n  \"name\": \"xunay\",\n  \"version\": \"1.0.1\",\n  \"type\": \"module\",\n  \"main\": \"./src/index.js\",\n  \"unpkg\": \"./dist/xunay.min.js\",\n  \"exports\": {\n    \".\": \"./src/index.js\",\n    \"./kit\": \"./src/kit-entry.js\",\n    \"./devtools\": \"./src/devtools-entry.js\",\n    \"./ssr\": \"./src/ssr-entry.js\",\n    \"./full\": \"./src/full-entry.js\"\n  },\n  \"files\": [\"src\", \"dist\", \"types\", \"README.md\", \"LICENSE\"],\n  \"license\": \"MIT\"\n}",'json'),
      ('H2','构建'),
      ('Code',"cd core\nnode build.js   # 生成 dist/xunay*.js",'bash'),
      ('H2','发布'),
      ('Code',"npm login\nnpm publish --access public",'bash'),
      ('H2','发布前的检查'),
      ('Ul',
        '构建产物是最新的',
        'README 内容准确',
        '版本号已更新',
        '没有敏感信息',
        'LICENSE 存在'),
      ('H2','子路径入口'),
      ('P','用户可以用子路径：'),
      ('Code',"import { signal } from 'xunay'                // 核心\nimport { Btn } from 'xunay/kit'             // 组件\nimport { openDevtools } from 'xunay/devtools'   // 调试\nimport { renderToString } from 'xunay/ssr'      // SSR",'js'),
      ('H2','CDN'),
      ('P','unpkg / jsdelivr 会自动读 package.json 的 unpkg 字段。'),
      ('Code',"<script src=\"https://unpkg.com/xunay/dist/xunay.min.js\"></script>\n<script src=\"https://cdn.jsdelivr.net/npm/xunay/dist/xunay.min.js\"></script>",'html'),
      ('H2','更新版本'),
      ('Code',"npm version patch   # 1.0.1 → 1.0.2\nnpm version minor   # 1.0.2 → 1.1.0\nnpm version major   # 1.1.0 → 2.0.0\nnpm publish",'bash'),
    ]),""", "tool-publish")

swap("    ('tool-debug', '调试技巧', []),", r"""    ('tool-debug', '调试技巧', [
      ('H1','调试技巧'),
      ('P','xunay 应用的调试方法。'),
      ('H2','用 devtools'),
      ('P','最直接——装 devtools，4 个面板看运行时状态。'),
      ('Code',"import 'xunay/devtools'",'xuy'),
      ('H2','Console 里访问内部状态'),
      ('Code',"// 全局 runtime\nwindow.__XUNAY_RUNTIME__\n\n// 所有 signal\nwindow.__XD__?.signals\n\n// 某个 DOM 的 scope\ndocument.querySelector('#app').__xunay_scope\n\n// 所有请求\nwindow.__XD__?.nets",'js'),
      ('H2','加标记日志'),
      ('Code',"const n = signal(0)\neffect(() => {\n  console.log('[n]', n())\n})\n\n// 输出带前缀，好过滤\n// [n] 0\n// [n] 1",'js'),
      ('H2','性能分析'),
      ('Code',"// 手动计时\nconst t0 = performance.now()\nsomeOperation()\nconsole.log(performance.now() - t0, 'ms')\n\n// Performance API\nperformance.mark('start')\nsomeOperation()\nperformance.mark('end')\nperformance.measure('op', 'start', 'end')\nconsole.table(performance.getEntriesByType('measure'))",'js'),
      ('H2','断点'),
      ('P','浏览器 F12 Sources 面板——在 .js 里打断点，跟普通 JS 一样。'),
      ('H2','看 effect 重跑'),
      ('Code',"let count = 0\nconst stop = effect(() => {\n  count++\n  console.log('effect 跑了', count, '次')\n})\n// 如果很快到 100+，说明有循环依赖",'js'),
      ('H2','常见问题排查'),
      ('Table',['症状','排查'],[
        ['页面不变','检查是否用了 () => 包动态值'],
        ['重复执行','effect 里是否读写同一 signal'],
        ['内存涨','onUnmount 是否清理定时器'],
        ['列表错乱','list 的 key 是否唯一稳定'],
        ['性能差','devtools 性能面板看长任务']),
    ]),""", "tool-debug")

swap("    ('tool-troubleshoot', '故障排查', []),", r"""    ('tool-troubleshoot', '故障排查', [
      ('H1','故障排查'),
      ('P','遇到问题按这个清单检查。'),
      ('H2','页面白屏'),
      ('Ul',
        'F12 看 console 报错',
        '检查 app.js 是否 404',
        '检查 #app 元素是否存在',
        '检查 mount 是否执行'),
      ('H2','内容不更新'),
      ('Code',"// 错误：静态求值\nspan(null, n())\n\n// 正确：动态\nspan(null, () => n())",'xuy'),
      ('H2','effect 无限循环'),
      ('Code',"// 错误\neffect(() => {\n  a(a() + 1)\n})\n\n// 正确：只读\neffect(() => {\n  console.log(a())\n})",'xuy'),
      ('H2','内存泄漏'),
      ('Code',"// 错误：没清理\nonMount(() => {\n  setInterval(tick, 1000)\n})\n\n// 正确：加清理\nonMount(() => {\n  const id = setInterval(tick, 1000)\n  onUnmount(() => clearInterval(id))\n})",'xuy'),
      ('H2','列表错乱'),
      ('Code',"// 错误：key 不稳定\nlist(items, (i, idx) => idx, ...)\n\n// 正确：用 id\nlist(items, i => i.id, ...)",'xuy'),
      ('H2','请求 404'),
      ('Code',"// 检查后端是否启动\ncurl http://localhost:12342/rpc/token\n\n// 检查路径\nfetch('/rpc/getTodos')   // 正确\nfetch('/api/getTodos')   // 错误",'bash'),
      ('H2','CORS 报错'),
      ('P','后端要开 CORS。Python FastAPI 例子：'),
      ('Code',"app.add_middleware(\n    CORSMiddleware,\n    allow_origins=['*'],\n    allow_methods=['*'],\n    allow_headers=['*']\n)",'py'),
      ('H2','编译失败'),
      ('Code',"[xunay compile] 期望 )\n  行 12, 列 8\n  return div(null, span(null, 'x'\n         ^",'txt'),
      ('P','按提示的行列号修改。'),
      ('H2','构建慢'),
      ('Ul',
        '减少 .xuy 文件数量',
        '用 --out 分散到多个目录',
        '检查是否有循环依赖'),
      ('H2','其他'),
      ('P','看 doc/13-编译器限制 或提交 issue。'),
    ]),""", "tool-troubleshoot")

swap("    ('tool-migrate', '迁移工具', []),", r"""    ('tool-migrate', '迁移工具', [
      ('H1','迁移工具'),
      ('P','从 React / Vue 迁移到 xunay 的辅助工具。'),
      ('H2','为什么不用自动化工具'),
      ('P','迁移涉及代码风格和心智模型——纯自动化会生成不伦不类的代码。手动迁移 + 参考对照表更快。'),
      ('H2','辅助脚本：React → XuNay'),
      ('Code',"// migrate.js —— 简单替换，不处理复杂情况\nimport fs from 'node:fs'\n\nlet src = fs.readFileSync('component.jsx', 'utf8')\n\n// useState → signal\nsrc = src.replace(/const \\[(\\w+), set(\\w+)\\] = useState\\(([^)]+)\\)/g,\n  'const $1 = signal($3)')\n\n// setN(x) → n(x)\nsrc = src.replace(/set([A-Z]\\w*)\\(/g, (m, n) => n[0].toLowerCase() + n.slice(1) + '(')\n\n// 读值：n → n()\nsrc = src.replace(/\\{([a-z]\\w*)\\}/g, '{() => $1()}')\n\nfs.writeFileSync('component.js', src)",'js'),
      ('Warn','自动脚本只能处理 60% 场景。剩下的手动改——尤其是 JSX 结构。'),
      ('H2','手动迁移清单'),
      ('Table',['步骤','操作'],[
        ['1','npm install xunay'],
        ['2','把 JSX 改成函数调用 div(...)'],
        ['3','把 useState 改成 signal'],
        ['4','把读值加 ()'],
        ['5','把 useEffect 改成 effect'],
        ['6','把 useMemo 改成 computed'],
        ['7','删掉 useCallback / React.memo'],
        ['8','把 .map 改成 list']),
      ('H2','逐文件迁移'),
      ('P','大项目不要一次改完——一个组件一个组件迁移，新旧并存。'),
      ('Code',"// 旧组件（React）\nexport function OldButton() { ... }\n\n// 新组件（XuNay）\nexport function NewButton() { ... }\n\n// 桥接：容器组件挂载 React\nmount(() => div(null,\n  h1(null, '新页面'),\n  // React 组件用 ref 挂载\n  div({ ref: el => mountReact(<OldButton />, el) })\n), '#app')",'xuy'),
      ('H2','项目结构迁移'),
      ('Code',"src/\n├── legacy/        React 旧代码\n├── components/    XuNay 新组件\n├── pages/         XuNay 页面\n└── app.xuy        新的入口",'txt'),
      ('H2','测试迁移'),
      ('P','先写行为测试，再迁移——保证迁移后行为不变。'),
      ('Code',"test('按钮点击 +1', () => {\n  const n = signal(0)\n  const btn = button({ on: { click: () => n(v => v + 1) } })\n  document.body.appendChild(render(btn))\n  btn.click()\n  assert.equal(n(), 1)\n})",'js'),
      ('H2','常见卡点'),
      ('Table',['卡点','建议'],[
        ['第三方组件库','保留 React 版本，桥接挂载'],
        ['复杂 Hooks 逻辑','改写成 signal + computed'],
        ['Context 深层传递','用 ctx'],
        ['Suspense','改用手动 loading'],
        ['Portals','直接操作 DOM']),
    ]),""", "tool-migrate")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("工具 7 篇已填")
