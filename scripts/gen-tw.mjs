import fs from 'node:fs'

const OUT = 'core/src/tw.css'
const L = []
const push = (s) => L.push(s)

push('/* XuNay 工具类（自动生成，勿手改） */')
push('/* 源: scripts/gen-tw.mjs — 跑 node scripts/gen-tw.mjs 重新生成 */')
push('*, *::before, *::after { box-sizing: border-box; }')
push('')

const SPACING = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]
const kk = (n) => String(n).replace('.', '-')
const px = (n) => n * 4

const COLORS = {
  slate:  ['#f8fafc','#f1f5f9','#e2e8f0','#cbd5e1','#94a3b8','#64748b','#475569','#334155','#1e293b','#0f172a','#020617'],
  gray:   ['#f9fafb','#f3f4f6','#e5e7eb','#d1d5db','#9ca3af','#6b7280','#4b5563','#374151','#1f2937','#111827','#030712'],
  red:    ['#fef2f2','#fee2e2','#fecaca','#fca5a5','#f87171','#ef4444','#dc2626','#b91c1c','#991b1b','#7f1d1d','#450a0a'],
  orange: ['#fff7ed','#ffedd5','#fed7aa','#fdba74','#fb923c','#f97316','#ea580c','#c2410c','#9a3412','#7c2d12','#431407'],
  amber:  ['#fffbeb','#fef3c7','#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706','#b45309','#92400e','#78350f','#451a03'],
  yellow: ['#fefce8','#fef9c3','#fef08a','#fde047','#facc15','#eab308','#ca8a04','#a16207','#854d0e','#713f12','#422006'],
  lime:   ['#f7fee7','#ecfccb','#d9f99d','#bef264','#a3e635','#84cc16','#65a30d','#4d7c0f','#3f6212','#365314','#1a2e05'],
  green:  ['#f0fdf4','#dcfce7','#bbf7d0','#86efac','#4ade80','#22c55e','#16a34a','#15803d','#166534','#14532d','#052e16'],
  emerald:['#ecfdf5','#d1fae5','#a7f3d0','#6ee7b7','#34d399','#10b981','#059669','#047857','#065f46','#064e3b','#022c22'],
  teal:   ['#f0fdfa','#ccfbf1','#99f6e4','#5eead4','#2dd4bf','#14b8a6','#0d9488','#0f766e','#115e59','#134e4a','#042f2e'],
  cyan:   ['#ecfeff','#cffafe','#a5f3fc','#67e8f9','#22d3ee','#06b6d4','#0891b2','#0e7490','#155e75','#164e63','#083344'],
  sky:    ['#f0f9ff','#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9','#0284c7','#0369a1','#075985','#0c4a6e','#082f49'],
  blue:   ['#eff6ff','#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a','#172554'],
  indigo: ['#eef2ff','#e0e7ff','#c7d2fe','#a5b4fc','#818cf8','#6366f1','#4f46e5','#4338ca','#3730a3','#312e81','#1e1b4b'],
  violet: ['#f5f3ff','#ede9fe','#ddd6fe','#c4b5fd','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#2e1065'],
  purple: ['#faf5ff','#f3e8ff','#e9d5ff','#d8b4fe','#c084fc','#a855f7','#9333ea','#7e22ce','#6b21a8','#581c87','#3b0764'],
  fuchsia:['#fdf4ff','#fae8ff','#f5d0fe','#f0abfc','#e879f9','#d946ef','#c026d3','#a21caf','#86198f','#701a75','#4a044e'],
  pink:   ['#fdf2f8','#fce7f3','#fbcfe8','#f9a8d4','#f472b6','#ec4899','#db2777','#be185d','#9d174d','#831843','#500724'],
  rose:   ['#fff1f2','#ffe4e6','#fecdd3','#fda4af','#fb7185','#f43f5e','#e11d48','#be123c','#9f1239','#881337','#4c0519'],
}
const SHADES = ['50','100','200','300','400','500','600','700','800','900','950']

