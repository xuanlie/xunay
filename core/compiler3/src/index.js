import fs from 'node:fs'
import path from 'node:path'
// XuNay compiler v3 — 真正的 AST 编译器
import * as acorn from 'acorn'
import { TAGS, VOID_TAGS } from './tags.js'

let _uid = 0
const uid = (prefix) => `_${prefix}${_uid++}`

const BOOL_PROPS = new Set([
  'checked', 'disabled', 'selected', 'readonly',
  'multiple', 'autofocus', 'required', 'hidden',
])
const VALUE_PROPS = new Set(['value', 'textContent'])


function readPackageCompileMode() {
  try {
    let dir = process.cwd()
    while (true) {
      const pkgPath = path.join(dir, "package.json")
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
        if (pkg.xunay && pkg.xunay.compileMode) return pkg.xunay.compileMode
      }
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  } catch {}
  return "compiled"
}

function __readFileMode(src) {
  // 只看前 10 行的注释，避免误伤正文
  const head = src.split("\n", 10).slice(0, 10)
  for (const line of head) {
    const t = line.trim()
    if (t === "" ) continue
    if (t.startsWith("//")) {
      if (/^\/\/\s*@runtime\b/.test(t)) return "runtime"
      if (/^\/\/\s*@compiled\b/.test(t)) return "compiled"
      if (/^\/\/\s*@hybrid\b/.test(t)) return "hybrid"
      continue
    }
    if (t.startsWith("/*")) {
      if (/@runtime\b/.test(t)) return "runtime"
      if (/@compiled\b/.test(t)) return "compiled"
      if (/@hybrid\b/.test(t)) return "hybrid"
      continue
    }
    break
  }
  return null
}

export function compile(src, opts = {}) {
  _uid = 0
  const globalMode = opts.mode || readPackageCompileMode()
  const fileMode = __readFileMode(src)
  // 文件级指令 > 全局配置
  const mode = fileMode || globalMode

  if (mode === "runtime") return compileRuntime(src, opts.tagModule || "xunay")
  // compiled / hybrid：hybrid 无文件指令时等同 compiled
  return compileProgram(src)
}

// runtime 模式：源码原样保留 + 自动注入用到的标签 import
function compileRuntime(src, tagModule) {
  let ast
  try {
    ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: "module" })
  } catch {
    return src
  }
  const bound = new Set()
  collectBindings(ast, bound)
  const used = new Set()
  collectUsedTagNames(ast, bound, used)
  if (used.size === 0) return src

  const names = [...used].sort().join(", ")
  const importLine = `import { ${names} } from "${tagModule}"`

  const lines = src.split("\n")
  let lastImport = -1
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t.startsWith("import ")) { lastImport = i; continue }
    if (t === "" || t.startsWith("//") || t.startsWith("/*")) continue
    break
  }
  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, importLine)
    return lines.join("\n")
  }
  return importLine + "\n" + src
}

function collectUsedTagNames(node, bound, out) {
  if (!node || typeof node.type !== "string") return
  if (node.type === "CallExpression" &&
      node.callee.type === "Identifier" &&
      TAGS.has(node.callee.name) &&
      !bound.has(node.callee.name)) {
    out.add(node.callee.name)
  }
  for (const key of Object.keys(node)) {
    if (key === "type" || key === "start" || key === "end") continue
    const v = node[key]
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c.type === "string") collectUsedTagNames(c, bound, out)
    } else if (v && typeof v.type === "string") {
      collectUsedTagNames(v, bound, out)
    }
  }
}

function compileProgram(src) {
  const ast = acorn.parse(src, {
    ecmaVersion: 2022,
    sourceType: 'module',
  })

  const bound = new Set()
  collectBindings(ast, bound)

  const calls = []
  findTagCalls(ast, bound, calls)

  const outer = findOutermost(calls).sort((a, b) => b.start - a.start)

  let out = src
  for (const call of outer) {
    const code = genTag(call, src, bound)
    out = out.slice(0, call.start) + code + out.slice(call.end)
  }
  return out
}

