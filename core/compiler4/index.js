import { transformCpt } from './cpt.js'
import { transformSdu } from './sdu.js'
import { transformXuy } from './xuy.js'
import { transformVmodel } from './vmodel.js'
import { transformEvent } from './event.js'
import { BUILTIN_CSS } from './builtins.js'


function maskNonCode(source) {
  // 保留字符位置和换行，屏蔽字符串、模板字符串、注释。
  // 用于语法探测，不用于实际源码转换。
  let out = '';
  let i = 0;
  let state = 'code';

  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1];

    if (state === 'line') {
      if (c === '\n') {
        out += '\n';
        state = 'code';
      } else {
        out += ' ';
      }
      i++;
      continue;
    }

    if (state === 'block') {
      if (c === '*' && n === '/') {
        out += '  ';
        i += 2;
        state = 'code';
      } else {
        out += c === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }

    if (state === 'single' || state === 'double' || state === 'template') {
      if (c === '\\') {
        out += ' ';
        if (i + 1 < source.length) {
          out += source[i + 1] === '\n' ? '\n' : ' ';
        }
        i += 2;
        continue;
      }
      if (
        (state === 'single' && c === "'") ||
        (state === 'double' && c === '"') ||
        (state === 'template' && c === '`')
      ) {
        out += ' ';
        state = 'code';
        i++;
        continue;
      }
      out += c === '\n' ? '\n' : ' ';
      i++;
      continue;
    }

    if (c === '/' && n === '/') {
      out += '  ';
      i += 2;
      state = 'line';
      continue;
    }
    if (c === '/' && n === '*') {
      out += '  ';
      i += 2;
      state = 'block';
      continue;
    }
    if (c === "'") {
      out += ' ';
      i++;
      state = 'single';
      continue;
    }
    if (c === '"') {
      out += ' ';
      i++;
      state = 'double';
      continue;
    }
    if (c === '`') {
      out += ' ';
      i++;
      state = 'template';
      continue;
    }

    out += c;
    i++;
  }

  return out;
}

export function needsCompile4(source) {
  if (typeof source !== 'string' || !source) return false;

  const code = maskNonCode(source);

  // 声明式极简语法
  if (/(^|[\s;{}()])(cpt|pag|dt)\s+[A-Za-z_$][\w$]*\s*\(/m.test(code)) {
    return true;
  }

  // xuy 生成器声明；参数内部仍由 transformXuy 解析原始源码
  if (/(^|[\s;{}()])xuy\s+[A-Za-z_$][\w$]*\s*=/m.test(code)) {
    return true;
  }

  // sdu<N> Comp(...)({...}) 与 sdu 内置组件调用
  if (/\bsdu\s*<\s*[^>\n]+\s*>\s*[A-Za-z_$][\w$]*/m.test(code)) {
    return true;
  }

  if (
    /\bsdu\s+(NavBar|Hero|CateGrid|GoodsCard|GoodsList|SeckillBar|Footer|SideBar|StatCard|StatRow|UserCard|UserRow|ListItem|Tabs|Breadcrumb|Empty|Loading|Table|Modal|Form)\s*\(/m.test(code)
  ) {
    return true;
  }

  return false;
}

export function compile4(source, opts = {}) {
  let out = source
  out = transformXuy(out)
  out = transformSdu(out)
  out = transformCpt(out)
  out = transformVmodel(out)
  out = transformEvent(out)

  if (/sdu\s+(NavBar|Hero|CateGrid|GoodsCard|GoodsList|SeckillBar|Footer|SideBar|StatCard|StatRow|UserCard|UserRow|ListItem|Tabs|Breadcrumb|Empty|Loading|Table|Modal|Form)\s*\(/.test(out)) {
    if (!out.includes('__sdu_css_injected__')) {
      const cssInject = `
// ── 内置 sdu 样式 ──
if (typeof document !== 'undefined' && !document.getElementById('sdu-builtin-css')) {
  const st = document.createElement('style')
  st.id = 'sdu-builtin-css'
  st.textContent = ${JSON.stringify(BUILTIN_CSS)}
  document.head.appendChild(st)
}
// __sdu_css_injected__
`
      out = out + '\n' + cssInject
    }
  }

  return out
}
