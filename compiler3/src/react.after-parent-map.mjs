import { parse, parseExpression } from '@babel/parser'

const PARSER_OPTIONS = {
  sourceType: 'unambiguous',
  plugins: ['jsx', 'typescript'],
}

const EVENTS = {
  onDoubleClick: 'dblclick',
  onChange: 'change',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
}

function walk(node, fn, parent = null) {
  if (!node || typeof node !== 'object') return
  if (typeof node.type === 'string') fn(node, parent)
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue
    const value = node[key]
    if (Array.isArray(value)) {
      for (const item of value) walk(item, fn, node)
    } else if (value && typeof value.type === 'string') {
      walk(value, fn, node)
    }
  }
}

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end
}

function applyEdits(source, edits) {
  edits.sort((a, b) => b.start - a.start || b.end - a.end)
  let lastStart = source.length + 1
  let out = source

  for (const edit of edits) {
    if (edit.end > lastStart) {
      throw new Error(
        'XuNay React compiler: overlapping AST edits; ' +
        'current=[' + edit.start + ',' + edit.end + ') ' +
        'text=' + JSON.stringify(edit.text) +
        '; lastStart=' + lastStart +
        '; context=' + JSON.stringify(source.slice(
          Math.max(0, edit.start - 50),
          Math.min(source.length, edit.end + 50)
        ))
      )
    }
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end)
    lastStart = edit.start
  }
  return out
}

function jsxName(node) {
  if (node.type === 'JSXIdentifier') return node.name
  if (node.type === 'JSXMemberExpression') {
    return `${jsxName(node.object)}.${jsxName(node.property)}`
  }
  throw new Error('XuNay React compiler: unsupported JSX name')
}

function normalizeText(value) {
  const lines = value.replace(/\r/g, '').split('\n')
  let result = ''

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\t/g, ' ')
    if (i > 0) line = line.replace(/^\s+/, '')
    if (i < lines.length - 1) line = line.replace(/\s+$/, '')
    if (line && result) result += ' '
    result += line
  }
  return result
}

function collectState(ast) {
  const states = new Map()

  walk(ast, node => {
    if (node.type !== 'VariableDeclarator') return
    if (node.id.type !== 'ArrayPattern') return

    const init = node.init
    if (
      !init ||
      init.type !== 'CallExpression' ||
      init.callee.type !== 'Identifier' ||
      init.callee.name !== 'useState'
    ) return

    const [state, setter] = node.id.elements
    if (
      !state || state.type !== 'Identifier' ||
      !setter || setter.type !== 'Identifier'
    ) {
      throw new Error(
        'XuNay React compiler: useState requires [state, setState]'
      )
    }

    // State names are not globally unique in JavaScript.
    // Different components may declare the same state name.
    states.set(state.name, setter.name)
  })

  return states
}

