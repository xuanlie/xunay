// 测试
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("测试"),
    P("xunay 用 Node 内置测试——零依赖。"),
    H2("跑测试"),
    Code("node --test test/core.test.js\nnode --test test/compiler.test.js\n# 或\nnode --test test/*.test.js", "bash"),
    H2("写测试"),
    Code("// test/core.test.js\nimport { test } from 'node:test'\nimport assert from 'node:assert/strict'\nimport { signal, computed, effect, batch } from '../core/src/core.js'\n\ntest('signal 读写', () => {\n  const s = signal(1)\n  assert.equal(s(), 1)\n  s(2)\n  assert.equal(s(), 2)\n})\n\ntest('effect 订阅与清理', () => {\n  const s = signal(0)\n  let runs = 0\n  const stop = effect(() => { s(); runs++ })\n  assert.equal(runs, 1)\n  s(1); assert.equal(runs, 2)\n  stop()\n  s(2); assert.equal(runs, 2)\n})", "js"),
    H2("现有测试"),
    Table(["文件","用例数","内容"], [["test/core.test.js","5","signal / computed / effect / batch"],["test/compiler.test.js","2","参数化模板 / IIFE"]]),
    H2("断言方法"),
    Code("assert.equal(a, b)      // ==\nassert.deepEqual(a, b)   // 深比较\nassert.ok(v)             // 真值\nassert.throws(fn)        // 抛错", "js"),
    H2("测试异步"),
    Code("test('异步', async () => {\n  const r = await fetch('/api')\n  assert.equal(r.status, 200)\n})", "js"),
    H2("CI 集成"),
    Code("# .github/workflows/test.yml\n- run: node --test test/*.test.js", "yaml"),
  )
}