// ==== Display ====
for (const v of ['block','inline-block','inline','flex','inline-flex','grid','inline-grid','table','table-row','table-cell','table-caption','hidden','contents','flow-root','list-item']) {
  push('.' + v + ' { display: ' + (v === 'hidden' ? 'none' : v) + '; }')
}
push('')

// ==== Position ====
for (const v of ['static','fixed','absolute','relative','sticky']) push('.' + v + ' { position: ' + v + '; }')
for (const side of ['top','right','bottom','left','inset']) {
  for (const n of [0,1,2,3,4,5,6,8,10,12,16,20,24]) {
    push('.' + side + '-' + n + ' { ' + side + ': ' + px(n) + 'px; }')
  }
}
push('.inset-x-0 { left: 0; right: 0; }')
push('.inset-y-0 { top: 0; bottom: 0; }')
push('')

// ==== Flex / Grid ====
for (const v of ['start','end','center','baseline','stretch']) {
  const av = v === 'start' ? 'flex-start' : v === 'end' ? 'flex-end' : v
  push('.items-' + v + ' { align-items: ' + av + '; }')
}
for (const v of ['start','end','center','between','around','evenly']) {
  const jv = v === 'start' ? 'flex-start' : v === 'end' ? 'flex-end' : v === 'between' ? 'space-between' : v === 'around' ? 'space-around' : 'space-evenly'
  push('.justify-' + v + ' { justify-content: ' + jv + '; }')
}
for (const v of ['auto','start','end','center','stretch','baseline']) {
  const av = v === 'start' ? 'flex-start' : v === 'end' ? 'flex-end' : v
  push('.self-' + v + ' { align-self: ' + av + '; }')
}
for (const v of ['row','row-reverse','col','col-reverse']) {
  const dv = v === 'col' ? 'column' : v === 'col-reverse' ? 'column-reverse' : v
  push('.flex-' + v + ' { flex-direction: ' + dv + '; }')
}
push('.flex-wrap { flex-wrap: wrap; }')
push('.flex-wrap-reverse { flex-wrap: wrap-reverse; }')
push('.flex-nowrap { flex-wrap: nowrap; }')
push('.flex-1 { flex: 1 1 0%; }')
push('.flex-auto { flex: 1 1 auto; }')
push('.flex-initial { flex: 0 1 auto; }')
push('.flex-none { flex: none; }')
push('.grow { flex-grow: 1; }')
push('.grow-0 { flex-grow: 0; }')
push('.shrink { flex-shrink: 1; }')
push('.shrink-0 { flex-shrink: 0; }')
for (let i = 1; i <= 12; i++) push('.grid-cols-' + i + ' { grid-template-columns: repeat(' + i + ', minmax(0, 1fr)); }')
for (let i = 1; i <= 12; i++) push('.col-span-' + i + ' { grid-column: span ' + i + ' / span ' + i + '; }')
for (let i = 1; i <= 6; i++) push('.row-span-' + i + ' { grid-row: span ' + i + ' / span ' + i + '; }')
push('.col-span-full { grid-column: 1 / -1; }')
push('.grid-flow-row { grid-auto-flow: row; }')
push('.grid-flow-col { grid-auto-flow: column; }')
push('.grid-flow-dense { grid-auto-flow: dense; }')
push('.grid-flow-row-dense { grid-auto-flow: row dense; }')
push('.grid-flow-col-dense { grid-auto-flow: column dense; }')
push('.place-items-center { place-items: center; }')
push('.place-content-center { place-content: center; }')
push('')

