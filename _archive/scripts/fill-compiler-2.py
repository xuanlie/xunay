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

swap("    ('compiler-extend', '扩展编译器', []),", r"""    ('compiler-extend', '扩展编译器', [
      ('H1','扩展编译器'),
      ('P','xuyc 只有 360 行——想加功能可以直接改。'),
      ('H2','加新标签'),
      ('P','内置标签列表在 tokenizer.js 的 TAGS 里。'),
      ('Code',"// tokenizer.js\nconst TAGS = new Set('div span p a button input ...'.split(' '))\n\n// 加新标签\nTAGS.add('video')\nTAGS.add('canvas')\nTAGS.add('audio')",'js'),
      ('H2','加属性处理'),
      ('P','在 gen.js 里扩展属性分派：'),
      ('Code',"// gen.js\nfor (const p of node.props) {\n  if (p.k === 'on') { ... }\n  else if (p.k === 'class') { ... }\n  else if (p.k === 'myCustomProp') {\n    // 自定义处理\n    lines.push(pad + v + '.myProp = ' + p.v)\n  }\n  else { ... }\n}",'js'),
      ('H2','加语法糖'),
      ('P','比如支持 @click 简写——在 parser 里处理：'),
      ('Code',"// 输入\ndiv({ '@click': handler })\n\n// 在 parseProps 里转换\nif (k.startsWith('@')) {\n  out.push({ k: 'on', v: '{ ' + k.slice(1) + ': ' + v + ' }' })\n}",'js'),
      ('H2','加新的文件类型'),
      ('P','想支持 .xuyx（带扩展语法）——复制一份编译器，改 tokenizer / parser。'),
      ('H2','不改源码的方式'),
      ('P','写一个预处理脚本，把自定义语法转成标准 .xuy：'),
      ('Code',"// preprocess.js\nconst src = fs.readFileSync('app.xuyx', 'utf8')\nconst transformed = src.replace(/@click/g, 'on: { click')\nfs.writeFileSync('app.xuy', transformed)\n// 然后正常编译",'js'),
      ('H2','参与贡献'),
      ('P','xunay 核心只有 2000 行——改起来不费劲。fork 后直接改，跑测试验证。'),
    ]),""", "compiler-extend")

swap("    ('compiler-build', '构建工具', []),", r"""    ('compiler-build', '构建工具', [
      ('H1','构建工具'),
      ('P','xuyc 是自带构建器——不依赖 Vite / Webpack / Rollup。'),
      ('H2','使用'),
      ('Code',"node bin/xuyc.js build <入口.xuy> [--out 输出目录]",'bash'),
      ('H2','示例'),
      ('Code',"node bin/xuyc.js build app.xuy --out dist\nnode bin/xuyc.js build src/main.xuy --out public\nnode bin/xuyc.js build myapp/app.xuy --out myapp/dist",'bash'),
      ('H2','输出'),
      ('Code',"dist/\n├── index.html         自动生成\n├── app.js             打包后的应用\n├── xunay.js           xunay 运行时\n└── src/               样式等静态资源",'txt'),
      ('H2','构建过程'),
      ('Code',"// 1. 编译所有 .xuy → .js\nconst processedEntry = processFile(entryPath)\n\n// 2. esbuild 打包\nawait esbuild.build({\n  entryPoints: [processedEntry],\n  bundle: true,\n  minify: true,\n  format: 'esm',\n  outfile: 'dist/app.js'\n})\n\n// 3. 复制 xunay.js\nfs.copyFileSync(coreDist + '/xunay.esm.js', 'dist/xunay.js')\n\n// 4. 复制 CSS\ncollectCss(entryDir, '')\n\n// 5. 生成 index.html\nfs.writeFileSync('dist/index.html', html)",'js'),
      ('H2','为什么不用 Vite / Webpack'),
      ('Table',['','Vite','xuyc'],[
        ['配置','复杂','零'],
        ['安装体积','~50MB','~5MB（只依赖 esbuild）'],
        ['启动','慢','快'],
        ['HMR','有','无'],
        ['插件生态','丰富','无'],
      ]),
      ('P','xuyc 只做一件事：把 .xuy 编译成能在浏览器跑的代码。不需要 HMR、不需要插件——改完刷新页面就行。'),
      ('H2','npm 脚本集成'),
      ('Code',"{\n  \"scripts\": {\n    \"build\": \"node ../bin/xuyc.js build app.xuy --out dist\",\n    \"dev\": \"npm run build && cd dist && python3 -m http.server 8080\"\n  }\n}",'json'),
      ('H2','自定义构建'),
      ('P','不用 xuyc 也行——直接用 compiler2：'),
      ('Code',"import { tokenize } from './compiler2/src/tokenizer.js'\nimport { parse } from './compiler2/src/parser.js'\nimport { genFunction } from './compiler2/src/gen.js'\nimport esbuild from 'esbuild'\n\nconst src = fs.readFileSync('app.xuy', 'utf8')\nconst nodes = parse(src)\nconst js = genFunction('app', nodes, src)\nfs.writeFileSync('app.js', js)\n\nawait esbuild.build({ entryPoints: ['app.js'], bundle: true, outfile: 'dist/app.js' })",'js'),
      ('H2','完整流程'),
      ('Code',"# 开发\nnode bin/xuyc.js build app.xuy --out dist\npython3 -m http.server 8080 --directory dist\n\n# 部署\ncp -r dist/* /var/www/",'bash'),
    ]),""", "compiler-build")

