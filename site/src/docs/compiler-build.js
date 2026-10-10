// 构建工具
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("构建工具"),
    P("bin/xuyc3.js 是 compiler3 的构建入口，做三件事：读配置、编译、esbuild 打包。"),
    H2("命令行"),
    Code("node bin/xuyc3.js build app.xuy --out dist\nnode bin/xuyc3.js build app.xuy --out dist --mode runtime\nnode bin/xuyc3.js build app.xuy --title \"我的应用\"", "bash"),
    H2("参数"),
    Table(["参数","默认","说明"], [["input","必填","输入的 .xuy 文件"],["--out, -o","dist","输出目录"],["--title","XuNay App","HTML title"],["--mode","(配置)","compiled / runtime / hybrid"]]),
    H2("build 流程"),
    Code(" 1. 读文件\n 2. 提取 // title: xxx\n 3. 决定编译模式（命令行 > package.json > 默认）\n 4. compile(src, { mode, tagModule })\n 5. 生成临时入口 .entry.js\n 6. esbuild 打包成 app.js（IIFE，ES2020）\n 7. 生成 index.html\n 8. 删除临时入口", "txt"),
    H2("为什么用 esbuild"),
    Ul("快——Go 写的，比 webpack / rollup 快 10-100 倍","零配置——开箱即用","支持 tree shaking 和代码压缩","已经在 devDependencies 里"),
    H2("输出结构"),
    Code("dist/\n├── app.js          编译后的所有代码\n└── index.html      引用 app.js", "txt"),
    H2("不用 xuyc3 也行"),
    P("直接用 compiler3 的 compile()："),
    Code("import { compile } from './compiler3/src/index.js'\nimport esbuild from 'esbuild'\nimport fs from 'fs'\n\nlet js = compile(fs.readFileSync('app.xuy', 'utf8'))\nfs.writeFileSync('temp.js', js)\n\nawait esbuild.build({\n  entryPoints: ['temp.js'],\n  bundle: true,\n  outfile: 'dist/app.js',\n})", "js"),
    H2("旧版 xuyc"),
    P("bin/xuyc.js 是 compiler2 时代的 CLI，仍保留。site/build.sh 用的是它。新项目建议用 xuyc3。"),
    H2("相关源码"),
    Table(["文件","职责"], [["bin/xuyc3.js","compiler3 CLI"],["bin/xuyc.js","compiler2 CLI（旧）"],["compiler3/src/index.js","compile() 实现"]]),
  )
}