function rewriteReads(expression, states, inheritedShadowed = new Set()) {
  if (!states.size) return expression

  let ast
  try {
    ast = parseExpression(expression, PARSER_OPTIONS)
  } catch {
    throw new Error(
      `XuNay React compiler: cannot parse expression: ${expression}`
    )
  }

  const edits = []
  const editKeys = new Set()

  function addEdit(start, end, text) {
    const key = `${start}:${end}:${text}`
    if (editKeys.has(key)) return

    // 不允许两个编辑修改重叠的源码区间。
    // 对象简写属性优先使用整个属性的编辑。
    for (const edit of edits) {
      if (start < edit.end && end > edit.start) {
        return
      }
    }

    editKeys.add(key)
    edits.push({ start, end, text })
  }

  function addPatternNames(pattern, names) {
    if (!pattern) return

    if (pattern.type === 'Identifier') {
      names.add(pattern.name)
      return
    }

    if (
      pattern.type === 'RestElement' ||
      pattern.type === 'AssignmentPattern'
    ) {
      addPatternNames(
        pattern.type === 'RestElement' ? pattern.argument : pattern.left,
        names
      )
      return
    }

    if (
      pattern.type === 'ArrayPattern' ||
      pattern.type === 'ArrayExpression'
    ) {
      for (const item of pattern.elements || []) {
        addPatternNames(item, names)
      }
      return
    }

    if (
      pattern.type === 'ObjectPattern' ||
      pattern.type === 'ObjectExpression'
    ) {
      for (const item of pattern.properties || []) {
        if (item.type === 'RestElement') {
          addPatternNames(item.argument, names)
        } else {
          addPatternNames(
            item.value || item.argument,
            names
          )
        }
      }
    }
  }

  // 收集当前函数的局部绑定，但不进入嵌套函数。
  // 内层函数的局部变量不能反过来屏蔽外层状态变量。
  function collectBindings(node, names, root = true) {
    if (!node || typeof node !== 'object') return

    if (
      !root &&
      (
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'ObjectMethod' ||
        node.type === 'ClassMethod'
      )
    ) {
      if (
        node.type === 'FunctionDeclaration' &&
        node.id
      ) {
        names.add(node.id.name)
      }
      return
    }

    if (node.type === 'VariableDeclarator') {
      addPatternNames(node.id, names)
    }

    if (
      node.type === 'FunctionDeclaration' &&
      node.id
    ) {
      names.add(node.id.name)
    }

    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue
      const value = node[key]

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item.type === 'string') {
            collectBindings(item, names, false)
          }
        }
      } else if (value && typeof value.type === 'string') {
        collectBindings(value, names, false)
      }
    }
  }

  function isBindingPosition(node, parent) {
    if (!parent) return false

    if (
      parent.type === 'VariableDeclarator' &&
      parent.id === node
    ) return true

    if (
      (
        parent.type === 'FunctionDeclaration' ||
        parent.type === 'FunctionExpression' ||
        parent.type === 'ClassDeclaration' ||
        parent.type === 'ClassExpression'
      ) &&
      parent.id === node
    ) return true

    if (
      (
        parent.type === 'FunctionDeclaration' ||
        parent.type === 'FunctionExpression' ||
        parent.type === 'ArrowFunctionExpression' ||
        parent.type === 'ObjectMethod' ||
        parent.type === 'ClassMethod'
      ) &&
      (parent.params || []).includes(node)
    ) return true

    if (
      parent.type === 'MemberExpression' &&
      parent.property === node &&
      !parent.computed
    ) return true

    if (
      parent.type === 'OptionalMemberExpression' &&
      parent.property === node &&
      !parent.computed
    ) return true

    if (
      parent.type === 'ObjectProperty' &&
      parent.key === node &&
      !parent.computed &&
      !parent.shorthand
    ) return true

    if (
      parent.type === 'ObjectMethod' &&
      parent.key === node &&
      !parent.computed
    ) return true

    if (
      parent.type === 'LabeledStatement' &&
      parent.label === node
    ) return true

    if (
      (
        parent.type === 'BreakStatement' ||
        parent.type === 'ContinueStatement'
      ) &&
      parent.label === node
    ) return true

    if (
      parent.type === 'ImportSpecifier' ||
      parent.type === 'ImportDefaultSpecifier' ||
      parent.type === 'ImportNamespaceSpecifier'
    ) return true

    return false
  }

  function visit(node, parent, inheritedShadowed) {
    if (!node || typeof node !== 'object') return

    let shadowed = inheritedShadowed

    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'ObjectMethod' ||
      node.type === 'ClassMethod'
    ) {
      shadowed = new Set(inheritedShadowed)

      for (const param of node.params || []) {
        addPatternNames(param, shadowed)
      }

      collectBindings(node.body, shadowed)
    }

    if (
      node.type === 'Identifier' &&
      states.has(node.name) &&
      !isBindingPosition(node, parent) &&
      !shadowed.has(node.name)
    ) {
      // 已经是 count() 时，不重复包装。
      const alreadyCalled =
        parent &&
        parent.type === 'CallExpression' &&
        parent.callee === node

      if (!alreadyCalled) {
        // 对象属性 key/value 可能是不同 AST 节点，
        // 但源码范围相同或重叠。key 不单独改写，
        // 由 value 分支统一替换整个 shorthand 属性。
        if (
          parent &&
          parent.type === 'ObjectProperty' &&
          parent.shorthand &&
          parent.key === node &&
          parent.value !== node
        ) {
          // key 交给 value 处理。
        } else if (
          parent &&
          parent.type === 'ObjectProperty' &&
          parent.shorthand &&
          parent.value === node
        ) {
          // shorthand 的 key/value 可能是同一个 AST 节点。
          // 整个属性只添加一次编辑，避免重叠。
          addEdit(
            parent.start,
            parent.end,
            `${node.name}: ${node.name}()`
          )
        } else {
          addEdit(
            node.start,
            node.end,
            `${node.name}()`
          )
        }
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue
      const value = node[key]

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item.type === 'string') {
            visit(item, node, shadowed)
          }
        }
      } else if (value && typeof value.type === 'string') {
        visit(value, node, shadowed)
      }
    }
  }

  visit(ast, null, new Set(inheritedShadowed))
  return applyEdits(expression, edits)
}