swap("    ('compiler-cli', 'xuyc 命令', []),", r"""    ('compiler-cli', 'xuyc 命令', [
      ('H1','xuyc 命令'),
      ('P','xuyc 是命令行工具，一个命令搞定编译。'),
      ('H2','语法'),
      ('Code','xuyc build <entry.xuy> [--out <dir>]','txt'),
      ('H2','参数'),
      ('Table',['参数','必填','说明'],[
        ['build','是','固定子命令'],
        ['entry.xuy','是','入口文件'],
        ['--out dir','否','输出目录（默认 dist）'],
      ]),
      ('H2','示例'),
      ('Code',"# 基本\nnode bin/xuyc.js build app.xuy\n\n# 指定输出\nnode bin/xuyc.js build app.xuy --out public\n\n# 从子目录\ncd myapp && node ../bin/xuyc.js build app.xuy --out dist",'bash'),
      ('H2','行为'),
      ('Ul',
        '读入口 .xuy',
        '递归处理所有 .xuy 依赖',
        '把 from "xunay" 替换成本地路径',
        'esbuild 打包 + minify',
        '复制 CSS',
        '生成 index.html'),
      ('H2','输出文件'),
      ('Code',"<out>/\n├── index.html        自动生成（读入口的 // title:）\n├── app.js            打包产物\n├── xunay.js          xunay 运行时\n├── tw.css            内置样式\n├── ui.css            内置样式\n└── src/              复制的 CSS",'txt'),
      ('H2','环境变量'),
      ('Table',['变量','作用'],[
        ['NODE_ENV=production','启用完整 minify'],
      ]),
      ('H2','退出码'),
      ('Table',['码','含义'],[
        ['0','成功'],
        ['1','参数错误 / 文件不存在 / 编译失败'],
      ]),
    ]),""", "compiler-cli")

