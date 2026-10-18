// compiler4/cpt —— cpt / pag / dt 转换
const KEYWORDS = ['cpt', 'pag', 'dt']

const HELPERS = [
  '// ═══ XuNay 极简语法 · 辅助 ═══',
  'const rand = (a, b) => Math.floor(a + Math.random() * (b - a + 1))',
  'const pick = arr => arr[Math.floor(Math.random() * arr.length)]',
].join('\n')

export function transformCpt(source) {
  let out = source
  for (const kw of KEYWORDS) {
    out = transformKeyword(out, kw)
  }
  if (out !== source && !out.includes('// ═══ XuNay') && /_n = /.test(out)) {
    out = HELPERS + '\n\n' + out
  }
  return out
}


function maskNonCode(source) {
  let out = '';
  let i = 0;
  let state = 'code';
  while (i < source.length) {
    const c = source[i], n = source[i + 1];
    if (state === 'line') {
      if (c === '\n') { out += '\n'; state = 'code'; }
      else out += ' ';
      i++; continue;
    }
    if (state === 'block') {
      if (c === '*' && n === '/') { out += '  '; i += 2; state = 'code'; }
      else { out += c === '\n' ? '\n' : ' '; i++; }
      continue;
    }
    if (state !== 'code') {
      if (c === '\\') { out += ' '; if (i + 1 < source.length) out += source[i + 1] === '\n' ? '\n' : ' '; i += 2; continue; }
      const end = (state === 'single' && c === "'") ||
                  (state === 'double' && c === '"') ||
                  (state === 'template' && c === '`');
      out += c === '\n' ? '\n' : ' ';
      if (end) state = 'code';
      i++; continue;
    }
    if (c === '/' && n === '/') { out += '  '; i += 2; state = 'line'; continue; }
    if (c === '/' && n === '*') { out += '  '; i += 2; state = 'block'; continue; }
    if (c === "'") { out += ' '; i++; state = 'single'; continue; }
    if (c === '"') { out += ' '; i++; state = 'double'; continue; }
    if (c === '`') { out += ' '; i++; state = 'template'; continue; }
    out += c; i++;
  }
  return out;
}

function transformKeyword(source, kw) {
  let result = ''
  let last = 0
  const scanSource = maskNonCode(source)
  const re = new RegExp(`(^|[\\s;{}()])${kw}\\s+([A-Za-z_$][\\w$]*)\\s*\\(`, 'g')
  let m
  while ((m = re.exec(scanSource))) {
    const prefix = m[1]
    const name = m[2]
    const parenStart = m.index + m[0].length - 1
    const parenEnd = matchBracket(source, parenStart, '(', ')')
    if (parenEnd < 0) { re.lastIndex = m.index + 1; continue }
    const args = source.slice(parenStart + 1, parenEnd).trim()

    let i = parenEnd + 1
    while (i < source.length && /\s/.test(source[i])) i++

    let replacement = null
    let end = i

    if (kw === 'dt') {
      if (source[i] === '{') {
        const braceEnd = matchBracket(source, i, '{', '}')
        if (braceEnd < 0) { re.lastIndex = m.index + 1; continue }
        const body = source.slice(i + 1, braceEnd)
        replacement = transformDt(name, args, body)
        end = braceEnd + 1
      } else { re.lastIndex = m.index + 1; continue }
    } else {
      if (source[i] === '=' && source[i + 1] === '>') {
        const exprStart = i + 2
        let j = exprStart, depth = 0, inStr = null
        while (j < source.length) {
          const c = source[j]
          if (inStr) {
            if (c === '\\') { j += 2; continue }
            if (c === inStr) inStr = null
            j++; continue
          }
          if (c === '"' || c === "'" || c === '`') { inStr = c; j++; continue }
          if (c === '(' || c === '[' || c === '{') depth++
          else if (c === ')' || c === ']' || c === '}') {
            if (depth === 0) break
            depth--
          } else if (depth === 0 && (c === '\n' || c === ';')) break
          j++
        }
        const expr = source.slice(exprStart, j).trim()
        replacement = `export const ${name} = (${args}) => ${expr}`
        end = j
      } else if (source[i] === '{') {
        const braceEnd = matchBracket(source, i, '{', '}')
        if (braceEnd < 0) { re.lastIndex = m.index + 1; continue }
        const body = source.slice(i + 1, braceEnd)
        const transformed = addImplicitReturn(body)
        replacement = `export function ${name}(${args}) {${transformed}}`
        end = braceEnd + 1
      } else { re.lastIndex = m.index + 1; continue }
    }

    result += source.slice(last, m.index) + prefix
    result += replacement
    last = end
    re.lastIndex = end
  }
  result += source.slice(last)
  return result
}

function matchBracket(src, start, open, close) {
  if (src[start] !== open) return -1
  let depth = 0, i = start, inStr = null, comment = null
  while (i < src.length) {
    const c = src[i], n = src[i + 1]
    if (comment === 'line') { if (c === '\n') comment = null; i++; continue }
    if (comment === 'block') {
      if (c === '*' && n === '/') { comment = null; i += 2; continue }
      i++; continue
    }
    if (inStr) {
      if (c === '\\') { i += 2; continue }
      if (c === inStr) inStr = null
      i++; continue
    }
    if (c === '/' && n === '/') { comment = 'line'; i += 2; continue }
    if (c === '/' && n === '*') { comment = 'block'; i += 2; continue }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return i }
    i++
  }
  return -1
}