function expressionOf(source, node, states, sourceAst, parentMap) {
  // JSX 表达式单独编译时，恢复原始源码中的外层函数参数作用域。
  const inheritedShadowed = new Set()
  const functionTypes = new Set([
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
    'ObjectMethod',
    'ClassMethod',
  ])

  sourceAst ||= parse(source, PARSER_OPTIONS)
  if (!parentMap) {
    parentMap = new WeakMap()
    walk(sourceAst, (current, parent) => {
      if (parent) parentMap.set(current, parent)
    })
  }

  function collectPatternIdentifiers(pattern) {
    if (!pattern) return

    if (pattern.type === 'Identifier') {
      inheritedShadowed.add(pattern.name)
      return
    }

    if (
      pattern.type === 'RestElement' ||
      pattern.type === 'AssignmentPattern'
    ) {
      collectPatternIdentifiers(
        pattern.type === 'RestElement' ? pattern.argument : pattern.left
      )
      return
    }

    if (pattern.type === 'ArrayPattern') {
      for (const item of pattern.elements || []) {
        collectPatternIdentifiers(item)
      }
      return
    }

    if (pattern.type === 'ObjectPattern') {
      for (const item of pattern.properties || []) {
        if (item.type === 'RestElement') {
          collectPatternIdentifiers(item.argument)
        } else {
          collectPatternIdentifiers(item.value)
        }
      }
    }
  }

  let currentFunction = node
  while (currentFunction) {
    if (functionTypes.has(currentFunction.type)) {
      for (const param of currentFunction.params || []) {
        collectPatternIdentifiers(param)
      }
    }
    currentFunction = parentMap.get(currentFunction) || null
  }

  const edits = []

  walk(node, (current, parent) => {
    if (current.type !== 'JSXElement') return

    // 外层 JSX 会递归转换内部 JSX，避免产生重叠编辑。
    if (
      parent &&
      (parent.type === 'JSXElement' ||
       parent.type === 'JSXFragment')
    ) return

    edits.push({
      start: current.start - node.start,
      end: current.end - node.start,
      text: transformJSX(current, source, states, sourceAst),
    })
  })

  let expression = source.slice(node.start, node.end)

  if (edits.length) {
    expression = applyEdits(expression, edits)
  }

  return rewriteReads(expression, states, inheritedShadowed)
}

