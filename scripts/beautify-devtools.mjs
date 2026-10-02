import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.ui", s)

// 替换 injectCSS 内容 —— 从 "function injectCSS()" 到下一个 "/* ========== 面板 ========== */"
const cssStart = s.indexOf("  function injectCSS() {")
const cssEnd = s.indexOf("  /* ========== 面板 ========== */")
if (cssStart < 0 || cssEnd < 0) throw new Error("未找到 injectCSS 段落")

const newCSS = `  function injectCSS() {
    if (document.getElementById('__xd_css__')) return
    var s = document.createElement('style')
    s.id = '__xd_css__'
    s.textContent = [
      /* ==== 面板 ==== */
      '.__xd_panel__{',
      '  position:fixed;z-index:2147483646;',
      '  background:rgba(13,17,23,.88);',
      '  backdrop-filter:blur(24px) saturate(180%);',
      '  -webkit-backdrop-filter:blur(24px) saturate(180%);',
      '  color:#c9d1d9;',
      '  font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;',
      '  display:flex;flex-direction:column;overflow:hidden;',
      '  border:1px solid rgba(99,102,241,.35);',
      '  box-shadow:0 24px 64px rgba(0,0,0,.65),0 0 0 1px rgba(99,102,241,.15) inset,0 0 60px rgba(99,102,241,.08);',
      '  animation:__xd_in__ .32s cubic-bezier(.16,1,.3,1)',
      '}',
      '@keyframes __xd_in__{',
      '  from{opacity:0;transform:translateY(16px) scale(.97)}',
      '  to{opacity:1;transform:translateY(0) scale(1)}',
      '}',
      '.__xd_panel__.closing{animation:__xd_out__ .22s cubic-bezier(.4,0,1,1) forwards}',
      '@keyframes __xd_out__{',
      '  to{opacity:0;transform:translateY(20px) scale(.96)}',
      '}',
      '.__xd_panel__.desktop{right:16px;bottom:84px;width:720px;height:480px;border-radius:16px}',
      '.__xd_panel__.mobile{left:0;right:0;bottom:0;width:100vw;height:68vh;border-radius:20px 20px 0 0;padding-bottom:env(safe-area-inset-bottom);animation:__xd_up__ .34s cubic-bezier(.16,1,.3,1)}',
      '@keyframes __xd_up__{',
      '  from{transform:translateY(100%)}',
      '  to{transform:translateY(0)}',
      '}',
      '.__xd_panel__.mobile::before{',
      '  content:"";position:absolute;top:8px;left:50%;transform:translateX(-50%);',
      '  width:40px;height:4px;border-radius:2px;',
      '  background:linear-gradient(90deg,#6366f1,#8b5cf6);opacity:.6',
      '}',

      /* ==== 顶栏 ==== */
      '.__xd_head__{',
      '  display:flex;padding:12px 14px;align-items:center;gap:8px;flex-shrink:0;',
      '  border-bottom:1px solid rgba(99,102,241,.15);',
      '  position:relative;overflow:hidden',
      '}',
      '.__xd_head__::after{',
      '  content:"";position:absolute;bottom:0;left:0;right:0;height:1px;',
      '  background:linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent);',
      '  animation:__xd_scan__ 3s linear infinite',
      '}',
      '@keyframes __xd_scan__{',
      '  0%{transform:translateX(-100%)}',
      '  100%{transform:translateX(100%)}',
      '}',
      '.__xd_head__ .t{',
      '  background:linear-gradient(135deg,#79c0ff,#a5b4fc,#c4b5fd);',
      '  -webkit-background-clip:text;background-clip:text;color:transparent;',
      '  font-weight:700;font-size:13px;letter-spacing:.3px',
      '}',
      '.__xd_head__ .sp{flex:1}',
      '.__xd_head__ button{',
      '  background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.2);',
      '  color:#a5b4fc;min-width:34px;height:34px;border-radius:10px;',
      '  font-size:15px;cursor:pointer;font-family:inherit;',
      '  display:inline-flex;align-items:center;justify-content:center;',
      '  transition:all .18s cubic-bezier(.4,0,.2,1)',
      '}',
      '.__xd_head__ button:hover{',
      '  background:rgba(99,102,241,.25);border-color:rgba(99,102,241,.6);',
      '  color:#c4b5fd;transform:scale(1.06)',
      '}',
      '.__xd_head__ button:active{transform:scale(.94)}',

      /* ==== Tabs ==== */
      '.__xd_tabs__{',
      '  display:flex;background:rgba(22,27,34,.6);',
      '  border-bottom:1px solid rgba(99,102,241,.15);',
      '  overflow-x:auto;flex-shrink:0;scrollbar-width:none;padding:0 6px',
      '}',
      '.__xd_tabs__::-webkit-scrollbar{display:none}',
      '.__xd_tabs__ button{',
      '  background:transparent;border:0;position:relative;',
      '  color:#6e7681;padding:12px 18px;font:inherit;font-size:12.5px;',
      '  white-space:nowrap;cursor:pointer;flex-shrink:0;font-family:inherit;',
      '  transition:color .2s;letter-spacing:.2px;font-weight:500',
      '}',
      '.__xd_tabs__ button::after{',
      '  content:"";position:absolute;bottom:0;left:50%;right:50%;height:2px;',
      '  background:linear-gradient(90deg,#6366f1,#8b5cf6);',
      '  border-radius:2px 2px 0 0;transition:left .25s cubic-bezier(.4,0,.2,1),right .25s cubic-bezier(.4,0,.2,1)',
      '}',
      '.__xd_tabs__ button:hover{color:#c9d1d9}',
      '.__xd_tabs__ button.on{color:#c4b5fd}',
      '.__xd_tabs__ button.on::after{left:16px;right:16px}',

      /* ==== 主体 ==== */
      '.__xd_body__{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;min-height:0;font-size:12px}',
      '.__xd_body__::-webkit-scrollbar{width:6px;height:6px}',
      '.__xd_body__::-webkit-scrollbar-thumb{background:rgba(99,102,241,.35);border-radius:3px}',
      '.__xd_body__::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,.6)}',
      '.__xd_empty__{padding:60px 20px;text-align:center;color:#6e7681;font-size:12px;animation:__xd_fade__ .4s}',
      '@keyframes __xd_fade__{from{opacity:0}to{opacity:1}}',

      /* ==== 行 ==== */
      '.__xd_row__{',
      '  padding:8px 16px;display:flex;gap:8px;align-items:center;',
      '  border-bottom:1px solid rgba(99,102,241,.06);',
      '  cursor:pointer;white-space:nowrap;min-height:34px;',
      '  transition:background .15s,transform .15s;',
      '  position:relative;animation:__xd_rowin__ .25s backwards',
      '}',
      '@keyframes __xd_rowin__{from{opacity:0;transform:translateX(-4px)}}',
      '.__xd_row__:hover{background:rgba(99,102,241,.09)}',
      '.__xd_row__:active{transform:scale(.995)}',
      '.__xd_row__.s{cursor:default}',
      '.__xd_row__.s:hover{background:transparent}',

      /* ==== 标签 ==== */
      '.__xd_tag__{',
      '  display:inline-block;padding:3px 8px;border-radius:6px;',
      '  font-size:10px;font-weight:700;flex-shrink:0;letter-spacing:.4px;',
      '  box-shadow:0 0 12px currentColor;text-shadow:0 0 8px currentColor',
      '}',
      '.__xd_tag__.get{background:rgba(31,111,235,.18);color:#60a5fa}',
      '.__xd_tag__.post{background:rgba(63,185,80,.18);color:#4ade80}',
      '.__xd_tag__.put,.__xd_tag__.patch{background:rgba(210,153,34,.18);color:#fbbf24}',
      '.__xd_tag__.del{background:rgba(248,81,73,.18);color:#f87171}',
      '.__xd_tag__.s2{background:rgba(63,185,80,.18);color:#4ade80}',
      '.__xd_tag__.s3{background:rgba(210,153,34,.18);color:#fbbf24}',
      '.__xd_tag__.s4{background:rgba(240,136,62,.18);color:#fb923c}',
      '.__xd_tag__.s5{background:rgba(248,81,73,.18);color:#f87171}',
      '.__xd_tag__.pending{background:rgba(139,148,158,.18);color:#94a3b8}',

      /* ==== 日志 ==== */
      '.__xd_log__{',
      '  padding:7px 16px;border-bottom:1px solid rgba(99,102,241,.06);',
      '  white-space:pre-wrap;word-break:break-word;font-size:11.5px;',
      '  line-height:1.6;animation:__xd_rowin__ .22s backwards;',
      '  border-left:2px solid transparent;transition:background .15s',
      '}',
      '.__xd_log__:hover{background:rgba(99,102,241,.06)}',
      '.__xd_log__.error{color:#f87171;border-left-color:rgba(248,81,73,.5)}',
      '.__xd_log__.warn{color:#fbbf24;border-left-color:rgba(210,153,34,.5)}',
      '.__xd_log__.log{color:#c9d1d9}',

      /* ==== 代码块 ==== */
      '.__xd_code__{',
      '  background:linear-gradient(135deg,rgba(22,27,34,.9),rgba(13,17,23,.9));',
      '  border:1px solid rgba(99,102,241,.2);border-radius:12px;',
      '  padding:12px 14px;font-size:11px;max-height:260px;overflow:auto;',
      '  white-space:pre-wrap;word-break:break-all;margin:8px 16px 16px;',
      '  line-height:1.65;color:#c9d1d9;',
      '  box-shadow:0 4px 16px rgba(0,0,0,.3) inset;',
      '  animation:__xd_fade__ .3s',
      '}',

      /* ==== 拖拽手柄 ==== */
      '.__xd_drag__{position:absolute;background:transparent;z-index:10}',
      '.__xd_drag__.e{right:0;top:0;width:6px;height:100%;cursor:ew-resize}',
      '.__xd_drag__.s{left:0;bottom:0;width:100%;height:6px;cursor:ns-resize}',
      '.__xd_drag__.se{right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize}',
      '.__xd_drag__.se::after{',
      '  content:"";position:absolute;right:4px;bottom:4px;width:8px;height:8px;',
      '  border-right:2px solid rgba(99,102,241,.5);border-bottom:2px solid rgba(99,102,241,.5);',
      '  border-radius:0 0 3px 0',
      '}',

      /* ==== 移动端 ==== */
      '@media(max-width:768px){',
      '  .__xd_panel__.desktop{display:none}',
      '  .__xd_row__{min-height:40px;padding:10px 16px;font-size:12.5px}',
      '  .__xd_tabs__ button{padding:14px 16px;font-size:13px}',
      '  .__xd_head__ button{min-width:40px;height:40px;font-size:17px}',
      '  .__xd_head__ .t{font-size:13.5px}',
      '}',

      /* ==== 按钮（拖拽时产生光晕） ====',
      '.__xd_glow__{',
      '  position:fixed;pointer-events:none;z-index:2147483645;',
      '  width:120px;height:120px;border-radius:50%;',
      '  background:radial-gradient(circle,rgba(99,102,241,.4),transparent 65%);',
      '  transition:opacity .3s;opacity:0',
      '}',
      '.__xd_glow__.on{opacity:1}'
    ].join('\\n')
    document.head.appendChild(s)
  }

`
s = s.slice(0, cssStart) + newCSS + s.slice(cssEnd)

