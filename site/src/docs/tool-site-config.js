// @title Site 配置与构建
// @group 配置
// @order 1
// @slug tool-site-config

import { D, H1, H2, H3, P, Code, Ul, Ol, Tip, Warn, Note, Table } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('Site 配置与构建'),
    P('xunay 的所有构建配置都写在 package.json 的 xunay 字段里。不用额外配置文件。'),

    H2('配置文件位置'),
    Code('package.json → "xunay": { ... }', 'json'),

    H2('完整配置项'),
    Code('{ "xunay": { "css": ["tw","ui"], "devtools": true, "minify": false, "sourcemap": true, "target": "es2020", "obfuscate": false, "cssHash": false, "filenameHash": "none" } }', 'json'),

    Table(['字段', '类型', '默认', '作用'], [
      ['css', 'string[]', '["tw","ui"]', '注入哪些内置 CSS'],
      ['devtools', 'boolean', 'true（开发）', '注入 devtools'],
      ['minify', 'boolean', '生产 true', 'esbuild 压缩'],
      ['sourcemap', 'boolean', '开发 true', '生成 .map'],
      ['target', 'string', 'es2020', 'JS 编译目标'],
      ['obfuscate', 'boolean', 'false', 'terser + javascript-obfuscator 混淆'],
      ['cssHash', 'boolean', 'false', 'CSS 类名 hash'],
      ['filenameHash', 'none / content / time', 'none', '构建时文件名 hash'],
    ]),

    H2('三种 hash 机制'),

    H3('1. 文件名 hash（filenameHash）'),
    Ul(
      'content：内容变才变',
      'time：每次构建都变',
      'none：不变（推荐，改用 serve.mjs 的 ?v=）',
    ),

    H3('2. CSS 类名 hash（cssHash）'),
    P('把 CSS 里定义的类名全局替换成 hash。'),
    Warn('有风险：JS 里同名普通字符串（如 CSS 值 flex）会被误伤。默认关闭。'),

    H3('3. 运行时 URL 版本号（serve.mjs 自动加 ?v=）'),
    P('构建时文件名不动（app.js），服务器每次返回 index.html 时给引用加 ?v=时间戳。'),
    Code('<script src="./app.js?v=muy4psn7">', 'html'),
    Tip('推荐。每次刷新 URL 都变，浏览器一定拿新的，不改文件名。'),

    H2('开发 / 发布 切换'),
    Code('node site/mode.mjs          # 显示当前\nnode site/mode.mjs dev      # 关混淆\nnode site/mode.mjs prod     # 开混淆', 'bash'),
    Code('npm run site:dev     # dev + build + 启服务器\nnpm run site:prod    # prod + build\nnpm run site:build   # 只 build\nnpm run site:serve   # 只启服务器\nnpm run site:mode    # 显示当前', 'bash'),

    H2('serve.mjs 是什么'),
    P('开发用静态服务器。做三件事：静态文件服务、SPA 路由回退、每次请求 index.html 时给 js/css 引用加 ?v=时间戳。'),
    Code('node site/serve.mjs 8081', 'bash'),

    H2('构建流程'),
    Code('node build-site.mjs\n\n[1/4] python site/gen-docs.py     生成文档\n[2/4] node bin/xuyc.js build app  编译网站\n[3/4] node bin/post-build.mjs     后处理\n[4/4] 清 dist 缓存                删旧 hash 文件', 'txt'),

    H2('体积对比'),
    Table(['模式', 'app.js', 'LCP 本地', '难度'], [
      ['dev（不混淆）', '~475 KB', '~300 ms', '容易读'],
      ['prod（混淆）', '~950 KB', '~600 ms', '难读'],
    ]),

    H2('常见问题'),

    H3('为什么看不到 ?v=？'),
    P('用 python -m http.server 或文件协议打开，不会加 ?v=。必须用 serve.mjs。'),

    H3('混淆后报错？'),
    P('切回 dev（node site/mode.mjs dev），重 build。混淆只用于发布。'),

    H3('文件被缓存？'),
    P('F12 → Network → 勾 Disable cache。或用 serve.mjs 的 ?v= 机制。'),

    H2('相关文件'),
    Table(['文件', '作用'], [
      ['package.json', '配置 + scripts'],
      ['build-site.mjs', '构建入口'],
      ['site/serve.mjs', '开发服务器 + ?v= 注入'],
      ['site/mode.mjs', 'dev/prod 切换'],
      ['bin/post-build.mjs', 'terser + 混淆'],
      ['site/gen-docs.py', '文档生成'],
    ]),
  )
}