// ==== Spacing ====
for (const n of SPACING) {
  const key = kk(n), p = px(n)
  push('.p-' + key + ' { padding: ' + p + 'px; }')
  push('.px-' + key + ' { padding-left: ' + p + 'px; padding-right: ' + p + 'px; }')
  push('.py-' + key + ' { padding-top: ' + p + 'px; padding-bottom: ' + p + 'px; }')
  push('.pt-' + key + ' { padding-top: ' + p + 'px; }')
  push('.pr-' + key + ' { padding-right: ' + p + 'px; }')
  push('.pb-' + key + ' { padding-bottom: ' + p + 'px; }')
  push('.pl-' + key + ' { padding-left: ' + p + 'px; }')
  push('.m-' + key + ' { margin: ' + p + 'px; }')
  push('.mx-' + key + ' { margin-left: ' + p + 'px; margin-right: ' + p + 'px; }')
  push('.my-' + key + ' { margin-top: ' + p + 'px; margin-bottom: ' + p + 'px; }')
  push('.mt-' + key + ' { margin-top: ' + p + 'px; }')
  push('.mr-' + key + ' { margin-right: ' + p + 'px; }')
  push('.mb-' + key + ' { margin-bottom: ' + p + 'px; }')
  push('.ml-' + key + ' { margin-left: ' + p + 'px; }')
  push('.gap-' + key + ' { gap: ' + p + 'px; }')
  push('.gap-x-' + key + ' { column-gap: ' + p + 'px; }')
  push('.gap-y-' + key + ' { row-gap: ' + p + 'px; }')
}
push('.m-auto { margin: auto; }')
push('.mx-auto { margin-left: auto; margin-right: auto; }')
push('.my-auto { margin-top: auto; margin-bottom: auto; }')
push('.mt-auto { margin-top: auto; }')
push('.mr-auto { margin-right: auto; }')
push('.mb-auto { margin-bottom: auto; }')
push('.ml-auto { margin-left: auto; }')
push('.space-x-1 > * + * { margin-left: 4px; }')
push('.space-x-2 > * + * { margin-left: 8px; }')
push('.space-x-3 > * + * { margin-left: 12px; }')
push('.space-x-4 > * + * { margin-left: 16px; }')
push('.space-y-1 > * + * { margin-top: 4px; }')
push('.space-y-2 > * + * { margin-top: 8px; }')
push('.space-y-3 > * + * { margin-top: 12px; }')
push('.space-y-4 > * + * { margin-top: 16px; }')
push('.space-y-6 > * + * { margin-top: 24px; }')
push('.space-y-8 > * + * { margin-top: 32px; }')
push('')

// ==== Sizing ====
for (const n of SPACING) {
  const key = kk(n), p = px(n)
  push('.w-' + key + ' { width: ' + p + 'px; }')
  push('.h-' + key + ' { height: ' + p + 'px; }')
  push('.size-' + key + ' { width: ' + p + 'px; height: ' + p + 'px; }')
  push('.min-w-' + key + ' { min-width: ' + p + 'px; }')
  push('.min-h-' + key + ' { min-height: ' + p + 'px; }')
  push('.max-w-' + key + ' { max-width: ' + p + 'px; }')
  push('.max-h-' + key + ' { max-height: ' + p + 'px; }')
}
const FRACS = [['1-2','50%'],['1-3','33.333333%'],['2-3','66.666667%'],['1-4','25%'],['2-4','50%'],['3-4','75%'],['1-5','20%'],['2-5','40%'],['3-5','60%'],['4-5','80%'],['1-6','16.666667%'],['5-6','83.333333%'],['1-12','8.333333%'],['5-12','41.666667%'],['7-12','58.333333%'],['11-12','91.666667%']]
for (const [key, pct] of FRACS) {
  push('.w-' + key + ' { width: ' + pct + '; }')
  push('.h-' + key + ' { height: ' + pct + '; }')
}
push('.w-auto { width: auto; }')
push('.w-full { width: 100%; }')
push('.w-screen { width: 100vw; }')
push('.w-min { width: min-content; }')
push('.w-max { width: max-content; }')
push('.w-fit { width: fit-content; }')
push('.h-auto { height: auto; }')
push('.h-full { height: 100%; }')
push('.h-screen { height: 100vh; }')
push('.h-min { height: min-content; }')
push('.h-max { height: max-content; }')
push('.h-fit { height: fit-content; }')
push('.min-w-0 { min-width: 0; }')
push('.min-w-full { min-width: 100%; }')
push('.min-h-0 { min-height: 0; }')
push('.min-h-full { min-height: 100%; }')
push('.min-h-screen { min-height: 100vh; }')
push('.max-w-xs { max-width: 320px; }')
push('.max-w-sm { max-width: 384px; }')
push('.max-w-md { max-width: 448px; }')
push('.max-w-lg { max-width: 512px; }')
push('.max-w-xl { max-width: 576px; }')
push('.max-w-2xl { max-width: 672px; }')
push('.max-w-3xl { max-width: 768px; }')
push('.max-w-4xl { max-width: 896px; }')
push('.max-w-5xl { max-width: 1024px; }')
push('.max-w-6xl { max-width: 1152px; }')
push('.max-w-7xl { max-width: 1280px; }')
push('.max-w-full { max-width: 100%; }')
push('.max-w-none { max-width: none; }')
push('.max-h-full { max-height: 100%; }')
push('.max-h-screen { max-height: 100vh; }')
push('')

