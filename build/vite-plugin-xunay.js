// vite 插件：把 .xuy 编译成 esm
import { readFileSync } from 'node:fs'
import { tokenize } from '../compiler2/src/tokenizer.js'
import { parse } from '../compiler2/src/parser.js'
import { genFunction } from '../compiler2/src/gen.js'

const XUY = /\.xuy$/

export default function xunay() {
  return {
    name: 'vite-plugin-xunay',
    enforce: 'pre',
    transform(src, id) {
      if (!XUY.test(id)) return null
      const raw = src || readFileSync(id, 'utf8')
      let nodes, code
      try {
        nodes = parse(raw)
        code = genFunction(id, nodes, raw)
      } catch (e) {
        this.error(e.message)
      }
      return { code, map: null }
    }
  }
}

// 用法：vite.config.js 里 plugins: [xunay()]

