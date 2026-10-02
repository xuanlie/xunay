import { test } from "node:test"
import assert from "node:assert/strict"
import { parse } from "../compiler2/src/parser.js"
import { genFunction } from "../compiler2/src/gen.js"

test("参数化模板 (r) => div(...) 编译成工厂函数", () => {
  const src = "const row = (r) => div({ class: \"row\" }, span(null, r.id))\n"
  const out = genFunction("row", parse(src), src)
  assert.ok(out.includes("(r) => (() =>"), "应是工厂函数: " + out)
  assert.ok(!out.startsWith("(() =>"), "不应立即执行: " + out)
})

test("顶层裸 tag(...) 编译成立即执行 IIFE", () => {
  const src = "const box = div({ class: \"box\" }, \"hi\")\n"
  const out = genFunction("box", parse(src), src)
  assert.ok(out.includes("(() =>"), "应立即执行: " + out)
})