// ==== Typography ====
const FS = { xs:12, sm:14, base:16, lg:18, xl:20, '2xl':24, '3xl':30, '4xl':36, '5xl':48, '6xl':60, '7xl':72, '8xl':96, '9xl':128 }
for (const [k, sz] of Object.entries(FS)) push('.text-' + k + ' { font-size: ' + sz + 'px; }')
const FW = { thin:100, extralight:200, light:300, normal:400, medium:500, semibold:600, bold:700, extrabold:800, black:900 }
for (const [k, w] of Object.entries(FW)) push('.font-' + k + ' { font-weight: ' + w + '; }')
push('.italic { font-style: italic; }')
push('.not-italic { font-style: normal; }')
push('.text-left { text-align: left; }')
push('.text-center { text-align: center; }')
push('.text-right { text-align: right; }')
push('.text-justify { text-align: justify; }')
for (const [k, v] of Object.entries({ none:1, tight:1.25, snug:1.375, normal:1.5, relaxed:1.625, loose:2 })) push('.leading-' + k + ' { line-height: ' + v + '; }')
for (const [k, v] of Object.entries({ tighter:'-0.05em', tight:'-0.025em', normal:'0', wide:'0.025em', wider:'0.05em', widest:'0.1em' })) push('.tracking-' + k + ' { letter-spacing: ' + v + '; }')
push('.uppercase { text-transform: uppercase; }')
push('.lowercase { text-transform: lowercase; }')
push('.capitalize { text-transform: capitalize; }')
push('.normal-case { text-transform: none; }')
push('.underline { text-decoration-line: underline; }')
push('.overline { text-decoration-line: overline; }')
push('.line-through { text-decoration-line: line-through; }')
push('.no-underline { text-decoration-line: none; }')
push('.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }')
push('.text-ellipsis { text-overflow: ellipsis; }')
push('.text-clip { text-overflow: clip; }')
push('.whitespace-normal { white-space: normal; }')
push('.whitespace-nowrap { white-space: nowrap; }')
push('.whitespace-pre { white-space: pre; }')
push('.whitespace-pre-line { white-space: pre-line; }')
push('.whitespace-pre-wrap { white-space: pre-wrap; }')
push('.break-normal { word-break: normal; overflow-wrap: normal; }')
push('.break-words { overflow-wrap: break-word; }')
push('.break-all { word-break: break-all; }')
push('.break-keep { word-break: keep-all; }')
push('')