// 按钮 CSS 也升级（拖拽时发光 + 脉冲）
const oldBtnCSS = /'position:fixed',[\s\S]*?'transition:box-shadow \.15s'\s*\]\.join\(';'\)/
const newBtnCSS = `'position:fixed',
    'right:16px',
    'bottom:16px',
    'width:60px',
    'height:60px',
    'border-radius:50%',
    'border:0',
    'background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)',
    'background-size:200% 200%',
    'color:#fff',
    'font-size:26px',
    'z-index:2147483647',
    'box-shadow:0 8px 24px rgba(99,102,241,.55),0 0 32px rgba(139,92,246,.35)',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'padding:0',
    'cursor:grab',
    '-webkit-tap-highlight-color:transparent',
    'font-family:inherit',
    'touch-action:none',
    'user-select:none',
    '-webkit-user-select:none',
    'transition:box-shadow .25s,transform .15s,font-size .15s',
    'animation:__xd_pulse__ 3s ease-in-out infinite'
  ].join(';')`
s = s.replace(oldBtnCSS, newBtnCSS)

// 注入按钮动画 + 光晕
s = s.replace(
  "  document.body.appendChild(btn)\n",
  `  // 按钮动画样式
  var animCSS = document.createElement('style')
  animCSS.textContent = [
    '@keyframes __xd_pulse__{',
    '  0%,100%{box-shadow:0 8px 24px rgba(99,102,241,.55),0 0 32px rgba(139,92,246,.35)}',
    '  50%{box-shadow:0 8px 28px rgba(99,102,241,.75),0 0 48px rgba(139,92,246,.55)}',
    '}',
    '.__xd_btn_dragging__{cursor:grabbing!important;transform:scale(1.12);',
    '  box-shadow:0 12px 36px rgba(99,102,241,.85),0 0 64px rgba(139,92,246,.7)!important}'
  ].join('')
  document.head.appendChild(animCSS)

  // 拖动时的光晕
  var glow = document.createElement('div')
  glow.className = '__xd_glow__'
  document.body.appendChild(glow)

  document.body.appendChild(btn)
`
)

