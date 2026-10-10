// XuNay 编译器 v2 - 运行时辅助
// 编译后的代码依赖这些函数

import { effect } from '../../core/src/eff.js'

export function bindText(textNode, fn) {
  let prev
  effect(() => {
    const v = fn()
    const s = v == null ? '' : String(v)
    if (s !== prev) { textNode.textContent = s; prev = s }
  })
}

export function bindAttr(dom, key, fn) {
  let prev
  effect(() => {
    const v = fn()
    if (v !== prev) {
      if (key === 'class' || key === 'className') dom.className = v
      else if (key === 'value') dom.value = v
      else if (v == null || v === false) dom.removeAttribute(key)
      else dom.setAttribute(key, v)
      prev = v
    }
  })
}

export function bindStyle(dom, fn) {
  effect(() => {
    const s = fn()
    if (s && typeof s === 'object') Object.assign(dom.style, s)
  })
}
