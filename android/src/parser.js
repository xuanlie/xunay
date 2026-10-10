import { parse as acornParse } from 'acorn'
import { TAGS } from '../../compiler2/src/tokenizer.js'

// 支持的标签名（跟 gen.js 的 XML_TAG 对齐）
const TAG_NAMES = new Set([
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'button', 'input', 'textarea', 'checkbox', 'switch', 'radio',
  'img', 'progress', 'slider',
  'form', 'label', 'section', 'main', 'aside', 'nav', 'header', 'footer',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'a', 'select', 'option',
  'video', 'audio', 'hr', 'br', 'pre', 'code', 'strong', 'em', 'b', 'i',
])

let __SRC__ = ''

// 从 ESTree Literal 提取源码文本
function lit(node) {
  if (node.type === 'Literal') {
    if (typeof node.value === 'string') return JSON.stringify(node.value)
    return String(node.value)
  }
  if (node.type === 'TemplateLiteral') {
    let out = '`'
    for (let i = 0; i < node.quasis.length; i++) {
      out += node.quasis[i].value.raw
      if (i < node.expressions.length) out += '${' + exprToStr(node.expressions[i]) + '}'
    }
    out += '`'
    return out
  }
  return exprToStr(node)
}

// ESTree 表达式 → 源码字符串（用于 props 的 v 字段）
function exprToStr(node) {
  if (!node) return ''
  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string') return "'" + node.value.replace(/'/g, "\\'") + "'"
      return String(node.value)
    case 'Identifier': return node.name
    case 'TemplateLiteral': return lit(node)
    case 'ArrowFunctionExpression': {
      const params = node.params.map(p => p.name)
      const paramsStr = params.length === 1 ? params[0] : '(' + params.join(', ') + ')'
      const prefix = node.async ? 'async ' : ''
      return prefix + paramsStr + ' => ' + exprToStr(node.body)
    }
    case 'MemberExpression':
      return exprToStr(node.object) + '.' + (node.computed ? '[' + exprToStr(node.property) + ']' : node.property.name)
    case 'CallExpression':
      return exprToStr(node.callee) + '(' + node.arguments.map(exprToStr).join(',') + ')'
    case 'BinaryExpression':
      return exprToStr(node.left) + ' ' + node.operator + ' ' + exprToStr(node.right)
    case 'UnaryExpression':
      return node.operator + exprToStr(node.argument)
    case 'ObjectExpression': {
      const parts = node.properties.map(p => {
        const k = p.key.name || p.key.value
        return k + ': ' + exprToStr(p.value)
      })
      return '{ ' + parts.join(', ') + ' }'
    }
    case 'ArrayExpression':
      return '[' + node.elements.map(exprToStr).join(', ') + ']'
    case 'ConditionalExpression':
      return exprToStr(node.test) + ' ? ' + exprToStr(node.consequent) + ' : ' + exprToStr(node.alternate)
    case 'BlockStatement':
      return '{' + __SRC__.slice(node.start + 1, node.end - 1) + '}'
    default:
      return '/* unsupported: ' + node.type + ' */'
  }
}

// 提取对象字面量的属性列表 [{ k, v }, ...]
function propsFrom(node) {
  if (!node || node.type !== 'ObjectExpression') return []
  const out = []
  for (const p of node.properties) {
    const k = p.key.name || p.key.value
    out.push({ k, v: exprToStr(p.value), ast: p.value })
  }
  return out
}

// 核心：把一个标签调用转成旧格式节点
function convertTag(call, src) {
  const name = call.callee.name
  const args = call.arguments
  const props = propsFrom(args[0])
  const children = []
  for (let i = 1; i < args.length; i++) {
    children.push(convertChild(args[i]))
  }
  return { type: 'tag', name, props, children }
}

