import { parse as acornParse } from 'acorn'
const STRING_METHODS = new Set(['trim','toUpperCase','toLowerCase','charAt','substring','indexOf','lastIndexOf','replace','replaceAll','startsWith','endsWith','contains','concat','slice','substr','padStart','padEnd','repeat','trimStart','trimEnd','split','at','valueOf','toString','includes'])

export function extractComputeds(src, sigs) {
  let ast
  try { ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' }) }
  catch (e) { return [] }
  const out = []
  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration') continue
    for (const d of node.declarations) {
      if (d.id.type !== 'Identifier' || !d.init) continue
      if (d.init.type !== 'CallExpression') continue
      if (d.init.callee.type !== 'Identifier' || d.init.callee.name !== 'computed') continue
      const arrow = d.init.arguments[0]
      if (!arrow || arrow.type !== 'ArrowFunctionExpression') continue
      out.push({ name: d.id.name, arrow })
    }
  }
  return out
}

export function translateArrowBody(src, arrowNode, opts) {
  const sigs = opts.sigs || new Map()
  const computedTypes = opts.computedTypes || new Map()
  const localVars = new Map()
  const lines = []
  const ctx = { src, sigs, computedTypes, localVars }
  if (arrowNode.body && arrowNode.body.type !== 'BlockStatement') {
    const r = expr(arrowNode.body, ctx)
    lines.push('        return ' + r.code + ';')
    return { lines, returnType: r.type }
  }
  translateStmtList(arrowNode.body, ctx, lines, 0)
  const returnType = inferReturnType(arrowNode, ctx)
  if (returnType !== 'void') {
    const last = lines[lines.length - 1]
    const alreadyHasReturn = lines.some(l => /^\s*return\b/.test(l))
    if (!last || (!/^\s*return\b/.test(last) && !alreadyHasReturn)) {
      if (returnType === 'int') lines.push('        return 0;')
      else if (returnType === 'boolean') lines.push('        return false;')
      else lines.push('        return null;')
    }
  }
  return { lines, returnType }
}

function inferReturnType(arrow, ctx) {
  const types = new Set()
  if (arrow.body && arrow.body.type !== 'BlockStatement') {
    return exprType(arrow.body, ctx)
  }
  function walk(n) {
    if (!n || typeof n !== 'object') return
    if (n.type === 'ReturnStatement') {
      if (!n.argument) types.add('void')
      else types.add(exprType(n.argument, ctx))
    }
    for (const k of Object.keys(n)) {
      if (['start','end','type','loc'].includes(k)) continue
      const v = n[k]
      if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object' && v.type) walk(v)
    }
  }
  walk(arrow.body)
  if (types.size === 0) return 'void'
  if (types.size > 1) {
    const arr = [...types]
    if (arr.every(t => t === 'int' || t === 'double')) return 'double'
    return 'Object'
  }
  return [...types][0]
}

function exprType(node, ctx) {
  if (!node) return 'Object'
  switch (node.type) {
    case 'Literal':
      if (node.value === null) return 'Object'
      if (typeof node.value === 'string') return 'String'
      if (typeof node.value === 'boolean') return 'boolean'
      if (typeof node.value === 'number') return Number.isInteger(node.value) ? 'int' : 'double'
      return 'Object'
    case 'TemplateLiteral': return 'String'
    case 'ObjectExpression': return 'JSObject'
    case 'Identifier':
      if (ctx.localVars.has(node.name)) return ctx.localVars.get(node.name)
      if (ctx.sigs && ctx.sigs.get && ctx.sigs.get(node.name) === '__REF__') return '__REF__'
      return 'Object'
    case 'CallExpression': {
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'get' && node.callee.object.type === 'Identifier') {
        return ctx.sigs.get(node.callee.object.name) || 'Object'
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'String') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__A.length === 0) return { code: '""', type: 'String' }
        return { code: 'String.valueOf(' + __A[0] + ')', type: 'String' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'Number') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__A.length === 0) return { code: '0.0', type: 'double' }
        return { code: 'Double.parseDouble(String.valueOf(' + __A[0] + '))', type: 'double' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'Boolean') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__A.length === 0) return { code: 'false', type: 'boolean' }
        return { code: 'Boolean.parseBoolean(String.valueOf(' + __A[0] + '))', type: 'boolean' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'goto') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (node.arguments.length >= 2 && node.arguments[1].type === 'ObjectExpression') {
          const __keys = [], __vals = []
          for (const p of node.arguments[1].properties) {
            const __k = p.key.name || p.key.value
            const __v = expr(p.value, ctx).code
            __keys.push('"' + __k + '"')
            __vals.push('String.valueOf(' + __v + ')')
          }
          return { code: 'gotoPage2(String.valueOf(' + (__A[0] || '""') + '), new String[]{' + __keys.join(', ') + '}, new String[]{' + __vals.join(', ') + '})', type: 'void' }
        }
        return { code: 'gotoPage(String.valueOf(' + (__A[0] || '""') + '))', type: 'void' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'param') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        return { code: 'param(String.valueOf(' + (__A[0] || '""') + '))', type: 'String' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'back') {
        return { code: 'onBackPressed()', type: 'void' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'setTheme') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        return { code: 'setTheme(String.valueOf(' + (__A[0] || '""') + '))', type: 'void' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'fetch') {
        const __fa = node.arguments.map(a => expr(a, ctx).code)
        if (__fa.length === 2) return { code: 'fetchUrl(' + __fa.join(', ') + ')', type: 'void' }
        return { code: 'fetchBlocking(' + __fa.join(', ') + ')', type: 'String' }
      }
      if (node.callee.type === 'Identifier' && ctx.sigs.has(node.callee.name)) {
        return ctx.sigs.get(node.callee.name) || 'Object'
      }
      if (node.callee.type === 'Identifier' && ctx.computedTypes.has(node.callee.name)) {
        return ctx.computedTypes.get(node.callee.name)
      }
      if (node.callee.type === 'MemberExpression' && STRING_METHODS.has(node.callee.property.name)) return 'String'
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'test') return 'boolean'
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'length') return 'int'
      return 'Object'
    }
    case 'MemberExpression':
      if (!node.computed && node.property.name === 'length') return 'int'
      return 'Object'
    case 'BinaryExpression': {
      if (['<','>','<=','>=','==','!=','===','!=='].includes(node.operator)) return 'boolean'
      if (node.operator === 'instanceof' || node.operator === 'in') return 'boolean'
      if (['&','|','^','<<','>>'].includes(node.operator)) return 'int'
      if (node.operator === '**') return 'double'
      if (node.operator === '/') return 'double'
      const lt = exprType(node.left, ctx), rt = exprType(node.right, ctx)
      if (lt === 'int' && rt === 'int') return 'int'
      if ((lt === 'int' || lt === 'double') && (rt === 'int' || rt === 'double')) return 'double'
      return 'Object'
    }
    case 'LogicalExpression': return 'boolean'
    case 'UnaryExpression': return node.operator === '!' ? 'boolean' : 'Object'
    case 'ChainExpression': return exprType(node.expression, ctx)
    case 'NewExpression': {
      if (node.callee.type === 'Identifier' && node.callee.name === 'Date') return 'Object'
      return 'Object'
    }
    case 'AwaitExpression': return exprType(node.argument, ctx)
    case 'ConditionalExpression': {
      const a = exprType(node.consequent, ctx), b = exprType(node.alternate, ctx)
      return a === b ? a : 'Object'
    }
    case 'ArrayExpression': return 'Object[]'
    default: return 'Object'
  }
}