function collectBindings(node, out) {
  if (!node || typeof node.type !== 'string') return

  switch (node.type) {
    case 'VariableDeclarator':
      collectPatternNames(node.id, out); break
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      if (node.id) out.add(node.id.name)
      for (const p of node.params) collectPatternNames(p, out)
      break
    case 'ClassDeclaration':
    case 'ClassExpression':
      if (node.id) out.add(node.id.name)
      break
    case 'ImportDeclaration': {
      // 从 'xunay' 或 'xunay/xxx' 引入的标签名，不加 bound
      // 兼容打包器把 'xunay' 换成各种路径：
      //   - 'xunay' / 'xunay/kit' 裸包名
      //   - '/path/to/core/dist/xunay-site.esm.js'
      //   - '/path/to/dist/xunay.js'（xuyc.js 的临时别名）
      const sv = node.source.value
      const isXunay = typeof sv === 'string' && (
        sv === 'xunay' ||
        sv.startsWith('xunay/') ||
        /[/\\]xunay[/\\].*\.esm\.js$/.test(sv) ||
        /[/\\]xunay\.js$/.test(sv)
      )
      for (const spec of node.specifiers) {
        if (!spec.local) continue
        const name = spec.local.name
        if (isXunay && TAGS.has(name)) continue  // 标签 → 不 bound
        out.add(name)
      }
      return  // 不再递归子节点
    }
    case 'CatchClause':
      if (node.param) collectPatternNames(node.param, out)
      break
  }

  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end') continue
    const v = node[key]
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c.type === 'string') collectBindings(c, out)
    } else if (v && typeof v.type === 'string') {
      collectBindings(v, out)
    }
  }
}

function collectPatternNames(node, out) {
  if (!node) return
  switch (node.type) {
    case 'Identifier':
      out.add(node.name); break
    case 'ObjectPattern':
      for (const prop of node.properties) {
        if (prop.type === 'Property') collectPatternNames(prop.value, out)
        else if (prop.type === 'RestElement') collectPatternNames(prop.argument, out)
      }
      break
    case 'ArrayPattern':
      for (const el of node.elements) if (el) collectPatternNames(el, out)
      break
    case 'RestElement':
      collectPatternNames(node.argument, out); break
    case 'AssignmentPattern':
      collectPatternNames(node.left, out); break
  }
}

function findTagCalls(node, bound, out) {
  if (!node || typeof node.type !== 'string') return

  if (node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      TAGS.has(node.callee.name) &&
      !bound.has(node.callee.name)) {
    out.push(node)
  }

  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end') continue
    const v = node[key]
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c.type === 'string') findTagCalls(c, bound, out)
    } else if (v && typeof v.type === 'string') {
      findTagCalls(v, bound, out)
    }
  }
}

function findOutermost(calls) {
  const sorted = [...calls].sort((a, b) => a.start - b.start || b.end - a.end)
  const result = []
  let lastEnd = -1
  for (const c of sorted) {
    if (c.start >= lastEnd) { result.push(c); lastEnd = c.end }
  }
  return result
}

function genTag(node, src, bound) {
  const lines = []
  const elVar = genTagExpr(node, src, bound, lines)
  let out = '(() => {\n'
  for (const line of lines) out += '  ' + line + '\n'
  out += `  return ${elVar}\n})()`
  return out
}

function genTagExpr(node, src, bound, lines) {
  const tagName = node.callee.name
  const elVar = uid(tagName)

  lines.push(`const ${elVar} = document.createElement(${JSON.stringify(tagName)})`)

  if (node.arguments.length > 0) {
    const propsNode = node.arguments[0]
    if (propsNode.type === 'ObjectExpression') {
      genProps(elVar, propsNode, src, bound, lines)
    } else if (propsNode.type === 'Literal' && propsNode.value === null) {
      // div(null, ...)
    } else {
      const srcExpr = src.slice(propsNode.start, propsNode.end)
      lines.push(`__rt__.applyProps(${elVar}, ${srcExpr})`)
    }
  }

  if (!VOID_TAGS.has(tagName)) {
    for (let i = 1; i < node.arguments.length; i++) {
      genChild(elVar, node.arguments[i], src, bound, lines)
    }
  }

  return elVar
}