function transformJSX(node, source, states, sourceAst, parentMap) {
  if (node.type === 'JSXFragment') {
    throw new Error(
      'XuNay React compiler: fragments are not supported in this first version'
    )
  }

  const opening = node.openingElement
  const rawName = jsxName(opening.name)

  // This version deliberately handles native DOM tags only.
  // Calling a React function component as a DOM tag would be incorrect.
  if (!/^[a-z][a-z0-9-]*$/.test(rawName)) {
    throw new Error(
      `XuNay React compiler: custom component "${rawName}" is not supported yet`
    )
  }

  const props = []
  const events = []
  const children = []

  for (const attr of opening.attributes) {
    if (attr.type === 'JSXSpreadAttribute') {
      props.push(`...(${expressionOf(source, attr.argument, states, sourceAst, parentMap)})`)
      continue
    }

    const key = jsxName(attr.name)
    let value

    if (!attr.value) {
      value = 'true'
    } else if (attr.value.type === 'StringLiteral') {
      value = JSON.stringify(attr.value.value)
    } else if (attr.value.type === 'JSXExpressionContainer') {
      const expr = attr.value.expression
      if (expr.type === 'JSXEmptyExpression') continue

      const raw = expressionOf(source, expr, states, sourceAst, parentMap)

      if (/^on[A-Z]/.test(key)) {
        value = raw
      } else if (key === 'ref' || key === 'style') {
        value = raw
      } else {
        value = `() => (${raw})`
      }
    } else {
      throw new Error(`XuNay React compiler: unsupported attribute "${key}"`)
    }

    if (/^on[A-Z]/.test(key)) {
      const event = EVENTS[key] || key.slice(2).toLowerCase()
      events.push(`${JSON.stringify(event)}: ${value}`)
    } else {
      const normalizedKey = key === 'className' ? 'class' : key
      props.push(`${JSON.stringify(normalizedKey)}: ${value}`)
    }
  }

  if (events.length) props.push(`on: { ${events.join(', ')} }`)

  for (const child of node.children) {
    if (child.type === 'JSXText') {
      const text = normalizeText(child.value)
      if (text) children.push(JSON.stringify(text))
    } else if (child.type === 'JSXExpressionContainer') {
      const expr = child.expression
      if (expr.type !== 'JSXEmptyExpression') {
        children.push(`() => (${expressionOf(source, expr, states, sourceAst, parentMap)})`)
      }
    } else if (child.type === 'JSXSpreadChild') {
      throw new Error('XuNay React compiler: spread children are unsupported')
    } else if (
      child.type === 'JSXElement' ||
      child.type === 'JSXFragment'
    ) {
      children.push(transformJSX(child, source, states, sourceAst, parentMap))
    }
  }

  return `createElement(${JSON.stringify(rawName)}, { ${props.join(', ')} }${
    children.length ? ', ' + children.join(', ') : ''
  })`
}

/**
 * Compile a limited React/JSX subset into XuNay's native reactive runtime.
 *
 * Supported:
 * - useState([state, setter]) with a single identifier for each
 * - Native lowercase JSX tags
 * - Dynamic text and ordinary dynamic attributes
 * - DOM event props such as onClick and onInput
 *
 * Not yet supported: custom components, fragments, useEffect, useContext,
 * useReducer, conditional hook calls, and React-specific event semantics.
 */
