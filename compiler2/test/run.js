import assert from 'node:assert/strict'
import { compile } from '../src/index.js'

const cases = [
  {
    name: '空源码',
    source: '',
  },
  {
    name: '普通文本',
    source: 'const message = "hello"',
  },
  {
    name: '简单标签',
    source: 'const app = <div>Hello</div>',
  },
  {
    name: '嵌套标签',
    source: 'const app = <div><span>Hello</span></div>',
  },
  {
    name: '多个标签',
    source: 'const app = <div><span>A</span><span>B</span></div>',
  },
]

let passed = 0
let failed = 0

for (const test of cases) {
  try {
    const output = compile(test.source)

    assert.equal(typeof output, 'string', '编译结果必须是字符串')

    if (test.source.includes('<div>')) {
      assert.ok(output.length > 0, '标签源码不能生成空结果')
    }

    console.log(`✓ ${test.name}`)
    passed++
  } catch (error) {
    console.error(`✗ ${test.name}`)
    console.error(error)
    failed++
  }
}

console.log(`\nCompiler2 测试结果：${passed} 通过，${failed} 失败`)
if (failed > 0) process.exitCode = 1