// ==== Colors ====
for (const [name, arr] of Object.entries(COLORS)) {
  SHADES.forEach((sh, i) => {
    const hex = arr[i]
    push('.bg-' + name + '-' + sh + ' { background-color: ' + hex + '; }')
    push('.text-' + name + '-' + sh + ' { color: ' + hex + '; }')
    push('.border-' + name + '-' + sh + ' { border-color: ' + hex + '; }')
    push('.ring-' + name + '-' + sh + ' { outline-color: ' + hex + '; }')
  })
}
push('.bg-white { background-color: #fff; }')
push('.bg-black { background-color: #000; }')
push('.bg-transparent { background-color: transparent; }')
push('.bg-current { background-color: currentColor; }')
push('.text-white { color: #fff; }')
push('.text-black { color: #000; }')
push('.text-transparent { color: transparent; }')
push('.text-current { color: currentColor; }')
push('.border-white { border-color: #fff; }')
push('.border-black { border-color: #000; }')
push('.border-transparent { border-color: transparent; }')
push('')

// ==== Borders ====
push('.border { border-width: 1px; border-style: solid; }')
push('.border-0 { border-width: 0; }')
push('.border-2 { border-width: 2px; border-style: solid; }')
push('.border-4 { border-width: 4px; border-style: solid; }')
push('.border-8 { border-width: 8px; border-style: solid; }')
for (const side of ['t','r','b','l']) {
  push('.border-' + side + ' { border-' + (side === 't' ? 'top' : side === 'r' ? 'right' : side === 'b' ? 'bottom' : 'left') + '-width: 1px; border-' + (side === 't' ? 'top' : side === 'r' ? 'right' : side === 'b' ? 'bottom' : 'left') + '-style: solid; }')
  push('.border-' + side + '-0 { border-' + (side === 't' ? 'top' : side === 'r' ? 'right' : side === 'b' ? 'bottom' : 'left') + '-width: 0; }')
}
push('.border-solid { border-style: solid; }')
push('.border-dashed { border-style: dashed; }')
push('.border-dotted { border-style: dotted; }')
push('.border-double { border-style: double; }')
push('.border-none { border-style: none; }')
push('.rounded-none { border-radius: 0; }')
push('.rounded-sm { border-radius: 2px; }')
push('.rounded { border-radius: 4px; }')
push('.rounded-md { border-radius: 6px; }')
push('.rounded-lg { border-radius: 8px; }')
push('.rounded-xl { border-radius: 12px; }')
push('.rounded-2xl { border-radius: 16px; }')
push('.rounded-3xl { border-radius: 24px; }')
push('.rounded-full { border-radius: 9999px; }')
push('')

// ==== Shadow ====
push('.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }')
push('.shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1); }')
push('.shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); }')
push('.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1); }')
push('.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }')
push('.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }')
push('.shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.05); }')
push('.shadow-none { box-shadow: none; }')
for (let i = 0; i <= 100; i += 5) push('.opacity-' + i + ' { opacity: ' + (i / 100) + '; }')
push('')

// ==== Z / Order ====
for (const n of [0,10,20,30,40,50]) push('.z-' + n + ' { z-index: ' + n + '; }')
push('.z-auto { z-index: auto; }')
for (let i = 1; i <= 12; i++) push('.order-' + i + ' { order: ' + i + '; }')
push('.order-first { order: -9999; }')
push('.order-last { order: 9999; }')
push('.order-none { order: 0; }')
push('')

// ==== Overflow ====
for (const v of ['auto','hidden','visible','scroll','clip']) {
  push('.overflow-' + v + ' { overflow: ' + v + '; }')
  push('.overflow-x-' + v + ' { overflow-x: ' + v + '; }')
  push('.overflow-y-' + v + ' { overflow-y: ' + v + '; }')
}
push('')

// ==== Interactivity ====
for (const v of ['auto','default','pointer','wait','text','move','help','not-allowed','none','grab','grabbing']) {
  push('.cursor-' + v + ' { cursor: ' + v + '; }')
}
for (const v of ['none','text','all','auto']) push('.select-' + v + ' { user-select: ' + v + '; }')
push('.pointer-events-none { pointer-events: none; }')
push('.pointer-events-auto { pointer-events: auto; }')
push('.visible { visibility: visible; }')
push('.invisible { visibility: hidden; }')
push('.collapse { visibility: collapse; }')
push('')