export function compileReact(source, options = {}) {
  const runtimeModule = options.runtimeModule || 'xunay'
  const ast = parse(source, PARSER_OPTIONS)
  const sourceAst = ast
  const parentMap = new WeakMap()
  walk(ast, (node, parent) => {
    if (parent) parentMap.set(node, parent)
  })
  const states = collectState(ast)
  const edits = []
  const jsxRanges = []

  walk(ast, (node, parent) => {
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
      // The outer JSX transform recursively handles nested JSX,
      // including JSX inside expression containers and callbacks.
      if (jsxRanges.some(range =>
        node.start >= range.start && node.end <= range.end
      )) return

      edits.push({
        start: node.start,
        end: node.end,
        text: transformJSX(node, source, states, sourceAst, parentMap),
      })
      jsxRanges.push({ start: node.start, end: node.end })
    }
  })

  const hookRanges = []
  const shadowRanges = []

  // Collect useState edits and parameter shadow ranges in one AST pass.
  walk(ast, node => {
    if (
      node.type === 'VariableDeclarator' &&
      node.id.type === 'ArrayPattern' &&
      node.init &&
      node.init.type === 'CallExpression' &&
      node.init.callee.type === 'Identifier' &&
      node.init.callee.name === 'useState'
    ) {
      hookRanges.push({ start: node.start, end: node.end })

      const [state, setter] = node.id.elements
      const initial = node.init.arguments[0]
        ? source.slice(
            node.init.arguments[0].start,
            node.init.arguments[0].end
          )
        : 'undefined'

      edits.push({
        start: node.start,
        end: node.end,
        text: ` ${state.name} = signal(${initial}), ${setter.name} = ${state.name}`,
      })
    }

    if (
      node.type !== 'FunctionDeclaration' &&
      node.type !== 'FunctionExpression' &&
      node.type !== 'ArrowFunctionExpression' &&
      node.type !== 'ObjectMethod' &&
      node.type !== 'ClassMethod'
    ) return

    const names = new Set()
    for (const param of node.params || []) {
      walk(param, binding => {
        if (binding.type === 'Identifier') names.add(binding.name)
      })
    }

    if (names.size) {
      shadowRanges.push({
        start: node.start,
        end: node.end,
        names,
      })
    }
  })

  walk(ast, (node, parent) => {
    if (node.type !== 'Identifier' || !states.has(node.name)) return
    if (parent && parent.type === 'VariableDeclarator' && parent.id === node) return
    if (parent && parent.type === 'ArrayPattern') return

    if (hookRanges.some(r => node.start >= r.start && node.end <= r.end)) return
    if (shadowRanges.some(r =>
      node.start >= r.start &&
      node.end <= r.end &&
      r.names.has(node.name)
    )) return

    let current = parent
    let insideJSX = false
    while (current) {
      if (
        current.type === 'JSXElement' ||
        current.type === 'JSXFragment' ||
        current.type === 'JSXExpressionContainer'
      ) {
        insideJSX = true
        break
      }
      current = null
    }
    if (insideJSX || jsxRanges.some(range => overlaps(range, node))) return

    if (
      parent &&
      parent.type === 'ObjectProperty' &&
      parent.shorthand &&
      parent.value === node
    ) {
      edits.push({
        start: parent.start,
        end: parent.end,
        text: `${node.name}: ${node.name}()`,
      })
      return
    }

    if (
      parent &&
      (
        (parent.type === 'MemberExpression' &&
          parent.property === node && !parent.computed) ||
        (parent.type === 'OptionalMemberExpression' &&
          parent.property === node && !parent.computed) ||
        (parent.type === 'ObjectProperty' &&
          parent.key === node && !parent.computed) ||
        (parent.type === 'CallExpression' && parent.callee === node) ||
        (parent.type === 'VariableDeclarator' && parent.id === node)
      )
    ) return

    // Skip the original useState tuple, which is replaced as a whole.
    const inHookDeclaration = (() => {
      let current = parent
      while (current) {
        if (
          current.type === 'VariableDeclarator' &&
          current.id.type === 'ArrayPattern' &&
          current.init?.type === 'CallExpression' &&
          current.init.callee?.name === 'useState'
        ) return true
        current = null
      }
      return false
    })()
    if (inHookDeclaration) return

    edits.push({
      start: node.start,
      end: node.end,
      text: `${node.name}()`,
    })
  })

  let output = applyEdits(source, edits)

  const imports = []
  if (states.size) imports.push('signal')
  if (jsxRanges.length) imports.push('createElement')

  if (imports.length) {
    output = `import { ${imports.join(', ')} } from ${JSON.stringify(runtimeModule)};\n${output}`
  }

  return output
}

export default compileReact