function truthyCheck(code, type) {
  if (type === 'String')  return '(' + code + ' != null && !' + code + '.isEmpty())'
  if (type === 'boolean') return '(' + code + ')'
  if (type === 'int' || type === 'double') return '(' + code + ' != 0)'
  return '(' + code + ' != null && !Boolean.FALSE.equals(' + code + '))'
}

function eqCheck(lcode, ltype, rcode, rtype, negate) {
  const eqOp = negate ? ' != ' : ' == '
  // null 检查：直接用 == / != null
  if (lcode === 'null' || rcode === 'null') {
    const other = lcode === 'null' ? rcode : lcode
    const otherType = lcode === 'null' ? rtype : ltype
    if (otherType === 'int' || otherType === 'double' || otherType === 'boolean') {
      return (negate ? 'false' : 'true')
    }
    return '(' + other + eqOp + 'null)'
  }
  if (ltype === 'String' || rtype === 'String') {
    const L = ltype === 'String' ? lcode : 'String.valueOf(' + lcode + ')'
    const R = rtype === 'String' ? rcode : 'String.valueOf(' + rcode + ')'
    return (negate ? '!' : '') + L + '.equals(' + R + ')'
  }
  if (ltype === 'int' || ltype === 'double' || rtype === 'int' || rtype === 'double') {
    return '(' + lcode + eqOp + rcode + ')'
  }
  return (negate ? '!' : '') + 'java.util.Objects.equals(' + lcode + ', ' + rcode + ')'
}

