// SSR 校验：客户端 vnode 和服务端 DOM 必须对齐
export function verifyHydration(dom, vnode, path = '') {
  if (vnode == null || vnode === false || vnode === true) return true
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (dom.nodeType !== 3) {
      console.error(`[xunay hydrate] 期望文本节点 @ ${path || 'root'}`, dom)
      return false
    }
    return true
  }
  if (typeof vnode === 'function') return verifyHydration(dom, vnode(), path)
  if (!vnode.type) return true
  if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vnode.type) {
    console.error(`[xunay hydrate] 标签不匹配 @ ${path || 'root'}`, vnode.type, dom)
    return false
  }
  const kids = vnode.children
  const dkids = dom.childNodes
  for (let i = 0; i < kids.length; i++) {
    verifyHydration(dkids[i], kids[i], `${path}/${vnode.type}[${i}]`)
  }
  return true
}

// 用法：在 mount 里判断 root 有 SSR 内容时走 verifyHydration 再 hydrate