// ==== Transform ====
for (const v of [0,50,75,90,95,100,105,110,125,150]) push('.scale-' + v + ' { transform: scale(' + (v / 100) + '); }')
for (const [k,v] of Object.entries({0:'0',45:'45deg',90:'90deg',180:'180deg'})) push('.rotate-' + k + ' { transform: rotate(' + v + '); }')
push('.rotate--45 { transform: rotate(-45deg); }')
push('.rotate--90 { transform: rotate(-90deg); }')
push('.rotate--180 { transform: rotate(-180deg); }')
push('')

// ==== Transition ====
push('.transition { transition: all 0.15s ease; }')
push('.transition-none { transition: none; }')
push('.transition-all { transition: all 0.15s ease; }')
push('.transition-colors { transition: color, background-color, border-color, fill, stroke 0.15s ease; }')
push('.transition-opacity { transition: opacity 0.15s ease; }')
push('.transition-shadow { transition: box-shadow 0.15s ease; }')
push('.transition-transform { transition: transform 0.15s ease; }')
for (const ms of [75,100,150,200,300,500,700,1000]) push('.duration-' + ms + ' { transition-duration: ' + ms + 'ms; }')
push('.ease-linear { transition-timing-function: linear; }')
push('.ease-in { transition-timing-function: cubic-bezier(0.4,0,1,1); }')
push('.ease-out { transition-timing-function: cubic-bezier(0,0,0.2,1); }')
push('.ease-in-out { transition-timing-function: cubic-bezier(0.4,0,0.2,1); }')
push('')

// ==== Object / Aspect ====
for (const v of ['contain','cover','fill','none','scale-down']) push('.object-' + v + ' { object-fit: ' + v + '; }')
for (const v of ['center','top','bottom','left','right']) push('.object-' + v + ' { object-position: ' + v + '; }')
push('.aspect-auto { aspect-ratio: auto; }')
push('.aspect-square { aspect-ratio: 1 / 1; }')
push('.aspect-video { aspect-ratio: 16 / 9; }')
push('.aspect-4-3 { aspect-ratio: 4 / 3; }')
push('')

// ==== A11y ====
push('.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0; }')
push('.not-sr-only { position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal; }')
push('')

// ==== 响应式 ====
const BP = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
for (const [name, width] of Object.entries(BP)) {
  push('@media (min-width: ' + width + 'px) {')
  for (const d of ['block','flex','inline-flex','grid','hidden']) {
    push('  .' + name + '\\:' + d + ' { display: ' + (d === 'hidden' ? 'none' : d) + '; }')
  }
  for (let i = 1; i <= 12; i++) push('  .' + name + '\\:grid-cols-' + i + ' { grid-template-columns: repeat(' + i + ', minmax(0, 1fr)); }')
  for (const d of ['row','col']) push('  .' + name + '\\:flex-' + d + ' { flex-direction: ' + (d === 'col' ? 'column' : d) + '; }')
  for (const [pk, pv] of [['p-4','16px'],['p-6','24px'],['p-8','32px']]) push('  .' + name + '\\:' + pk + ' { padding: ' + pv + '; }')
  for (const [wk, wv] of [['w-1-2','50%'],['w-1-3','33.333333%'],['w-1-4','25%']]) push('  .' + name + '\\:' + wk + ' { width: ' + wv + '; }')
  push('}')
  push('')
}

push('@media (max-width: 768px) {')
push('  * { -webkit-tap-highlight-color: transparent; }')
push('  button { min-height: 44px; touch-action: manipulation; }')
push('  input, textarea, select { font-size: 16px; min-height: 44px; }')
push('  img { max-width: 100%; height: auto; }')
push('}')

// ==== 追加 extra 规则 ====
{
  const { extraRules } = await import('./gen-tw-extra.mjs')
  L.push(...extraRules())
}

fs.writeFileSync(OUT, L.join('\n'), 'utf8')
console.log('OK: ' + OUT + ' — ' + L.length + ' 行, ' + fs.statSync(OUT).size + ' 字节')