function genProps(elVar, objNode, src, bound, lines) {
  for (const prop of objNode.properties) {
    if (prop.type === 'SpreadElement') {
      const spreadSrc = src.slice(prop.argument.start, prop.argument.end)
      lines.push(`__rt__.applyProps(${elVar}, ${spreadSrc})`)
      continue
    }
    if (prop.type !== 'Property') continue

    const key = getKey(prop.key)
    if (key == null) continue
    const valueNode = prop.value
    const valueSrc = src.slice(valueNode.start, valueNode.end)

    if (key === 'on' && valueNode.type === 'ObjectExpression') {
      for (const ev of valueNode.properties) {
        if (ev.type !== 'Property') continue
        const evName = getKey(ev.key)
        if (!evName) continue
        const handlerSrc = src.slice(ev.value.start, ev.value.end)
        lines.push(`${elVar}.addEventListener(${JSON.stringify(evName)}, ${handlerSrc})`)
      }
      continue
    }

    if (key === 'ref') {
      lines.push(`if (typeof (${valueSrc}) === 'function') (${valueSrc})(${elVar})`)
      continue
    }

    if (key === 'style') {
      if (valueNode.type === 'ObjectExpression') {
        lines.push(`Object.assign(${elVar}.style, ${valueSrc})`)
      } else if (isFn(valueNode)) {
        lines.push(`__rt__.bindStyle(${elVar}, ${valueSrc})`)
      } else {
        lines.push(`__rt__.applyStyle(${elVar}, ${valueSrc})`)
      }
      continue
    }

    if (key === 'class' || key === 'className') {
      if (isFn(valueNode)) {
        lines.push(`__rt__.bindAttr(${elVar}, 'class', ${valueSrc})`)
      } else if (valueNode.type === 'ObjectExpression') {
        lines.push(`${elVar}.className = __rt__.classNames(${valueSrc})`)
      } else {
        lines.push(`${elVar}.className = ${valueSrc}`)
      }
      continue
    }

    if (key === 'html' || key === 'innerHTML') {
      lines.push(`${elVar}.innerHTML = ${valueSrc}`)
      continue
    }

    if (isFn(valueNode)) {
      lines.push(`__rt__.bindAttr(${elVar}, ${JSON.stringify(key)}, ${valueSrc})`)
      continue
    }

    if (BOOL_PROPS.has(key)) {
      lines.push(`${elVar}.${key} = ${valueSrc}`)
      continue
    }

    if (VALUE_PROPS.has(key)) {
      lines.push(`${elVar}.${key} = ${valueSrc}`)
      continue
    }

    if (valueNode.type === 'Literal') {
      if (valueNode.value === true) {
        lines.push(`${elVar}.setAttribute(${JSON.stringify(key)}, '')`)
      } else if (valueNode.value === false || valueNode.value === null) {
        // skip
      } else {
        lines.push(`${elVar}.setAttribute(${JSON.stringify(key)}, ${valueSrc})`)
      }
      continue
    }

    lines.push(`${elVar}.setAttribute(${JSON.stringify(key)}, ${valueSrc})`)
  }
}