function convertChild(arg) {
  if (!arg) return null

  // 字符串 / 数字字面量 → text
  if (arg.type === 'Literal' && typeof arg.value === 'string') {
    return { type: 'text', expr: "'" + arg.value.replace(/'/g, "\\'") + "'" }
  }
  if (arg.type === 'Literal' && typeof arg.value === 'number') {
    return { type: 'text', expr: String(arg.value) }
  }

  // 模板字符串 → text（gen.js 会识别 txt`...` 里的 template）
  if (arg.type === 'TemplateLiteral') {
    return { type: 'text', expr: lit(arg), ast: arg, tag: 'txt' }
  }

  // TaggedTemplateExpression: txt`...`
  if (arg.type === 'TaggedTemplateExpression') {
    const tag = arg.tag.name
    const q = arg.quasi
    let body = ''
    for (let i = 0; i < q.quasis.length; i++) {
      body += q.quasis[i].value.raw
      if (i < q.expressions.length) body += '${' + exprToStr(q.expressions[i]) + '}'
    }
    return { type: 'text', expr: tag + '`' + body + '`', ast: q, tag }
  }

  // 标签调用 → 递归
  if (arg.type === 'CallExpression' && arg.callee.type === 'Identifier') {
    const fn = arg.callee.name
    if (TAG_NAMES.has(fn)) return convertTag(arg)
    if (fn === 'show') return convertShow(arg)
    if (fn === 'list') return convertList(arg)
    // 函数展开（Home / About 等用户定义）
    const __isArrow = arg.type === 'ArrowFunctionExpression' && arg.body && arg.body.type !== 'BlockStatement'
    return { type: 'dyn', expr: exprToStr(arg), ast: __isArrow ? arg.body : null, isArrow: __isArrow }
  }

  // 其他表达式 → dyn
  const __isArrow = arg.type === 'ArrowFunctionExpression' && arg.body && arg.body.type !== 'BlockStatement'
    return { type: 'dyn', expr: exprToStr(arg), ast: __isArrow ? arg.body : null, isArrow: __isArrow }
}

function convertShow(call) {
  const args = call.arguments
  const condAst = args[0]
  const cond = exprToStr(condAst)
  let child = null
  if (args[1]) {
    if (args[1].type === 'ArrowFunctionExpression') {
      child = convertChild(args[1].body)
    } else if (args[1].type === 'CallExpression') {
      child = convertChild(args[1])
    }
  }
  return { type: 'show', cond, condAst, child }
}

function convertList(call) {
  const args = call.arguments
  let arrExpr = args[0]
  let filterAst = null
  let mapAst = null

  // 循环解链 .filter() / .map()
  while (arrExpr && arrExpr.type === 'CallExpression' && arrExpr.callee.type === 'MemberExpression') {
    const method = arrExpr.callee.property.name
    if (method === 'filter') {
      filterAst = arrExpr.arguments[0]
      arrExpr = arrExpr.callee.object
    } else if (method === 'map') {
      mapAst = arrExpr.arguments[0]
      arrExpr = arrExpr.callee.object
    } else {
      break
    }
  }

  const arr = exprToStr(arrExpr)
  return { type: 'list', arr, render: exprToStr(args[1]), filterAst, mapAst }
}

// ========== 预处理：展开箭头函数常量 ==========
function expandComponents(src) {
  let ast
  try {
    ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' })
  } catch (e) { return src }

  const components = {}
  function isComponentBody(fnNode) {
    const b = fnNode.body
    let expr
    if (b.type === 'BlockStatement') {
      if (b.body.length !== 1 || b.body[0].type !== 'ReturnStatement') return false
      expr = b.body[0].argument
    } else {
      expr = b
    }
    if (!expr || expr.type !== 'CallExpression') return false
    if (expr.callee.type !== 'Identifier') return false
    return TAG_NAMES.has(expr.callee.name)
  }
  for (const node of ast.body) {
    if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) {
        if (d.init && d.init.type === 'ArrowFunctionExpression' && d.id.type === 'Identifier' && isComponentBody(d.init)) {
          components[d.id.name] = {
            params: d.init.params.map(p => p.name),
            bodyStart: d.init.body.start,
            bodyEnd: d.init.body.end,
            defStart: node.start,
            defEnd: node.end,
            isBlock: false,
          }
        }
      }
    } else if (node.type === 'FunctionDeclaration' && node.id && isComponentBody(node)) {
      components[node.id.name] = {
        params: node.params.map(p => p.name),
        bodyStart: node.body.start,
        bodyEnd: node.body.end,
        defStart: node.start,
        defEnd: node.end,
        isBlock: true,
      }
    }
  }
  if (Object.keys(components).length === 0) return src

  const calls = []
  function walk(n) {
    if (!n || typeof n !== 'object') return
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && components[n.callee.name]) {
      // 跳过函数定义体内的自引用（现在还不做递归展开）
      calls.push({
        name: n.callee.name,
        start: n.start,
        end: n.end,
        args: n.arguments.map(a => src.slice(a.start, a.end)),
      })
    }
    for (const k of Object.keys(n)) {
      if (['start','end','type','loc'].includes(k)) continue
      const v = n[k]
      if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object' && v.type) walk(v)
    }
  }
  walk(ast)

  // 从后往前替换
  calls.sort((a, b) => b.start - a.start)
  let out = src
  for (const call of calls) {
    const info = components[call.name]
    let body = src.slice(info.bodyStart, info.bodyEnd)
    if (info.isBlock) {
      let inner = body.trim()
      if (inner.startsWith('{') && inner.endsWith('}')) inner = inner.slice(1, -1).trim()
      inner = inner.replace(/^return\s+/, '').replace(/;\s*$/, '')
      body = inner
    }
    for (let i = 0; i < info.params.length; i++) {
      const prm = info.params[i]
      const arg = call.args[i] || 'null'
      body = body.replace(new RegExp('\\b' + prm + '\\b(?!\\s*:)', 'g'), arg)
    }
    out = out.slice(0, call.start) + '(' + body + ')' + out.slice(call.end)
  }

  // 删除函数定义（从后往前）
  const defs = Object.values(components).map(c => ({ start: c.defStart, end: c.defEnd }))
  defs.sort((a, b) => b.start - a.start)
  for (const def of defs) {
    out = out.slice(0, def.start) + out.slice(def.end)
  }
  return out
}

