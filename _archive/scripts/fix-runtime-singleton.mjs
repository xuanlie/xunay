import { readFileSync, writeFileSync } from "node:fs"

const path = "core/src/runtime.js"
const s = readFileSync(path, "utf8")
writeFileSync(path + ".bak", s)

const from = `export const runtime = {
  currentEffect: null,
  effectStack: [],
  currentScope: null,
  scopeStack: [],
  batchDepth: 0,
  pendingEffects: new Set(),
  hooks: {
    onSignalCreate: null,
    onSignalSet: null,
    onEffectCreate: null,
    onEffectRun: null,
    onScopeCreate: null,
    onScopeDispose: null,
  }
}`

const to = `const G = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {})
export const runtime = G.__XUNAY_RUNTIME__ || (G.__XUNAY_RUNTIME__ = {
  currentEffect: null,
  effectStack: [],
  currentScope: null,
  scopeStack: [],
  batchDepth: 0,
  pendingEffects: new Set(),
  hooks: {
    onSignalCreate: null,
    onSignalSet: null,
    onEffectCreate: null,
    onEffectRun: null,
    onScopeCreate: null,
    onScopeDispose: null,
  }
})`

if (!s.includes(from)) throw new Error("未命中 runtime")
writeFileSync(path, s.replace(from, to))
console.log("runtime 单例化")
