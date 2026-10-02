import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.netfilter", s)

// 在 renderNetwork 里的 S.nets 循环前插入过滤栏
const anchor = `    for (let i = S.nets.length - 1; i >= 0; i--) {
      const n = S.nets[i]
      const r = mk('div', '__xd_row__' + (S._selNet === n ? ' on' : ''))`

if (!s.includes(anchor)) throw new Error("未命中 renderNetwork 循环")

const filterBar = `    // 过滤 + 清除栏
    const filterBar = mk('div')
    filterBar.style.cssText = 'display:flex;gap:8px;padding:8px 16px;background:#f8f9fa;border-bottom:1px solid #dadce0;position:sticky;top:0;z-index:4;align-items:center'
    const fw = mk('div')
    fw.style.cssText = 'position:relative;display:flex;align-items:center;flex:1'
    fw.innerHTML = SVG.filter
    const fi = mk('input')
    fi.placeholder = '过滤 URL / 方法 / 状态码…'
    fi.value = S._netFilter || ''
    fi.style.cssText = 'flex:1;height:32px;padding:0 12px 0 32px;background:#fff;border:1px solid #dadce0;color:#202124;border-radius:8px;font:inherit;font-size:12.5px;outline:none;font-family:inherit'
    fi.onfocus = () => { fi.style.borderColor = '#8b5cf6'; fi.style.boxShadow = '0 0 0 3px rgba(139,92,246,.12)' }
    fi.onblur = () => { fi.style.borderColor = '#dadce0'; fi.style.boxShadow = 'none' }
    fi.oninput = () => { S._netFilter = fi.value; renderBody() }
    fw.appendChild(fi)
    filterBar.appendChild(fw)

    const clrBtn = mk('button')
    clrBtn.innerHTML = SVG.trash
    clrBtn.title = '清除所有请求'
    clrBtn.style.cssText = 'height:32px;min-width:36px;padding:0 10px;background:#fff;border:1px solid #dadce0;color:#5f6368;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .15s,color .15s,border-color .15s'
    clrBtn.onmouseenter = () => { clrBtn.style.background = '#fce8e6'; clrBtn.style.borderColor = '#f4b8b3'; clrBtn.style.color = '#c5221f' }
    clrBtn.onmouseleave = () => { clrBtn.style.background = '#fff'; clrBtn.style.borderColor = '#dadce0'; clrBtn.style.color = '#5f6368' }
    clrBtn.onclick = () => {
      S.nets.length = 0
      try { sessionStorage.removeItem('__xd_state__') } catch (e) {}
      renderBody()
      buildSidebar()
      buildTabBar()
    }
    filterBar.appendChild(clrBtn)

    const stat = mk('span')
    const total = S.nets.length
    const f = (S._netFilter || '').toLowerCase()
    const filtered = f ? S.nets.filter(n => {
      const hay = (n.url + ' ' + n.method + ' ' + (n.status || '') + ' ' + (n.statusText || '')).toLowerCase()
      return hay.includes(f)
    }).length : total
    stat.textContent = f ? (filtered + ' / ' + total) : (total + ' 条')
    stat.style.cssText = 'color:#9aa0a6;font-size:11px;font-family:ui-monospace,Consolas,monospace;white-space:nowrap'
    filterBar.appendChild(stat)

    mainEl.appendChild(filterBar)

    const fLower = (S._netFilter || '').toLowerCase()
    const matches = n => {
      if (!fLower) return true
      const hay = (n.url + ' ' + n.method + ' ' + (n.status || '') + ' ' + (n.statusText || '')).toLowerCase()
      return hay.includes(fLower)
    }

    let shownCount = 0
    for (let i = S.nets.length - 1; i >= 0; i--) {
      const n = S.nets[i]
      if (!matches(n)) continue
      shownCount++
      const r = mk('div', '__xd_row__' + (S._selNet === n ? ' on' : ''))`

s = s.replace(anchor, filterBar)

// 循环结尾：加"无匹配"提示
const loopEnd = `      r.onclick = () => { S._selNet = n; renderNetDetail(n) }
      mainEl.appendChild(r)
    }
  }

  let _netTab = 'overview'`

if (!s.includes(loopEnd)) throw new Error("未命中循环结尾")

s = s.replace(loopEnd, `      r.onclick = () => { S._selNet = n; renderNetDetail(n) }
      mainEl.appendChild(r)
    }
    if (!shownCount && fLower) {
      const emp = mk('div', '__xd_empty__', '没有匹配的请求')
      mainEl.appendChild(emp)
    }
  }

  let _netTab = 'overview'`)

writeFileSync(p, s)
console.log("网络过滤 + 清除完成")
