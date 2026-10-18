// 总览
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Xuyg · 最速开发"),
    P("Xuyg 是 XuNay 的极简语法编译器。编译期把极简语法展开成标准 JS，运行时零开销。一个电商网站全站约 1300 行，比常规写法的 5000 行少 4 倍。"),
    Tip("Xuyg 只读 xuyc.js（内存替换），绝不修改磁盘上的 xuyc.js。旧代码零影响。"),
    H2("核心优势"),
    Table(["项","常规","Xuyg"], [["import","每文件 5-10 行","0 行（自动）"],["export function","13 字符","cpt 3 字符"],["return","每个函数末尾","隐式返回"],["数据定义","12 条商品 72 行","dt 6 行"],["嵌套","手写 map","sdu 一行"],["页面","60 行","4 行"]]),
    H2("命令"),
    Code("# 构建\nnode ~/xunay/bin/Xuyg.js build app.xuy --out dist\n\n# 构建 + 起服务（前台，Ctrl+C 停）\nnode ~/xunay/bin/Xuyg.js build app.xuy --out dist --serve 12343\n\n# 构建 + 起服务 + 自动打开浏览器\nnode ~/xunay/bin/Xuyg.js build app.xuy --out dist --serve 12343 --open\n\n# 生产压缩\nnode ~/xunay/bin/Xuyg.js build app.xuy --out dist --minify\n\n# 开发热重载\nnode ~/xunay/bin/Xuyg.js dev app.xuy --out dist --port 12344\n\n# 调试模式（打印编译产物）\nXUYG_DEBUG=1 node ~/xunay/bin/Xuyg.js build app.xuy --out dist", "bash"),
    H2("触发条件"),
    P("文件里出现 cpt / pag / dt / sdu 任一关键字 → 走 Xuyg。否则走原 xuyc，零影响。"),
  )
}
