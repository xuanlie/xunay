// XuNay 编译器 v2 - 入口
import { parse } from './parser.js'
import { genFunction } from './gen.js'

export function compile(src) {
  const nodes = parse(src)
  if (nodes.length === 0) return src
  return genFunction('__compiled', nodes, src)
}