export function parse(src) {
  __SRC__ = src
  // 提取 const CSS = `...` 或 const css = `...`
  let __css__ = ''
  const __cssPatterns = [
    /const\s+(?:CSS|css|style)\s*=\s*`([\s\S]*?)`/,
    /\w+\.textContent\s*=\s*`([\s\S]*?)`/,
    /\w+\.innerHTML\s*=\s*`([\s\S]*?)`/,
  ]
  for (const __re of __cssPatterns) {
    const __m = src.match(__re)
    if (__m) {
      __css__ = __css__ ? (__css__ + '\n' + __m[1]) : __m[1]
      src = src.replace(__m[0], '')
    }
  }
  // 提取 const LANG = { zh: {...}, en: {...} }
  let __lang__ = null
  try {
    const tmpAst = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' })
    for (const node of tmpAst.body) {
      if (node.type === 'VariableDeclaration') {
        for (const d of node.declarations) {
          const nm = d.id && d.id.name
          if ((nm === 'LANG' || nm === 'I18N' || nm === 'langs') && d.init && d.init.type === 'ObjectExpression') {
            __lang__ = {}
            for (const prop of d.init.properties) {
              const langName = prop.key.name || prop.key.value
              const table = {}
              if (prop.value.type === 'ObjectExpression') {
                for (const kv of prop.value.properties) {
                  const k = kv.key.name || kv.key.value
                  const v = kv.value.type === 'Literal' ? String(kv.value.value) : ''
                  table[k] = v
                }
              }
              __lang__[langName] = table
            }
          }
        }
      }
    }
  } catch (e) {}
  // 1) 展开箭头函数常量
  src = expandComponents(src)

  // 2) acorn 解析
  let ast
  try {
    ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module', locations: true })
  } catch (e) {
    throw new Error('解析失败: ' + e.message)
  }

  // 3) 扫描顶层语句
  const result = []
  const pages = []
  for (const node of ast.body) {
    if (node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'CallExpression') {
      const c = node.expression
      if (c.callee && c.callee.type === 'Identifier' && c.callee.name === 'page' && c.arguments.length >= 2) {
        const nameArg = c.arguments[0]
        const fnArg = c.arguments[1]
        if (nameArg && nameArg.type === 'Literal' && typeof nameArg.value === 'string' &&
            fnArg && fnArg.type === 'ArrowFunctionExpression' && fnArg.body && fnArg.body.type === 'CallExpression') {
          const raw = convertChild(fnArg.body)
          if (raw) { pages.push({ name: nameArg.value, raw }); continue }
        }
      }
    }
    walkTop(node, src, result)
  }
  if (pages.length > 0) {
    result.length = 0
    for (const p of pages) result.push({ type: 'raw', pageName: p.name, node: p.raw })
  }
  if (__css__ && result.length > 0) result[0].css = __css__
  if (__lang__ && result.length > 0) result[0].lang = __lang__
  result.expandedSrc = src
  result.pages = pages.map(p => p.name)
  return result
}

function walkTop(node, src, out) {
  if (!node) return

  // app(() => div(...), '#app')
  if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression') {
    const call = node.expression
    if (call.callee.type === 'Identifier' && (call.callee.name === 'app' || call.callee.name === 'mount')) {
      const fn = call.arguments[0]
      if (fn && fn.type === 'ArrowFunctionExpression') {
        const body = fn.body
        if (body.type === 'CallExpression') {
          const raw = convertChild(body)
          if (raw) out.push({ type: 'raw', node: raw, start: node.start, end: node.end })
        }
      }
      return
    }
    // 直接写 div(...) 顶层
    if (call.callee.type === 'Identifier' && TAG_NAMES.has(call.callee.name)) {
      const raw = convertTag(call)
      out.push({ type: 'raw', node: raw, start: node.start, end: node.end })
      return
    }
  }
}