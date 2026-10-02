// core 冒烟测试（node --test）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signal, computed, effect, batch } from '../core/src/core.js'

test('signal 读写', () => {
  const s = signal(1)
  assert.equal(s(), 1)
  s(2)
  assert.equal(s(), 2)
})

test('signal 函数式更新', () => {
  const s = signal(1)
  s(v => v + 10)
  assert.equal(s(), 11)
})

test('effect 订阅与清理', () => {
  const s = signal(0)
  let runs = 0
  const stop = effect(() => { s(); runs++ })
  assert.equal(runs, 1)
  s(1); assert.equal(runs, 2)
  stop()
  s(2); assert.equal(runs, 2)
})

test('computed 派生', () => {
  const a = signal(2), b = signal(3)
  const sum = computed(() => a() + b())
  assert.equal(sum(), 5)
  a(10)
  assert.equal(sum(), 13)
})

test('batch 合并触发', () => {
  const a = signal(0), b = signal(0)
  let runs = 0
  effect(() => { a(); b(); runs++ })
  runs = 0
  batch(() => { a(1); b(2) })
  assert.equal(runs, 1)
})