// 智能隐式 return：保留缩进，支持多行表达式

function addImplicitReturn(body) {
  // 找到函数体最后一条顶层语句。
  // 扫描时忽略字符串、模板字符串和注释，并跳过括号内部换行。
  let segments = [];
  let start = 0;
  let i = 0;
  let paren = 0, bracket = 0, brace = 0;
  let state = 'code';

  function boundary(pos) {
    const raw = body.slice(start, pos);
    if (raw.trim()) segments.push({ start, end: pos, raw });
    start = pos + 1;
  }

  while (i < body.length) {
    const c = body[i];
    const n = body[i + 1];

    if (state === 'line') {
      if (c === '\n') state = 'code';
      i++;
      continue;
    }
    if (state === 'block') {
      if (c === '*' && n === '/') {
        state = 'code';
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (state === 'single' || state === 'double' || state === 'template') {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (
        (state === 'single' && c === "'") ||
        (state === 'double' && c === '"') ||
        (state === 'template' && c === '`')
      ) state = 'code';
      i++;
      continue;
    }

    if (c === '/' && n === '/') {
      state = 'line';
      i += 2;
      continue;
    }
    if (c === '/' && n === '*') {
      state = 'block';
      i += 2;
      continue;
    }
    if (c === "'") { state = 'single'; i++; continue; }
    if (c === '"') { state = 'double'; i++; continue; }
    if (c === '`') { state = 'template'; i++; continue; }

    if (c === '(') paren++;
    else if (c === ')') paren = Math.max(0, paren - 1);
    else if (c === '[') bracket++;
    else if (c === ']') bracket = Math.max(0, bracket - 1);
    else if (c === '{') brace++;
    else if (c === '}') brace = Math.max(0, brace - 1);

    if (paren === 0 && bracket === 0 && brace === 0) {
      if (c === ';') {
        boundary(i);
      } else if (c === '\n') {
        const prev = body.slice(start, i).trimEnd();
        let nextIndex = i + 1;
        while (nextIndex < body.length && /[ \t\r]/.test(body[nextIndex])) {
          nextIndex++;
        }
        const next = body[nextIndex] || '';

        // 运算符、逗号、成员访问等续行不能拆开。
        const continued =
          /(?:[+\-*\/%=&|!?<>.,:~^]|\\|\b(?:return|throw|yield|await|new))$/.test(prev) ||
          /^[.([+\-*\/%=&|!?<>:,~^]/.test(next);

        if (!continued) boundary(i);
      }
    }

    i++;
  }

  const tail = body.slice(start);
  if (tail.trim()) segments.push({ start, end: body.length, raw: tail });

  if (!segments.length) return body;

  const last = segments[segments.length - 1];
  const leading = (last.raw.match(/^\s*/) || [''])[0];
  const stmt = last.raw.slice(leading.length).trim();

  if (!stmt) return body;

  // 控制语句、声明、显式返回、注释不自动加 return。
  if (/^(?:return\b|const\b|let\b|var\b|if\b|for\b|while\b|switch\b|throw\b|try\b|do\b|break\b|continue\b|debugger\b|import\b|export\b|\/\/|\/\*)/.test(stmt)) {
    return body;
  }

  const before = body.slice(0, last.start);
  const after = body.slice(last.end);
  return before + leading + 'return ' + stmt + after;
}

function transformDt(name, args, body) {
  const fields = parseFields(body)
  if (!fields.length) return `export function ${name}() { return [] }`

  const trimmed = args.trim()
  let funcArgs, countExpr
  if (/^\d+$/.test(trimmed)) {
    funcArgs = ''
    countExpr = String(parseInt(trimmed, 10))
  } else if (/^[A-Za-z_$][\w$]*(\s*,\s*[A-Za-z_$][\w$]*)*$/.test(trimmed)) {
    const argName = trimmed.split(',')[0].trim()
    funcArgs = trimmed
    countExpr = `(${argName} === undefined ? 20 : (${argName} === 0 ? 100 : ${argName}))`
  } else {
    funcArgs = ''
    countExpr = trimmed
  }

  const fieldNames = fields.map(f => f.name)
  const fieldLines = fields.map(f => {
    let expr = f.expr
    // 把字段名引用替换成 row.字段名（跳过字符串）
    const strs = []
    expr = expr.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, (m) => {
      strs.push(m); return '__STR' + (strs.length - 1) + '__'
    })
    for (const fn of fieldNames) {
      if (fn === f.name) continue
      expr = expr.replace(new RegExp('(?<![.\\w$])' + fn + '\\b', 'g'), 'row.' + fn)
    }
    expr = expr.replace(/row\.row\./g, 'row.')
    expr = expr.replace(/__STR(\d+)__/g, (_, i) => strs[+i])
    return `    row.${f.name} = ${expr}`
  }).join('\n')
  return [
    `export function ${name}(${funcArgs}) {`,
    `  const _n = ${countExpr}`,
    `  const out = []`,
    `  for (let i = 0; i < _n; i++) {`,
    `    const seq = i + 1`,
    `    const row = {}`,
    fieldLines,
    `    out.push(row)`,
    `  }`,
    `  return out`,
    `}`,
  ].join('\n')
}

function parseFields(body) {
  const fields = []
  for (const line of body.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('//')) continue
    const m = t.match(/^([A-Za-z_$][\w$]*)\s*:\s*(.+?)\s*;?\s*$/)
    if (m) fields.push({ name: m[1], expr: m[2] })
  }
  return fields
}