// onDown / onMove / onUp 加光晕效果
s = s.replace(
  "    btn.style.cursor = 'grabbing'\n  }\n  function onMove(e) {",
  "    btn.style.cursor = 'grabbing'\n    btn.classList.add('__xd_btn_dragging__')\n    // 光晕跟随\n    var p2 = getBtnPos()\n    glow.style.left = (p2.left + btn.offsetWidth / 2 - 60) + 'px'\n    glow.style.top = (p2.top + btn.offsetHeight / 2 - 60) + 'px'\n    glow.classList.add('on')\n  }\n  function onMove(e) {"
)

s = s.replace(
  "    var c = clampPos(ox + dx, oy + dy)\n    btn.style.left = c.left + 'px'\n    btn.style.top = c.top + 'px'\n    btn.style.right = 'auto'\n    btn.style.bottom = 'auto'\n  }",
  "    var c = clampPos(ox + dx, oy + dy)\n    btn.style.left = c.left + 'px'\n    btn.style.top = c.top + 'px'\n    btn.style.right = 'auto'\n    btn.style.bottom = 'auto'\n    glow.style.left = (c.left + btn.offsetWidth / 2 - 60) + 'px'\n    glow.style.top = (c.top + btn.offsetHeight / 2 - 60) + 'px'\n  }"
)

