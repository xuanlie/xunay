// 编译器错误上下文——parser 抛异常时提供行号 + 附近代码
export function describeError(src, pos, msg) {
  const before = src.slice(0, pos)
  const line = before.split('\n').length
  const col = pos - before.lastIndexOf('\n')
  const lineStart = before.lastIndexOf('\n') + 1
  const lineEnd = src.indexOf('\n', pos)
  const text = src.slice(lineStart, lineEnd < 0 ? src.length : lineEnd)
  const caret = ' '.repeat(Math.max(0, col - 1)) + '^'
  return [
    `[xunay compile] ${msg}`,
    `  行 ${line}, 列 ${col}`,
    `  ${text}`,
    `  ${caret}`
  ].join('\n')
}

export function wrapError(src, pos, msg, cause) {
  const e = new Error(describeError(src, pos, msg))
  e.pos = pos
  e.cause = cause
  return e
}

// TODO: parser.js 里 `throw new Error(...)` 换成 wrapError(src, pos, ...)