swap("    ('compiler-config', '配置', []),", r"""    ('compiler-config', '配置', [
      ('H1','配置'),
      ('P','xuyc 只有少量配置——尽量零配置。'),
      ('H2','package.json 的 xunay 字段'),
      ('Code',"{\n  \"name\": \"myapp\",\n  \"xunay\": {\n    \"devtools\": true\n  }\n}",'json'),
      ('H2','配置项'),
      ('Table',['键','类型','默认','说明'],[
        ['devtools','boolean','true','是否打包 devtools'],
      ]),
      ('H2','配置优先级'),
      ('Code',"1. 当前目录的 package.json\n2. 项目根的 package.json\n3. 内置默认值",'txt'),
      ('H2','入口文件头'),
      ('P','入口 .xuy 的第一行可以写标题，会用于生成 index.html 的 <title>。'),
      ('Code',"// title: 我的应用\nimport { mount } from 'xunay'\n\nmount(() => div(null, 'Hello'), '#app')",'xuy'),
      ('H2','输出目录'),
      ('Code',"# --out 指定\nnode bin/xuyc.js build app.xuy --out build\n\n# 默认 dist\nnode bin/xuyc.js build app.xuy",'bash'),
      ('H2','CSS 收集'),
      ('P','xuyc 自动收集两类 CSS：'),
      ('Ul',
        '入口目录及 src/ 下的所有 .css',
        'core/src/ 里的 tw.css / ui.css（内置）'),
      ('P','收集到的 CSS 会在 index.html 里按顺序引入。'),
      ('H2','xunay.config.json'),
      ('P','项目根的 xunay.config.json 是后端配置，跟前端编译器无关：'),
      ('Code',"{\n  \"backend\": \"node\",\n  \"ports\": {\n    \"node\": 12341,\n    \"python\": 12342\n  }\n}",'json'),
    ]),""", "compiler-config")

swap("    ('compiler-plugin', '插件', []),", r"""    ('compiler-plugin', '插件', [
      ('H1','插件'),
      ('P','xuyc 没有正式的插件系统——但可以通过修改源码或预处理扩展。'),
      ('H2','为什么没插件系统'),
      ('P','xuyc 只做一件事，做的事情足够少——加插件系统本身会变成额外的复杂度。'),
      ('H2','三种扩展方式'),
      ('H3','1. 预处理脚本'),
      ('Code',"// preprocess.js\nimport fs from 'node:fs'\n\nconst files = ['app.xuy', 'src/Home.xuy']\nfor (const f of files) {\n  let s = fs.readFileSync(f, 'utf8')\n  // 把 @click 换成 on: { click\n  s = s.replace(/@(\\w+):/g, 'on: { $1:')\n  fs.writeFileSync(f, s)\n}\n\n// 然后跑 xuyc\nnode preprocess.js && node bin/xuyc.js build app.xuy",'js'),
      ('H3','2. 直接改编译器'),
      ('P','xuyc 只有 360 行——fork 后直接改。'),
      ('Code',"// gen.js 加自定义处理\nif (p.k === 'myCustomProp') {\n  lines.push(pad + v + '.setAttribute(\"data-custom\", ' + p.v + ')')\n}",'js'),
      ('H3','3. 用 build API'),
      ('Code',"import { parse } from './compiler2/src/parser.js'\nimport { genFunction } from './compiler2/src/gen.js'\nimport esbuild from 'esbuild'\n\n// 自定义编译流程\nconst src = fs.readFileSync('app.xuy', 'utf8')\nlet js = genFunction('app', parse(src), src)\n\n// 后处理\njs = js.replace(/console\\.log/g, '')\n\nawait esbuild.build({ entryPoints: ['temp.js'], bundle: true, outfile: 'dist/app.js' })",'js'),
      ('H2','常见的扩展'),
      ('Table',['需求','方式'],[
        ['加新标签','改 tokenizer TAGS'],
        ['加语法糖','改 parser'],
        ['改生成代码','改 gen.js'],
        ['加后处理','build 脚本里替换产物'],
        ['加 CSS 处理','build.sh 里跑 tailwind'],
      ]),
    ]),""", "compiler-plugin")