s = s.replace(
  "    dragging = false\n    btn.style.cursor = 'grab'\n    if (moved) {",
  "    dragging = false\n    btn.style.cursor = 'grab'\n    btn.classList.remove('__xd_btn_dragging__')\n    glow.classList.remove('on')\n    if (moved) {"
)

// 打开/关闭时按钮发光变化
s = s.replace(
  "    btn.textContent = '×'\n    btn.style.background = '#ef4444'\n    btn.style.fontSize = '30px'\n    btn.style.boxShadow = '0 6px 20px rgba(239,68,68,.5)'",
  "    btn.textContent = '×'\n    btn.style.background = 'linear-gradient(135deg,#ef4444,#f87171,#fb923c)'\n    btn.style.backgroundSize = '200% 200%'\n    btn.style.fontSize = '32px'\n    btn.style.animation = 'none'\n    btn.style.boxShadow = '0 8px 24px rgba(239,68,68,.6),0 0 40px rgba(248,113,113,.45)'"
)

s = s.replace(
  "    btn.textContent = '🔧'\n    btn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)'\n    btn.style.fontSize = '24px'\n    btn.style.boxShadow = '0 6px 20px rgba(99,102,241,.5)'",
  "    btn.textContent = '🔧'\n    btn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)'\n    btn.style.backgroundSize = '200% 200%'\n    btn.style.fontSize = '26px'\n    btn.style.animation = '__xd_pulse__ 3s ease-in-out infinite'\n    btn.style.boxShadow = '0 8px 24px rgba(99,102,241,.55),0 0 32px rgba(139,92,246,.35)'"
)

// close 加动画
s = s.replace(
  `  function close() {
    if (!XD.open) return
    XD.open = false
    if (panel) { panel.remove(); panel = null }`,
  `  function close() {
    if (!XD.open) return
    XD.open = false
    var p = panel
    if (p) {
      p.classList.add('closing')
      setTimeout(function () { if (p && p.parentNode) p.remove() }, 220)
      panel = null
    }`
)

writeFileSync(p, s)
console.log("UI 美化完成")
