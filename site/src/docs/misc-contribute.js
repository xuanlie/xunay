// 贡献指南
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("贡献指南"),
    P("xunay 是一个开源项目——欢迎任何形式的贡献。"),
    H2("贡献方式"),
    Ul("报告 bug","提功能建议","改文档","写测试","改进代码","翻译"),
    H2("报告 bug"),
    P("提供以下信息："),
    Ul("预期行为","实际行为","复现代码（最短）","环境（浏览器 / Node 版本）"),
    H2("提 PR"),
    Code("# 1. fork\n# 2. clone\ngit clone https://github.com/yourname/xunay\n\n# 3. 分支\ngit checkout -b fix-something\n\n# 4. 改\n# 5. 测试\nnode --test test/*.test.js\n\n# 6. 提交\ngit commit -m 'fix: xxx'\ngit push origin fix-something\n\n# 7. 在 GitHub 提 PR", "bash"),
    H2("代码规范"),
    Ul("不写 TypeScript","不加依赖（除非必要）","保持每个文件单一职责","核心文件保持简洁（core/src 每文件 < 200 行）"),
    H2("测试"),
    P("改核心代码必须加测试。"),
    Code("import { test } from 'node:test'\nimport assert from 'node:assert/strict'\nimport { signal } from '../core/src/core.js'\n\ntest('改动说明', () => {\n  const s = signal(1)\n  s(2)\n  assert.equal(s(), 2)\n})", "js"),
    H2("项目结构"),
    Code("core/          核心运行时\ncompiler2/     .xuy 编译器\nbin/           命令行工具\nbackends/      四套后端\nsite/          文档站\ndocs/          Markdown 文档\nexamples/      示例\ntest/          测试", "txt"),
    H2("Commit 规范"),
    Table(["前缀","用途"], [["feat:","新功能"],["fix:","修 bug"],["docs:","文档"],["refactor:","重构"],["perf:","性能"],["test:","测试"],["chore:","杂项"]]),
    H2("License"),
    P("MIT——贡献即同意以 MIT 协议发布。"),
  )
}