export function expr(node, ctx) {
  if (!node) return { code: 'null', type: 'Object' }
  switch (node.type) {
    case 'Literal':
      if (node.value === null) return { code: 'null', type: 'Object' }
      if (typeof node.value === 'string') return { code: JSON.stringify(node.value), type: 'String' }
      if (typeof node.value === 'boolean') return { code: String(node.value), type: 'boolean' }
      if (typeof node.value === 'number') return { code: String(node.value), type: Number.isInteger(node.value) ? 'int' : 'double' }
      return { code: 'null', type: 'Object' }
    case 'Identifier':
      if (ctx.sigs && ctx.sigs.get && ctx.sigs.get(node.name) === '__REF__') return { code: node.name, type: '__REF__' }
      if (node.name === 'undefined') return { code: 'null', type: 'Object' }
      return { code: node.name, type: exprType(node, ctx) }
    case 'TemplateLiteral': {
      const parts = []
      for (let i = 0; i < node.quasis.length; i++) {
        const raw = node.quasis[i].value.raw
        if (raw) parts.push(JSON.stringify(raw))
        if (i < node.expressions.length) {
          const e = expr(node.expressions[i], ctx)
          if (e.type === 'String') parts.push(e.code)
          else parts.push('numStr(' + e.code + ')')
        }
      }
      return { code: parts.length ? parts.join(' + ') : '""', type: 'String' }
    }
    case 'CallExpression': {
        // ==== 内置函数（第二处 case） ====
        if (node.callee.type === 'Identifier' && node.callee.name === 'goto') {
          const __A = node.arguments.map(a => expr(a, ctx).code)
          if (node.arguments.length >= 2 && node.arguments[1].type === 'ObjectExpression') {
            const __keys = [], __vals = []
            for (const p of node.arguments[1].properties) {
              const __k = p.key.name || p.key.value
              const __v = expr(p.value, ctx).code
              __keys.push('"' + __k + '"')
              __vals.push('String.valueOf(' + __v + ')')
            }
            return { code: 'gotoPage2(String.valueOf(' + (__A[0] || '""') + '), new String[]{' + __keys.join(', ') + '}, new String[]{' + __vals.join(', ') + '})', type: 'void' }
          }
          return { code: 'gotoPage(String.valueOf(' + (__A[0] || '""') + '))', type: 'void' }
        }
        if (node.callee.type === 'Identifier' && node.callee.name === 'param') {
          const __A = node.arguments.map(a => expr(a, ctx).code)
          return { code: 'param(String.valueOf(' + (__A[0] || '""') + '))', type: 'String' }
        }
        if (node.callee.type === 'Identifier' && node.callee.name === 'back') {
          return { code: 'onBackPressed()', type: 'void' }
        }
        if (node.callee.type === 'Identifier' && node.callee.name === 'setTheme') {
          const __A = node.arguments.map(a => expr(a, ctx).code)
          return { code: 'setTheme(String.valueOf(' + (__A[0] || '""') + '))', type: 'void' }
        }

      if (node.callee.type === 'MemberExpression' && !node.callee.computed && node.callee.property.name) {
        const __pn = node.callee.property.name
        const __DM = {
          getFullYear: 'getYear() + 1900',
          getMonth: 'getMonth()',
          getDate: 'getDate()',
          getDay: 'getDay()',
          getHours: 'getHours()',
          getMinutes: 'getMinutes()',
          getSeconds: 'getSeconds()',
          getMilliseconds: 'getMilliseconds()',
          getTime: 'getTime()',
        }
        if (__DM[__pn]) {
          const __ob = expr(node.callee.object, ctx)
          return { code: __ob.code + '.' + __DM[__pn], type: __pn === 'getTime' ? 'double' : 'int' }
        }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'console') {
        const __m = node.callee.property.name
        const __a = node.arguments.map(a => expr(a, ctx).code).join(' + " " + ')
        const __lvl = __m === 'error' ? 'e' : __m === 'warn' ? 'w' : 'd'
        return { code: 'android.util.Log.' + __lvl + '("xunay", String.valueOf(' + (__a || '""') + '))', type: 'void' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'localStorage') {
        const __m = node.callee.property.name
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__m === 'getItem') return { code: 'getPref(' + (__A[0] || '""') + ')', type: 'String' }
        if (__m === 'setItem') return { code: 'setPref(' + (__A[0] || '""') + ', String.valueOf(' + (__A[1] || '""') + '))', type: 'void' }
        if (__m === 'removeItem') return { code: 'removePref(' + (__A[0] || '""') + ')', type: 'void' }
        if (__m === 'clear') return { code: 'clearPref()', type: 'void' }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'setTimeout' && node.arguments.length >= 1) {
        const fn = node.arguments[0]
        const delay = node.arguments[1] ? expr(node.arguments[1], ctx) : { code: '0', type: 'int' }
        if (fn.type === 'ArrowFunctionExpression' && fn.body) {
          const bodyR = expr(fn.body, ctx)
          return { code: 'new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> { ' + bodyR.code + '; }, ' + delay.code + ')', type: 'void' }
        }
      }
      if (node.callee.type === 'Identifier' && node.callee.name === 'fetch') {
        const __fa = node.arguments.map(a => expr(a, ctx).code)
        if (__fa.length === 2) return { code: 'fetchUrl(' + __fa.join(', ') + ')', type: 'void' }
        return { code: 'fetchBlocking(' + __fa.join(', ') + ')', type: 'String' }
      }
      if (node.callee.type === 'Identifier' && ctx.sigs.has(node.callee.name)) {
        const t = ctx.sigs.get(node.callee.name)
        if (node.arguments.length === 0) {
          return { code: node.callee.name + '.get()', type: t }
        }
        const args = node.arguments.map(a => expr(a, ctx).code).join(', ')
        return { code: node.callee.name + '.set(' + args + ')', type: 'void' }
      }
      if (node.callee.type === 'Identifier' && ctx.computedTypes.has(node.callee.name)) {
        return { code: node.callee.name + '()', type: ctx.computedTypes.get(node.callee.name) }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'test' && node.callee.object.type === 'Literal' && node.callee.object.regex) {
        const pat = node.callee.object.regex.pattern
        const arg = expr(node.arguments[0], ctx)
        return { code: 'java.util.regex.Pattern.compile(' + JSON.stringify(pat) + ').matcher(String.valueOf(' + arg.code + ')).find()', type: 'boolean' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'get' && node.callee.object.type === 'Identifier' && ctx.sigs.has(node.callee.object.name)) {
        const t = ctx.sigs.get(node.callee.object.name)
        return { code: node.callee.object.name + '.get()', type: t }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'join') {
        const A = node.arguments.map(a => expr(a, ctx).code)
        const sep = A[0] || '","'
        return { code: 'joinArr(' + expr(node.callee.object, ctx).code + ', ' + sep + ')', type: 'String' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'slice') {
        const A = node.arguments.map(a => expr(a, ctx).code)
        const obj = expr(node.callee.object, ctx).code
        if (A.length === 1) return { code: 'sliceArr(' + obj + ', ' + A[0] + ', Integer.MAX_VALUE)', type: 'Object[]' }
        if (A.length === 2) return { code: 'sliceArr(' + obj + ', ' + A[0] + ', ' + A[1] + ')', type: 'Object[]' }
        return { code: obj, type: 'Object[]' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'concat') {
        const A = node.arguments.map(a => expr(a, ctx).code)
        const obj = expr(node.callee.object, ctx).code
        return { code: 'concatArr(' + obj + ', ' + A.join(', ') + ')', type: 'Object[]' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'indexOf') {
        const A = node.arguments.map(a => expr(a, ctx).code)
        const obj = expr(node.callee.object, ctx).code
        return { code: 'indexOfArr(' + obj + ', ' + (A[0] || 'null') + ')', type: 'int' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'includes') {
        const A = node.arguments.map(a => expr(a, ctx).code)
        const obj = expr(node.callee.object, ctx).code
        return { code: '(indexOfArr(' + obj + ', ' + (A[0] || 'null') + ') >= 0)', type: 'boolean' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'reverse') {
        const obj = expr(node.callee.object, ctx).code
        return { code: 'reverseArr(' + obj + ')', type: 'Object[]' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'sort') {
        const obj = expr(node.callee.object, ctx).code
        return { code: 'sortArr(' + obj + ')', type: 'Object[]' }
      }
      if (node.callee.type === 'MemberExpression' && node.arguments[0] && node.arguments[0].type === 'ArrowFunctionExpression') {
        const __m = node.callee.property.name
        const __ARR = ['map','filter','forEach','reduce','find','some','every']
        if (__ARR.includes(__m)) {
          const __obj = expr(node.callee.object, ctx).code
          const __fn = node.arguments[0]
          const __mk = (v) => v.type === 'lambda' ? '((Number) ' + v.code + ').doubleValue()' : v.code
          if (__m === 'forEach') {
            const __pn = __fn.params[0].name
            const __ctx2 = Object.assign({}, ctx, { localVars: new Map(ctx.localVars) })
            __ctx2.localVars.set(__pn, 'lambda')
            let __body
            if (__fn.body.type === 'BlockStatement') {
              const __lines = []
              translateStmtList(__fn.body, __ctx2, __lines, 0)
              __body = '{\n' + __lines.join('\n') + '\n            }'
            } else {
              __body = '{ ' + expr(__fn.body, __ctx2).code + '; }'
            }
            return { code: 'forEachArr(' + __obj + ', ' + __pn + ' -> ' + __body + ')', type: 'void' }
          }
          if (__m === 'reduce') {
            const __an = __fn.params[0].name
            const __xn = __fn.params[1].name
            const __ctx2 = Object.assign({}, ctx, { localVars: new Map(ctx.localVars) })
            __ctx2.localVars.set(__an, 'lambda')
            __ctx2.localVars.set(__xn, 'lambda')
            const __body = expr(__fn.body, __ctx2).code
            const __init = node.arguments[1] ? expr(node.arguments[1], ctx).code : 'null'
            return { code: 'reduceArr(' + __obj + ', ' + __init + ', (' + __an + ', ' + __xn + ') -> ' + __body + ')', type: 'Object' }
          }
          const __pn = __fn.params[0].name
          const __ctx2 = Object.assign({}, ctx, { localVars: new Map(ctx.localVars) })
          __ctx2.localVars.set(__pn, 'lambda')
          const __body = expr(__fn.body, __ctx2)
          if (__m === 'map')    return { code: 'mapArr(' + __obj + ', ' + __pn + ' -> ' + __mk(__body) + ')', type: 'java.util.List<Object>' }
          if (__m === 'filter') return { code: 'filterArr(' + __obj + ', ' + __pn + ' -> ' + __body.code + ')', type: 'java.util.List<Object>' }
          if (__m === 'find')   return { code: 'findArr(' + __obj + ', ' + __pn + ' -> ' + __body.code + ')', type: 'Object' }
          if (__m === 'some')   return { code: 'someArr(' + __obj + ', ' + __pn + ' -> ' + __body.code + ')', type: 'boolean' }
          if (__m === 'every')  return { code: 'everyArr(' + __obj + ', ' + __pn + ' -> ' + __body.code + ')', type: 'boolean' }
        }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier') {
        const __ns = node.callee.object.name
        const __md = node.callee.property.name
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__ns === 'Math') {
          const __ret = { abs: null, floor: 'double', ceil: 'double', round: 'double', min: null, max: null, pow: 'double', sqrt: 'double', random: 'double', sign: 'double' }
          let __t = __ret[__md] || 'double'
          if (__t === null) {
            const aT = node.arguments[0] ? exprType(node.arguments[0], ctx) : 'int'
            __t = (aT === 'int' || aT === 'double') ? aT : 'double'
          }
          if ((__md === 'max' || __md === 'min') && node.arguments.length > 2) {
            let __e = 'Math.' + __md + '(' + __A[0] + ', ' + __A[1] + ')'
            for (let __i = 2; __i < __A.length; __i++) __e = 'Math.' + __md + '(' + __e + ', ' + __A[__i] + ')'
            return { code: __e, type: __t }
          }
          return { code: 'Math.' + __md + '(' + __A.join(', ') + ')', type: __t }
        }
        if (__ns === 'Number') {
          if (__md === 'parseInt')   return { code: 'Integer.parseInt(' + __A.join(', ') + ')', type: 'int' }
          if (__md === 'parseFloat') return { code: 'Double.parseDouble(' + __A.join(', ') + ')', type: 'double' }
          if (__md === 'isNaN')      return { code: 'Double.isNaN(((' + (__A[0] || '0') + ') instanceof Number ? ((Number) ' + (__A[0] || '0') + ').doubleValue() : 0)', type: 'boolean' }
          if (__md === 'isInteger')  return { code: '((' + (__A[0] || '0') + ') instanceof Integer || ((' + (__A[0] || '0') + ') instanceof Double && ((Double) ' + (__A[0] || '0') + ') % 1 == 0))', type: 'boolean' }
          return { code: 'Number.' + __md + '(' + __A.join(', ') + ')', type: 'double' }
        }
        if (__ns === 'String') {
          if (__md === 'fromCharCode') return { code: 'String.valueOf((char) (' + (__A[0] || '0') + '))', type: 'String' }
        }
        if (__ns === 'JSON') {
          if (__md === 'parse') return { code: 'jsonParse(String.valueOf(' + (__A[0] || '""') + '))', type: 'Object' }
          if (__md === 'stringify') return { code: 'jsonStringify(' + (__A[0] || 'null') + ')', type: 'String' }
        }
        if (__ns === 'Array') {
          if (__md === 'from') return { code: 'asList(' + (__A[0] || 'new Object[0]') + ').toArray()', type: 'Object[]' }
          if (__md === 'isArray') return { code: '((' + (__A[0] || 'null') + ') instanceof Object[] || (' + (__A[0] || 'null') + ') instanceof java.util.List)', type: 'boolean' }
        }
        if (__ns === 'Object') {
          if (__md === 'keys') return { code: 'objKeys(' + (__A[0] || 'null') + ')', type: 'java.util.List<String>' }
          if (__md === 'values') return { code: 'objValues(' + (__A[0] || 'null') + ')', type: 'java.util.List<Object>' }
          if (__md === 'entries') return { code: 'objEntries(' + (__A[0] || 'null') + ')', type: 'java.util.List<Object[]>' }
        }
        if (__ns === 'Date') {
          if (__md === 'now') return { code: 'dateNow()', type: 'double' }
        }
      }
      if (node.callee.type === 'Identifier') {
        const __fn = node.callee.name
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__fn === 'setInterval') return { code: 'setIntervalFn(() -> { ' + (__A[0] || '') + ' }, ' + (__A[1] || '0') + ')', type: 'double' }
        if (__fn === 'clearInterval' || __fn === 'clearTimeout') return { code: (__fn === 'clearInterval' ? 'clearIntervalFn' : 'clearTimeoutFn') + '((long) ((Number) ' + (__A[0] || '0') + ').doubleValue())', type: 'void' }
        if (__fn === 'setTimeout') {
          if (node.arguments[0] && node.arguments[0].type === 'ArrowFunctionExpression' && node.arguments[0].body) {
            const __body = expr(node.arguments[0].body, ctx).code
            const __ms = __A[1] || '0'
            return { code: 'new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> { ' + __body + '; }, (long) ((Number) ' + __ms + ').doubleValue())', type: 'void' }
          }
        }
      }
      if (node.optional && node.callee.type === 'MemberExpression') {
        const obj = expr(node.callee.object, ctx)
        const inner = expr(node.callee, ctx)
        return { code: '(' + obj.code + ' == null ? null : ' + inner.code + ')', type: inner.type }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'replace' && node.arguments[0] && node.arguments[0].type === 'Literal' && node.arguments[0].regex) {
        const __obj = expr(node.callee.object, ctx)
        const __objS = __obj.type === 'String' ? __obj.code : 'String.valueOf(' + __obj.code + ')'
        const __pat = node.arguments[0].regex.pattern
        const __rep = expr(node.arguments[1], ctx).code
        return { code: __objS + '.replaceAll(' + JSON.stringify(__pat) + ', ' + __rep + ')', type: 'String' }
      }
      if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'match' && node.arguments[0] && node.arguments[0].type === 'Literal' && node.arguments[0].regex) {
        const __obj = expr(node.callee.object, ctx)
        const __objS = __obj.type === 'String' ? __obj.code : 'String.valueOf(' + __obj.code + ')'
        const __pat = node.arguments[0].regex.pattern
        return { code: 'java.util.regex.Pattern.compile(' + JSON.stringify(__pat) + ').matcher(' + __objS + ').find()', type: 'boolean' }
      }
      if (node.callee.type === 'MemberExpression' && STRING_METHODS.has(node.callee.property.name)) {
        const m = node.callee.property.name
        const obj = expr(node.callee.object, ctx)
        const objStr = obj.type === 'String' ? obj.code : 'String.valueOf(' + obj.code + ')'
        const A = node.arguments.map(a => expr(a, ctx).code)
        const args = A.join(', ')
        if (m === 'slice' || m === 'substr') return { code: objStr + '.substring(' + args + ')', type: 'String' }
        if (m === 'padStart') {
          const n = A[0] || '0'
          const fill = A[1] ? A[1].replace(/^['"]|['"]$/g, '') : ' '
          return { code: 'String.format("%1$" + Math.max(' + n + ', ' + objStr + '.length()) + "s", ' + objStr + ').replace(\' \', \'' + fill + '\')', type: 'String' }
        }
        if (m === 'padEnd') {
          const n = A[0] || '0'
          const fill = A[1] ? A[1].replace(/^['"]|['"]$/g, '') : ' '
          return { code: objStr + ' + "' + fill + '".repeat(Math.max(0, ' + n + ' - ' + objStr + '.length()))', type: 'String' }
        }
        if (m === 'repeat') return { code: objStr + '.repeat(' + args + ')', type: 'String' }
        if (m === 'trimStart') return { code: objStr + '.replaceAll("^\\\\s+", "")', type: 'String' }
        if (m === 'trimEnd') return { code: objStr + '.replaceAll("\\\\s+$", "")', type: 'String' }
        if (m === 'includes') return { code: objStr + '.contains(' + args + ')', type: 'boolean' }
        if (m === 'split') return { code: objStr + '.split(' + args + ')', type: 'Object[]' }
        if (m === 'at') return { code: objStr + '.charAt(' + args + ')', type: 'String' }
        if (m === 'valueOf' || m === 'toString') return { code: objStr, type: 'String' }
        return { code: objStr + '.' + m + '(' + args + ')', type: (m === 'contains' || m === 'startsWith' || m === 'endsWith' || m === 'isEmpty') ? 'boolean' : 'String' }
      }
      const callee = expr(node.callee, ctx)
      const args = node.arguments.map(a => expr(a, ctx).code).join(', ')
      return { code: callee.code + '(' + args + ')', type: 'Object' }
    }
    case 'MemberExpression': {
      if (node.object.type === 'Literal' && node.object.regex) return { code: JSON.stringify(node.object.regex.pattern), type: 'String' }
      if (!node.computed && node.property.name === 'length') {
        const obj = expr(node.object, ctx)
        const objStr = obj.type === 'String' ? obj.code : 'String.valueOf(' + obj.code + ')'
        return { code: objStr + '.length()', type: 'int' }
      }
      if (node.object.type === 'Identifier' && node.object.name === 'Math' && !node.computed && node.property.name) {
        const __c = node.property.name
        const __consts = { PI: 'Math.PI', E: 'Math.E', LN2: 'Math.log(2)', LN10: 'Math.log(10)', SQRT2: 'Math.sqrt(2)', SQRT1_2: 'Math.sqrt(0.5)' }
        if (__consts[__c]) return { code: __consts[__c], type: 'double' }
      }
      if (node.object.type === 'Identifier' && node.object.name === 'Number' && !node.computed && node.property.name) {
        const __c = node.property.name
        const __consts = { MAX_VALUE: 'Double.MAX_VALUE', MIN_VALUE: 'Double.MIN_VALUE', MAX_SAFE_INTEGER: '9007199254740991L', MIN_SAFE_INTEGER: '-9007199254740991L', POSITIVE_INFINITY: 'Double.POSITIVE_INFINITY', NEGATIVE_INFINITY: 'Double.NEGATIVE_INFINITY', EPSILON: 'Math.ulp(1.0)' }
        if (__consts[__c]) return { code: __consts[__c], type: 'double' }
      }
      const obj = expr(node.object, ctx)
      const __opt = node.optional
      const __objLike = (obj.type === 'JSObject' || obj.type === 'Object') && !node.computed
      if (__objLike) {
        const __inner = 'jsGet(' + obj.code + ', "' + node.property.name + '")'
        if (__opt) return { code: '(' + obj.code + ' == null ? null : ' + __inner + ')', type: 'JSObject' }
        return { code: __inner, type: 'JSObject' }
      }
      if (!node.computed) {
        const inner = obj.code + '.' + node.property.name
        if (__opt) return { code: '(' + obj.code + ' == null ? null : ' + inner + ')', type: 'Object' }
        return { code: inner, type: 'Object' }
      }
      const inner = obj.code + '[' + expr(node.property, ctx).code + ']'
      if (__opt) return { code: '(' + obj.code + ' == null ? null : ' + inner + ')', type: 'Object' }
      return { code: inner, type: 'Object' }
    }
    case 'BinaryExpression': {
      const l = expr(node.left, ctx), r = expr(node.right, ctx)
      if (node.operator === '===' || node.operator === '==') return { code: eqCheck(l.code, l.type, r.code, r.type, false), type: 'boolean' }
      if (node.operator === '!==' || node.operator === '!=') return { code: eqCheck(l.code, l.type, r.code, r.type, true), type: 'boolean' }
      if (node.operator === 'instanceof') return { code: '(' + l.code + ' instanceof ' + r.code + ')', type: 'boolean' }
      if (node.operator === 'in') return { code: 'inObj(' + r.code + ', ' + l.code + ')', type: 'boolean' }
      if (node.operator === '**') {
        const lc = l.type === 'double' ? l.code : '((Number) ' + l.code + ').doubleValue()'
        const rc = r.type === 'double' ? r.code : '((Number) ' + r.code + ').doubleValue()'
        return { code: 'Math.pow(' + lc + ', ' + rc + ')', type: 'double' }
      }
      if (['&','|','^','<<','>>'].includes(node.operator)) {
        return { code: '(((Number) ' + l.code + ').intValue() ' + node.operator + ' ((Number) ' + r.code + ').intValue())', type: 'int' }
      }
      const __promote = (v) => v.type === 'lambda' ? { code: '((Number) ' + v.code + ').doubleValue()', type: 'double' } : v
      const __lp = __promote(l), __rp = __promote(r)
      if (node.operator === '<' || node.operator === '>' || node.operator === '<=' || node.operator === '>=') return { code: '(' + __lp.code + ' ' + node.operator + ' ' + __rp.code + ')', type: 'boolean' }
      if (node.operator === '+' && (l.type === 'String' || r.type === 'String')) {
        const ls = l.type === 'String' ? l.code : 'String.valueOf(' + l.code + ')'
        const rs = r.type === 'String' ? r.code : 'String.valueOf(' + r.code + ')'
        return { code: '(' + ls + ' + ' + rs + ')', type: 'String' }
      }
      if (node.operator === '/') {
        const lc = __lp.type === 'double' ? __lp.code : '((Number) ' + __lp.code + ').doubleValue()'
        const rc = __rp.type === 'double' ? __rp.code : '((Number) ' + __rp.code + ').doubleValue()'
        return { code: '(' + lc + ' / ' + rc + ')', type: 'double' }
      }
      let op = node.operator
      let code = '(' + __lp.code + ' ' + op + ' ' + __rp.code + ')'
      let t = 'Object'
      if (__lp.type === 'int' && __rp.type === 'int') t = 'int'
      else if ((__lp.type === 'int' || __lp.type === 'double') && (__rp.type === 'int' || __rp.type === 'double')) t = 'double'
      return { code, type: t }
    }
    case 'LogicalExpression': {
      const l = expr(node.left, ctx), r = expr(node.right, ctx)
      if (node.operator === '??') {
        const __isRef = (t) => t === 'Object' || t === 'JSObject' || t === 'String'
        if (__isRef(l.type) || __isRef(r.type)) {
          const lc = l.type === 'String' ? l.code : 'String.valueOf(' + l.code + ')'
          const rc = r.type === 'String' ? r.code : 'String.valueOf(' + r.code + ')'
          return { code: '(' + l.code + ' != null ? ' + lc + ' : ' + rc + ')', type: 'String' }
        }
        return { code: l.code, type: l.type }
      }
      const lc = l.type === 'boolean' ? l.code : truthyCheck(l.code, l.type)
      const rc = r.type === 'boolean' ? r.code : truthyCheck(r.code, r.type)
      return { code: '(' + lc + ' ' + node.operator + ' ' + rc + ')', type: 'boolean' }
    }
    case 'UnaryExpression': {
      const arg = expr(node.argument, ctx)
      if (node.operator === 'typeof') return { code: 'typeOf(' + arg.code + ')', type: 'String' }
      if (node.operator === 'void') return { code: '0', type: 'int' }
      if (node.operator === 'delete') return { code: 'false', type: 'boolean' }
      if (node.operator === '~') return { code: '(~((Number) ' + arg.code + ').intValue())', type: 'int' }
      if (node.operator === '+') return { code: arg.code, type: arg.type }
      if (node.operator === '!') {
        if (arg.type === 'String') return { code: '(' + arg.code + ' == null || ' + arg.code + '.isEmpty())', type: 'boolean' }
        if (arg.type === 'boolean') return { code: '(!' + arg.code + ')', type: 'boolean' }
        if (arg.type === 'int' || arg.type === 'double') return { code: '(' + arg.code + ' == 0)', type: 'boolean' }
        return { code: '(' + arg.code + ' == null || Boolean.FALSE.equals(' + arg.code + '))', type: 'boolean' }
      }
      if (node.operator === '-') return { code: '(-' + arg.code + ')', type: arg.type }
      return { code: '(' + node.operator + arg.code + ')', type: 'Object' }
    }
    case 'ConditionalExpression': {
      const t = expr(node.test, ctx), c = expr(node.consequent, ctx), a = expr(node.alternate, ctx)
      const tc = t.type === 'boolean' ? t.code : truthyCheck(t.code, t.type)
      if (c.type !== a.type) {
        const __isRef = (x) => x === 'Object' || x === 'JSObject' || x === 'String'
        if (__isRef(c.type) || __isRef(a.type)) {
          const cc = c.type === 'String' ? c.code : 'String.valueOf(' + c.code + ')'
          const aa = a.type === 'String' ? a.code : 'String.valueOf(' + a.code + ')'
          return { code: '(' + tc + ' ? ' + cc + ' : ' + aa + ')', type: 'String' }
        }
      }
      return { code: '(' + tc + ' ? ' + c.code + ' : ' + a.code + ')', type: c.type === a.type ? c.type : 'Object' }
    }
    case 'ArrayExpression': {
      const el = node.elements.map(e => expr(e, ctx).code)
      return { code: 'new Object[]{' + el.join(', ') + '}', type: 'Object[]' }
    }
    case 'ChainExpression': {
      return expr(node.expression, ctx)
    }
    case 'AwaitExpression':
      return expr(node.argument, ctx)
    case 'NewExpression': {
      const __cn = node.callee.type === 'Identifier' ? node.callee.name : null
      if (__cn === 'Date') {
        const __A = node.arguments.map(a => expr(a, ctx).code)
        if (__A.length === 0) return { code: 'new java.util.Date()', type: 'DateObj' }
        if (__A.length === 1) return { code: 'new java.util.Date((long) ((Number) ' + __A[0] + ').doubleValue())', type: 'DateObj' }
        return { code: 'new java.util.Date()', type: 'Object' }
      }
      return { code: '/* new ' + (__cn || '?') + ' not supported */ null', type: 'Object' }
    }
    case 'ObjectExpression': {
      const parts = []
      for (const p of node.properties) {
        const k = p.key && (p.key.name || p.key.value)
        if (!k) continue
        const v = expr(p.value, ctx)
        parts.push(JSON.stringify(String(k)))
        parts.push(v.code)
      }
      return { code: 'obj(' + parts.join(', ') + ')', type: 'JSObject' }
    }
    default:
      return { code: '/* unsupported: ' + node.type + ' */ null', type: 'Object' }
  }
}

function translateStmtList(body, ctx, out, depth) {
  const list = body.type === 'BlockStatement' ? body.body : [body]
  for (const st of list) translateStmt(st, ctx, out, depth)
}

function translateStmt(st, ctx, out, depth) {
  const pad = '    '.repeat(depth + 2)
  switch (st.type) {
    case 'VariableDeclaration': {
      for (const d of st.declarations) {
        const e = d.init ? expr(d.init, ctx) : { code: 'null', type: 'Object' }
        const __jmap = { DateObj: 'java.util.Date', JSObject: 'Object', '__REF__': 'android.view.View' }
        const __jt = __jmap[e.type] || e.type
        ctx.localVars.set(d.id.name, e.type)
        out.push(pad + __jt + ' ' + d.id.name + ' = ' + e.code + ';')
      }
      break
    }
    case 'ReturnStatement':
      if (st.argument) out.push(pad + 'return ' + expr(st.argument, ctx).code + ';')
      else out.push(pad + 'return;')
      break
    case 'IfStatement': {
      const t = expr(st.test, ctx)
      const cond = t.type === 'boolean' ? t.code : truthyCheck(t.code, t.type)
      out.push(pad + 'if (' + cond + ') {')
      translateStmt(st.consequent, ctx, out, depth + 1)
      out.push(pad + '}')
      if (st.alternate) {
        if (st.alternate.type === 'IfStatement') {
          const tmp = []
          translateStmt(st.alternate, ctx, tmp, depth)
          out.push(pad + 'else ' + tmp.join('\n').trim())
        } else {
          out.push(pad + 'else {')
          translateStmt(st.alternate, ctx, out, depth + 1)
          out.push(pad + '}')
        }
      }
      break
    }
    case 'ExpressionStatement': {
      const e = st.expression
      if (e.type === 'UpdateExpression') {
        out.push(pad + e.argument.name + (e.operator === '++' ? '++' : '--') + ';')
      } else if (e.type === 'AssignmentExpression') {
        out.push(pad + e.left.name + ' ' + e.operator + ' ' + expr(e.right, ctx).code + ';')
      } else {
        out.push(pad + expr(e, ctx).code + ';')
      }
      break
    }
    case 'BlockStatement':
      translateStmtList(st, ctx, out, depth)
      break
    case 'ForStatement': {
      const init = st.init
      const test = st.test
      const update = st.update
      let initStr = ''
      if (init) {
        if (init.type === 'VariableDeclaration') {
          const d = init.declarations[0]
          const e = d.init ? expr(d.init, ctx) : { code: '0', type: 'int' }
          ctx.localVars.set(d.id.name, e.type)
          initStr = e.type + ' ' + d.id.name + ' = ' + e.code
        } else {
          initStr = expr(init, ctx).code
        }
      }
      const testStr = test ? expr(test, ctx).code : 'true'
      let updateStr = ''
      if (update) {
        if (update.type === 'UpdateExpression') {
          updateStr = update.argument.name + (update.operator === '++' ? '++' : '--')
        } else {
          updateStr = expr(update, ctx).code
        }
      }
      out.push(pad + 'for (' + initStr + '; ' + testStr + '; ' + updateStr + ') {')
      translateStmt(st.body, ctx, out, depth + 1)
      out.push(pad + '}')
      break
    }
    case 'ForOfStatement': {
      const left = st.left
      let varName
      if (left.type === 'VariableDeclaration') varName = left.declarations[0].id.name
      else varName = left.name
      ctx.localVars.set(varName, 'Object')
      const right = expr(st.right, ctx)
      out.push(pad + 'for (Object ' + varName + ' : asList(' + right.code + ')) {')
      translateStmt(st.body, ctx, out, depth + 1)
      out.push(pad + '}')
      break
    }
    case 'WhileStatement': {
      const cond = expr(st.test, ctx).code
      out.push(pad + 'while (' + cond + ') {')
      translateStmt(st.body, ctx, out, depth + 1)
      out.push(pad + '}')
      break
    }
    case 'DoWhileStatement': {
      out.push(pad + 'do {')
      translateStmt(st.body, ctx, out, depth + 1)
      const cond = expr(st.test, ctx).code
      out.push(pad + '} while (' + cond + ');')
      break
    }
    case 'BreakStatement':
      out.push(pad + 'break;')
      break
    case 'ContinueStatement':
      out.push(pad + 'continue;')
      break
    case 'SwitchStatement': {
      const disc = expr(st.discriminant, ctx)
      out.push(pad + 'switch (' + disc.code + ') {')
      for (const cs of st.cases) {
        if (cs.test === null) out.push(pad + '    default:')
        else {
          const v = expr(cs.test, ctx)
          out.push(pad + '    case ' + v.code + ':')
        }
        for (const sub of cs.consequent) translateStmt(sub, ctx, out, depth + 2)
      }
      out.push(pad + '}')
      break
    }
    case 'TryStatement': {
      out.push(pad + 'try {')
      translateStmt(st.block, ctx, out, depth + 1)
      out.push(pad + '}')
      if (st.handler) {
        const pn = st.handler.param ? st.handler.param.name : 'e'
        ctx.localVars.set(pn, 'Object')
        out.push(pad + 'catch (Exception ' + pn + ') {')
        translateStmt(st.handler.body, ctx, out, depth + 1)
        out.push(pad + '}')
      }
      if (st.finalizer) {
        out.push(pad + 'finally {')
        translateStmt(st.finalizer, ctx, out, depth + 1)
        out.push(pad + '}')
      }
      break
    }
    case 'ThrowStatement': {
      const v = st.argument ? expr(st.argument, ctx) : { code: 'null', type: 'Object' }
      if (v.type === 'String') out.push(pad + 'throw new RuntimeException(' + v.code + ');')
      else out.push(pad + 'throw new RuntimeException(String.valueOf(' + v.code + '));')
      break
    }
    default:
      out.push(pad + '// unsupported stmt: ' + st.type)
  }
}


export function discoverComputedTypes(src, sigs) {
  const cList = extractComputeds(src, sigs)
  const types = new Map()
  for (const c of cList) types.set(c.name, 'Object')
  for (let i = 0; i < 4; i++) {
    let changed = false
    for (const c of cList) {
      const r = translateArrowBody(src, c.arrow, { sigs, computedTypes: types })
      if (types.get(c.name) !== r.returnType) { types.set(c.name, r.returnType); changed = true }
    }
    if (!changed) break
  }
  return types
}


export function translateAsyncBody(src, arrowNode, opts) {
  const sigs = opts.sigs || new Map()
  const computedTypes = opts.computedTypes || new Map()
  const localVars = new Map()
  const lines = []
  const ctx = { src, sigs, computedTypes, localVars }
  translateStmtList(arrowNode.body, ctx, lines, 0)
  return { lines }
}

export function extractLifecycle(src, sigs, computedTypes) {
  let ast
  try { ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' }) }
  catch (e) { return { mount: null, unmount: null } }
  const out = { mount: null, unmount: null }
  for (const node of ast.body) {
    if (node.type !== 'ExpressionStatement') continue
    const c = node.expression
    if (c.type !== 'CallExpression') continue
    if (c.callee.type !== 'Identifier') continue
    const name = c.callee.name
    if (name !== 'onMount' && name !== 'onUnmount') continue
    const fn = c.arguments[0]
    if (!fn || fn.type !== 'ArrowFunctionExpression') continue
    const r = translateArrowBody(src, fn, { sigs, computedTypes })
    out[name === 'onMount' ? 'mount' : 'unmount'] = r.lines
  }
  return out
}

export function extractEffects(src, sigs, computedTypes) {
  let ast
  try { ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' }) }
  catch (e) { return [] }
  const out = []
  const allNames = new Set([...sigs.keys(), ...computedTypes.keys()])
  for (const node of ast.body) {
    if (node.type !== 'ExpressionStatement') continue
    const c = node.expression
    if (c.type !== 'CallExpression') continue
    if (c.callee.type !== 'Identifier' || c.callee.name !== 'effect') continue
    const fn = c.arguments[0]
    if (!fn || fn.type !== 'ArrowFunctionExpression') continue
    const deps = new Set()
    ;(function walk(n) {
      if (!n || typeof n !== 'object') return
      if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && allNames.has(n.callee.name) && n.arguments.length === 0) deps.add(n.callee.name)
      for (const k of Object.keys(n)) {
        if (['start','end','type','loc'].includes(k)) continue
        const v = n[k]
        if (Array.isArray(v)) v.forEach(walk)
        else if (v && typeof v === 'object' && v.type) walk(v)
      }
    })(fn.body)
    const r = translateArrowBody(src, fn, { sigs, computedTypes })
    out.push({ deps: [...deps], lines: r.lines })
  }
  return out
}

export function extractRefs(src) {
  let ast
  try { ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' }) }
  catch (e) { return [] }
  const out = []
  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration') continue
    for (const d of node.declarations) {
      if (d.id.type !== 'Identifier' || !d.init) continue
      if (d.init.type !== 'CallExpression') continue
      if (d.init.callee.type !== 'Identifier' || d.init.callee.name !== 'ref') continue
      out.push(d.id.name)
    }
  }
  return out
}

export function extractTopFunctions(src, sigs, computedTypes) {
  let ast
  try { ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' }) }
  catch (e) { return [] }
  const out = []
  const sigNames = new Set(sigs.keys())
  const computedNameSet = new Set(computedTypes.keys())
  for (const node of ast.body) {
    if (node.type !== 'VariableDeclaration') continue
    for (const d of node.declarations) {
      if (d.id.type !== 'Identifier') continue
      if (!d.init || d.init.type !== 'ArrowFunctionExpression') continue
      if (sigNames.has(d.id.name)) continue
      if (computedNameSet.has(d.id.name)) continue
      out.push({ name: d.id.name, arrow: d.init })
    }
  }
  return out
}


export const ARRAY_HELPERS = `
    private static Object jsonParse(String s) {
        try { return new org.json.JSONTokener(s).nextValue(); } catch (Exception e) { return null; }
    }
    private static String jsonStringify(Object o) {
        if (o == null) return "null";
        if (o instanceof String) return org.json.JSONObject.quote((String) o);
        if (o instanceof Number || o instanceof Boolean) return String.valueOf(o);
        if (o instanceof java.util.Map) return new org.json.JSONObject((java.util.Map<?, ?>) o).toString();
        if (o instanceof Iterable) { org.json.JSONArray a = new org.json.JSONArray(); for (Object x : (Iterable<?>) o) a.put(x); return a.toString(); }
        if (o instanceof Object[]) { org.json.JSONArray a = new org.json.JSONArray(); for (Object x : (Object[]) o) a.put(x); return a.toString(); }
        return org.json.JSONObject.quote(String.valueOf(o));
    }
    private static java.util.List<String> objKeys(Object o) {
        java.util.List<String> out = new java.util.ArrayList<>();
        if (o == null) return out;
        if (o instanceof java.util.Map) { for (Object k : ((java.util.Map<?, ?>) o).keySet()) out.add(String.valueOf(k)); return out; }
        if (o instanceof java.util.List) { for (int i = 0; i < ((java.util.List<?>) o).size(); i++) out.add(String.valueOf(i)); return out; }
        if (o instanceof Object[]) { for (int i = 0; i < ((Object[]) o).length; i++) out.add(String.valueOf(i)); return out; }
        return out;
    }
    private static java.util.List<Object> objValues(Object o) {
        java.util.List<Object> out = new java.util.ArrayList<>();
        if (o == null) return out;
        if (o instanceof java.util.Map) { for (Object v : ((java.util.Map<?, ?>) o).values()) out.add(v); return out; }
        if (o instanceof java.util.List) return new java.util.ArrayList<>((java.util.List<Object>) o);
        if (o instanceof Object[]) { for (Object v : (Object[]) o) out.add(v); return out; }
        return out;
    }
    private static java.util.List<Object[]> objEntries(Object o) {
        java.util.List<Object[]> out = new java.util.ArrayList<>();
        if (o == null) return out;
        if (o instanceof java.util.Map) { for (java.util.Map.Entry<?, ?> e : ((java.util.Map<?, ?>) o).entrySet()) out.add(new Object[]{ String.valueOf(e.getKey()), e.getValue() }); }
        return out;
    }
    private static long dateNow() { return System.currentTimeMillis(); }
    private static java.util.Map<Long, Runnable> __intervals = new java.util.HashMap<>();
    private static long __intervalId = 0;
    private static long setIntervalFn(Runnable fn, long ms) {
        final long id = ++__intervalId;
        __intervals.put(id, fn);
        final android.os.Handler h = new android.os.Handler(android.os.Looper.getMainLooper());
        Runnable loop = new Runnable() {
            @Override public void run() {
                Runnable g = __intervals.get(id);
                if (g == null) return;
                g.run();
                if (__intervals.containsKey(id)) h.postDelayed(this, ms);
            }
        };
        h.postDelayed(loop, ms);
        return id;
    }
    private static void clearIntervalFn(long id) { __intervals.remove(id); }
    private static void clearTimeoutFn(long id) { }
    private static String typeOf(Object o) {
        if (o == null) return "object";
        if (o instanceof Boolean) return "boolean";
        if (o instanceof Number) return "number";
        if (o instanceof String) return "string";
        return "object";
    }
    private static boolean inObj(Object obj, Object key) {
        if (obj == null || key == null) return false;
        if (obj instanceof java.util.Map) return ((java.util.Map<?, ?>) obj).containsKey(String.valueOf(key));
        if (obj instanceof java.util.List) {
            int idx = ((Number) key).intValue();
            return idx >= 0 && idx < ((java.util.List<?>) obj).size();
        }
        if (obj instanceof Object[]) {
            int idx = ((Number) key).intValue();
            return idx >= 0 && idx < ((Object[]) obj).length;
        }
        return false;
    }
    private static java.util.Map<String, Object> obj(Object... kv) {
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) m.put(String.valueOf(kv[i]), kv[i + 1]);
        return m;
    }
    @SuppressWarnings("unchecked")
    private static Object jsGet(Object o, String key) {
        if (o == null) return null;
        if (o instanceof java.util.Map) return ((java.util.Map<String, Object>) o).get(key);
        return null;
    }
    private static String numStr(Object o) {
        if (o == null) return "null";
        if (o instanceof Double) { double d = (Double) o; if (d == Math.floor(d) && !Double.isInfinite(d) && Math.abs(d) < 1e15) return String.valueOf((long) d); return String.valueOf(d); }
        if (o instanceof Float) { float f = (Float) o; if (f == Math.floor(f) && !Float.isInfinite(f) && Math.abs(f) < 1e15) return String.valueOf((long) f); return String.valueOf(f); }
        if (o instanceof java.util.Map) {
            java.util.Map<?, ?> map = (java.util.Map<?, ?>) o;
            StringBuilder sb = new StringBuilder("{");
            boolean __first = true;
            for (java.util.Map.Entry<?, ?> e : map.entrySet()) {
                if (!__first) sb.append(", ");
                __first = false;
                sb.append("\\"").append(String.valueOf(e.getKey())).append("\\": ");
                Object v = e.getValue();
                if (v instanceof String) sb.append("\\"").append(v).append("\\"");
                else if (v instanceof java.util.Map || v instanceof java.util.List || v instanceof Object[]) sb.append(numStr(v));
                else sb.append(String.valueOf(v));
            }
            return sb.append("}").toString();
        }
        if (o instanceof java.util.List) {
            java.util.List<?> list = (java.util.List<?>) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) { if (i > 0) sb.append(", "); sb.append(numStr(list.get(i))); }
            return sb.append("]").toString();
        }
        if (o instanceof Object[]) {
            Object[] arr = (Object[]) o;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) { if (i > 0) sb.append(", "); sb.append(numStr(arr[i])); }
            return sb.append("]").toString();
        }
        return String.valueOf(o);
    }
    private static Object normalizeNum(Object o) {
        if (o instanceof Double) { double d = (Double) o; if (d == Math.floor(d) && !Double.isInfinite(d) && Math.abs(d) < 1e15) return (long) d; }
        if (o instanceof Float) { float f = (Float) o; if (f == Math.floor(f) && !Float.isInfinite(f) && Math.abs(f) < 1e15) return (long) f; }
        return o;
    }
    private static java.util.List<Object> mapArr(Object src, java.util.function.Function<Object, Object> fn) {
        java.util.List<Object> out = new java.util.ArrayList<>();
        for (Object x : asList(src)) out.add(normalizeNum(fn.apply(x)));
        return out;
    }
    private static java.util.List<Object> filterArr(Object src, java.util.function.Predicate<Object> fn) {
        java.util.List<Object> out = new java.util.ArrayList<>();
        for (Object x : asList(src)) if (fn.test(x)) out.add(x);
        return out;
    }
    private static void forEachArr(Object src, java.util.function.Consumer<Object> fn) {
        for (Object x : asList(src)) fn.accept(x);
    }
    private static Object reduceArr(Object src, Object init, java.util.function.BiFunction<Object, Object, Object> fn) {
        Object acc = init;
        for (Object x : asList(src)) acc = fn.apply(acc, x);
        return normalizeNum(acc);
    }
    private static Object findArr(Object src, java.util.function.Predicate<Object> fn) {
        for (Object x : asList(src)) if (fn.test(x)) return x;
        return null;
    }
    private static boolean someArr(Object src, java.util.function.Predicate<Object> fn) {
        for (Object x : asList(src)) if (fn.test(x)) return true;
        return false;
    }
    private static boolean everyArr(Object src, java.util.function.Predicate<Object> fn) {
        for (Object x : asList(src)) if (!fn.test(x)) return false;
        return true;
    }
    private static java.util.List<Object> asList(Object o) {
        if (o == null) return new java.util.ArrayList<>();
        if (o instanceof java.util.List) return (java.util.List<Object>) o;
        if (o instanceof Object[]) { java.util.List<Object> r = new java.util.ArrayList<>(); for (Object x : (Object[]) o) r.add(x); return r; }
        java.util.List<Object> r = new java.util.ArrayList<>(); r.add(o); return r;
    }
    private static String joinArr(Object a, String sep) {
        java.util.List<Object> list = asList(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < list.size(); i++) { if (i > 0) sb.append(sep); sb.append(numStr(list.get(i))); }
        return sb.toString();
    }
    private static Object[] sliceArr(Object a, int from, int to) {
        java.util.List<Object> list = asList(a); int n = list.size();
        if (from < 0) from = Math.max(0, n + from);
        if (to < 0) to = Math.max(0, n + to);
        if (from > n) from = n; if (to > n) to = n;
        if (from > to) return new Object[0];
        return list.subList(from, to).toArray();
    }
    private static int indexOfArr(Object a, Object v) {
        java.util.List<Object> list = asList(a);
        for (int i = 0; i < list.size(); i++) if (v == null ? list.get(i) == null : v.equals(list.get(i))) return i;
        return -1;
    }
    private static Object[] concatArr(Object a, Object... rest) {
        java.util.List<Object> out = new java.util.ArrayList<>(asList(a));
        for (Object r : rest) out.addAll(asList(r));
        return out.toArray();
    }
    private static Object[] reverseArr(Object a) {
        java.util.List<Object> list = asList(a);
        Object[] r = new Object[list.size()];
        for (int i = 0; i < list.size(); i++) r[i] = list.get(list.size() - 1 - i);
        return r;
    }
    private static Object[] sortArr(Object a) {
        Object[] r = asList(a).toArray();
        java.util.Arrays.sort(r, (x, y) -> String.valueOf(x).compareTo(String.valueOf(y)));
        return r;
    }
`
