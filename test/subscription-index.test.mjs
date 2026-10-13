import { test } from 'node:test'
import assert from 'node:assert/strict'
import { signal, effect, computed } from '../core/src/index.js'

// V070 修复：改用 node:test 框架，失败时有测试名和分组

test('动态依赖切换：signal 切换订阅', () => {
  const chooseA = signal(true)
  const a = signal(1)
  const b = signal(10)

  let runs = 0
  let value

  const dispose = effect(() => {
    runs++
    value = chooseA() ? a() : b()
  })

  assert.equal(value, 1)
  assert.equal(a.subsCount(), 1)
  assert.equal(b.subsCount(), 0)

  chooseA(false)
  assert.equal(value, 10)
  assert.equal(a.subsCount(), 0)
  assert.equal(b.subsCount(), 1)

  const previousRuns = runs
  a(2)
  assert.equal(runs, previousRuns, 'a 已不订阅，不应触发')

  b(20)
  assert.equal(value, 20)

  dispose()
  assert.equal(a.subsCount(), 0)
  assert.equal(b.subsCount(), 0)
})

test('computed 动态依赖切换 + 清理', () => {
  const sourceA = signal(2)
  const sourceB = signal(3)
  const chooseComputedA = signal(true)

  const derived = computed(() =>
    chooseComputedA() ? sourceA() : sourceB()
  )

  let computedValue
  const disposeComputedEffect = effect(() => {
    computedValue = derived()
  })

  assert.equal(computedValue, 2)

  chooseComputedA(false)
  assert.equal(computedValue, 3)

  sourceA(8)
  assert.equal(computedValue, 3, 'A 已不依赖，不应变化')

  sourceB(9)
  assert.equal(computedValue, 9)

  disposeComputedEffect()
  derived.dispose()

  assert.equal(sourceA.subsCount(), 0)
  assert.equal(sourceB.subsCount(), 0)
})