swap("    ('compiler-vite', 'Vite 集成', []),", r"""    ('compiler-vite', 'Vite 集成', [
      ('H1','Vite 集成'),
      ('P','xuyc 自带构建，但也能接 Vite——如果你想用 Vite 的生态。'),
      ('H2','插件代码'),
      ('Code',"// build/vite-plugin-xunay.js\nimport { readFileSync } from 'node:fs'\nimport { tokenize } from '../compiler2/src/tokenizer.js'\nimport { parse } from '../compiler2/src/parser.js'\nimport { genFunction } from '../compiler2/src/gen.js'\n\nconst XUY = /\\.xuy$/\n\nexport default function xunay() {\n  return {\n    name: 'vite-plugin-xunay',\n    enforce: 'pre',\n    transform(src, id) {\n      if (!XUY.test(id)) return null\n      const raw = src || readFileSync(id, 'utf8')\n      let nodes, code\n      try {\n        nodes = parse(raw)\n        code = genFunction(id, nodes, raw)\n      } catch (e) {\n        this.error(e.message)\n      }\n      return { code, map: null }\n    }\n  }\n}",'js'),
      ('H2','配置'),
      ('Code',"// vite.config.js\nimport { defineConfig } from 'vite'\nimport xunay from './build/vite-plugin-xunay.js'\n\nexport default defineConfig({\n  plugins: [xunay()]\n})",'js'),
      ('H2','用法'),
      ('Code',"vite dev    # 开发服务器\nvite build  # 生产构建",'bash'),
      ('H2','vs xuyc'),
      ('Table',['','xuyc','Vite + plugin'],[
        ['安装','零依赖','~50MB'],
        ['配置','零','vite.config'],
        ['HMR','无','有'],
        ['构建速度','快','快'],
        ['生态','无','丰富'],
      ]),
      ('H2','什么时候用 Vite'),
      ('Ul',
        '需要 HMR',
        '需要复杂构建配置',
        '需要插件生态（PostCSS、Tailwind 等）',
        '团队已经用 Vite'),
      ('H2','什么时候不用'),
      ('Ul',
        '个人小项目',
        '学习框架',
        '不想装 50MB 依赖',
        '要最简构建'),
    ]),""", "compiler-vite")

swap("    ('compiler-types', '类型声明', []),", r"""    ('compiler-types', '类型声明', [
      ('H1','类型声明'),
      ('P','xunay 提供 d.ts 类型声明文件——编辑器有补全。'),
      ('H2','文件位置'),
      ('Code','types/xunay.d.ts','txt'),
      ('H2','核心类型'),
      ('Code',"// 信号\nexport type Signal<T> = {\n  (): T\n  (v: T | ((prev: T) => T)): T\n}\n\nexport type Accessor<T> = () => T\n\n// vnode\nexport interface VNode {\n  [ELEMENT]: true\n  type: string\n  props: Record<string, unknown>\n  children: unknown[]\n}\n\nexport type Child = VNode | string | number | boolean | null | (() => unknown)",'ts'),
      ('H2','API 声明'),
      ('Code',"export function signal<T>(init: T): Signal<T>\nexport function computed<T>(fn: () => T): Accessor<T>\nexport function effect(fn: () => void): () => void\nexport function batch(fn: () => void): void\n\nexport function mount(comp: () => VNode, target: string | Element): () => void\n\nexport function list<T>(\n  arr: T[] | Accessor<T[]>,\n  keyFn: (item: T) => string | number,\n  renderFn: (item: T) => VNode\n): () => { __xunay_list: true }\n\nexport function show(cond: Accessor<boolean>, renderFn: () => VNode): unknown",'ts'),
      ('H2','标签声明'),
      ('Code',"export const tags: Record<string, (p: Props | null, ...c: Child[]) => VNode>\nexport const div: typeof tags.div\nexport const span: typeof tags.span\nexport const button: typeof tags.button\nexport const input: typeof tags.input",'ts'),
      ('H2','在项目里用'),
      ('Code',"// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"types\": [\"./types/xunay.d.ts\"]\n  }\n}",'json'),
      ('H2','在 .xuy 里的类型'),
      ('P','.xuy 是 JS，不写类型。但编辑器读 d.ts 后能给 .xuy 里的 API 补全。'),
      ('H2','不写 TS 的设计'),
      ('P','xunay 的设计哲学明确"不写 TS"。d.ts 是给使用方的可选便利，不是框架内部的要求。'),
    ]),""", "compiler-types")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("编译器 7 篇已填")
