import { parse } from '@babel/parser'

function sourceOf(src, node) {
  return src.slice(node.start, node.end)
}

function jsxName(node) {
  if (!node) return ''
  if (node.type === 'JSXIdentifier') return node.name
  if (node.type === 'JSXMemberExpression') {
    return `${jsxName(node.object)}.${jsxName(node.property)}`
  }
  if (node.type === 'JSXNamespacedName') {
    return `${jsxName(node.namespace)}:${jsxName(node.name)}`
  }
  return ''
}

function normalizeText(value) {
  const lines = value.replace(/\r/g, '').split('\n')
  let out = ''

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\t/g, ' ')
    if (i !== 0) line = line.replace(/^\s+/, '')
    if (i !== lines.length - 1) line = line.replace(/\s+$/, '')
    if (!line) continue
    if (out) out += ' '
    out += line
  }

  return out
}

function transformElement(node, src) {
  const opening = node.openingElement
  const name = jsxName(opening.name)
  const isFragment = opening.name.type === 'JSXIdentifier' &&
    opening.name.name === '__XUNAY_FRAGMENT__'

  const props = []
  const events = []
  let spreadIndex = 0

  for (const attr of opening.attributes) {
    if (attr.type === 'JSXSpreadAttribute') {
      props.push(`...(${sourceOf(src, attr.argument)})`)
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
      const raw = transformNode(expr, src)
      if (/^on[A-Z]/.test(key)) {
        value = raw
      } else if (key === 'ref') {
        value = raw
      } else if (key === 'style' && expr.type === 'ObjectExpression') {
        value = raw
      } else {
        value = `() => (${raw})`
      }
    } else {
      throw new SyntaxError(`不支持的 JSX 属性值：${key}`)
    }

    if (/^on[A-Z]/.test(key)) {
      const eventName = key.slice(2).toLowerCase()
      events.push(`${JSON.stringify(eventName)}: ${value}`)
    } else {
      props.push(`${JSON.stringify(key)}: ${value}`)
    }
    spreadIndex++
  }

  if (events.length) {
    props.push(`on: { ${events.join(', ')} }`)
  }

  const children = []

  for (const child of node.children) {
    if (child.type === 'JSXText') {
      const text = normalizeText(child.value)
      if (text) children.push(JSON.stringify(text))
      continue
    }

    if (child.type === 'JSXExpressionContainer') {
      const expr = child.expression
      if (expr.type === 'JSXEmptyExpression') continue
      children.push(`() => (${transformNode(expr, src)})`)
      continue
    }

    if (child.type === 'JSXSpreadChild') {
      children.push(`...(${transformNode(child.expression, src)})`)
      continue
    }

    children.push(transformNode(child, src))
  }

  const propsArg = props.length ? `{ ${props.join(', ')} }` : 'null'
  const tag = isFragment ? 'fragment' : name
  return `${tag}(${propsArg}${children.length ? ', ' + children.join(', ') : ''})`
}

function transformNode(node, src) {
  if (!node || typeof node !== 'object') return ''

  if (node.type === 'JSXElement') {
    return transformElement(node, src)
  }

  if (node.type === 'JSXFragment') {
    const children = []
    for (const child of node.children) {
      if (child.type === 'JSXText') {
        const text = normalizeText(child.value)
        if (text) children.push(JSON.stringify(text))
      } else if (child.type === 'JSXExpressionContainer') {
        if (child.expression.type !== 'JSXEmptyExpression') {
          children.push(`() => (${transformNode(child.expression, src)})`)
        }
      } else {
        children.push(transformNode(child, src))
      }
    }
    return `fragment(null${children.length ? ', ' + children.join(', ') : ''})`
  }

  // 转换普通 JS 表达式内部的嵌套 JSX，例如三元表达式、map 回调和函数参数。
  const start = node.start
  const end = node.end
  if (typeof start !== 'number' || typeof end !== 'number') {
    return sourceOf(src, node)
  }

  const replacements = []
  function findNestedJSX(n) {
    if (!n || typeof n !== 'object') return

    if (n !== node && (n.type === 'JSXElement' || n.type === 'JSXFragment')) {
      replacements.push({
        start: n.start,
        end: n.end,
        value: transformNode(n, src)
      })
      return
    }

    for (const key of Object.keys(n)) {
      if (key === 'loc' || key === 'start' || key === 'end' ||
          key === 'extra' || key === 'comments' || key === 'tokens') continue
      const value = n[key]
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') findNestedJSX(item)
        }
      } else if (value && typeof value === 'object') {
        findNestedJSX(value)
      }
    }
  }

  findNestedJSX(node)
  if (!replacements.length) return sourceOf(src, node)

  let result = sourceOf(src, node)
  replacements.sort((a, b) => b.start - a.start)
  for (const item of replacements) {
    result = result.slice(0, item.start - start) +
      item.value +
      result.slice(item.end - start)
  }
  return result
}

function collectJSX(node, src, replacements) {
  if (!node || typeof node !== 'object') return

  if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
    replacements.push({
      start: node.start,
      end: node.end,
      code: transformNode(node, src),
    })
    return
  }

  for (const key of Object.keys(node)) {
    if (key === 'start' || key === 'end' || key === 'loc' ||
        key === 'tokens' || key === 'comments' || key === 'extra') continue

    const value = node[key]
    if (Array.isArray(value)) {
      for (const child of value) {
        if (child && typeof child.type === 'string') {
          collectJSX(child, src, replacements)
        }
      }
    } else if (value && typeof value.type === 'string') {
      collectJSX(value, src, replacements)
    }
  }
}

export function transformJSX(src) {
  if (!src.includes('<')) return src

  let ast
  try {
    ast = parse(src, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript'],
      errorRecovery: false,
    })
  } catch {
    // 普通 JavaScript 交给原有编译器处理错误和兼容逻辑。
    return src
  }

  const replacements = []
  collectJSX(ast, src, replacements)
  if (!replacements.length) return src

  replacements.sort((a, b) => b.start - a.start)
  let out = src

  for (const item of replacements) {
    out = out.slice(0, item.start) + item.code + out.slice(item.end)
  }

  return out
}
