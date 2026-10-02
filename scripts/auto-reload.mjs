import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.autoreload2", s)

// 找 startHooks() 调用处，在它前面插入自动刷新 + signal 快照
const anchor = "  // 立即挂 hook，早于 app 里所有 fetch\n  startHooks()"
if (!s.includes(anchor)) throw new Error("未找到 startHooks 调用")

const autoReloadCode = `  // ===== Signal 值快照（刷新后恢复）=====
  function saveSignalSnapshot() {
    try {
      const snap = []
      for (const sg of S.signals) {
        try {
          let v = sg()
          // 排除函数（不可序列化）
          if (typeof v === 'function') continue
          snap.push(v)
        } catch (e) { snap.push(null) }
      }
      sessionStorage.setItem('__xd_sig_snapshot__', JSON.stringify({
        at: Date.now(),
        count: snap.length,
        values: snap
      }))
    } catch (e) {}
  }

  function restoreSignalSnapshot() {
    try {
      const raw = sessionStorage.getItem('__xd_sig_snapshot__')
      if (!raw) return
      const snap = JSON.parse(raw)
      // 5 分钟内的快照才恢复
      if (Date.now() - snap.at > 5 * 60 * 1000) {
        sessionStorage.removeItem('__xd_sig_snapshot__')
        return
      }
      // 等 signal 都创建完
      setTimeout(() => {
        const cur = S.signals.length
        const max = Math.min(snap.count, snap.values.length, cur)
        for (let i = 0; i < max; i++) {
          try {
            const v = snap.values[i]
            if (v === undefined) continue
            S.signals[i](v)
          } catch (e) {}
        }
        console.log('[devtools] 已恢复 ' + max + ' 个 signal 值')
      }, 150)
    } catch (e) {}
  }

  restoreSignalSnapshot()

  // ===== 自动刷新 =====
  ;(function setupAutoReload() {
    if (!location.search.includes('watch=1')) return

    let lastMod = null
    let firstProbe = true
    let pending = false

    async function probe() {
      if (pending) return
      let url = null
      const scripts = document.getElementsByTagName('script')
      for (const sc of scripts) {
        const src = sc.getAttribute('src') || ''
        if (src.includes('app.js')) { url = new URL(src, location.href).href; break }
      }
      if (!url) return
      try {
        const r = await fetch(url, { method: 'HEAD', cache: 'no-store' })
        if (!r.ok) return
        const m = r.headers.get('last-modified') || r.headers.get('etag') || ''
        if (firstProbe) { lastMod = m; firstProbe = false; console.log('[devtools] 自动刷新已开启，监控:', url); return }
        if (m && m !== lastMod) {
          console.log('[devtools] 检测到更新，保存数据后刷新')
          pending = true
          saveSignalSnapshot()
          setTimeout(() => location.reload(), 300)
          lastMod = m
        }
      } catch (e) {}
    }

    setTimeout(() => {
      probe()
      setInterval(probe, 2000)
    }, 1500)
  })()

  // 立即挂 hook，早于 app 里所有 fetch
  startHooks()`

s = s.replace(anchor, autoReloadCode)
writeFileSync(p, s)
console.log("自动刷新 + 数据恢复完成")
