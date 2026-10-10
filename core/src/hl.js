// XuNay 语法高亮 v2 · 12 种 token
const RULES = {
  js: [
    [/\/\/[^\n]*/g, 'c'],
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/`(?:[^`\\]|\\.)*`/g, 's'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 's'],
    [/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|delete|void|yield|in|of|static|get|set)\b/g, 'k'],
    [/\b(null|undefined|true|false|NaN|Infinity|this)\b/g, 'b'],
    [/\b(console|window|document|Math|JSON|Object|Array|String|Number|Boolean|Promise|Map|Set|Date|RegExp|Error|Symbol|globalThis)\b/g, 'b'],
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g, 't'],
    [/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, 'n'],
    [/\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g, 'n'],
    [/[a-zA-Z_$][\w$]*(?=\s*\()/g, 'f'],
    [/[+\-*/%=<>!&|^~?:]+/g, 'o'],
    [/[{}()\[\];,.]/g, 'm'],
  ],
  xuy: [
    [/\/\/[^\n]*/g, 'c'],
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/`(?:[^`\\]|\\.)*`/g, 's'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 's'],
    [/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|delete|void|yield|in|of|static|get|set)\b/g, 'k'],
    [/\b(null|undefined|true|false|NaN|Infinity|this)\b/g, 'b'],
    [/\b(console|window|document|Math|JSON|Object|Array|String|Number|Boolean|Promise|Map|Set|Date|RegExp|Error|Symbol|globalThis)\b/g, 'b'],
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g, 't'],
    [/\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, 'n'],
    [/\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g, 'n'],
    [/[a-zA-Z_$][\w$]*(?=\s*\()/g, 'f'],
    [/[+\-*/%=<>!&|^~?:]+/g, 'o'],
    [/[{}()\[\];,.]/g, 'm'],
    [/\b(div|span|p|a|button|input|form|label|ul|ol|li|h1|h2|h3|h4|h5|h6|table|thead|tbody|tr|td|th|img|header|footer|nav|main|section|article|select|option|textarea|pre|code|br|hr)(?=\s*\()/g, 'd'],
  ],

  ts: [
    [/\/\/[^\n]*/g, 'c'],
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/`(?:[^`\\]|\\.)*`/g, 's'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 's'],
    [/\b(interface|type|enum|namespace|declare|abstract|implements|public|private|protected|readonly|const|let|var|function|return|if|else|for|while|class|extends|super|import|export|from|default|async|await|try|catch|finally|throw|typeof|new|this|as|is|keyof|infer)\b/g, 'k'],
    [/\b(string|number|boolean|void|never|unknown|any|null|undefined|true|false)\b/g, 'b'],
    [/\b(console|window|document|Math|JSON|Object|Array|Promise|Map|Set|Date)\b/g, 'b'],
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g, 't'],
    [/\b\d+(\.\d+)?\b/g, 'n'],
    [/[a-zA-Z_$][\w$]*(?=\s*\()/g, 'f'],
    [/[+\-*/%=<>!&|^~?:]+/g, 'o'],
    [/[{}()\[\];,.]/g, 'm'],
  ],
  py: [
    [/#[^\n]*/g, 'c'],
    [/'''[\s\S]*?'''|"""[\s\S]*?"""/g, 's'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 's'],
    [/\b(def|class|return|if|elif|else|for|while|break|continue|import|from|as|try|except|finally|raise|with|lambda|yield|global|nonlocal|pass|async|await|and|or|not|is|in)\b/g, 'k'],
    [/\b(None|True|False|self|cls)\b/g, 'b'],
    [/\b(print|len|range|str|int|float|list|dict|set|tuple|type|isinstance|super|open)\b/g, 'b'],
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g, 't'],
    [/\b\d+(\.\d+)?\b/g, 'n'],
    [/[a-zA-Z_][\w]*(?=\s*\()/g, 'f'],
    [/@\w+/g, 'd'],
    [/[+\-*/%=<>!&|^~]+/g, 'o'],
    [/[{}()\[\];,.:]/g, 'm'],
  ],
  go: [
    [/\/\/[^\n]*/g, 'c'],
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/`[^`]*`/g, 's'],
    [/"(?:[^"\\]|\\.)*"/g, 's'],
    [/\b(package|import|func|return|if|else|for|range|break|continue|switch|case|default|var|const|type|struct|interface|map|chan|go|defer|select|make|new|len|cap|append|copy|delete|panic|recover)\b/g, 'k'],
    [/\b(nil|true|false|iota)\b/g, 'b'],
    [/\b(string|int|int8|int16|int32|int64|uint|float32|float64|bool|byte|rune|error|any)\b/g, 't'],
    [/\b(fmt|os|io|net|http|time|sync|context|errors|strings|strconv)\b/g, 'b'],
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g, 't'],
    [/\b\d+(\.\d+)?\b/g, 'n'],
    [/[a-zA-Z_][\w]*(?=\s*\()/g, 'f'],
    [/:=|<-|[+\-*/%=<>!&|^~]+/g, 'o'],
    [/[{}()\[\];,.]/g, 'm'],
  ],
  rust: [
    [/\/\/[^\n]*/g, 'c'],
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/"(?:[^"\\]|\\.)*"/g, 's'],
    [/\b(fn|let|mut|const|static|if|else|match|for|while|loop|break|continue|return|struct|enum|impl|trait|pub|use|mod|as|where|move|ref|self|Self|super|crate|async|await|dyn|unsafe)\b/g, 'k'],
    [/\b(true|false|None|Some|Ok|Err)\b/g, 'b'],
    [/\b(i8|i16|i32|i64|u8|u16|u32|u64|f32|f64|bool|char|str|String|Vec|Option|Result|HashMap|Box)\b/g, 't'],
    [/\b([A-Z][a-zA-Z0-9_]*)\b/g, 't'],
    [/\b\d+(\.\d+)?\b/g, 'n'],
    [/[a-z_][\w]*(?=\s*\()/g, 'f'],
    [/[a-z_]\w*!/g, 'd'],
    [/[+\-*/%=<>!&|^~]+/g, 'o'],
    [/[{}()\[\];,.:#]/g, 'm'],
  ],
  css: [
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/@[a-z-]+/g, 'd'],
    [/\.[a-zA-Z_-][\w-]*/g, 't'],
    [/#[a-zA-Z_-][\w-]*/g, 't'],
    [/[a-zA-Z-]+(?=\s*:)/g, 'p'],
    [/:[a-zA-Z-]+/g, 'b'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, 's'],
    [/#[0-9a-fA-F]{3,8}\b/g, 'n'],
    [/\b\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/g, 'n'],
    [/[+\-*/]/g, 'o'],
    [/[{}()\[\];,:]/g, 'm'],
  ],
  html: [
    [/<!--[\s\S]*?-->/g, 'c'],
    [/"[^"]*"|'[^']*'/g, 's'],
    [/<\/?[a-zA-Z][\w-]*/g, 't'],
    [/\/?>/g, 't'],
    [/[a-zA-Z-]+(?==)/g, 'p'],
    [/[{}()\[\];,.:]/g, 'm'],
  ],
  json: [
    [/"[^"\n]*"(?=\s*:)/g, 'p'],
    [/"[^"\n]*"/g, 's'],
    [/\b(true|false|null)\b/g, 'b'],
    [/-?\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, 'n'],
    [/[{}[\],:]/g, 'm'],
  ],
  sql: [
    [/--[^\n]*/g, 'c'],
    [/\/\*[\s\S]*?\*\//g, 'c'],
    [/'[^'\n]*'/g, 's'],
    [/\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|DROP|ALTER)\b/gi, 'k'],
    [/\b(COUNT|SUM|AVG|MAX|MIN|NOW|COALESCE|CAST)\b/gi, 'f'],
    [/\b\d+(\.\d+)?\b/g, 'n'],
    [/[+\-*/%=<>]+/g, 'o'],
    [/[{}()\[\];,.]/g, 'm'],
  ],
  yaml: [
    [/#[^\n]*/g, 'c'],
    [/^[\w-]+(?=:)/gm, 'p'],
    [/"[^"\n]*"|'[^'\n]*'/g, 's'],
    [/\b(true|false|null|yes|no|on|off)\b/gi, 'b'],
    [/\b\d+(\.\d+)?\b/g, 'n'],
    [/[{}()\[\];,.:?|-]/g, 'm'],
  ],
  bash: [
    [/#[^\n]*/g, 'c'],
    [/"(?:[^"\\]|\\.)*"|'[^'\n]*'/g, 's'],
    [/\$\{[^}]+\}|\$\w+/g, 'f'],
    [/\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|local|source|echo|cd|set|unset|read|test|alias|sudo)\b/g, 'k'],
    [/\b(true|false)\b/g, 'b'],
    [/\b\d+\b/g, 'n'],
    [/[+\-*/%=<>!&|]+/g, 'o'],
    [/[{}()\[\];,.]/g, 'm'],
  ],
  md: [
    [/^#{1,6} .+$/gm, 'k'],
    [/\*\*[^*]+\*\*|__[^_]+__/g, 'f'],
    [/\*[^*]+\*|_[^_]+_/g, 't'],
    [/`[^`\n]+`/g, 's'],
    [/^\s*[-*+] /gm, 'd'],
    [/^> .+$/gm, 'c'],
    [/\[[^\]]+\]\([^)]+\)/g, 'f'],
    [/```[\s\S]*?```/g, 'c'],
  ],
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

export function highlight(code, lang) {
  const rules = RULES[lang] || RULES.js
  const marks = []
  let out = code

  // 第一步：在原始文本上 token 化
  for (const [re, cls] of rules) {
    out = out.replace(re, m => {
      if (m.indexOf('\uE000') >= 0) return m
      const idx = marks.length
      marks.push({ cls: cls, text: m })
      return '\uE000' + String.fromCharCode(0xE100 + idx) + '\uE001'
    })
  }

  // 第二步：转义剩余的普通文本（& < >）
  out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 第三步：把占位符恢复成带样式的 span（token 文本也做转义）
  out = out.replace(/\uE000([\uE100-\uE8FF]+)\uE001/g, (_, ch) => {
    const m = marks[ch.charCodeAt(0) - 0xE100]
    if (!m) return ''
    const text = m.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return '<span class="h-' + m.cls + '">' + text + '</span>'
  })

  return out
}

export const languages = Object.keys(RULES)
