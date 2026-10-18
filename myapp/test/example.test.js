import { test } from 'node:test'
import assert from 'node:assert/strict'

test('example: 1 + 1 = 2', () => {
  assert.equal(1 + 1, 2)
})

test('example: 数组 map', () => {
  const arr = [1, 2, 3]
  assert.deepEqual(arr.map(x => x * 2), [2, 4, 6])
})

// 要测 src/ 下的 .xuy 文件：
// 1. 先跑 'xuyc build app.xuy --out dist'
// 2. 从 dist 或 src 里的编译产物导入
