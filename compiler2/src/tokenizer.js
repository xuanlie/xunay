// XuNay 编译器 v2 - 词法分析
const TAGS = new Set('div span p a button input form label ul ol li h1 h2 h3 h4 h5 h6 img br hr table thead tbody tr td th pre code blockquote header footer nav main section article select option textarea checkbox switch radio progress slider tabs tab canvas video audio summary details'.split(' '))

export { TAGS }

export function tokenize(src) {
  const tokens = []
  let i = 0
  const N = src.length
  while (i < N) {
    const c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '/' && src[i+1] === '/') { while (i < N && src[i] !== '\n') i++; continue }
    if (c === '/' && src[i+1] === '*') { i += 2; while (i < N && !(src[i]==='*'&&src[i+1]==='/')) i++; i += 2; continue }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; let v = c; i++
      while (i < N && src[i] !== q) { if (src[i] === '\\') { v += src[i] + src[i+1]; i += 2; continue } v += src[i]; i++ }
      v += src[i] || ''; i++
      tokens.push({ t: 'str', v }); continue
    }
    if (/[a-zA-Z_$]/.test(c)) {
      let v = ''
      while (i < N && /[\w$]/.test(src[i])) { v += src[i]; i++ }
      tokens.push({ t: 'id', v }); continue
    }
    if (/[0-9]/.test(c)) {
      let v = ''
      while (i < N && /[\d.xXa-fA-F]/.test(src[i])) { v += src[i]; i++ }
      tokens.push({ t: 'num', v }); continue
    }
    if ('(){}[],:.='.includes(c)) { tokens.push({ t: 'p', v: c }); i++; continue }
    if ('+-*/<>!&|?'.includes(c)) {
      let v = c; i++
      while (i < N && '+-*/<>!&|='.includes(src[i])) { v += src[i]; i++ }
      tokens.push({ t: 'op', v }); continue
    }
    i++
  }
  return tokens
}