function genChild(parentVar, node, src, bound, lines) {
  if (node.type === 'Literal' && typeof node.value === 'string') {
    lines.push(`${parentVar}.appendChild(document.createTextNode(${src.slice(node.start, node.end)}))`)
    return
  }
  if (node.type === 'Literal' && typeof node.value === 'number') {
    lines.push(`${parentVar}.appendChild(document.createTextNode(${String(node.value)}))`)
    return
  }
  if (node.type === 'Literal' &&
      (node.value === null || node.value === undefined || node.value === false || node.value === true)) {
    return
  }

  if (node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      TAGS.has(node.callee.name) &&
      !bound.has(node.callee.name)) {
    const childVar = genTagExpr(node, src, bound, lines)
    lines.push(`${parentVar}.appendChild(${childVar})`)
    return
  }

  if (node.type === 'SpreadElement') {
    // ...arr → renderChild(arr)，剥掉 ... 前缀
    const argSrc = src.slice(node.argument.start, node.argument.end)
    const tVar = uid('t')
    if (containsTagCall(argSrc, bound)) {
      const compiled = compileExpr(argSrc, bound)
      lines.push(`const ${tVar} = __rt__.renderChild(${compiled})`)
    } else {
      lines.push(`const ${tVar} = __rt__.renderChild(${argSrc})`)
    }
    lines.push(`if (${tVar}) ${parentVar}.appendChild(${tVar})`)
    return
  }

  if (isFn(node)) {
    const tVar = uid('t')
    lines.push(`const ${tVar} = document.createTextNode('')`)
    const info = detectSingleSignal(node, src)
    if (info) {
      // 单信号直出
      const toStr = info.wrap
        ? `${info.wrap}`
        : `__rt__.toString`
      lines.push(`__rt__.bindTextDirect(${tVar}, ${info.sigName}, ${toStr})`)
    } else {
      lines.push(`__rt__.bindText(${tVar}, ${src.slice(node.start, node.end)})`)
    }
    lines.push(`${parentVar}.appendChild(${tVar})`)
    return
  }

  const exprSrc = src.slice(node.start, node.end)
  const tVar = uid('t')

  if (containsTagCall(exprSrc, bound)) {
    const compiled = compileExpr(exprSrc, bound)
    lines.push(`const ${tVar} = __rt__.renderChild(${compiled})`)
  } else {
    lines.push(`const ${tVar} = __rt__.renderChild(${exprSrc})`)
  }
  lines.push(`if (${tVar}) ${parentVar}.appendChild(${tVar})`)
}

function compileExpr(src, bound) {
  let expr
  try {
    expr = acorn.parseExpressionAt(src, 0, { ecmaVersion: 2022 })
  } catch {
    return src
  }
  if (!expr) return src

  const calls = []
  findTagCalls(expr, bound, calls)
  if (calls.length === 0) return src

  const outer = findOutermost(calls).sort((a, b) => b.start - a.start)
  let out = src
  for (const call of outer) {
    const code = genTag(call, src, bound)
    out = out.slice(0, call.start) + code + out.slice(call.end)
  }
  return out
}

function containsTagCall(s, bound) {
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; continue }
    if (c === '/' && s[i + 1] === '*') { i += 2; while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++; i += 2; continue }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; i++
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') i += 2; else i++ }
      i++
      continue
    }
    if (/[a-zA-Z_]/.test(c)) {
      const start = i
      while (i < s.length && /[\w$]/.test(s[i])) i++
      const name = s.slice(start, i)
      if (TAGS.has(name) && !bound.has(name)) {
        const prev = start > 0 ? s[start - 1] : ''
        if (prev !== '.' && !/[\w$]/.test(prev)) {
          let j = i
          while (j < s.length && /\s/.test(s[j])) j++
          if (s[j] === '(') return true
        }
      }
      continue
    }
    i++
  }
  return false
}

// 探测形如 X() 或 String(X()) 的单信号读取
// 返回 signal 标识符或 null
function detectSingleSignal(node, src) {
  if (node.type !== 'ArrowFunctionExpression') return null
  let body = node.body
  if (body.type === 'BlockStatement') return null
  // String(X())
  if (body.type === 'CallExpression' &&
      body.callee.type === 'Identifier' &&
      body.arguments.length === 1 &&
      body.arguments[0].type === 'CallExpression' &&
      body.arguments[0].callee.type === 'Identifier' &&
      body.arguments[0].arguments.length === 0) {
    return {
      sigName: body.arguments[0].callee.name,
      wrap: body.callee.name,
    }
  }
  // X()
  if (body.type === 'CallExpression' &&
      body.callee.type === 'Identifier' &&
      body.arguments.length === 0) {
    return { sigName: body.callee.name, wrap: null }
  }
  return null
}

function isFn(node) {
  return node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression'
}

function getKey(keyNode) {
  if (keyNode.type === 'Identifier') return keyNode.name
  if (keyNode.type === 'Literal') return String(keyNode.value)
  return null
}
