import { translateCss } from './css-android.js'
import { parse as acornParse } from 'acorn'
import { extractComputeds as j2jExtract, translateArrowBody, translateAsyncBody, discoverComputedTypes, expr as j2jExpr, extractTopFunctions as j2jExtractTop, extractLifecycle, extractEffects, extractRefs, ARRAY_HELPERS } from './js-to-java.js'
let idCounter = 0
function nextId() { return 'v' + (idCounter++) }
function resetId() { idCounter = 0 }

const XML_TAG = {
  div: 'LinearLayout', span: 'TextView', p: 'TextView',
  h1: 'TextView', h2: 'TextView', h3: 'TextView',
  h4: 'TextView', h5: 'TextView', h6: 'TextView',
  button: 'Button', input: 'EditText', textarea: 'EditText',
  checkbox: 'CheckBox', switch: 'Switch', radio: 'RadioButton', img: 'ImageView',
  progress: 'ProgressBar', slider: 'SeekBar',
  form: 'LinearLayout', label: 'TextView',
  ul: 'LinearLayout', ol: 'LinearLayout', li: 'LinearLayout',
  table: 'LinearLayout', tr: 'LinearLayout', td: 'LinearLayout', th: 'TextView',
  a: 'TextView', select: 'android.widget.Spinner', option: 'TextView',
  video: 'android.widget.VideoView', audio: 'android.widget.VideoView',
  hr: 'View', br: 'View', pre: 'TextView', code: 'TextView',
  strong: 'TextView', em: 'TextView', b: 'TextView', i: 'TextView',
  section: 'LinearLayout', main: 'LinearLayout', aside: 'LinearLayout',
  nav: 'LinearLayout', header: 'LinearLayout', footer: 'LinearLayout',
}
const TEXT_CLASSES = new Set(['Button', 'TextView', 'EditText', 'CheckBox', 'Switch', 'RadioButton'])
const CHECK_CLASSES = new Set(['CheckBox', 'Switch', 'RadioButton'])
const SEEKBAR_CLASSES = new Set(['ProgressBar', 'SeekBar'])
const H_SIZE = { h1: 32, h2: 28, h3: 24, h4: 20, h5: 18, h6: 16 }

function genMultiPage(source, ast, rules, sigs, sigsJ2J, computedTypes, computedNames, computedArrows, computedMethodsStr, __effectCode, __lc, __refs, __refFields) {
  resetId()
  const pages = []
  const activityNames = []
  const layoutNames = []
  const files = {}
  for (let i = 0; i < ast.pages.length; i++) {
    const pageName = ast.pages[i]
    const pageNode = ast[i]
    if (!pageNode || !pageNode.node) continue
    const clsName = i === 0 ? 'MainActivity' : (pageName[0].toUpperCase() + pageName.slice(1).replace(/[^a-zA-Z0-9]/g, '') + 'Activity')
    const layName = 'activity_' + (i === 0 ? 'main' : pageName.toLowerCase().replace(/[^a-z0-9]/g, '_'))
    activityNames.push(clsName)
    layoutNames.push(layName)
  }
  for (let i = 0; i < ast.pages.length; i++) {
    const pageName = ast.pages[i]
    const pageNode = ast[i]
    if (!pageNode || !pageNode.node) continue
    resetId()
    const clsName = activityNames[i]
    const layName = layoutNames[i]
    const ctx = {
      binds: [], events: [], shows: [], lists: [], progressBinds: [],
      rootId: null, sigs, sigsJ2J, computedTypes, computedNames, computedArrows, computedMethodsStr,
      animations: [], javaStyles: [], formSubmit: null, src: (ast.expandedSrc || source),
      refs: __refs, keyframes: {},
    }
    ctx.rootId = nextId()
    const xmlBody = walkXml(pageNode.node, '    ', ctx, true, rules, [], true, true)
    const xml = '<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="vertical"\n    android:fitsSystemWindows="true">\n\n' + xmlBody + '\n\n</LinearLayout>\n'
    const __routesForThis = {}
    for (let __j = 0; __j < ast.pages.length; __j++) {
      if (__j === i) continue
      __routesForThis[ast.pages[__j]] = activityNames[__j]
    }
    const java = buildJava(
      extractSignals(source),
      ctx, sigs, (ast[0] && ast[0].lang) || null,
      __lc.mount ? __lc.mount.join('\n') : '',
      __lc.unmount ? __lc.unmount.join('\n') : '',
      __effectCode, __refFields, clsName, layName, __routesForThis
    )
    files['app/src/main/java/com/xunay/app/' + clsName + '.java'] = java
    files['app/src/main/res/layout/' + layName + '.xml'] = xml
  }
  files['app/src/main/java/com/xunay/app/Signal.java'] = SIGNAL_RUNTIME
  // 生成带所有 Activity 的 Manifest
  const __acts = activityNames.map((a, i) => {
    const isMain = i === 0
    return '        <activity android:name=".' + a + '"' + (isMain ? ' android:exported="true"' : '') + '>\n' +
      (isMain ? '            <intent-filter>\n                <action android:name="android.intent.action.MAIN"/>\n                <category android:name="android.intent.category.LAUNCHER"/>\n            </intent-filter>\n' : '') +
      '        </activity>'
  }).join('\n')
  files['app/src/main/AndroidManifest.xml'] = '<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <uses-permission android:name="android.permission.INTERNET"/>\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>\n    <application android:label="xunay" android:theme="@android:style/Theme.Material.Light.NoActionBar" android:configChanges="uiMode|orientation|screenSize">\n' + __acts + '\n    </application>\n</manifest>\n'
  files['app/build.gradle'] = BUILD_GRADLE
  files['settings.gradle'] = SETTINGS_GRADLE
  files['gradle.properties'] = GRADLE_PROPERTIES
  return { files }
}

export function genAndroid(source, ast) {
  resetId()
  const signals = extractSignals(source)
  const JAVA2J2J = { Integer: 'int', Double: 'double', String: 'String', Boolean: 'boolean', Object: 'Object', 'JSObject': 'JSObject', 'java.util.List<Object>': 'java.util.List<Object>' }
  const sigs = new Map(signals.map(x => [x.name, x.javaType]))
  const sigsJ2J = new Map(signals.map(x => [x.name, JAVA2J2J[x.javaType] || 'Object']))
  const computedTypes = discoverComputedTypes(source, sigsJ2J)
  const computedNames = new Set(computedTypes.keys())
  for (const __cn of computedNames) if (!sigs.has(__cn)) sigs.set(__cn, '__COMPUTED__')
  const computedArrows = new Map()
  for (const c of j2jExtract(source, sigsJ2J)) computedArrows.set(c.name, c.arrow)
  const topFunctions = j2jExtractTop(source, sigsJ2J, computedTypes)
  for (const fn of topFunctions) {
    if (!computedTypes.has(fn.name)) {
      computedTypes.set(fn.name, 'void')
      computedArrows.set(fn.name, fn.arrow)
    }
  }
  const __refs = extractRefs(source)
  for (const __r of __refs) sigsJ2J.set(__r, '__REF__')
  const __refFields = __refs.map(r => '    private android.view.View ' + r + ';\n').join('')
  const __effects = extractEffects(source, sigsJ2J, computedTypes)
  const __effectCode = __effects.flatMap(e => {
    if (!e.deps.length) return []
    return e.deps.map(d => '        ' + d + '.subscribe(val -> {' + String.fromCharCode(10) + e.lines.map(l => '    ' + l).join(String.fromCharCode(10)) + String.fromCharCode(10) + '        });')
  }).join(String.fromCharCode(10))
  const __lc = extractLifecycle(source, sigsJ2J, computedTypes)
  const __onMountCode = __lc.mount ? __lc.mount.join('\n') : ''
  const __onUnmountCode = __lc.unmount ? __lc.unmount.join('\n') : ''
  const computedMethodsStr = [...computedArrows.entries()].map(([name, arrow]) => {
    const { lines, returnType } = translateArrowBody(source, arrow, { sigs: sigsJ2J, computedTypes })
    const __rt = returnType === 'JSObject' ? 'Object' : returnType
    return '    private ' + __rt + ' ' + name + '() {\n' + lines.join('\n') + '\n    }'
  }).join('\n\n')
  const ctx = {
    binds: [], events: [], shows: [], lists: [], progressBinds: [],
    rootId: null,
    sigs,
    sigsJ2J,
    computedTypes,
    computedNames,
    computedArrows,
    computedMethodsStr,
    animations: [],
    javaStyles: [],
    formSubmit: null,
    src: (ast.expandedSrc || source),
    refs: __refs,
  }
  const cssText = (ast[0] && ast[0].css) || ''
  const langTable = (ast[0] && ast[0].lang) || null
  const rules = parseCSS(cssText)
  const __keyframes = {}
  for (const __r of rules) {
    if (__r.__isKeyframes) __keyframes[__r.name] = __r.frames
  }
  ctx.keyframes = __keyframes
  if (ast.pages && ast.pages.length > 1) {
    return genMultiPage(source, ast, rules, sigs, sigsJ2J, computedTypes, computedNames, computedArrows, computedMethodsStr, __effectCode, __lc, __refs, __refFields)
  }
  const root = ast.find(r => r.node.type === 'tag')
  let xmlBody = ''
  if (root) {
    ctx.rootId = nextId()
    xmlBody = walkXml(root.node, '    ', ctx, true, rules, [], true, true)
  }
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:fitsSystemWindows="true">

${xmlBody}

</LinearLayout>
`
  const java = buildJava(signals, ctx, sigs, langTable, __onMountCode, __onUnmountCode, __effectCode, __refFields, undefined, undefined, {})
  // 清洗: String(x.get()) -> String.valueOf(x.get())
  const javaClean = java.replace(/\bString\(([^()]+\.get\(\))\)/g, 'String.valueOf($1)')
  return {
    files: {
      'app/src/main/java/com/xunay/app/MainActivity.java': javaClean,
      'app/src/main/res/layout/activity_main.xml': xml,
      'app/src/main/java/com/xunay/app/Signal.java': SIGNAL_RUNTIME,
      'app/src/main/AndroidManifest.xml': MANIFEST,
      'app/build.gradle': BUILD_GRADLE,
      'settings.gradle': SETTINGS_GRADLE,
      'gradle.properties': GRADLE_PROPERTIES,
    }
  }
}

function extractSignals(src) {
  const out = []
  const re = /(?:const|let|var)\s+(\w+)\s*=\s*(?:s|signal)\(\s*([\s\S]*?)\s*\)(?=\s*(?:\n|$))/g
  let m
  while ((m = re.exec(src))) {
    const parts = splitTop(m[2])
    const init = convertJsLiteral(parts[0])
    const persistKey = parts[1] ? toPlainString(parts[1]) : null
    out.push({ name: m[1], init, javaType: inferType(init), persistKey })
  }
  return out
}

function inferType(init) {
  if (/^-?\d+$/.test(init)) return 'Integer'
  if (/^-?\d+\.\d+$/.test(init)) return 'Double'
  if (/^".*"$/.test(init)) return 'String'
  if (init === 'true' || init === 'false') return 'Boolean'
  if (init.startsWith('new java.util.ArrayList')) return 'java.util.List<Object>'
  if (init.startsWith('obj(')) return 'JSObject'
  return 'Object'
}

function convertJsLiteral(v) {
  v = v.trim()
  if (v === '') return '""'
  if (/^'(.*)'$/.test(v)) return '"' + v.slice(1, -1).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  if (/^"(.*)"$/.test(v)) return v
  if (/^\[([\s\S]*)\]$/.test(v)) {
    const inner = v.slice(1, -1).trim()
    if (!inner) return 'new java.util.ArrayList<>()'
    const items = splitTop(inner).map(x => convertJsLiteral(x.trim()))
    return 'new java.util.ArrayList<>(java.util.Arrays.asList(' + items.join(', ') + '))'
  }
  if (/^-?\d+(\.\d+)?$/.test(v)) return v
  if (v === 'true' || v === 'false') return v
  if (/^\{([\s\S]*)\}$/.test(v)) {
    const inner = v.slice(1, -1).trim()
    if (!inner) return 'obj()'
    const parts = []
    for (const pair of splitTop(inner)) {
      const idx = pair.indexOf(':')
      if (idx < 0) continue
      const k = pair.slice(0, idx).trim().replace(/^['"]|['"]$/g, '')
      const val = pair.slice(idx + 1).trim()
      parts.push(JSON.stringify(k))
      parts.push(convertJsLiteral(val))
    }
    return 'obj(' + parts.join(', ') + ')'
  }
  return 'null'
}

function splitTop(s) {
  const out = []; let depth = 0, cur = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') { const q = c; cur += c; i++; while (i < s.length && s[i] !== q) { if (s[i] === '\\') { cur += s[i] + s[i+1]; i += 2; continue } cur += s[i]; i++ } cur += s[i] || ''; continue }
    if (c === '(' || c === '[' || c === '{') depth++
    if (c === ')' || c === ']' || c === '}') depth--
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; continue }
    cur += c
  }
  if (cur.trim()) out.push(cur)
  return out
}

function parseStyleObj(s) {
  s = String(s || '').trim()
  if (!s) return []
  if (s.startsWith('{')) {
    try {
      const ast = acornParse('(' + s + ')', { ecmaVersion: 2022 })
      const obj = ast.body[0].expression
      if (obj.type === 'ObjectExpression') {
        const out = []
        for (const p of obj.properties) {
          const k = p.key.name || p.key.value
          const v = p.value
          if (v.type === 'Literal') out.push({ k, v: String(v.value) })
          else if (v.type === 'TemplateLiteral') {
            let str = ''
            for (let i = 0; i < v.quasis.length; i++) {
              str += v.quasis[i].value.raw
              if (i < v.expressions.length) str += '${' + (v.expressions[i].name || '?') + '}'
            }
            out.push({ k, v: str })
          } else if (v.type === 'Identifier') out.push({ k, v: v.name })
          else out.push({ k, v: '' })
        }
        return out
      }
    } catch (e) { /* fallthrough */ }
  }
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) s = s.slice(1, -1)
  s = s.trim()
  if (s.startsWith('{')) s = s.slice(1)
  if (s.endsWith('}')) s = s.slice(0, -1)
  s = s.trim()
  if (!s) return []
  return s.split(';').map(item => {
    const idx = item.indexOf(':')
    if (idx < 0) return null
    const k = item.slice(0, idx).trim().replace(/^['"]|['"]$/g, '')
    const v = item.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
    return k ? { k, v } : null
  }).filter(Boolean)
}

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function toPlainString(s) {
  s = s.trim()
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1)
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1)
  return s
}

function normalizeHex(v) {
  v = v.replace(/^['"]|['"]$/g, '')
  if (v.startsWith('#')) {
    let c = v.slice(1)
    if (c.length === 3) c = c.split('').map(x => x + x).join('')
    return '#' + c
  }
  return v
}

function styleToXmlAttrs(styleStr) {
  const attrs = []
  const items = parseStyleObj(styleStr)
  for (const item of items) {
    const v = normalizeHex(item.v)
    switch (item.k) {
      case 'color': attrs.push('android:textColor="' + v + '"'); break
      case 'background':
      case 'backgroundColor': attrs.push('android:background="' + v + '"'); break
      case 'fontSize': attrs.push('android:textSize="' + v + 'sp"'); break
      case 'padding': attrs.push('android:padding="' + v + 'dp"'); break
      case 'textAlign': {
        const g = v === 'center' ? 'center' : v === 'right' ? 'right' : 'left'
        attrs.push('android:gravity="' + g + '"')
        break
      }
    }
  }
  return attrs
}

function getTemplateInfo(expr) {
  const m = expr.match(/^txt`([\s\S]*?)`$/)
  if (!m) return null
  const body = m[1]
  // 匹配 ${sig} 或 ${sig 运算}
  const sm = body.match(/\$\{\s*(\w+)\s*([+\-*\/])\s*(-?\d+(?:\.\d+)?)\s*\}/)
  if (sm) {
    return { sig: sm[1], prefix: body.slice(0, sm.index), op: sm[2], num: sm[3] }
  }
  const sm2 = body.match(/\$\{\s*(\w+)\s*\}/)
  if (!sm2) return null
  return { sig: sm2[1], prefix: body.slice(0, sm2.index) }
}


function collectSigs(node, sigMap, computedArrows) {
  const names = new Set()
  function walk(n) {
    if (!n) return
    if (n.type === 'MemberExpression') {
      walk(n.object)
      if (n.computed) walk(n.property)
      return
    }
    if (n.type === 'ObjectExpression') {
      for (const p of n.properties) walk(p.value)
      return
    }
    if (n.type === 'Property') {
      walk(n.value)
      return
    }
    if (n.type === 'Identifier') {
      const __t = sigMap.get(n.name)
      if (__t && __t !== '__COMPUTED__') names.add(n.name)
      else if (__t === '__COMPUTED__' && computedArrows && computedArrows.has(n.name)) {
        const __arrow = computedArrows.get(n.name)
        walk(__arrow.body)
      }
    }
    for (const k of Object.keys(n)) {
      if (['start','end','type','loc'].includes(k)) continue
      const v = n[k]
      if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object' && v.type) walk(v)
    }
  }
  walk(node)
  return [...names]
}

function mapToJava(arrowAst, sigs) {
  if (!arrowAst || arrowAst.type !== 'ArrowFunctionExpression') return null
  const param = arrowAst.params[0] && arrowAst.params[0].name
  if (!param) return null
  function walk(n) {
    if (!n) return 'null'
    if (n.type === 'Identifier') {
      if (n.name === param) return '__it'
      if (sigs.has(n.name)) return n.name + '.get()'
      return n.name
    }
    if (n.type === 'Literal') return typeof n.value === 'string' ? JSON.stringify(n.value) : String(n.value)
    if (n.type === 'BinaryExpression') {
      let l = walk(n.left), r = walk(n.right)
      if (n.left.type === 'Identifier' && n.left.name === param) l = '((Number) __it).doubleValue()'
      if (n.right.type === 'Identifier' && n.right.name === param) r = '((Number) __it).doubleValue()'
      return '(' + l + ' ' + n.operator + ' ' + r + ')'
    }
    if (n.type === 'MemberExpression') {
      const obj = walk(n.object)
      return obj + '.' + n.property.name
    }
    if (n.type === 'CallExpression') {
      if (n.callee.type === 'MemberExpression' && n.callee.property.name === 'includes') {
        return '((String) __it).contains(String.valueOf(' + walk(n.arguments[0]) + '))'
      }
      const c = walk(n.callee), args = n.arguments.map(walk).join(', ')
      return c + '(' + args + ')'
    }
    return 'null'
  }
  return walk(arrowAst.body)
}

function filterToJava(arrowAst, sigs) {
  if (!arrowAst || arrowAst.type !== 'ArrowFunctionExpression') return null
  const param = arrowAst.params[0] && arrowAst.params[0].name
  if (!param) return null
  function walk(n) {
    if (!n) return 'null'
    if (n.type === 'Identifier') {
      if (n.name === param) return '__it'
      if (sigs.has(n.name)) return n.name + '.get()'
      return n.name
    }
    if (n.type === 'Literal') return typeof n.value === 'string' ? JSON.stringify(n.value) : String(n.value)
    if (n.type === 'BinaryExpression') {
      const op = n.operator === '===' ? '==' : n.operator === '!==' ? '!=' : n.operator
      let l = walk(n.left), r = walk(n.right)
      if (n.left.type === 'Identifier' && n.left.name === param && typeof n.right.value === 'number') {
        l = '((Number) __it).doubleValue()'
      } else if (n.right.type === 'Identifier' && n.right.name === param && typeof n.left.value === 'number') {
        r = '((Number) __it).doubleValue()'
      }
      return '(' + l + ' ' + op + ' ' + r + ')'
    }
    if (n.type === 'UnaryExpression') return n.operator + walk(n.argument)
    if (n.type === 'LogicalExpression') return '(' + walk(n.left) + ' ' + n.operator + ' ' + walk(n.right) + ')'
    return 'null'
  }
  return walk(arrowAst.body)
}

function isNumericSignal(node, sigs) {
  if (!node) return false
  if (node.type === 'Literal' && typeof node.value === 'number') return true
  if (node.type === 'Identifier') {
    const t = sigs.get(node.name)
    return t === 'Integer' || t === 'Double'
  }
  if (node.type === 'BinaryExpression') {
    return isNumericSignal(node.left, sigs) || isNumericSignal(node.right, sigs)
  }
  return false
}

function exprToJava(node, sigs) {
  if (!node) return 'null'
  switch (node.type) {
    case 'Literal':
      if (node.value === null) return 'null'
      if (typeof node.value === 'string') return JSON.stringify(node.value)
      if (typeof node.value === 'boolean') return String(node.value)
      return String(node.value)
    case 'Identifier': {
      const __t = sigs.get(node.name)
      if (__t === '__COMPUTED__') return node.name + '()'
      if (__t) return node.name + '.get()'
      return node.name
    }
    case 'TaggedTemplateExpression': {
      return exprToJava(node.quasi, sigs)
    }
    case 'TemplateLiteral': {
      const parts = []
      for (let i = 0; i < node.quasis.length; i++) {
        const raw = node.quasis[i].value.raw
        if (raw) parts.push(JSON.stringify(raw))
        if (i < node.expressions.length) {
          let innerNode = node.expressions[i]
          // TaggedTemplateExpression (嵌套 txt`...`) 展开成 TemplateLiteral
          if (innerNode.type === 'TaggedTemplateExpression') innerNode = innerNode.quasi
          let e = exprToJava(innerNode, sigs)
          if (innerNode.type === 'TemplateLiteral') {
            parts.push('(' + e + ')')
          } else if (isNumericSignal(innerNode, sigs)) {
            parts.push('numStr(' + e + ')')
          } else {
            parts.push('numStr(' + e + ')')
          }
        }
      }
      if (parts.length === 0) return '""'
      return parts.join(' + ')
    }
    case 'BinaryExpression': {
      const isArith = ['+','-','*','/','%'].includes(node.operator)
      const isCmp = ['<','>','<=','>=','==','!=','===','!=='].includes(node.operator)
      let l = exprToJava(node.left, sigs)
      let r = exprToJava(node.right, sigs)
      if (isArith || isCmp) {
        if (isNumericSignal(node.left, sigs) && node.left.type !== 'Literal') l = '((Number) ' + l + ').doubleValue()'
        if (isNumericSignal(node.right, sigs) && node.right.type !== 'Literal') r = '((Number) ' + r + ').doubleValue()'
        if (node.left.type === 'Literal' && typeof node.left.value === 'number') l = node.left.value.toFixed(1)
      }
      let op = node.operator
      if (op === '===' || op === '==') op = '=='
      if (op === '!==' || op === '!=') op = '!='
      return '(' + l + ' ' + op + ' ' + r + ')'
    }
    case 'LogicalExpression':
      return '(' + exprToJava(node.left, sigs) + ' ' + node.operator + ' ' + exprToJava(node.right, sigs) + ')'
    case 'UnaryExpression':
      if (node.operator === '!') return '(!' + exprToJava(node.argument, sigs) + ')'
      if (node.operator === '-') return '(-' + exprToJava(node.argument, sigs) + ')'
      return '(' + node.operator + exprToJava(node.argument, sigs) + ')'
    case 'ConditionalExpression':
      return '(' + exprToJava(node.test, sigs) + ' ? ' + exprToJava(node.consequent, sigs) + ' : ' + exprToJava(node.alternate, sigs) + ')'
    case 'MemberExpression':
      if (node.computed) return exprToJava(node.object, sigs) + '[' + exprToJava(node.property, sigs) + ']'
      return exprToJava(node.object, sigs) + '.' + node.property.name
    case 'CallExpression': {
      const callee = exprToJava(node.callee, sigs)
      const args = node.arguments.map(a => exprToJava(a, sigs)).join(', ')
      return callee + '(' + args + ')'
    }
    case 'ArrayExpression':
      return 'java.util.Arrays.asList(' + node.elements.map(e => exprToJava(e, sigs)).join(', ') + ')'
    default:
      return '/* unsupported ' + node.type + ' */'
  }
}

import * as csstree from 'css-tree'

function parseMediaQuery(mq) {
  mq = mq.trim().toLowerCase()
  if (/^[(]?orientation\s*:\s*landscape[)]?$/.test(mq)) return { type: 'orientation', value: 'landscape', java: 'getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_LANDSCAPE' }
  if (/^[(]?orientation\s*:\s*portrait[)]?$/.test(mq)) return { type: 'orientation', value: 'portrait', java: 'getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_PORTRAIT' }
  let m = mq.match(/^\(min-width:\s*(\d+)px\)$/)
  if (m) return { type: 'min-width', value: parseInt(m[1]), java: 'getResources().getConfiguration().screenWidthDp >= ' + m[1] }
  m = mq.match(/^\(max-width:\s*(\d+)px\)$/)
  if (m) return { type: 'max-width', value: parseInt(m[1]), java: 'getResources().getConfiguration().screenWidthDp <= ' + m[1] }
  if (/^[(]?prefers-color-scheme\s*:\s*dark[)]?$/.test(mq)) return { type: 'dark', java: '(getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_YES' }
  if (/^[(]?prefers-color-scheme\s*:\s*light[)]?$/.test(mq)) return { type: 'light', java: '(getResources().getConfiguration().uiMode & android.content.res.Configuration.UI_MODE_NIGHT_MASK) == android.content.res.Configuration.UI_MODE_NIGHT_NO' }
  return null
}

function collectDecls(block) {
  const props = {}
  csstree.walk(block, {
    visit: 'Declaration',
    enter(decl) { props[decl.property] = csstree.generate(decl.value).trim() }
  })
  return props
}

function expandVars(props, rootVars) {
  for (const [k, v] of Object.entries(props)) {
    let nv = String(v).replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (m, name, fb) => {
      return rootVars[name] !== undefined ? rootVars[name] : (fb || m)
    })
    nv = nv.replace(/calc\(\s*([^)]+)\s*\)/g, (m, expr) => {
      const cleaned = expr.replace(/px/g, '')
      if (!/^[\d\s+\-*/.()]+$/.test(cleaned)) return m
      try {
        const result = Function('"use strict"; return (' + cleaned + ')')()
        if (typeof result === 'number' && isFinite(result)) return String(result)
      } catch (e) {}
      return m
    })
    props[k] = nv
  }
}

function parseCSS(cssText) {
  const rules = []
  const rootVars = {}
  if (!cssText || !cssText.trim()) return rules
  let ast
  try {
    ast = csstree.parse(cssText, { parseValue: true, parseRulePrelude: true, atrule: true })
  } catch (e) {
    console.warn('CSS 解析失败：', e.message)
    return rules
  }
  function addRule(selector, props, media, kind) {
    expandVars(props, rootVars)
    const parts = selector.split(',').map(x => x.trim()).filter(Boolean)
    for (const sel of parts) rules.push({ selector: sel, props, media: media || null, kind: kind || 'base' })
  }
  function walkChildren(list) {
    for (const node of list) {
      if (node.type === 'Rule') {
        const selector = csstree.generate(node.prelude)
        const props = collectDecls(node.block)
        if (selector === ':root' || selector === 'html') {
          for (const [k, v] of Object.entries(props)) if (k.startsWith('--')) rootVars[k] = v
          continue
        }
        if (/:active\b/.test(selector)) {
          const __baseAct = selector.replace(/:active\b/g, "").trim()
          if (__baseAct) addRule(__baseAct, props, null, "active")
        } else if (!/:(hover|focus|focus-visible|focus-within|disabled|checked|link|visited)\b/.test(selector)) {
          addRule(selector, props, null)
        }
      } else if (node.type === 'Atrule' && node.name === 'keyframes') {
        const __kfName = node.prelude && node.prelude.children ? csstree.generate(node.prelude).trim() : ''
        if (__kfName && node.block && node.block.children) {
          const __frames = {}
          for (const __fr of node.block.children.toArray()) {
            if (__fr.type !== 'Rule') continue
            const __sel = csstree.generate(__fr.prelude).trim()
            const __props = collectDecls(__fr.block)
            expandVars(__props, rootVars)
            const __keys = __sel === 'from' ? ['0%'] : __sel === 'to' ? ['100%'] : __sel.split(',').map(x => x.trim())
            for (const __k of __keys) {
              __frames[__k] = Object.assign(__frames[__k] || {}, __props)
            }
          }
          rules.push({ __isKeyframes: true, name: __kfName, frames: __frames })
        }
      } else if (node.type === 'Atrule' && node.name === 'media') {
        const mq = csstree.generate(node.prelude)
        const cond = parseMediaQuery(mq)
        if (!cond) continue
        if (!node.block || !node.block.children) continue
        const inner = node.block.children.toArray()
        for (const n of inner) {
          if (n.type === 'Rule') {
            const selector = csstree.generate(n.prelude)
            const props = collectDecls(n.block)
            if (/:active\b/.test(selector)) {
              const __baseAct2 = selector.replace(/:active\b/g, "").trim()
              if (__baseAct2) addRule(__baseAct2, props, cond, "active")
            } else if (!/:(hover|focus|focus-visible|focus-within|disabled|checked|link|visited)\b/.test(selector)) {
              addRule(selector, props, cond)
            }
          }
        }
      }
    }
  }
  walkChildren(ast.children.toArray())
  return rules
}

function parseCompound(s) {
  const result = { tag: null, classes: [], id: null, attrs: [], pseudo: [] }
  let i = 0
  const tagMatch = s.match(/^[a-zA-Z][\w-]*/)
  if (tagMatch) { result.tag = tagMatch[0]; i = tagMatch[0].length }
  while (i < s.length) {
    const c = s[i]
    if (c === '.') {
      const m = s.slice(i + 1).match(/^[\w-]+/)
      if (m) { result.classes.push(m[0]); i += 1 + m[0].length } else i++
    } else if (c === '#') {
      const m = s.slice(i + 1).match(/^[\w-]+/)
      if (m) { result.id = m[0]; i += 1 + m[0].length } else i++
    } else if (c === '[') {
      const end = s.indexOf(']', i)
      if (end < 0) break
      const inner = s.slice(i + 1, end)
      const m = inner.match(/^([\w-]+)(?:\s*[=~|^$*]?=\s*['"]?([^'"]*)['"]?)?$/)
      if (m) result.attrs.push({ name: m[1], value: m[2] || null })
      i = end + 1
    } else if (c === ':') {
      const m = s.slice(i + 1).match(/^[\w-]+/)
      if (m) { result.pseudo.push(m[0]); i += 1 + m[0].length } else i++
    } else i++
  }
  return result
}

function matchCompound(compound, ctx) {
  if (compound.tag && compound.tag !== ctx.tag) return false
  for (const c of compound.classes) if (!ctx.classList.includes(c)) return false
  if (compound.id && compound.id !== ctx.id) return false
  for (const a of compound.attrs) {
    if (a.name === 'type' && ctx.type !== a.value) return false
  }
  for (const p of compound.pseudo) {
    if (p === 'before' || p === 'after') return false
    if (p === 'first-child' && !ctx.isFirst) return false
    if (p === 'last-child' && !ctx.isLast) return false
    if (p === 'only-child' && !(ctx.isFirst && ctx.isLast)) return false
  }
  return true
}

function tokenizeSelector(sel) {
  const tokens = []
  let i = 0
  let pendingCombinator = null
  while (i < sel.length) {
    const c = sel[i]
    if (/\s/.test(c)) { i++; if (pendingCombinator === null) pendingCombinator = 'descendant'; continue }
    if (c === '>') { pendingCombinator = 'child'; i++; continue }
    if (c === '+') { pendingCombinator = 'adjacent'; i++; continue }
    if (c === '~') { pendingCombinator = 'sibling'; i++; continue }
    let j = i, depth = 0
    while (j < sel.length) {
      const ch = sel[j]
      if (ch === '[') depth++
      if (ch === ']') depth--
      if (depth === 0 && (/\s/.test(ch) || ch === '>' || ch === '+' || ch === '~')) break
      j++
    }
    tokens.push({ combinator: pendingCombinator || 'descendant', compound: parseCompound(sel.slice(i, j)) })
    pendingCombinator = null
    i = j
  }
  return tokens
}

function matchesSelector(sel, ctx, ancestors) {
  const tokens = tokenizeSelector(sel)
  if (tokens.length === 0) return false
  const last = tokens[tokens.length - 1]
  if (!matchCompound(last.compound, ctx)) return false
  if (tokens.length === 1) return true
  let aIdx = ancestors.length - 1
  for (let k = tokens.length - 2; k >= 0; k--) {
    const t = tokens[k]
    if (t.combinator === 'adjacent' || t.combinator === 'sibling') return false
    let matched = false
    if (t.combinator === 'descendant') {
      for (let ai = aIdx; ai >= 0; ai--) {
        if (matchCompound(t.compound, ancestors[ai])) { aIdx = ai - 1; matched = true; break }
      }
    } else if (t.combinator === 'child') {
      if (aIdx >= 0 && matchCompound(t.compound, ancestors[aIdx])) { aIdx--; matched = true }
    }
    if (!matched) return false
  }
  return true
}

function matchCSS(rules, selfCtx, ancestors) {
  const base = {}
  const active = {}
  const media = []
  for (const r of rules) {
    if (r.__isKeyframes) continue
    if (matchesSelector(r.selector, selfCtx, ancestors || [])) {
      if (r.kind === 'active') Object.assign(active, r.props)
      else if (r.media) media.push({ cond: r.media, props: r.props })
      else Object.assign(base, r.props)
    }
  }
  return { base, media, active }
}

const COLOR_NAMES = {
  white: '#ffffff', black: '#000000', red: '#ff0000', green: '#00ff00',
  blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
  pink: '#ffc0cb', gray: '#808080', grey: '#808080', silver: '#c0c0c0',
  navy: '#000080', teal: '#008080', lime: '#00ff00', cyan: '#00ffff',
  magenta: '#ff00ff', brown: '#a52a2a',
  darkgray: '#a9a9a9', darkgrey: '#a9a9a9', lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3', gold: '#ffd700', darkblue: '#00008b',
  darkgreen: '#006400', darkred: '#8b0000', lightblue: '#add8e6',
  lightgreen: '#90ee90', violet: '#ee82ee', indigo: '#4b0082',
  olive: '#808000', maroon: '#800000', aqua: '#00ffff',
}

function expandBox(v) {
  const parts = v.trim().split(/\s+/)
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]]
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]]
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]]
  return [parts[0], parts[1], parts[2], parts[3]]
}

function normalizeColor(v) {
  v = String(v || '').trim()
  if (/^(transparent|none|normal|auto|inherit|currentcolor)$/i.test(v)) return '#00000000'
  if (v === 'white') return '#ffffff'
  if (v === 'black') return '#000000'
  if (v === 'red') return '#ff0000'
  if (v === 'blue') return '#0000ff'
  if (v === 'green') return '#00ff00'
  if (v === 'gray' || v === 'grey') return '#808080'
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return '#' + v[1]+v[1] + v[2]+v[2] + v[3]+v[3]
  if (/^#[0-9a-fA-F]{4}$/.test(v)) return '#' + v[1]+v[1] + v[2]+v[2] + v[3]+v[3]
  return v
}

const TEXT_INHERIT_KEYS = new Set([
  'color','font-size','font-weight','font-style','font-family',
  'line-height','letter-spacing','text-align','text-transform',
  'text-decoration','text-overflow','white-space','word-break','text-shadow',
])
function pickTextProps(css) {
  const out = {}
  for (const k of Object.keys(css)) if (TEXT_INHERIT_KEYS.has(k)) out[k] = css[k]
  return Object.keys(out).length ? out : null
}

function cssToXmlAttrs(cssProps) {
  const attrs = []
  for (const [k, v0] of Object.entries(cssProps)) {
    const v = String(v0).trim()
    switch (k) {
      case 'background':
      case 'background-color':
        if (String(v).includes('gradient')) break
        attrs.push('android:background="' + normalizeColor(v) + '"')
        break
      case 'color':
        attrs.push('android:textColor="' + normalizeColor(v) + '"')
        break
      case 'font-size':
        attrs.push('android:textSize="' + v.replace(/px$/, '') + 'sp"')
        break
      case 'font-weight':
        if (v === 'bold' || parseInt(v) >= 600) attrs.push('android:textStyle="bold"')
        break
      case 'font-style':
        if (v === 'italic') {
          const idx2 = attrs.findIndex(a => a.startsWith('android:textStyle='))
          if (idx2 >= 0) {
            attrs[idx2] = attrs[idx2].includes('bold') ? 'android:textStyle="bold|italic"' : 'android:textStyle="italic"'
          } else {
            attrs.push('android:textStyle="italic"')
          }
        }
        break
      case 'line-height':
        if (/^\d*\.?\d+$/.test(v) && parseFloat(v) < 5) {
          attrs.push('android:lineSpacingMultiplier="' + v + '"')
        } else {
          attrs.push('android:lineSpacingExtra="' + v.replace(/px$/, '') + 'dp"')
        }
        break
      case 'letter-spacing':
        attrs.push('android:letterSpacing="' + v.replace(/em$/, '') + '"')
        break
      case 'text-align': {
        const g = v === 'center' ? 'center' : v === 'right' ? 'right' : 'left'
        attrs.push('android:gravity="' + g + '"')
        break
      }
      case 'padding': {
        const [t, r, b, l] = expandBox(v).map(x => String(x).replace(/px$/, '').trim())
        const __ok = (x) => /^-?[\d.]+$/.test(x)
        if (__ok(t)) attrs.push('android:paddingTop="' + t + 'dp"')
        if (__ok(r)) attrs.push('android:paddingRight="' + r + 'dp"')
        if (__ok(b)) attrs.push('android:paddingBottom="' + b + 'dp"')
        if (__ok(l)) attrs.push('android:paddingLeft="' + l + 'dp"')
        break
      }
      case 'margin': {
        const [t, r, b, l] = expandBox(v).map(x => String(x).replace(/px$/, '').trim())
        const __ok = (x) => /^-?[\d.]+$/.test(x)
        if (__ok(t)) attrs.push('android:layout_marginTop="' + t + 'dp"')
        if (__ok(r)) attrs.push('android:layout_marginRight="' + r + 'dp"')
        if (__ok(b)) attrs.push('android:layout_marginBottom="' + b + 'dp"')
        if (__ok(l)) attrs.push('android:layout_marginLeft="' + l + 'dp"')
        break
      }
      case 'width':
        if (v === 'match' || v === '100%' || v === 'fill') attrs.push('android:layout_width="match_parent"')
        else if (v === 'wrap') attrs.push('android:layout_width="wrap_content"')
        else if (/^[\d.]+(px)?$/.test(v)) attrs.push('android:layout_width="' + v.replace(/px$/, '') + 'dp"')
        else if (/^[\d.]+(vh|vw|rem|em|%)$/.test(v)) attrs.push('android:layout_width="0dp"')
        break
      case 'height':
        if (v === 'match' || v === '100%' || v === 'fill') attrs.push('android:layout_height="match_parent"')
        else if (v === 'wrap') attrs.push('android:layout_height="wrap_content"')
        else if (/^[\d.]+(px)?$/.test(v)) attrs.push('android:layout_height="' + v.replace(/px$/, '') + 'dp"')
        else if (/^[\d.]+(vh|vw|rem|em|%)$/.test(v)) attrs.push('android:layout_height="0dp"')
        break
      case 'opacity':
        if (/^0?\.\d+$|^[01]$/.test(v)) attrs.push('android:alpha="' + v + '"')
        break
      case 'visibility':
        if (v === 'hidden' || v === 'gone') attrs.push('android:visibility="gone"')
        else if (v === 'visible') attrs.push('android:visibility="visible"')
        break
      // skip border* (由 Java 处理)
      case 'border':
      case 'border-width':
      case 'border-color':
      case 'border-style':
      case 'border-radius':
        break
    }
  }
  return attrs
}

function toArgb(hex, fallback) {
  if (!hex) return fallback
  hex = String(hex).replace('#', '').toUpperCase()
  if (hex.length === 8) return '0x' + hex
  if (hex.length === 6) return '0xFF' + hex
  if (hex.length === 3) return '0xFF' + hex.split('').map(c => c + c).join('')
  return fallback
}
function cssToJava(cssProps, id, cls) {
  const lines = []
  const __clsFull = cls.indexOf('.') >= 0 ? cls : 'android.widget.' + cls
  const e = '((' + __clsFull + ') findViewById(R.id.' + id + '))'

  // ==== 预扫：收集背景 / 圆角 / 边框 ====
  let bgColor = null
  let gradientCode = null
  let radius = null
  let cornerRadii = null
  let strokeWidth = 0
  let strokeColor = null

  for (const [k, v0] of Object.entries(cssProps)) {
    const v = String(v0).trim()
    if ((k === 'background' || k === 'background-color') && !v.includes('gradient')) {
      bgColor = normalizeColor(v).replace('#', '')
    }
    if (k === 'background-image' || (k === 'background' && v.includes('gradient'))) {
      // linear-gradient
      let gm = v.match(/linear-gradient\(([^)]+)\)/)
      if (gm) {
        const __inner = gm[1].trim()
        let __angle = null
        let __rest = __inner
        const __am = __inner.match(/^(-?\d+)deg\s*,/)
        if (__am) { __angle = __am[1]; __rest = __inner.slice(__am[0].length).trim() }
        else if (/^to\s+right\s*,/i.test(__inner)) { __angle = '90'; __rest = __inner.replace(/^to\s+right\s*,\s*/i, '') }
        else if (/^to\s+left\s*,/i.test(__inner)) { __angle = '270'; __rest = __inner.replace(/^to\s+left\s*,\s*/i, '') }
        else if (/^to\s+bottom\s*,/i.test(__inner)) { __angle = '180'; __rest = __inner.replace(/^to\s+bottom\s*,\s*/i, '') }
        else if (/^to\s+top\s*,/i.test(__inner)) { __angle = '0'; __rest = __inner.replace(/^to\s+top\s*,\s*/i, '') }
        const __stops = __rest.split(',').map(x => x.trim()).filter(Boolean)
        const __colors = __stops.map(x => {
          const __m = x.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/)
          return __m ? __m[1] : null
        }).filter(Boolean)
        if (__colors.length >= 2) {
          const __toHex = (c) => {
            c = c.replace('#', '')
            if (c.length === 3) c = c.split('').map(y => y + y).join('')
            if (c.length === 8) c = c.slice(2)
            return c.toUpperCase()
          }
          const __dirMap = { '0': 'BOTTOM_TOP', '45': 'BL_TR', '90': 'LEFT_RIGHT', '135': 'TL_BR', '180': 'TOP_BOTTOM', '225': 'TR_BL', '270': 'RIGHT_LEFT', '315': 'BR_TL' }
          const __dir = __dirMap[String(__angle || '180')] || 'TOP_BOTTOM'
          const __colorList = __colors.map(c => '0xFF' + __toHex(c)).join(', ')
          gradientCode = 'new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.' + __dir + ', new int[]{' + __colorList + '})'
        }
      }
    }
    if (k === 'border-radius') {
      const __parts = v.split(/\s+/).map(x => x.replace(/px$/, ''))
      if (__parts.length === 1) {
        radius = v.endsWith('%') ? '9999' : __parts[0]
      } else if (__parts.length === 4) {
        cornerRadii = __parts.map(x => x === '50%' ? '9999' : x)
        radius = __parts[0]
      } else {
        radius = __parts[0]
      }
    }
    if (k === 'border') {
      const m = v.match(/^([\d.]+)\w*\s+(solid|dashed|dotted)\s+(.+)$/)
      if (m) { strokeWidth = parseInt(m[1]); strokeColor = normalizeColor(m[3]).replace('#', '') }
      else {
        const m2 = v.match(/^([\d.]+)\w*\s+(solid|dashed|dotted)$/)
        if (m2) { strokeWidth = parseInt(m2[1]); strokeColor = '000000' }
      }
    }
    if (k === 'border-width') strokeWidth = parseInt(v.replace(/px$/, ''))
    if (k === 'border-color') strokeColor = normalizeColor(v).replace('#', '')
    if (k === 'border-style' && !strokeColor) strokeColor = '000000'
  }

  // ==== 生成统一背景 drawable ====
  if (gradientCode) {
    lines.push('        ' + e + '.setBackground(' + gradientCode + ');')
  } else if (bgColor !== null || radius !== null || strokeWidth > 0) {
    const argb = toArgb(bgColor, '0x00000000')
    const radiusF = radius !== null ? radius + 'f' : '0f'
    const strokeArgb = toArgb(strokeColor, '0xFF000000')
    let code = '        { android.graphics.drawable.GradientDrawable __gd = new android.graphics.drawable.GradientDrawable();'
    code += ' __gd.setColor(' + argb + ');'
    if (cornerRadii) {
      const [tl, tr, br, bl] = cornerRadii
      code += ' __gd.setCornerRadii(new float[]{' + tl + 'f,' + tl + 'f,' + tr + 'f,' + tr + 'f,' + br + 'f,' + br + 'f,' + bl + 'f,' + bl + 'f});'
    } else {
      code += ' __gd.setCornerRadius(' + radiusF + ');'
    }
    if (strokeWidth > 0) {
      const __bs = String(cssProps['border-style'] || '').toLowerCase()
      const __bd = String(cssProps.border || '').toLowerCase()
      const __bw = cssProps['border-width'] ? '1' : null
      const __isDashed = __bs === 'dashed' || /\bdashed\b/.test(__bd)
      const __isDotted = __bs === 'dotted' || /\bdotted\b/.test(__bd)
      if (__isDashed) code += ' __gd.setStroke(' + strokeWidth + ', ' + strokeArgb + ', 6f, 6f);'
      else if (__isDotted) code += ' __gd.setStroke(' + strokeWidth + ', ' + strokeArgb + ', 2f, 4f);'
      else code += ' __gd.setStroke(' + strokeWidth + ', ' + strokeArgb + ');'
    }
    code += ' ' + e + '.setBackground(__gd); }'
    lines.push(code)
  }

  // ==== 其他 Java 处理 ====
  for (const [k, v0] of Object.entries(cssProps)) {
    const v = String(v0).trim()
    switch (k) {
      case 'color':
        lines.push('        if (findViewById(R.id.' + id + ') instanceof android.widget.TextView) ((android.widget.TextView) findViewById(R.id.' + id + ')).setTextColor(android.graphics.Color.parseColor("' + normalizeColor(v) + '"));')
        break
      case 'font-size':
        lines.push('        if (findViewById(R.id.' + id + ') instanceof android.widget.TextView) ((android.widget.TextView) findViewById(R.id.' + id + ')).setTextSize(' + (function(){let __n=parseFloat(String(v));if(/rem$|em$/.test(String(v)))__n=__n*16;return isNaN(__n)?0:__n;})() + 'f);')
        break
      case 'padding': {
        if (/(vh|vw|rem|em)$/.test(v) && !/px$/.test(v)) break
        const parts = v.split(/\s+/).map(x => String(x).replace(/px$/, '').trim())
        const t = parts[0], r = parts[1] || parts[0], b = parts[2] || parts[0], l = parts[3] || r
        lines.push('        ' + e + '.setPadding(' + l + ', ' + t + ', ' + r + ', ' + b + ');')
        break
      }
      case 'background':
      case 'background-color': {
        if (String(v).includes('gradient')) break
        // ??? GradientDrawable???/?????? setBackgroundColor ????
        if (bgColor !== null && (radius !== null || strokeWidth > 0)) break
        lines.push('        ' + e + '.setBackgroundColor(android.graphics.Color.parseColor("' + normalizeColor(v) + '"));')
        break
      }
      case 'text-decoration':
        if (v === 'underline') {
          lines.push('        { TextView __tv = (TextView) findViewById(R.id.' + id + '); __tv.setPaintFlags(__tv.getPaintFlags() | android.graphics.Paint.UNDERLINE_TEXT_FLAG); }')
        } else if (v === 'line-through') {
          lines.push('        { TextView __tv = (TextView) findViewById(R.id.' + id + '); __tv.setPaintFlags(__tv.getPaintFlags() | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG); }')
        }
        break
      case 'transform': {
        let m
        if ((m = v.match(/rotate\(\s*(-?\d+(?:\.\d+)?)deg\s*\)/))) lines.push('        ' + e + '.setRotation(' + m[1] + 'f);')
        if ((m = v.match(/scale\(\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/))) {
          const __sx = m[1], __sy = m[2] || m[1]
          lines.push('        ' + e + '.setScaleX(' + __sx + 'f);')
          lines.push('        ' + e + '.setScaleY(' + __sy + 'f);')
        }
        if ((m = v.match(/translate\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px\s*\)/))) {
          lines.push('        ' + e + '.setTranslationX(' + m[1] + 'f);')
          lines.push('        ' + e + '.setTranslationY(' + m[2] + 'f);')
        }
        if ((m = v.match(/skewX\(\s*(-?\d+(?:\.\d+)?)deg\s*\)/))) {
          lines.push('        { float __t = (float) Math.tan(Math.toRadians(' + m[1] + ')); android.graphics.Matrix __mx = new android.graphics.Matrix(); __mx.setSkew(__t, 0f); ' + e + '.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null); }')
        }
        if ((m = v.match(/skewY\(\s*(-?\d+(?:\.\d+)?)deg\s*\)/))) {
          lines.push('        { float __t = (float) Math.tan(Math.toRadians(' + m[1] + ')); android.graphics.Matrix __mx = new android.graphics.Matrix(); __mx.setSkew(0f, __t); ' + e + '.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null); }')
        }
        break
      }
      case 'box-shadow': {
        const nums = v.match(/-?\d+(?:\.\d+)?/g) || []
        const el = nums.length >= 2 ? nums[1] : nums[0]
        if (el) lines.push('        ' + e + '.setElevation(' + el + 'f);')
        break
      }
    }
  }

  // outline: 最后处理
  {
    const __ol = cssProps.outline
    if (__ol) {
      const __om = String(__ol).match(/^([\d.]+)(?:px)?\s+(?:solid|dashed|dotted)?\s*(#[0-9a-fA-F]{3,8}|\w+)?/)
      if (__om) {
        const __ow = parseFloat(__om[1])
        const __oc = __om[2] || '#000000'
        let __h = String(__oc).replace('#', '')
        if (__h.length === 3) __h = __h.split('').map(x => x + x).join('')
        const __ocArgb = '0xFF' + __h.toUpperCase()
        const __bg = cssProps.background || cssProps['background-color']
        let __bgArgb = '0x00000000'
        if (__bg && String(__bg).startsWith('#')) {
          let __bh = String(__bg).slice(1)
          if (__bh.length === 3) __bh = __bh.split('').map(x => x + x).join('')
          __bgArgb = '0xFF' + __bh.toUpperCase()
        }
        const __rad = cssProps['border-radius'] ? String(cssProps['border-radius']).replace(/px$/, '') : '0'
        lines.push('        { android.graphics.drawable.GradientDrawable __ol = new android.graphics.drawable.GradientDrawable(); __ol.setColor(' + __bgArgb + '); __ol.setStroke(' + __ow + ', ' + __ocArgb + '); __ol.setCornerRadius(' + __rad + 'f); ' + e + '.setBackground(__ol); }')
      }
    }
  }

  return lines
}

function walkSelect(node, pad, ctx, isRoot, rules, ancestors, isFirst, isLast, id, selfCtx) {
  const attrs = ['android:id="@+id/' + id + '"', 'android:layout_width="wrap_content"', 'android:layout_height="wrap_content"']

  if (rules && rules.length) {
    const cssResult = matchCSS(rules, selfCtx, ancestors)
    const __t = translateCss(cssResult.base, ctx, 'select')
    attrs.push(...__t.selfAttrs)
    attrs.push(...__t.containerAttrs)
    if (ctx.javaStyles) {
      for (const ln of __t.selfJava) {
        ctx.javaStyles.push('        { android.view.View __v = findViewById(R.id.' + id + '); ' + ln + ' }')
      }
    }
    attrs.push(...cssToXmlAttrs(cssResult.base))
  }

  const items = []
  let selectedIdx = 0
  for (const c of node.children || []) {
    if (c.type !== 'tag' || c.name !== 'option') continue
    let value = '', label = '', sel = false
    for (const p of c.props || []) {
      if (p.k === 'value') value = toPlainString(p.v)
      if (p.k === 'selected') sel = true
    }
    for (const oc of c.children || []) {
      if (oc.type === 'text' && /^['\`"]/.test(oc.expr)) label = toPlainString(oc.expr)
    }
    if (!label) label = value
    if (!value) value = label
    if (sel) selectedIdx = items.length
    items.push({ value, label })
  }

  if (ctx.javaStyles && items.length) {
    const labels = items.map(x => '"' + String(x.label).replace(/"/g, '\\"') + '"').join(', ')
    ctx.javaStyles.push('        {')
    ctx.javaStyles.push('            android.widget.Spinner __sp = findViewById(R.id.' + id + ');')
    ctx.javaStyles.push('            String[] __items = new String[]{' + labels + '};')
    ctx.javaStyles.push('            android.widget.ArrayAdapter<String> __ad = new android.widget.ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, __items);')
    ctx.javaStyles.push('            __sp.setAdapter(__ad);')
    if (selectedIdx > 0) ctx.javaStyles.push('            __sp.setSelection(' + selectedIdx + ');')
    ctx.javaStyles.push('        }')
  }

  return pad + '<android.widget.Spinner ' + attrs.join(' ') + ' />'
}

function walkXml(node, pad, ctx, isRoot, rules, ancestors, isFirst, isLast) {
  let __cOverride = null
  if (node.type !== 'tag') return ''
  ancestors = ancestors || []
  if (isFirst === undefined) isFirst = true
  if (isLast === undefined) isLast = true

  let cls = XML_TAG[node.name] || 'View'
  const id = isRoot ? ctx.rootId : nextId()
  const isText = TEXT_CLASSES.has(cls)
  const isLayout = cls === 'LinearLayout'
  const isSeek = SEEKBAR_CLASSES.has(cls)

  // 预扫 props 拿 class / id / type
  const classListPre = []
  let idPre = null
  let typePre = null
  for (const p of node.props || []) {
    if (p.k === 'class') {
      if (p.ast && p.ast.type === 'ArrowFunctionExpression' && p.ast.body && p.ast.body.type === 'TemplateLiteral') {
        const __q0 = p.ast.body.quasis[0] ? p.ast.body.quasis[0].value.raw : ''
        classListPre.push(...__q0.split(/\s+/).filter(Boolean))
      } else {
        classListPre.push(...toPlainString(p.v).split(/\s+/).filter(Boolean))
      }
    }
    if (p.k === 'id') idPre = toPlainString(p.v)
    if (p.k === 'type') typePre = toPlainString(p.v)
  }
  if (cls === 'EditText' && typePre === 'checkbox') cls = 'CheckBox'
  if (cls === 'EditText' && typePre === 'radio')    cls = 'RadioButton'
  if (cls === 'EditText' && typePre === 'switch')   cls = 'Switch'
  const selfCtx = { tag: node.name, classList: classListPre, id: idPre, type: typePre, isFirst: isFirst, isLast: isLast }

  // <select> 分流：扫 option → Spinner
  if (node.name === 'select') {
    return walkSelect(node, pad, ctx, isRoot, rules, ancestors, isFirst, isLast, id, selfCtx)
  }

  let __hasAbsChild = false
  let __cssMerged = {}
  if (node.children && node.children.length) {
    for (const __c of node.children) {
      if (__c.type !== 'tag') continue
      const __cc = []
      for (const __p of __c.props || []) {
        if (__p.k === 'class') __cc.push(...toPlainString(__p.v).split(/\s+/).filter(Boolean))
      }
      const __cctx = { tag: __c.name, classList: __cc, id: null, type: null, isFirst: false, isLast: false }
      if (rules && rules.length) {
        const __cr = matchCSS(rules, __cctx, ancestors.concat([selfCtx]))
        if (__cr.base.position === 'absolute' || __cr.base.position === 'fixed') { __hasAbsChild = true; break }
      }
      for (const __p of __c.props || []) {
        if (__p.k === 'style') {
          const __items = parseStyleObj(__p.v)
          for (const __it of __items) {
            if (__it.k === 'position' && (__it.v === 'absolute' || __it.v === 'fixed')) { __hasAbsChild = true; break }
          }
          if (__hasAbsChild) break
        }
      }
      if (__hasAbsChild) break
    }
  }

  let staticText = null
  let dynamicText = null
  for (const c of node.children) {
    if (c.type === 'text') {
      if (c.ast && c.ast.type === 'TemplateLiteral') {
        dynamicText = { ast: c.ast, sigNames: collectSigs(c.ast, ctx.sigs, ctx.computedArrows) }
      } else if (/^['`"]/.test(c.expr) && !c.expr.includes('${')) {
        staticText = toPlainString(c.expr)
      } else {
        dynamicText = { sig: null, expr: c.expr }
      }
    } else if (c.type === 'dyn') {
      if (c.ast && c.ast.type === 'TemplateLiteral') {
        dynamicText = { ast: c.ast, sigNames: collectSigs(c.ast, ctx.sigs, ctx.computedArrows) }
      } else if (c.isArrow && c.ast) {
        const deps = new Set()
        findSignalDeps(c.ast, ctx, deps)
        dynamicText = { exprAst: c.ast, deps: [...deps] }
      } else {
        const funcMatch = c.expr.match(/^(\w+)\s*\(\s*'([^']*)'\s*\)$/)
        if (funcMatch && (funcMatch[1] === 't' || funcMatch[1] === 'tr')) {
          dynamicText = { funcName: funcMatch[1], funcKey: funcMatch[2] }
        } else {
          dynamicText = { sig: null, expr: c.expr }
        }
      }
    }
  }

  const attrs = ['android:id="@+id/' + id + '"']
  if (isLayout) {
    attrs.push('android:layout_width="match_parent"')
    attrs.push('android:layout_height="wrap_content"')
    attrs.push('android:orientation="vertical"')
  } else {
    if (cls === 'ImageView' && !attrs.some(a => a.startsWith('android:layout_width'))) {
      attrs.push('android:layout_width="80dp"')
      attrs.push('android:layout_height="80dp"')
      attrs.push('android:scaleType="centerCrop"')
    } else {
      attrs.push('android:layout_width="wrap_content"')
      attrs.push('android:layout_height="wrap_content"')
    }
  }

  if (staticText !== null && isText) {
    if (cls === 'EditText') attrs.push('android:hint="' + xmlEscape(staticText) + '"')
    else attrs.push('android:text="' + xmlEscape(staticText) + '"')
  }
  if (H_SIZE[node.name] && !attrs.some(a => a.startsWith('android:textSize='))) attrs.push('android:textSize="' + H_SIZE[node.name] + 'sp"')

  // 无条件匹配 CSS（不依赖 class 属性）
  let __childCommon = []
  let __childGap = null
  let __childGapAxis = 'top'
  let __childGridCols = null
  let __wrapOuter = null
  let __borders = null
  let __horiz = false
  if (rules) {
    const cssResult = matchCSS(rules, selfCtx, ancestors)

    // :active 伪类 → setOnTouchListener
    if (cssResult.active && Object.keys(cssResult.active).length > 0) {
      const __actBg = cssResult.active["background"] || cssResult.active["background-color"]
      const __actOp = cssResult.active["opacity"]
      const __toArgb5 = (hex) => {
        if (!hex) return null
        let h = String(hex).replace(/#/g, "").toUpperCase()
        if (h.length === 3) h = h.split("").map(x => x + x).join("")
        if (h.length === 6) return "0xFF" + h
        if (h.length === 8) return "0x" + h
        return "0xFF000000"
      }
      if (__actBg) {
        const __argb = __toArgb5(__actBg)
        const __rad = cssResult.base["border-radius"] ? String(cssResult.base["border-radius"]).replace(/px$/, "") : null
        ctx.javaStyles.push("        {")
        ctx.javaStyles.push("            android.view.View __av = findViewById(R.id." + id + ");")
        ctx.javaStyles.push("            final android.graphics.drawable.Drawable __origBg = __av.getBackground();")
        ctx.javaStyles.push("            final android.graphics.drawable.GradientDrawable __pressedBg = new android.graphics.drawable.GradientDrawable();")
        ctx.javaStyles.push("            __pressedBg.setColor(" + __argb + ");")
        if (__rad) ctx.javaStyles.push("            __pressedBg.setCornerRadius(" + __rad + "f);")
        ctx.javaStyles.push("            __av.setOnTouchListener((__vv, __ev) -> {")
        ctx.javaStyles.push("                int __a = __ev.getAction();")
        ctx.javaStyles.push("                if (__a == android.view.MotionEvent.ACTION_DOWN) __vv.setBackground(__pressedBg);")
        ctx.javaStyles.push("                else if (__a == android.view.MotionEvent.ACTION_UP || __a == android.view.MotionEvent.ACTION_CANCEL) __vv.setBackground(__origBg);")
        ctx.javaStyles.push("                return false;")
        ctx.javaStyles.push("            });")
        ctx.javaStyles.push("        }")
      } else if (__actOp !== undefined) {
        const __f = parseFloat(__actOp)
        if (!isNaN(__f)) {
          ctx.javaStyles.push("        {")
          ctx.javaStyles.push("            android.view.View __av = findViewById(R.id." + id + ");")
          ctx.javaStyles.push("            __av.setOnTouchListener((__vv, __ev) -> {")
          ctx.javaStyles.push("                int __a = __ev.getAction();")
          ctx.javaStyles.push("                if (__a == android.view.MotionEvent.ACTION_DOWN) __vv.setAlpha(" + __f + "f);")
          ctx.javaStyles.push("                else if (__a == android.view.MotionEvent.ACTION_UP || __a == android.view.MotionEvent.ACTION_CANCEL) __vv.setAlpha(1.0f);")
          ctx.javaStyles.push("                return false;")
          ctx.javaStyles.push("            });")
          ctx.javaStyles.push("        }")
        }
      }
    }
    const __t = translateCss(cssResult.base, ctx, node.name)
    attrs.push(...__t.selfAttrs)
    attrs.push(...__t.containerAttrs)
    if (__t.containerType) __cOverride = __t.containerType
    if (__hasAbsChild && cls === 'LinearLayout') __cOverride = 'FrameLayout'
    __childCommon = __t.childCommon || []
    __childGap = __t._gap
    __childGapAxis = __t._gapAxis || 'top'
    if (__t._gridCols) __childGridCols = __t._gridCols
    if (__t._wrapOuter) __wrapOuter = __t._wrapOuter
    if (__t._borders && Object.keys(__t._borders).length) __borders = __t._borders
    if (__t._horiz !== undefined) __horiz = __t._horiz
    if (ctx.javaStyles) {
      for (const ln of __t.selfJava) {
        ctx.javaStyles.push('        { android.view.View __v = findViewById(R.id.' + id + '); ' + ln + ' }')
      }
    }
    attrs.push(...cssToXmlAttrs(cssResult.base))
    Object.assign(__cssMerged, cssResult.base)
    for (const m of cssResult.media) {
      const inner = cssToJava(m.props, id, cls)
      if (inner.length) {
        ctx.javaStyles.push('        if (' + m.cond.java + ') {')
        for (const ln of inner) ctx.javaStyles.push('    ' + ln)
        ctx.javaStyles.push('        }')
      }
    }
  }

  let __pseudoBefore = '', __pseudoAfter = ''
  if (rules && rules.length) {
    for (const __r of rules) {
      if (__r.__isKeyframes) continue
      const __mm = __r.selector.match(/^(.*?)::(before|after)$/)
      if (!__mm) continue
      const __base = __mm[1].trim()
      if (!matchesSelector(__base, selfCtx, ancestors)) continue
      const __pp = __r.props
      if (!__pp.content) continue
      const __pid = nextId()
      const __pa = ['android:id="@+id/' + __pid + '"']
      const __px1 = (x) => String(x).replace(/px$/, '')
      if (__pp.width) __pa.push('android:layout_width="' + __px1(__pp.width) + 'dp"')
      else __pa.push('android:layout_width="wrap_content"')
      if (__pp.height) __pa.push('android:layout_height="' + __px1(__pp.height) + 'dp"')
      else __pa.push('android:layout_height="wrap_content"')
      if (__pp.position === 'absolute') {
        const __g = []
        if (__pp.top !== undefined) __g.push('top')
        if (__pp.bottom !== undefined) __g.push('bottom')
        if (__pp.left !== undefined) __g.push('left')
        if (__pp.right !== undefined) __g.push('right')
        if (__g.length) __pa.push('android:layout_gravity="' + __g.join('|') + '"')
        if (__pp.top !== undefined) __pa.push('android:layout_marginTop="' + __px1(__pp.top) + 'dp"')
        if (__pp.bottom !== undefined) __pa.push('android:layout_marginBottom="' + __px1(__pp.bottom) + 'dp"')
        if (__pp.left !== undefined) __pa.push('android:layout_marginLeft="' + __px1(__pp.left) + 'dp"')
        if (__pp.right !== undefined) __pa.push('android:layout_marginRight="' + __px1(__pp.right) + 'dp"')
        __hasAbsChild = true
      }
      let __bgAdded = false
      if (__pp.background && !String(__pp.background).includes('gradient')) {
        __pa.push('android:background="' + normalizeColor(__pp.background) + '"')
        __bgAdded = true
      }
      if (__pp['border-radius']) {
        const __rad = String(__pp['border-radius']).replace(/px$/, '')
        const __rF = __rad === '50%' ? '9999f' : __rad + 'f'
        const __bgC = __pp.background ? normalizeColor(__pp.background).replace('#', '') : '00000000'
        const __argb = toArgb(__bgC, '0x00000000')
        ctx.javaStyles.push('        { android.graphics.drawable.GradientDrawable __gd = new android.graphics.drawable.GradientDrawable(); __gd.setColor(' + __argb + '); __gd.setCornerRadius(' + __rF + '); ((android.view.View) findViewById(R.id.' + __pid + ')).setBackground(__gd); }')
        if (__bgAdded) {
          const __idx = __pa.findIndex(a => a.startsWith('android:background='))
          if (__idx >= 0) __pa.splice(__idx, 1)
        }
      }
      if (__mm[2] === 'before') __pseudoBefore = pad + '    <View ' + __pa.join(' ') + ' />'
      else __pseudoAfter = pad + '    <View ' + __pa.join(' ') + ' />'
    }
  }

  for (const p of node.props || []) {
    if (p.k === 'style' && p.ast && p.ast.type === 'ArrowFunctionExpression' && p.ast.body && p.ast.body.type === 'ObjectExpression') {
      const __obj = p.ast.body
      for (const __prop of __obj.properties) {
        const __k = __prop.key.name || __prop.key.value
        const __val = __prop.value
        if ((__k === 'width' || __k === 'height') && __val.type === 'BinaryExpression' && __val.operator === '+' && __val.right.type === 'Literal' && __val.right.value === '%') {
          const __exprAst = __val.left
          const __deps = new Set()
          findSignalDeps(__exprAst, ctx, __deps)
          if (!__deps.size) continue
          const __r = j2jExpr(__exprAst, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
          const __code = __r.type === 'int' || __r.type === 'double' ? __r.code : '((Number)' + __r.code + ').doubleValue()'
          const __axis = __k === 'width' ? 'width' : 'height'
          const __parent = __k === 'width' ? 'getWidth()' : 'getHeight()'
          for (const __d of __deps) {
            ctx.javaStyles.push('        ' + __d + '.subscribe(val -> {')
            ctx.javaStyles.push('            final float __pct = (float)(' + __code + ') / 100f;')
            ctx.javaStyles.push('            final android.view.View __v = findViewById(R.id.' + id + ');')
            ctx.javaStyles.push('            __v.post(() -> {')
            ctx.javaStyles.push('                android.view.View __p = (android.view.View) __v.getParent();')
            ctx.javaStyles.push('                if (__p == null) return;')
            ctx.javaStyles.push('                int __pz = __p.' + __parent + ';')
            ctx.javaStyles.push('                android.view.ViewGroup.LayoutParams __lp = __v.getLayoutParams();')
            ctx.javaStyles.push('                __lp.' + __axis + ' = (int)(__pz * __pct);')
            ctx.javaStyles.push('                __v.setLayoutParams(__lp);')
            ctx.javaStyles.push('            });')
            ctx.javaStyles.push('        });')
          }
          continue
        }
        if (__k === 'display' && __val.type === 'ConditionalExpression') {
          // 支持 display: cond ? 'block' : 'none'
          const __deps = new Set()
          findSignalDeps(__val.test, ctx, __deps)
          if (!__deps.size) continue
          const __r = j2jExpr(__val.test, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
          const __condCode = __r.type === 'boolean' ? __r.code : 'Boolean.TRUE.equals(' + __r.code + ')'
          const __trueVal = __val.consequent.type === 'Literal' ? String(__val.consequent.value) : ''
          for (const __d of __deps) {
            ctx.javaStyles.push('        ' + __d + '.subscribe(val -> findViewById(R.id.' + id + ').setVisibility(' + __condCode + ' ? android.view.View.VISIBLE : android.view.View.GONE));')
          }
          continue
        }
      }
    }
    if (p.k === 'style') {
      const __items = parseStyleObj(p.v)
      const __styleObj = {}
      for (const it of __items) __styleObj[it.k] = it.v
      const __t2 = translateCss(__styleObj, ctx, node.name)
      attrs.push(...__t2.selfAttrs)
      attrs.push(...__t2.containerAttrs)
      if (__t2._gap) { __childGap = __t2._gap; __childGapAxis = __t2._gapAxis || 'top' }
      if (__t2._wrapOuter) __wrapOuter = __t2._wrapOuter
      if (__t2._borders && Object.keys(__t2._borders).length) __borders = __t2._borders
      if (__t2._horiz !== undefined) __horiz = __t2._horiz
      if (__t2.childCommon && __t2.childCommon.length) __childCommon = __t2.childCommon
      if (ctx.javaStyles) {
        for (const ln of __t2.selfJava) {
          ctx.javaStyles.push('        { android.view.View __v = findViewById(R.id.' + id + '); ' + ln + ' }')
        }
      }
      // inline style ? background / color / border ?????
      attrs.push(...cssToXmlAttrs(__styleObj))
      Object.assign(__cssMerged, __styleObj)
    }
    else if (p.k === 'placeholder') attrs.push('android:hint="' + xmlEscape(toPlainString(p.v)) + '"')
    else if (p.k === 'href') attrs.push('android:tag="href:' + xmlEscape(toPlainString(p.v)) + '"')
    else if (p.k === 'alt') attrs.push('android:contentDescription="' + xmlEscape(toPlainString(p.v)) + '"')
    else if (p.k === 'title') attrs.push('android:tooltipText="' + xmlEscape(toPlainString(p.v)) + '"')
    else if (p.k === 'name') attrs.push('android:tag="name:' + xmlEscape(toPlainString(p.v)) + '"')
    else if (p.k === 'max' && !isSeek) attrs.push('android:maxLength="' + p.v.replace(/['"]/g, '') + '"')
    else if (p.k === 'min' && !isSeek) { /* skip */ }
    else if (p.k === 'step') { /* skip */ }
    else if (p.k === 'readonly') attrs.push('android:editable="false"')
    else if (p.k === 'required') { /* skip, 用校验 */ }
    else if (p.k === 'autofocus') attrs.push('android:focusable="true"')
    else if (p.k === 'checked' && (cls === 'CheckBox' || cls === 'Switch' || cls === 'RadioButton')) {
      const __ck = toPlainString(p.v)
      if (__ck === 'true') attrs.push('android:checked="true"')
      else if (__ck === 'false') attrs.push('android:checked="false"')
    }
    else if (p.k === 'on') {
      if (node.name === 'form') {
        const __m = String(p.v).match(/submit\s*:\s*\{\s*fn\s*:\s*(\w+)/)
        if (__m) ctx.formSubmit = __m[1]
      }
      if (p.ast && p.ast.type === 'ObjectExpression') {
        for (const __pr of p.ast.properties) {
          const __ev = __pr.key.name || __pr.key.value
          const __hs = ctx.src.slice(__pr.value.start, __pr.value.end)
          ctx.events.push({ id, cls, raw: '{ ' + __ev + ': ' + __hs + ' }', ast: p.ast })
        }
      } else {
        ctx.events.push({ id, cls, raw: p.v, ast: p.ast })
      }
    }
    else if (p.k === 'src' && cls === 'ImageView') ctx.events.push({ id, cls, type: 'src', value: p.v })
    else if (p.k === 'animate') {
      const animItems = parseStyleObj(p.v)
      const anim = {}
      for (const it of animItems) anim[it.k] = it.v.replace(/['"]/g, '')
      ctx.animations.push({ id, cls, type: anim.type || 'fadeIn', duration: parseInt(anim.duration) || 300 })
    }
    else if (p.k === 'disabled' && p.ast && p.ast.type === 'ArrowFunctionExpression' && p.ast.body) {
      const __deps = new Set()
      findSignalDeps(p.ast.body, ctx, __deps)
      if (__deps.size) ctx.events.push({ id, cls, type: 'disabled', ast: p.ast.body, deps: [...__deps] })
    }
    else if (p.k === 'value') {
      if (isSeek) attrs.push('android:progress="' + p.v.replace(/['"]/g, '') + '"')
      else if (p.ast && p.ast.type === 'ArrowFunctionExpression' && p.ast.body) {
        const __deps = new Set()
        findSignalDeps(p.ast.body, ctx, __deps)
        if (__deps.size) ctx.events.push({ id, cls, type: 'value', ast: p.ast.body, deps: [...__deps] })
      }
    }
    else if (p.k === 'max' && isSeek) attrs.push('android:max="' + p.v.replace(/['"]/g, '') + '"')
  }

  if (ctx.javaStyles) ctx.javaStyles.push(...cssToJava(__cssMerged, id, __cOverride || cls))

  if (dynamicText && dynamicText.exprAst && dynamicText.deps) {
    if (dynamicText.deps.length === 0) {
      ctx.binds.push({ id, cls, exprAst: dynamicText.exprAst, deps: [], oneShot: true })
    } else {
      ctx.binds.push({ id, cls, exprAst: dynamicText.exprAst, deps: dynamicText.deps })
    }
  } else if (dynamicText && dynamicText.ast && dynamicText.sigNames) {
    if (dynamicText.sigNames.length === 0) {
      ctx.binds.push({ id, cls, sig: null, ast: dynamicText.ast, oneShot: true })
    } else {
      for (const sname of dynamicText.sigNames) {
        ctx.binds.push({ id, cls, sig: sname, ast: dynamicText.ast })
      }
    }
  } else if (dynamicText && dynamicText.funcName) {
    ctx.binds.push({ id, cls, funcName: dynamicText.funcName, funcKey: dynamicText.funcKey })
  } else if (dynamicText && dynamicText.sig) {
    if (isSeek) {
      ctx.progressBinds.push({ id, cls, sig: dynamicText.sig, op: dynamicText.op, num: dynamicText.num })
    } else {
      ctx.binds.push({ id, cls, sig: dynamicText.sig, prefix: dynamicText.prefix, op: dynamicText.op, num: dynamicText.num, expr: dynamicText.expr, ast: dynamicText.ast })
    }
  }

  if (__childGap && !__childGridCols && /^[\d.]+$/.test(String(__childGap))) {
    const __half = (parseFloat(__childGap) / 2).toFixed(1)
    const __hasPad = (a) => attrs.some(x => x.startsWith('android:' + a + '='))
    if (!__hasPad('paddingLeft'))   attrs.push('android:paddingLeft="' + __half + 'dp"')
    if (!__hasPad('paddingRight'))  attrs.push('android:paddingRight="' + __half + 'dp"')
    if (!__hasPad('paddingTop'))    attrs.push('android:paddingTop="' + __half + 'dp"')
    if (!__hasPad('paddingBottom')) attrs.push('android:paddingBottom="' + __half + 'dp"')
  }
  // ===== 动态 class 模板拼接（如 `fill s${strength()}`） =====
  let __dynTpl = null
  for (const p of node.props || []) {
    if (p.k === 'class' && p.ast && p.ast.type === 'ArrowFunctionExpression' && p.ast.body && p.ast.body.type === 'TemplateLiteral') {
      const __b = p.ast.body
      if (__b.expressions.length === 1 && __b.expressions[0].type !== 'ConditionalExpression') {
        __dynTpl = {
          static0: __b.quasis[0] ? __b.quasis[0].value.raw : '',
          static1: __b.quasis[1] ? __b.quasis[1].value.raw : '',
          exprAst: __b.expressions[0],
        }
      }
    }
  }
  if (__dynTpl && rules && rules.length) {
    const __branches = []
    for (let __n = 0; __n <= 10; __n++) {
      const __fullStr = (__dynTpl.static0 + __n + __dynTpl.static1).trim()
      const __clsList = __fullStr.split(/\s+/).filter(Boolean)
      const __selfN = Object.assign({}, selfCtx, { classList: __clsList })
      const __cssN = matchCSS(rules, __selfN, ancestors)
      if (Object.keys(__cssN.base).length) __branches.push({ n: __n, css: __cssN.base })
    }
    if (__branches.length) {
      const __deps = new Set()
      findSignalDeps(__dynTpl.exprAst, ctx, __deps)
      const __cond = j2jExpr(__dynTpl.exprAst, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
      const __condCode = __cond.type === 'int' || __cond.type === 'double' ? __cond.code : '((Number)' + __cond.code + ').intValue()'
      const __toArgb = (hex, fb) => {
        if (!hex) return fb
        let h = String(hex).replace(/#/g, '').toUpperCase()
        if (h.length === 3) h = h.split('').map(x => x + x).join('')
        if (h.length === 6) return '0xFF' + h
        if (h.length === 8) return '0x' + h
        return fb
      }
      let __radiusCode = null
      for (const __br of __branches) {
        const __r = __br.css['border-radius']
        if (__r) { __radiusCode = String(__r).replace(/px$/, ''); break }
      }
      for (const __d of __deps) {
        ctx.javaStyles.push('        ' + __d + '.subscribe(val -> {')
        ctx.javaStyles.push('            int __n = ' + __condCode + ';')
        ctx.javaStyles.push('            android.graphics.drawable.GradientDrawable __gd = new android.graphics.drawable.GradientDrawable();')
        if (__radiusCode) ctx.javaStyles.push('            __gd.setCornerRadius(' + __radiusCode + 'f);')
        let __first = true
        for (const __br of __branches) {
          const __bg = __br.css['background'] || __br.css['background-color']
          if (__bg) {
            const __kw = __first ? 'if' : 'else if'
            ctx.javaStyles.push('            ' + __kw + ' (__n == ' + __br.n + ') __gd.setColor(' + __toArgb(__bg, '0xFF000000') + ');')
            __first = false
          }
        }
        ctx.javaStyles.push('            findViewById(R.id.' + id + ').setBackground(__gd);')
        ctx.javaStyles.push('        });')
      }
    }
  }

  // ===== 动态 class 检测与切换 =====
  let __dynClass = null
  for (const p of node.props || []) {
    if (p.k === 'class' && p.ast && p.ast.type === 'ArrowFunctionExpression' && p.ast.body && p.ast.body.type === 'TemplateLiteral') {
      const __body = p.ast.body
      if (__body.expressions.length === 1 && __body.expressions[0].type === 'ConditionalExpression') {
        const __cq0 = __body.quasis[0] ? __body.quasis[0].value.raw : ''
        const __cq1 = __body.quasis[1] ? __body.quasis[1].value.raw : ''
        const __ce = __body.expressions[0]
        const __tv = __ce.consequent.type === 'Literal' ? String(__ce.consequent.value) : ''
        const __fv = __ce.alternate.type === 'Literal' ? String(__ce.alternate.value) : ''
        __dynClass = { condAst: __ce.test, classTrue: (__cq0 + __tv + __cq1).trim(), classFalse: (__cq0 + __fv + __cq1).trim() }
      }
    }
  }
  if (__dynClass) {
    const __deps = new Set()
    findSignalDeps(__dynClass.condAst, ctx, __deps)
    const __selfF = Object.assign({}, selfCtx, { classList: __dynClass.classFalse.split(/\s+/).filter(Boolean) })
    const __selfT = Object.assign({}, selfCtx, { classList: __dynClass.classTrue.split(/\s+/).filter(Boolean) })
    const __cssF = rules ? matchCSS(rules, __selfF, ancestors) : { base: {}, media: [] }
    const __cssT = rules ? matchCSS(rules, __selfT, ancestors) : { base: {}, media: [] }
    const __pick = (o) => {
      const bg = o['background'] || o['background-color'] || null
      let bColor = o['border-color'] || null, bWidth = null
      if (o['border']) {
        const m = String(o['border']).match(/^(\d+)px\s+\w+\s+(.+)$/)
        if (m) { bWidth = m[1]; if (!bColor) bColor = m[2] }
      }
      const radius = o['border-radius'] ? String(o['border-radius']).replace(/px$/, '') : null
      const color = o['color'] || null
      return { bg, bColor, bWidth, radius, color }
    }
    const __sF = __pick(__cssF.base)
    const __sT = __pick(__cssT.base)
    const __cond = j2jExpr(__dynClass.condAst, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
    const __condCode = __cond.type === 'boolean' ? __cond.code : 'Boolean.TRUE.equals(' + __cond.code + ')'
    const __toArgb = (hex, fb) => {
      if (!hex) return fb
      let h = String(hex).replace(/#/g, '').toUpperCase()
      if (h.length === 3) h = h.split('').map(x => x + x).join('')
      if (h.length === 6) return '0xFF' + h
      if (h.length === 8) return '0x' + h
      return fb
    }
    const __emit = (s, indent) => {
      const lines = []
      lines.push(indent + 'android.graphics.drawable.GradientDrawable __gd = new android.graphics.drawable.GradientDrawable();')
      if (s.radius) lines.push(indent + '__gd.setCornerRadius(' + s.radius + 'f);')
      lines.push(indent + '__gd.setColor(' + __toArgb(s.bg, '0x00000000') + ');')
      if (s.bWidth) lines.push(indent + '__gd.setStroke(' + s.bWidth + ', ' + __toArgb(s.bColor, '0xFF000000') + ');')
      lines.push(indent + 'findViewById(R.id.' + id + ').setBackground(__gd);')
      if (s.color) lines.push(indent + 'if (findViewById(R.id.' + id + ') instanceof android.widget.TextView) ((android.widget.TextView) findViewById(R.id.' + id + ')).setTextColor(' + __toArgb(s.color, '0xFF000000') + ');')
      return lines
    }
    for (const __d of __deps) {
      ctx.javaStyles.push('        ' + __d + '.subscribe(val -> {')
      ctx.javaStyles.push('            if (' + __condCode + ') {')
      for (const ln of __emit(__sT, '                ')) ctx.javaStyles.push(ln)
      ctx.javaStyles.push('            } else {')
      for (const ln of __emit(__sF, '                ')) ctx.javaStyles.push(ln)
      ctx.javaStyles.push('            }')
      ctx.javaStyles.push('        });')
    }
  }

  // ref 属性：绑定 View 引用
  for (const p of node.props || []) {
    if (p.k === 'ref') {
      const __refName = toPlainString(p.v)
      if (ctx.refs && ctx.refs.includes(__refName)) {
        ctx.javaStyles.push('        ' + __refName + ' = findViewById(R.id.' + id + ');')
      }
    }
  }
  if (cls === 'Button' && typePre === 'submit' && ctx.formSubmit) {
    ctx.events.push({ id, cls, type: 'submitClick', fnName: ctx.formSubmit })
  }

  const __seen = new Set()
  for (let i = attrs.length - 1; i >= 0; i--) {
    const key = attrs[i].split('=')[0]
    if (__seen.has(key)) attrs.splice(i, 1)
    else __seen.add(key)
  }

  let __fc = __cOverride || cls
  if (__fc.indexOf('FlexboxLayout') >= 0 || __fc === 'FrameLayout') {
    for (let i = attrs.length - 1; i >= 0; i--) {
      if (attrs[i].indexOf('android:orientation=') === 0) attrs.splice(i, 1)
    }
  }
  let __wrapOpen = '', __wrapClose = ''
  if (__wrapOuter) {
    // ???????????? ScrollView???? wrap_content
    let __h = 'wrap_content'
    for (let i = attrs.length - 1; i >= 0; i--) {
      const __m = attrs[i].match(/^android:layout_height="([^"]+)"$/)
      if (__m && __m[1] !== 'wrap_content' && __m[1] !== 'match_parent') {
        __h = __m[1]
        attrs[i] = 'android:layout_height="wrap_content"'
        break
      }
    }
    __wrapOpen = pad + '<' + __wrapOuter + ' android:layout_width="match_parent" android:layout_height="' + __h + '">\n'
    __wrapClose = '\n' + pad + '</' + __wrapOuter + '>'
  }

  const inner = []
  const childAncestors = ancestors.concat([selfCtx])
  // 非文本容器里的 text/dyn 子节点 → 生成子 TextView
  const realChildren = node.children.filter(c => {
    if (c.type === 'tag' || c.type === 'show' || c.type === 'list') return true
    if (!isText && (c.type === 'text' || c.type === 'dyn')) return true
    return false
  })
  for (let ci = 0; ci < realChildren.length; ci++) {
    const c = realChildren[ci]
    const cf = ci === 0
    const cl = ci === realChildren.length - 1
    if (c.type === 'tag') {
      let __cx = walkXml(c, pad + '    ', ctx, false, rules, childAncestors, cf, cl)
      if (__childCommon.length) {
        __cx = __cx.replace(/^(\s*<[A-Za-z][A-Za-z0-9.]*)/, (m, pre) => pre + ' ' + __childCommon.join(' '))
      }
      if (__childGap && !__childGridCols && /^[\d.]+$/.test(String(__childGap))) {
        const __half = (parseFloat(__childGap) / 2).toFixed(1)
        const __addGap = (attr, val) => {
          if (!new RegExp('android:' + attr + '=').test(__cx)) {
            __cx = __cx.replace(/^(\s*<[A-Za-z][A-Za-z0-9.]*)/, (m, pre) => pre + ' android:' + attr + '="' + val + 'dp"')
          }
        }
        __addGap('layout_marginLeft', __half)
        __addGap('layout_marginRight', __half)
        __addGap('layout_marginTop', __half)
        __addGap('layout_marginBottom', __half)
      }
      if (__childGridCols) {
        const __pct = (100 / __childGridCols).toFixed(2) + '%'
        __cx = __cx.replace(/^(\s*<[A-Za-z][A-Za-z0-9.]*)/, (m, pre) => pre + ' app:layout_flexBasisPercent="' + __pct + '"')
        __cx = __cx.replace(/android:layout_width="[^"]*"/, 'android:layout_width="0dp"')
      }
      inner.push(__cx)
    } else if (c.type === 'show') {
      inner.push(walkShow(c, pad + '    ', ctx))
    } else if (c.type === 'list') {
      inner.push(walkList(c, pad + '    ', ctx))
    } else if (c.type === 'text' || c.type === 'dyn') {
      // 生成子 TextView
      const childId = nextId()
      const childAttrs = ['android:id="@+id/' + childId + '"', 'android:layout_width="wrap_content"', 'android:layout_height="wrap_content"']
      const tpl = c.ast && c.ast.type === 'TemplateLiteral' ? { ast: c.ast, sigNames: collectSigs(c.ast, ctx.sigs, ctx.computedArrows) } : null
      if (tpl && tpl.sigNames && tpl.sigNames.length) {
        for (const sname of tpl.sigNames) {
          ctx.binds.push({ id: childId, cls: 'TextView', sig: sname, ast: tpl.ast })
        }
      } else if (c.type === 'text' && /^['`"]/.test(c.expr) && !c.expr.includes('${')) {
        childAttrs.push('android:text="' + xmlEscape(toPlainString(c.expr)) + '"')
      } else if (c.type === 'dyn') {
        const funcMatch = c.expr.match(/^(\w+)\s*\(\s*'([^']*)'\s*\)$/)
        if (funcMatch && (funcMatch[1] === 't' || funcMatch[1] === 'tr')) {
          ctx.binds.push({ id: childId, cls: 'TextView', funcName: funcMatch[1], funcKey: funcMatch[2] })
        }
      }
      // 父容器文字属性下传（color / font-family / font-size / 等）
      if (__cssMerged && Object.keys(__cssMerged).length > 0) {
        const __tp = pickTextProps(__cssMerged)
        if (__tp) {
          for (const __a of cssToXmlAttrs(__tp)) {
            if (!childAttrs.some(x => x.split('=')[0] === __a.split('=')[0])) childAttrs.push(__a)
          }
          if (ctx.javaStyles) {
            const __tJava = translateCss(__tp, ctx, 'TextView').selfJava
            for (const __ln of __tJava) {
              ctx.javaStyles.push('        { android.view.View __v = findViewById(R.id.' + childId + '); ' + __ln + ' }')
            }
          }
        }
      }
      inner.push(pad + '    <TextView ' + childAttrs.join(' ') + ' />')
    }
  }

  if (__pseudoBefore) inner.unshift(__pseudoBefore)
  if (__pseudoAfter) inner.push(__pseudoAfter)

  if (__borders && Object.keys(__borders).length) {
    const __innerOri = __horiz ? 'horizontal' : 'vertical'
    const __outerAttrs = []
    const __innerAttrs = []
    for (const a of attrs) {
      if (a.startsWith('android:layout_width=') || a.startsWith('android:layout_height=') || a.startsWith('android:layout_margin')) {
        __outerAttrs.push(a)
      } else if (!a.startsWith('android:orientation=')) {
        __innerAttrs.push(a)
      }
    }
    __innerAttrs.push('android:orientation="' + __innerOri + '"')
    __innerAttrs.push('android:layout_width="match_parent"')
    __innerAttrs.push('android:layout_height="match_parent"')
    const __oldInner = inner.slice()
    inner.length = 0
    inner.push(pad + '    <LinearLayout ' + __innerAttrs.join(' ') + '>')
    for (const ln of __oldInner) inner.push('    ' + ln)
    inner.push(pad + '    </LinearLayout>')
    for (const side of ['top','bottom','left','right']) {
      const b = __borders[side]
      if (!b) continue
      const __bid = nextId()
      const __battrs = ['android:id="@+id/' + __bid + '"']
      const __bw = b.w + 'dp'
      if (side === 'top' || side === 'bottom') {
        __battrs.push('android:layout_width="match_parent"')
        __battrs.push('android:layout_height="' + __bw + '"')
      } else {
        __battrs.push('android:layout_width="' + __bw + '"')
        __battrs.push('android:layout_height="match_parent"')
      }
      __battrs.push('android:layout_gravity="' + side + '"')
      __battrs.push('android:background="' + b.color + '"')
      inner.push(pad + '    <View ' + __battrs.join(' ') + ' />')
    }
    attrs.length = 0
    for (const a of __outerAttrs) attrs.push(a)
    __fc = 'FrameLayout'
  }

  if (inner.length === 0) return __wrapOpen + pad + '<' + __fc + ' ' + attrs.join(' ') + ' />' + __wrapClose
  return __wrapOpen + pad + '<' + __fc + ' ' + attrs.join(' ') + '>\n' + inner.join('\n') + '\n' + pad + '</' + __fc + '>' + __wrapClose
}

function condToJava(cond, sig) {
  let m = cond.match(/^\w+\s*\(\s*v\s*=>\s*v\s*===\s*['"]([^'"]+)['"]\s*\)$/)
  if (m) return '"' + m[1] + '".equals(' + sig + '.get())'
  m = cond.match(/^\w+\s*\(\s*v\s*=>\s*v\s*!==\s*['"]([^'"]+)['"]\s*\)$/)
  if (m) return '!"' + m[1] + '".equals(' + sig + '.get())'
  m = cond.match(/^\w+\s*\(\s*v\s*=>\s*v\s*>\s*(-?\d+(?:\.\d+)?)\s*\)$/)
  if (m) return '((' + sig + '.get() instanceof Number) && ((Number)' + sig + '.get()).doubleValue() > ' + m[1] + ')'
  m = cond.match(/^\w+\s*\(\s*v\s*=>\s*v\s*<\s*(-?\d+(?:\.\d+)?)\s*\)$/)
  if (m) return '((' + sig + '.get() instanceof Number) && ((Number)' + sig + '.get()).doubleValue() < ' + m[1] + ')'
  m = cond.match(/^\w+\s*\(\s*v\s*=>\s*v\s*===\s*(true|false)\s*\)$/)
  if (m) return 'Boolean.' + m[1].toUpperCase() + '.equals(' + sig + '.get())'
  return 'Boolean.TRUE.equals(' + sig + '.get())'
}

function walkShow(node, pad, ctx) {
  const id = nextId()
  let javaCond = 'false'
  const deps = new Set()
  if (node.condAst && node.condAst.type === 'ArrowFunctionExpression') {
    const r = j2jExpr(node.condAst.body, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
    javaCond = r.type === 'boolean' ? r.code : 'Boolean.TRUE.equals(' + r.code + ')'
    findSignalDeps(node.condAst.body, ctx, deps)
  } else {
    const sig = extractSignalName(node.cond)
    if (sig) {
      deps.add(sig)
      javaCond = condToJava(node.cond, sig)
    }
  }
  if (deps.size) ctx.shows.push({ id, deps: [...deps], javaCond })
  let inner = ''
  if (node.child && node.child.type === 'tag') inner = walkXml(node.child, pad + '    ', ctx, false)
  const attrs = 'android:id="@+id/' + id + '" android:layout_width="match_parent" android:layout_height="wrap_content" android:visibility="gone"'
  if (!inner) return pad + '<FrameLayout ' + attrs + ' />'
  return pad + '<FrameLayout ' + attrs + '>\n' + inner + '\n' + pad + '</FrameLayout>'
}

function findSignalDeps(ast, ctx, out) {
  if (!ast || typeof ast !== 'object') return
  if (ast.type === 'MemberExpression') {
    findSignalDeps(ast.object, ctx, out)
    if (ast.computed) findSignalDeps(ast.property, ctx, out)
    return
  }
  if (ast.type === 'ObjectExpression') {
    for (const p of ast.properties) findSignalDeps(p.value, ctx, out)
    return
  }
  if (ast.type === 'Property') {
    findSignalDeps(ast.value, ctx, out)
    return
  }
  if (ast.type === 'CallExpression' && ast.callee.type === 'Identifier') {
    const name = ast.callee.name
    if (ctx.sigsJ2J && ctx.sigsJ2J.has(name)) out.add(name)
    else if (ctx.computedArrows && ctx.computedArrows.has(name)) {
      findSignalDeps(ctx.computedArrows.get(name).body, ctx, out)
    }
  }
  for (const k of Object.keys(ast)) {
    if (['start','end','type','loc'].includes(k)) continue
    const v = ast[k]
    if (Array.isArray(v)) v.forEach(x => findSignalDeps(x, ctx, out))
    else if (v && typeof v === 'object' && v.type) findSignalDeps(v, ctx, out)
  }
}

function walkList(node, pad, ctx) {
  const id = nextId()
  const sig = extractSignalName(node.arr)
  const deps = new Set()
  if (sig) deps.add(sig)
  if (node.filterAst && ctx.sigs) {
    for (const n of collectSigs(node.filterAst, ctx.sigs, ctx.computedArrows)) deps.add(n)
  }
  ctx.lists.push({ id, sig, filterAst: node.filterAst || null, mapAst: node.mapAst || null, deps: [...deps] })
  return pad + '<androidx.recyclerview.widget.RecyclerView android:id="@+id/' + id + '" android:layout_width="match_parent" android:layout_height="wrap_content" />'
}

function extractSignalName(expr) {
  if (!expr) return null
  expr = expr.trim()
  if (/^\w+$/.test(expr)) return expr
  let m = expr.match(/=>\s*(\w+)\s*\(/)
  if (m) return m[1]
  m = expr.match(/^\(?\s*(\w+)\s*\(/)
  return m ? m[1] : null
}

function asyncHandlerToJava(handlerBody, sigs) {
  const stmts = handlerBody.split(/[;\n]/).map(x => x.trim()).filter(Boolean)
  const javaLines = []
  let fetchedVar = null
  let fetchUrl = null
  for (const stmt of stmts) {
    let m = stmt.match(/^(?:const|let|var)\s+(\w+)\s*=\s*await\s+fetchUrl\s*\(\s*['\"]([^'\"]+)['\"]\s*\)$/)
    if (m) { fetchedVar = m[1]; fetchUrl = m[2]; continue }
    m = stmt.match(/^(?:const|let|var)\s+(\w+)\s*=\s*await\s+fetch\s*\(\s*['\"]([^'\"]+)['\"]\s*\)$/)
    if (m) { fetchedVar = m[1]; fetchUrl = m[2]; continue }
    m = stmt.match(/^(\w+)\s*\(\s*(\w+)\s*\)$/)
    if (m && fetchedVar) { const val = (m[2] === fetchedVar) ? '__result' : m[2]; javaLines.push(m[1] + '.set(' + val + ');'); continue }
    m = stmt.match(/^(\w+)\s*\(\s*['\"]([^'\"]*)['\"]\s*\)$/)
    if (m) { javaLines.push(m[1] + '.set(\"' + m[2] + '\");'); continue }
  }
  if (!fetchUrl || !fetchedVar) return null
  const body = javaLines.join(' ')
  const code = 'new Thread(() -> { try { java.net.URL __u = new java.net.URL(\"' + fetchUrl + '\"); java.net.HttpURLConnection __c = (java.net.HttpURLConnection) __u.openConnection(); __c.setRequestMethod(\"GET\"); java.io.BufferedReader __br = new java.io.BufferedReader(new java.io.InputStreamReader(__c.getInputStream())); StringBuilder __sb = new StringBuilder(); String __line; while ((__line = __br.readLine()) != null) __sb.append(__line).append(System.lineSeparator()); __br.close(); final String __result = __sb.toString(); runOnUiThread(() -> { ' + body + ' }); } catch (Exception __e) { __e.printStackTrace(); } }).start();'
  return code
}

function convertHandler(expr) {
  // 块体: () => { stmt1; stmt2 }
  const __blk = expr.match(/^\(\s*\)\s*=>\s*\{([\s\S]*)\}\s*$/)
  if (__blk) {
    const inner = __blk[1].trim()
    const stmts = inner.split(';').map(x => x.trim()).filter(Boolean)
    const parts = []
    for (const stmt of stmts) {
      const mm = stmt.match(/^(\w+)\s*\(([\s\S]*)\)$/)
      if (mm && mm[2].trim() !== '') {
        let args = mm[2]
        args = args.replace(/\b([a-zA-Z_]\w*)\(\)/g, '$1.get()')
        args = args.replace(/'([^']*)'/g, '"$1"')
        parts.push(mm[1] + '.set(' + args + ')')
      } else {
        let clean = stmt
        clean = clean.replace(/'([^']*)'/g, '"$1"')
        parts.push(clean)
      }
    }
    return parts.join('; ') + ';'
  }
  // 特殊调用
  const __gt = expr.match(/^\(\s*\)\s*=>\s*goto\s*\(\s*(['"])(.*?)\1\s*\)\s*$/)
  if (__gt) return 'gotoPage("' + __gt[2] + '");'
  const __bk = expr.match(/^\(\s*\)\s*=>\s*back\s*\(\s*\)\s*$/)
  if (__bk) return 'onBackPressed();'
  // 先剥掉参数 e => / (e) => / (evt) =>
  const __pm = expr.match(/^\(?\s*\w*\s*\)?\s*=>\s*([\s\S]+)$/)
  if (__pm && /^\(?\s*\w+\s*\)?\s*=>/.test(expr)) {
    const __inner = __pm[1].trim()
    // goto('page', {k: v, ...}) → gotoPage2
    const __gotoObjHandler = __inner.match(/^goto\s*\(\s*(['"])(.*?)\1\s*,\s*\{([\s\S]+?)\}\s*\)$/)
    if (__gotoObjHandler) {
      const __pgName = __gotoObjHandler[2]
      const __pairs = __gotoObjHandler[3].split(',').map(x => x.trim()).filter(Boolean)
      const __gk = [], __gv = []
      for (const __p of __pairs) {
        const __kv = __p.match(/^(\w+)\s*:\s*([\s\S]+)$/)
        if (!__kv) continue
        __gk.push('"' + __kv[1] + '"')
        let __vv = __kv[2].trim().replace(/'([^']*)'/g, '"$1"')
        __gv.push('String.valueOf(' + __vv + ')')
      }
      return 'gotoPage2("' + __pgName + '", new String[]{' + __gk.join(', ') + '}, new String[]{' + __gv.join(', ') + '});'
    }
    // goto('page')
    const __goto1Handler = __inner.match(/^goto\s*\(\s*(['"])(.*?)\1\s*\)$/)
    if (__goto1Handler) return 'gotoPage("' + __goto1Handler[2] + '");'
    // param('key')
    const __paramHandler = __inner.match(/^param\s*\(\s*(['"])(.*?)\1\s*\)$/)
    if (__paramHandler) return 'param("' + __paramHandler[2] + '");'

    let __m2 = __inner.match(/^(\w+)\s*\(\s*'([^']*)'\s*\)$/)
    if (__m2) return __m2[1] + '.set("' + __m2[2] + '");'
    __m2 = __inner.match(/^(\w+)\s*\(\s*"([^"]*)"\s*\)$/)
    if (__m2) return __m2[1] + '.set("' + __m2[2] + '");'
    __m2 = __inner.match(/^(\w+)\s*\(\s*(true|false)\s*\)$/)
    if (__m2) return __m2[1] + '.set(' + __m2[2] + ');'
    __m2 = __inner.match(/^(\w+)\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)$/)
    if (__m2) return __m2[1] + '.set(' + __m2[2] + ');'
    __m2 = __inner.match(/^(\w+)\s*\(\s*(\w+)\s*\)$/)
    if (__m2) return __m2[1] + '.set(' + __m2[2] + '.get());'
    return __inner + ';'
  }
  let m = expr.match(/^\(\)\s*=>\s*(\w+)\(v\s*=>\s*(.+?)\)$/)
  if (m) return m[1] + '.set(' + m[2].replace(/\bv\b/g, m[1] + '.get()') + ');'
  m = expr.match(/^\(\)\s*=>\s*(.+)$/)
  if (m) {
    const body = m[1].trim()
    const __inner = body
    // goto('page', {k: v, ...}) → gotoPage2
    const __gotoObjHandler = __inner.match(/^goto\s*\(\s*(['"])(.*?)\1\s*,\s*\{([\s\S]+?)\}\s*\)$/)
    if (__gotoObjHandler) {
      const __pgName = __gotoObjHandler[2]
      const __pairs = __gotoObjHandler[3].split(',').map(x => x.trim()).filter(Boolean)
      const __gk = [], __gv = []
      for (const __p of __pairs) {
        const __kv = __p.match(/^(\w+)\s*:\s*([\s\S]+)$/)
        if (!__kv) continue
        __gk.push('"' + __kv[1] + '"')
        let __vv = __kv[2].trim().replace(/'([^']*)'/g, '"$1"')
        __gv.push('String.valueOf(' + __vv + ')')
      }
      return 'gotoPage2("' + __pgName + '", new String[]{' + __gk.join(', ') + '}, new String[]{' + __gv.join(', ') + '});'
    }
    // goto('page')
    const __goto1Handler = __inner.match(/^goto\s*\(\s*(['"])(.*?)\1\s*\)$/)
    if (__goto1Handler) return 'gotoPage("' + __goto1Handler[2] + '");'
    // param('key')
    const __paramHandler = __inner.match(/^param\s*\(\s*(['"])(.*?)\1\s*\)$/)
    if (__paramHandler) return 'param("' + __paramHandler[2] + '");'

    // toast 支持
    let toastMatch = body.match(/^toast\s*\(\s*['"]([^'"]*)['"]\s*\)$/)
      if (toastMatch) return 'android.widget.Toast.makeText(this, "' + toastMatch[1] + '", android.widget.Toast.LENGTH_SHORT).show();'
      let alertMatch = body.match(/^alert\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*\)$/)
      if (alertMatch) return 'new android.app.AlertDialog.Builder(this).setTitle("' + alertMatch[1] + '").setMessage("' + alertMatch[2] + '").setPositiveButton("OK", null).show();'
      let notifyMatch = body.match(/^notify\s*\(\s*['"]([^'"]*)['"]\s*,\s*['"]([^'"]*)['"]\s*\)$/)
      if (notifyMatch) return 'showNotification("' + notifyMatch[1] + '", "' + notifyMatch[2] + '");'
      let fileMatch = body.match(/^readFile\s*\(\s*['"]([^'"]*)['"]\s*,\s*(\w+)\s*\)$/)
      if (fileMatch) return 'readFile("' + fileMatch[1] + '", ' + fileMatch[2] + ');'
      fileMatch = body.match(/^writeFile\s*\(\s*['"]([^'"]*)['"]\s*,\s*(\w+)\s*\)$/)
      if (fileMatch) return 'writeFile("' + fileMatch[1] + '", ' + fileMatch[2] + ');'
      let langMatch = body.match(/^setLang\s*\(\s*['"]([^'"]*)['"]\s*\)$/)
      if (langMatch) return 'setLang("' + langMatch[1] + '");'
        let m2 = body.match(/^(\w+)\s*\(\s*'([^']*)'\s*\)$/)
    if (m2) return m2[1] + '.set("' + m2[2] + '");'
    m2 = body.match(/^(\w+)\s*\(\s*"([^"]*)"\s*\)$/)
    if (m2) return m2[1] + '.set("' + m2[2] + '");'
    m2 = body.match(/^(\w+)\s*\(\s*(-?\d+(?:\.\d+)?)\s*\)$/)
    if (m2) return m2[1] + '.set(' + m2[2] + ');'
    // 通用：sig(表达式含 signal 调用)
    m2 = body.match(/^(\w+)\s*\(\s*([\s\S]+?)\s*\)$/)
    if (m2) {
      const __sn = m2[1]
      let __arg = m2[2]
      __arg = __arg.replace(/\b([a-zA-Z_]\w*)\(\)/g, '$1.get()')
      return __sn + '.set(' + __arg + ');'
    }
    m2 = body.match(/^(\w+)\s*\(\s*(true|false)\s*\)$/)
    if (m2) return m2[1] + '.set(' + m2[2] + ');'
    m2 = body.match(/^(\w+)\s*\(\s*([^)]+)\s*\)$/)
    if (m2) {
      const __arg = m2[2].trim()
      if (/^\w+$/.test(__arg)) return m2[1] + '.set(' + __arg + '.get());'
      return m2[1] + '.set(' + __arg + ');'
    }
    // fetch('url', sig) → fetchUrl("url", sig)
    m2 = body.match(/^fetch\s*\(\s*'([^']+)'\s*,\s*(\w+)\s*\)$/)
    if (m2) return 'fetchUrl("' + m2[1] + '", ' + m2[2] + ');'
    m2 = body.match(/^fetch\s*\(\s*"([^"]+)"\s*,\s*(\w+)\s*\)$/)
    if (m2) return 'fetchUrl("' + m2[1] + '", ' + m2[2] + ');'
    return body + ';'
  }
  return expr + ';'
}

function buildJava(signals, ctx, sigs, langTable, __onMountCode, __onUnmountCode, __effectCode, __refFields, className, layoutName, routesMap) {
  className = className || "MainActivity"
  layoutName = layoutName || "activity_main"
  routesMap = routesMap || {}
  const __routesCode = Object.entries(routesMap).map(([k, v]) => "        ROUTES.put(\"" + k + "\", " + v + ".class);").join(String.fromCharCode(10))
  const computedMethods = ctx.computedMethodsStr || ''
  const fields = signals.map(s => {
    const __jt = s.javaType === 'JSObject' ? 'Object' : s.javaType
    return '    private final Signal<' + __jt + '> ' + s.name + ' = new Signal<>(' + s.init + ');'
  }).join('\n')

  const persistList = signals.filter(x => x.persistKey)
  const getterMap = { Integer: 'getInt', String: 'getString', Boolean: 'getBoolean', Double: 'getFloat' }
  const setterMap = { Integer: 'putInt', String: 'putString', Boolean: 'putBoolean', Double: 'putFloat' }
  const persistCode = persistList.length ? '        android.content.SharedPreferences __prefs = getSharedPreferences("xunay", MODE_PRIVATE);\n' + persistList.map(x => {
    const g = getterMap[x.javaType] || 'getString'
    const st = setterMap[x.javaType] || 'putString'
    const saveVal = x.javaType === 'Integer' ? '((Number) val).intValue()' : x.javaType === 'Double' ? '((Number) val).floatValue()' : 'val'
    return '        ' + x.name + '.set(__prefs.' + g + '("' + x.persistKey + '", ' + x.init + '));\n' +
           '        ' + x.name + '.subscribe(val -> __prefs.edit().' + st + '("' + x.persistKey + '", ' + saveVal + ').apply());'
  }).join('\n') : ''

  const javaStyleLines = (ctx.javaStyles || [])

  const animLines = (ctx.animations || []).map(a => {
    const e = 'findViewById(R.id.' + a.id + ')'
    if (a.type === 'fadeIn') return '        ' + e + '.setAlpha(0f); ' + e + '.animate().alpha(1f).setDuration(' + a.duration + ').start();'
    if (a.type === 'fadeOut') return '        ' + e + '.animate().alpha(0f).setDuration(' + a.duration + ').start();'
    if (a.type === 'slideUp') return '        ' + e + '.setTranslationY(200f); ' + e + '.animate().translationY(0f).setDuration(' + a.duration + ').start();'
    if (a.type === 'slideDown') return '        ' + e + '.setTranslationY(-200f); ' + e + '.animate().translationY(0f).setDuration(' + a.duration + ').start();'
    if (a.type === 'scaleIn') return '        ' + e + '.setScaleX(0f); ' + e + '.setScaleY(0f); ' + e + '.animate().scaleX(1f).scaleY(1f).setDuration(' + a.duration + ').start();'
    return ''
  }).filter(Boolean)

  const evLines = []
  // 合并同元素的 focus / blur
  const __fbMap = new Map()
  const __evKeep = []
  for (const e of ctx.events) {
    if (e.raw && /^\{ (focus|blur):/.test(e.raw)) {
      const evName = e.raw.slice(2, e.raw.indexOf(':'))
      const cur = __fbMap.get(e.id) || { id: e.id, cls: e.cls, focus: null, blur: null }
      if (evName === 'focus') cur.focus = e
      else cur.blur = e
      __fbMap.set(e.id, cur)
    } else {
      __evKeep.push(e)
    }
  }
  for (const fb of __fbMap.values()) {
    const onF = fb.focus ? fb.focus.raw.replace(/^\{ focus:\s*/, '').replace(/\s*\}$/, '').trim() : null
    const onB = fb.blur ? fb.blur.raw.replace(/^\{ blur:\s*/, '').replace(/\s*\}$/, '').trim() : null
    const fBody = onF ? convertHandler(onF) : ''
    const bBody = onB ? convertHandler(onB) : ''
    evLines.push('        findViewById(R.id.' + fb.id + ').setOnFocusChangeListener((v, hasFocus) -> { if (hasFocus) { ' + fBody + ' } else { ' + bBody + ' } });')
  }
  for (const e of __evKeep) {
    if (e.type === 'src') {
      const srcVal = e.value.replace(/^['"]|['"]$/g, '')
      const srcLit = '"' + srcVal.replace(/"/g, '\\"') + '"'
      evLines.push('        loadImage((ImageView) findViewById(R.id.' + e.id + '), ' + srcLit + ');')
      continue
    }
    if (e.type === 'submitClick') {
      evLines.push('        findViewById(R.id.' + e.id + ').setOnClickListener(view -> ' + e.fnName + '());')
      continue
    }
    if (e.type === 'value') {
      const __r = j2jExpr(e.ast, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
      const __expr = __r.type === 'String' ? __r.code : 'String.valueOf(' + __r.code + ')'
      const __cast = '((android.widget.TextView) findViewById(R.id.' + e.id + '))'
      for (const __d of (e.deps || [])) {
        evLines.push('        ' + __d + '.subscribe(val -> { String __s = ' + __expr + '; if (!__s.equals(' + __cast + '.getText().toString())) ' + __cast + '.setText(__s); });')
      }
      continue
    }
    if (e.type === 'disabled') {
      const __r = j2jExpr(e.ast, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
      const __expr = __r.type === 'boolean' ? __r.code : 'Boolean.TRUE.equals(' + __r.code + ')'
      evLines.push('        findViewById(R.id.' + e.id + ').setEnabled(!(' + __expr + '));')
      for (const __d of (e.deps || [])) {
        evLines.push('        ' + __d + '.subscribe(val -> findViewById(R.id.' + e.id + ').setEnabled(!(' + __expr + ')));')
      }
      continue
    }
    const m = e.raw.match(/^\{\s*(\w+)\s*:\s*([\s\S]+?)\s*\}$/)
    if (!m) continue
    const ev = m[1], handler = m[2].trim()
    const sig = extractSignalName(handler)
    if (ev === 'click') {
      if (handler.trim().startsWith('async')) {
        let __done = false
        if (e.ast && e.ast.properties) {
          for (const __pr of e.ast.properties) {
            if (__pr.key.name === 'click' && __pr.value.type === 'ArrowFunctionExpression' && __pr.value.async) {
              const r = translateAsyncBody(ctx.src, __pr.value, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
              const body = r.lines.map(l => '            ' + l.trim()).join('\n')
              evLines.push('        findViewById(R.id.' + e.id + ').setOnClickListener(view -> { new Thread(() -> { try {')
              evLines.push(body)
              evLines.push('        } catch (Exception __e) { __e.printStackTrace(); } }).start(); });')
              __done = true
              break
            }
          }
        }
        if (!__done) {
          const bodyMatch = handler.match(/async[\s\S]*?\{\s*([\s\S]*?)\s*\}\s*$/)
          const asyncJava = bodyMatch ? asyncHandlerToJava(bodyMatch[1], sigs) : null
          if (asyncJava) {
            evLines.push('        findViewById(R.id.' + e.id + ').setOnClickListener(view -> { ' + asyncJava + ' });')
          } else {
            evLines.push('        findViewById(R.id.' + e.id + ').setOnClickListener(view -> { /* async unsupported */ });')
          }
        }
      } else {
        evLines.push('        findViewById(R.id.' + e.id + ').setOnClickListener(view -> { ' + convertHandler(handler) + ' });')
      }
    } else if (ev === 'input' && e.cls === 'EditText') {
      if (sig) {
        evLines.push('        ((EditText) findViewById(R.id.' + e.id + ')).addTextChangedListener(new android.text.TextWatcher() {')
        evLines.push('            public void afterTextChanged(android.text.Editable s) { ' + sig + '.set(s.toString()); }')
        evLines.push('            public void beforeTextChanged(CharSequence s, int a, int b, int c) {}')
        evLines.push('            public void onTextChanged(CharSequence s, int a, int b, int c) {}')
        evLines.push('        });')
      }
    } else if (ev === 'change') {
      if (CHECK_CLASSES.has(e.cls) && sig) {
        evLines.push('        ((' + e.cls + ') findViewById(R.id.' + e.id + ')).setOnCheckedChangeListener((btn, isChecked) -> ' + sig + '.set(isChecked));')
      } else if (SEEKBAR_CLASSES.has(e.cls) && sig) {
        evLines.push('        ((' + e.cls + ') findViewById(R.id.' + e.id + ')).setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener() {')
        evLines.push('            public void onProgressChanged(android.widget.SeekBar sb, int progress, boolean fromUser) { ' + sig + '.set(progress); }')
        evLines.push('            public void onStartTrackingTouch(android.widget.SeekBar sb) {}')
        evLines.push('            public void onStopTrackingTouch(android.widget.SeekBar sb) {}')
        evLines.push('        });')
      } else if (e.cls === 'EditText' && sig) {
        evLines.push('        ((EditText) findViewById(R.id.' + e.id + ')).addTextChangedListener(new android.text.TextWatcher() {')
        evLines.push('            public void afterTextChanged(android.text.Editable s) { ' + sig + '.set(s.toString()); }')
        evLines.push('            public void beforeTextChanged(CharSequence s, int a, int b, int c) {}')
        evLines.push('            public void onTextChanged(CharSequence s, int a, int b, int c) {}')
        evLines.push('        });')
      }
    } else if (ev === 'blur' || ev === 'focus') {
      // 已合并处理
    } else if (ev === 'keydown' || ev === 'keyup') {
      evLines.push('        findViewById(R.id.' + e.id + ').setOnKeyListener((v, code, evt) -> { if (evt.getAction() == android.view.KeyEvent.ACTION_' + (ev === 'keydown' ? 'DOWN' : 'UP') + ') { ' + convertHandler(handler) + ' } return false; });')
    } else if (ev === 'scroll') {
      evLines.push('        if (findViewById(R.id.' + e.id + ') instanceof android.view.ViewGroup) ((android.view.ViewGroup) findViewById(R.id.' + e.id + ')).setOnScrollChangeListener((v, x, y, ox, oy) -> { ' + convertHandler(handler) + ' });')
    } else if (ev === 'mousedown' || ev === 'mouseup') {
      evLines.push('        findViewById(R.id.' + e.id + ').setOnTouchListener((v, evt) -> { if (evt.getAction() == android.view.MotionEvent.ACTION_' + (ev === 'mousedown' ? 'DOWN' : 'UP') + ') { ' + convertHandler(handler) + ' } return false; });')
    } else if (ev === 'touchstart' || ev === 'touchend') {
      evLines.push('        findViewById(R.id.' + e.id + ').setOnTouchListener((v, evt) -> { if (evt.getAction() == android.view.MotionEvent.ACTION_' + (ev === 'touchstart' ? 'DOWN' : 'UP') + ') { ' + convertHandler(handler) + ' } return false; });')
    }
  }

  const bindLines = ctx.binds.flatMap(b => {
    if (b.funcName) {
      return ['        ((TextView) findViewById(R.id.' + b.id + ')).setText(' + b.funcName + '("' + b.funcKey + '"));']
    }
    if (b.exprAst) {
      const r = j2jExpr(b.exprAst, { sigs: ctx.sigsJ2J, computedTypes: ctx.computedTypes })
      const rhs = r.type === 'String' ? r.code : 'String.valueOf(' + r.code + ')'
      if (b.oneShot) {
        return ['        ((TextView) findViewById(R.id.' + b.id + ')).setText(' + rhs + ');']
      }
      return (b.deps || []).map(d =>
        '        ' + d + '.subscribe(val -> ((TextView) findViewById(R.id.' + b.id + ')).setText(' + rhs + '));'
      )
    }
    let rhs
    if (b.ast && b.ast.type === 'TemplateLiteral') {
      rhs = exprToJava(b.ast, sigs)
    } else if (b.op && b.num) {
      rhs = '"' + (b.prefix || '').replace(/"/g, '\\"') + '" + (((Number) val).doubleValue() ' + b.op + ' ' + b.num + ')'
    } else if (b.prefix) {
      rhs = '"' + b.prefix.replace(/"/g, '\\"') + '" + val'
    } else {
      rhs = 'String.valueOf(val)'
    }
    if (b.oneShot) {
      return ['        ((TextView) findViewById(R.id.' + b.id + ')).setText(' + rhs + ');']
    }
    return ['        ' + b.sig + '.subscribe(val -> ((' + b.cls + ') findViewById(R.id.' + b.id + ')).setText(' + rhs + '));']
  })

  const progressLines = ctx.progressBinds.map(p =>
    '        ' + p.sig + '.subscribe(val -> ((' + p.cls + ') findViewById(R.id.' + p.id + ')).setProgress(val instanceof Number ? ((Number) val).intValue() : 0));'
  )

  const showLines = ctx.shows.flatMap(s => {
    const arr = []
    arr.push('        findViewById(R.id.' + s.id + ').setVisibility(android.view.View.GONE);')
    for (const d of (s.deps || [])) {
      arr.push('        ' + d + '.subscribe(val -> findViewById(R.id.' + s.id + ').setVisibility(' + s.javaCond + ' ? android.view.View.VISIBLE : android.view.View.GONE));')
    }
    return arr
  })

  const listRenders = ctx.lists.map(l => {
    const filterCond = l.filterAst ? filterToJava(l.filterAst, sigs) : null
    const methodName = 'renderList_' + l.id
    if (filterCond) {
      const mapExpr = l.mapAst ? mapToJava(l.mapAst, sigs) : null
      const addLine = mapExpr
        ? '            __f.add(' + mapExpr + ');'
        : '            __f.add(__it);'
      const body = [
        '    private void ' + methodName + '() {',
        '        java.util.List<Object> __f = new java.util.ArrayList<>();',
        '        java.util.List<?> __val = ' + l.sig + '.get();',
        '        if (__val != null) for (Object __it : __val) { if (' + filterCond + ') { ' + addLine + ' } }',
        '        ListAdapter a = new ListAdapter(__f);',
        '        androidx.recyclerview.widget.RecyclerView rv = (androidx.recyclerview.widget.RecyclerView) findViewById(R.id.' + l.id + ');',
        '        rv.setLayoutManager(new androidx.recyclerview.widget.LinearLayoutManager(this));',
        '        rv.setAdapter(a);',
        '    }'
      ].join('\n')
      return { method: body, deps: l.deps || [l.sig], methodName }
    }
    const body = [
      '    private void ' + methodName + '() {',
      '        ListAdapter a = new ListAdapter(' + l.sig + '.get());',
      '        androidx.recyclerview.widget.RecyclerView rv = (androidx.recyclerview.widget.RecyclerView) findViewById(R.id.' + l.id + ');',
      '        rv.setLayoutManager(new androidx.recyclerview.widget.LinearLayoutManager(this));',
      '        rv.setAdapter(a);',
      '    }'
    ].join('\n')
    return { method: body, deps: l.deps || [l.sig], methodName }
  })

  const listLines = listRenders.map(r =>
    r.deps.map(dep => '        ' + dep + '.subscribe(val -> ' + r.methodName + '());').join('\n')
  )

  const listMethods = listRenders.map(r => r.method).join('\n')

  const hasList = ctx.lists.length > 0
  const listAdapter = hasList ? `
    private class ListAdapter extends androidx.recyclerview.widget.RecyclerView.Adapter<ListAdapter.VH> {
        private final java.util.List<?> items;
        ListAdapter(java.util.List<?> items) { this.items = items != null ? items : new java.util.ArrayList<>(); }
        public VH onCreateViewHolder(android.view.ViewGroup parent, int viewType) {
            TextView tv = new TextView(MainActivity.this);
            tv.setPadding(24, 24, 24, 24);
            tv.setTextSize(16f);
            return new VH(tv);
        }
        public void onBindViewHolder(VH h, int pos) { h.tv.setText(String.valueOf(items.get(pos))); }
        public int getItemCount() { return items.size(); }
        class VH extends androidx.recyclerview.widget.RecyclerView.ViewHolder {
            TextView tv;
            VH(TextView v) { super(v); tv = v; }
        }
    }` : ''

  // 生成 i18n 表
  let __i18nLines = []
  if (langTable) {
    for (const [langName, table] of Object.entries(langTable)) {
      const varName = 'lang_' + langName.replace(/[^a-zA-Z0-9_]/g, '_')
      __i18nLines.push('        java.util.Map<String, String> ' + varName + ' = new java.util.HashMap<>();')
      for (const [k, v] of Object.entries(table)) {
        __i18nLines.push('        ' + varName + '.put("' + k + '", "' + String(v).replace(/"/g, '\\"') + '");')
      }
      __i18nLines.push('        I18N.put("' + langName + '", ' + varName + ');')
    }
  } else {
    __i18nLines.push('        // 未定义 LANG 表')
  }
  const __i18nCode = [
    '    private static final java.util.Map<String, java.util.Map<String, String>> I18N = new java.util.HashMap<>();',
    '    static {',
    ...__i18nLines.map(l => '    ' + l),
    '    }',
    '    private String __lang = "zh";',
    '    private void setLang(String lang) { this.__lang = lang; recreate(); }',
    '    private String t(String key) {',
    '        java.util.Map<String, String> m = I18N.get(__lang);',
    '        return m != null ? m.getOrDefault(key, key) : key;',
    '    }'
  ].join(String.fromCharCode(10))

  return `package com.xunay.app;

import android.app.Activity;
import android.os.Bundle;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;

public class ${className} extends Activity {
${fields}\n${__refFields}

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.${layoutName});\n${__routesCode ? '\n' + __routesCode + '\n' : ''}\n${persistCode}
${__effectCode ? '\n' + __effectCode + '\n' : ''}
${__onMountCode ? '\n' + __onMountCode + '\n' : ''}
${javaStyleLines.join('\n')}
${animLines.join('\n')}
${evLines.join('\n')}
${bindLines.join('\n')}
${progressLines.join('\n')}
${showLines.join('\n')}
${listLines.map(x => Array.isArray(x) ? x.join('\n') : x).join('\n')}
    }

${__i18nCode}

    private void readFile(String name, Signal<String> target) {
        new Thread(() -> {
            try {
                java.io.FileInputStream fis = openFileInput(name);
                java.io.BufferedReader r = new java.io.BufferedReader(new java.io.InputStreamReader(fis));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = r.readLine()) != null) sb.append(line).append(System.lineSeparator());
                r.close();
                final String result = sb.toString();
                runOnUiThread(() -> target.set(result));
            } catch (Exception e) { e.printStackTrace(); }
        }).start();
    }

    private void writeFile(String name, Signal<String> source) {
        try {
            java.io.FileOutputStream fos = openFileOutput(name, MODE_PRIVATE);
            fos.write(String.valueOf(source.get()).getBytes());
            fos.close();
        } catch (Exception e) { e.printStackTrace(); }
    }

    private void showNotification(String title, String body) {
        String channelId = "xunay_default";
        android.app.NotificationManager nm = (android.app.NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            android.app.NotificationChannel ch = new android.app.NotificationChannel(channelId, "xunay", android.app.NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
        }
        android.app.Notification.Builder b = new android.app.Notification.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body);
        nm.notify((int) System.currentTimeMillis(), b.build());
    }

    private String fetchBlocking(String url) {
        try {
            java.net.URL u = new java.net.URL(url);
            java.net.HttpURLConnection c = (java.net.HttpURLConnection) u.openConnection();
            c.setRequestMethod("GET");
            java.io.BufferedReader r = new java.io.BufferedReader(new java.io.InputStreamReader(c.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = r.readLine()) != null) sb.append(line).append(System.lineSeparator());
            r.close();
            return sb.toString();
        } catch (Exception e) { return "Error: " + e.getMessage(); }
    }

    private void setTheme(String mode) {
        boolean dark = "dark".equals(mode);
        int bg = dark ? 0xFF121212 : 0xFFFFFFFF;
        int fg = dark ? 0xFFEEEEEE : 0xFF222222;
        android.view.View __root = findViewById(android.R.id.content);
        if (__root != null) __root.setBackgroundColor(bg);
        applyThemeColors(__root, fg);
    }
    private void applyThemeColors(android.view.View v, int fg) {
        if (v == null) return;
        if (v instanceof android.widget.TextView) ((android.widget.TextView) v).setTextColor(fg);
        if (v instanceof android.view.ViewGroup) {
            android.view.ViewGroup g = (android.view.ViewGroup) v;
            for (int i = 0; i < g.getChildCount(); i++) applyThemeColors(g.getChildAt(i), fg);
        }
    }
    private static final java.util.Map<String, java.lang.Class<?>> ROUTES = new java.util.HashMap<>();
    private void gotoPage(String name) {
        java.lang.Class<?> cls = ROUTES.get(name);
        if (cls == null) return;
        android.content.Intent it = new android.content.Intent(this, cls);
        startActivity(it);
    }

    private void gotoPage2(String name, String[] keys, String[] vals) {
        java.lang.Class<?> cls = ROUTES.get(name);
        if (cls == null) return;
        android.content.Intent it = new android.content.Intent(this, cls);
        for (int i = 0; i < keys.length && i < vals.length; i++) it.putExtra(keys[i], vals[i]);
        startActivity(it);
    }

    private String param(String key) {
        String v = getIntent().getStringExtra(key);
        return v == null ? "" : v;
    }
    private android.content.SharedPreferences getPrefs() {
        return getSharedPreferences("xunay-kv", MODE_PRIVATE);
    }
    private String getPref(String key) {
        return getPrefs().getString(key, null);
    }
    private void setPref(String key, String value) {
        getPrefs().edit().putString(key, value).apply();
    }
    private void removePref(String key) {
        getPrefs().edit().remove(key).apply();
    }
    private void clearPref() {
        getPrefs().edit().clear().apply();
    }

    private void fetchUrl(String url, Signal<String> target) {
        new Thread(() -> {
            try {
                java.net.URL u = new java.net.URL(url);
                java.net.HttpURLConnection c = (java.net.HttpURLConnection) u.openConnection();
                c.setRequestMethod("GET");
                java.io.BufferedReader r = new java.io.BufferedReader(new java.io.InputStreamReader(c.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = r.readLine()) != null) sb.append(line).append(System.lineSeparator());
                r.close();
                final String result = sb.toString();
                runOnUiThread(() -> target.set(result));
            } catch (Exception e) {
                final String err = "Error: " + e.getMessage();
                runOnUiThread(() -> target.set(err));
            }
        }).start();
    }

    private void loadImage(ImageView iv, String url) {
        // 用 Glide 自动缓存（内存 + 磁盘）
        com.bumptech.glide.Glide.with(iv).load(url).into(iv);
    }
${__onUnmountCode ? '    @Override\n    protected void onDestroy() {\n        super.onDestroy();\n' + __onUnmountCode + '\n    }\n\n' : ''}
${listAdapter}
${listMethods}
${computedMethods}
${ARRAY_HELPERS}
}
`
}

const SIGNAL_RUNTIME = `package com.xunay.app;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class Signal<T> {
    private T value;
    private final List<Consumer<T>> subs = new ArrayList<>();
    public Signal(T init) { this.value = init; }
    public T get() { return value; }
    public void set(T v) {
        this.value = v;
        if (android.os.Looper.myLooper() == android.os.Looper.getMainLooper()) {
            for (Consumer<T> s : subs) s.accept(v);
        } else {
            new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
                for (Consumer<T> s : subs) s.accept(v);
            });
        }
    }
    public void subscribe(Consumer<T> fn) {
        subs.add(fn);
        fn.accept(value);
    }
}
`

const MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <application android:label="xunay" android:theme="@android:style/Theme.Material.Light.NoActionBar" android:configChanges="uiMode|orientation|screenSize">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
`

const BUILD_GRADLE = `plugins { id 'com.android.application' version '8.6.0' }
android {
    namespace 'com.xunay.app'
    compileSdk 35
    defaultConfig { applicationId 'com.xunay.app'; minSdk 24; targetSdk 35; versionCode 6; versionName "3.0" }
    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }

    signingConfigs {
        release {
            if (project.hasProperty('XUNAY_KEYSTORE') && project.XUNAY_KEYSTORE) {
                storeFile file(project.XUNAY_KEYSTORE)
                storePassword project.XUNAY_KEYSTORE_PASSWORD ?: ''
                keyAlias project.XUNAY_KEY_ALIAS ?: ''
                keyPassword project.XUNAY_KEY_PASSWORD ?: ''
            }
        }
    }

    buildTypes {
        release {
            if (project.hasProperty('XUNAY_KEYSTORE') && project.XUNAY_KEYSTORE) {
                signingConfig signingConfigs.release
            }
            minifyEnabled false
        }
    }
}
dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    implementation 'com.google.android.flexbox:flexbox:3.0.0'
}
`

const GRADLE_PROPERTIES = `android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8

# release 签名（可选，留空则只编 debug）
XUNAY_KEYSTORE=
XUNAY_KEYSTORE_PASSWORD=
XUNAY_KEY_ALIAS=
XUNAY_KEY_PASSWORD=
`

const SETTINGS_GRADLE = `pluginManagement {
    repositories { google(); mavenCentral(); gradlePluginPortal() }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
}
rootProject.name = 'xunay-app'
include ':app'
`
