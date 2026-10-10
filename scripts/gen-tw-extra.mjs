// Tailwind 全面补齐（除任意值 JIT）
import fs from 'node:fs'

const SPACING = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]
const kk = (n) => String(n).replace('.', '-')
const px = (n) => n * 4

const COLORS = {
  slate:['#f8fafc','#f1f5f9','#e2e8f0','#cbd5e1','#94a3b8','#64748b','#475569','#334155','#1e293b','#0f172a','#020617'],
  gray:['#f9fafb','#f3f4f6','#e5e7eb','#d1d5db','#9ca3af','#6b7280','#4b5563','#374151','#1f2937','#111827','#030712'],
  red:['#fef2f2','#fee2e2','#fecaca','#fca5a5','#f87171','#ef4444','#dc2626','#b91c1c','#991b1b','#7f1d1d','#450a0a'],
  orange:['#fff7ed','#ffedd5','#fed7aa','#fdba74','#fb923c','#f97316','#ea580c','#c2410c','#9a3412','#7c2d12','#431407'],
  amber:['#fffbeb','#fef3c7','#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706','#b45309','#92400e','#78350f','#451a03'],
  yellow:['#fefce8','#fef9c3','#fef08a','#fde047','#facc15','#eab308','#ca8a04','#a16207','#854d0e','#713f12','#422006'],
  lime:['#f7fee7','#ecfccb','#d9f99d','#bef264','#a3e635','#84cc16','#65a30d','#4d7c0f','#3f6212','#365314','#1a2e05'],
  green:['#f0fdf4','#dcfce7','#bbf7d0','#86efac','#4ade80','#22c55e','#16a34a','#15803d','#166534','#14532d','#052e16'],
  emerald:['#ecfdf5','#d1fae5','#a7f3d0','#6ee7b7','#34d399','#10b981','#059669','#047857','#065f46','#064e3b','#022c22'],
  teal:['#f0fdfa','#ccfbf1','#99f6e4','#5eead4','#2dd4bf','#14b8a6','#0d9488','#0f766e','#115e59','#134e4a','#042f2e'],
  cyan:['#ecfeff','#cffafe','#a5f3fc','#67e8f9','#22d3ee','#06b6d4','#0891b2','#0e7490','#155e75','#164e63','#083344'],
  sky:['#f0f9ff','#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9','#0284c7','#0369a1','#075985','#0c4a6e','#082f49'],
  blue:['#eff6ff','#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a','#172554'],
  indigo:['#eef2ff','#e0e7ff','#c7d2fe','#a5b4fc','#818cf8','#6366f1','#4f46e5','#4338ca','#3730a3','#312e81','#1e1b4b'],
  violet:['#f5f3ff','#ede9fe','#ddd6fe','#c4b5fd','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#2e1065'],
  purple:['#faf5ff','#f3e8ff','#e9d5ff','#d8b4fe','#c084fc','#a855f7','#9333ea','#7e22ce','#6b21a8','#581c87','#3b0764'],
  fuchsia:['#fdf4ff','#fae8ff','#f5d0fe','#f0abfc','#e879f9','#d946ef','#c026d3','#a21caf','#86198f','#701a75','#4a044e'],
  pink:['#fdf2f8','#fce7f3','#fbcfe8','#f9a8d4','#f472b6','#ec4899','#db2777','#be185d','#9d174d','#831843','#500724'],
  rose:['#fff1f2','#ffe4e6','#fecdd3','#fda4af','#fb7185','#f43f5e','#e11d48','#be123c','#9f1239','#881337','#4c0519'],
}
const SHADES = ['50','100','200','300','400','500','600','700','800','900','950']

// ============ 类名 → CSS 声明（用于变体生成）============
function cssFor(cls) {
  const map = {
    'block':'display: block;','inline-block':'display: inline-block;','inline':'display: inline;',
    'flex':'display: flex;','inline-flex':'display: inline-flex;','grid':'display: grid;',
    'inline-grid':'display: inline-grid;','hidden':'display: none;','contents':'display: contents;',
    'items-start':'align-items: flex-start;','items-center':'align-items: center;',
    'items-end':'align-items: flex-end;','items-stretch':'align-items: stretch;',
    'items-baseline':'align-items: baseline;',
    'justify-start':'justify-content: flex-start;','justify-center':'justify-content: center;',
    'justify-end':'justify-content: flex-end;','justify-between':'justify-content: space-between;',
    'justify-around':'justify-content: space-around;','justify-evenly':'justify-content: space-evenly;',
    'self-auto':'align-self: auto;','self-start':'align-self: flex-start;','self-center':'align-self: center;',
    'self-end':'align-self: flex-end;','self-stretch':'align-self: stretch;',
    'flex-row':'flex-direction: row;','flex-col':'flex-direction: column;',
    'flex-row-reverse':'flex-direction: row-reverse;','flex-col-reverse':'flex-direction: column-reverse;',
    'flex-wrap':'flex-wrap: wrap;','flex-nowrap':'flex-wrap: nowrap;',
    'flex-1':'flex: 1 1 0%;','flex-auto':'flex: 1 1 auto;','flex-initial':'flex: 0 1 auto;','flex-none':'flex: none;',
    'grow':'flex-grow: 1;','grow-0':'flex-grow: 0;','shrink':'flex-shrink: 1;','shrink-0':'flex-shrink: 0;',
    'static':'position: static;','fixed':'position: fixed;','absolute':'position: absolute;',
    'relative':'position: relative;','sticky':'position: sticky;',
    'overflow-hidden':'overflow: hidden;','overflow-auto':'overflow: auto;',
    'overflow-visible':'overflow: visible;','overflow-scroll':'overflow: scroll;','overflow-clip':'overflow: clip;',
    'visible':'visibility: visible;','invisible':'visibility: hidden;','collapse':'visibility: collapse;',
    'pointer-events-none':'pointer-events: none;','pointer-events-auto':'pointer-events: auto;',
    'cursor-pointer':'cursor: pointer;','cursor-default':'cursor: default;',
    'cursor-not-allowed':'cursor: not-allowed;','cursor-wait':'cursor: wait;','cursor-text':'cursor: text;',
    'cursor-move':'cursor: move;','cursor-grab':'cursor: grab;',
    'border':'border-width: 1px; border-style: solid;',
    'border-0':'border-width: 0;','border-2':'border-width: 2px; border-style: solid;',
    'border-4':'border-width: 4px; border-style: solid;','border-8':'border-width: 8px; border-style: solid;',
    'border-solid':'border-style: solid;','border-dashed':'border-style: dashed;',
    'border-dotted':'border-style: dotted;','border-none':'border-style: none;',
    'rounded-none':'border-radius: 0;','rounded-sm':'border-radius: 2px;','rounded':'border-radius: 4px;',
    'rounded-md':'border-radius: 6px;','rounded-lg':'border-radius: 8px;','rounded-xl':'border-radius: 12px;',
    'rounded-2xl':'border-radius: 16px;','rounded-3xl':'border-radius: 24px;','rounded-full':'border-radius: 9999px;',
    'shadow-sm':'box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);',
    'shadow':'box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);',
    'shadow-md':'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);',
    'shadow-lg':'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);',
    'shadow-xl':'box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);',
    'shadow-2xl':'box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);',
    'shadow-none':'box-shadow: none;',
    'opacity-0':'opacity: 0;','opacity-25':'opacity: 0.25;','opacity-50':'opacity: 0.5;',
    'opacity-75':'opacity: 0.75;','opacity-100':'opacity: 1;',
    'bg-white':'background-color: #fff;','bg-black':'background-color: #000;',
    'bg-transparent':'background-color: transparent;','bg-current':'background-color: currentColor;',
    'text-white':'color: #fff;','text-black':'color: #000;','text-transparent':'color: transparent;',
    'text-current':'color: currentColor;',
    'text-left':'text-align: left;','text-center':'text-align: center;','text-right':'text-align: right;',
    'text-justify':'text-align: justify;',
    'uppercase':'text-transform: uppercase;','lowercase':'text-transform: lowercase;',
    'capitalize':'text-transform: capitalize;','normal-case':'text-transform: none;',
    'underline':'text-decoration-line: underline;','line-through':'text-decoration-line: line-through;',
    'no-underline':'text-decoration-line: none;',
    'italic':'font-style: italic;','not-italic':'font-style: normal;',
    'truncate':'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
    'w-auto':'width: auto;','w-full':'width: 100%;','w-screen':'width: 100vw;',
    'w-1-2':'width: 50%;','w-1-3':'width: 33.333333%;','w-2-3':'width: 66.666667%;',
    'w-1-4':'width: 25%;','w-3-4':'width: 75%;',
    'h-auto':'height: auto;','h-full':'height: 100%;','h-screen':'height: 100vh;',
    'm-auto':'margin: auto;','mx-auto':'margin-left: auto; margin-right: auto;',
  }
  if (map[cls]) return map[cls]
  // 动态
  const m = cls.match(/^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|w|h)-(\d+(?:-\d+)?)$/)
  if (m) {
    const n = parseFloat(m[2].replace('-', '.'))
    const v = px(n)
    const props = {
      p:'padding', px:'padding-left:padding-right', py:'padding-top:padding-bottom',
      pt:'padding-top', pr:'padding-right', pb:'padding-bottom', pl:'padding-left',
      m:'margin', mx:'margin-left:margin-right', my:'margin-top:margin-bottom',
      mt:'margin-top', mr:'margin-right', mb:'margin-bottom', ml:'margin-left',
      gap:'gap', 'gap-x':'column-gap', 'gap-y':'row-gap',
      w:'width', h:'height',
    }
    const k = m[1]
    if (k.startsWith('gap')) return '.' + m[0] + ' { ' + (k === 'gap' ? 'gap' : k === 'gap-x' ? 'column-gap' : 'row-gap') + ': ' + v + 'px; }'
    return '.' + m[0] + ' { ' + k + ': ' + v + 'px; }'
  }
  // 颜色
  const cm = cls.match(/^(bg|text|border)-(\w+)-(\d+)$/)
  if (cm) {
    const [, kind, color, sh] = cm
    const arr = COLORS[color]
    if (!arr) return ''
    const idx = SHADES.indexOf(sh)
    if (idx < 0) return ''
    const hex = arr[idx]
    if (kind === 'bg') return 'background-color: ' + hex + ';'
    if (kind === 'text') return 'color: ' + hex + ';'
    if (kind === 'border') return 'border-color: ' + hex + ';'
  }
  // grid
  const gm = cls.match(/^grid-cols-(\d+)$/)
  if (gm) return 'grid-template-columns: repeat(' + gm[1] + ', minmax(0, 1fr));'
  const cm2 = cls.match(/^col-span-(\d+)$/)
  if (cm2) return 'grid-column: span ' + cm2[1] + ' / span ' + cm2[1] + ';'
  if (cls === 'col-span-full') return 'grid-column: 1 / -1;'
  return ''
}

// ============ 批 1：小项补齐 ============
function patch1(push) {
  push('/* ===== 批 1：小项补齐 ===== */')

  // grid-rows
  for (let i = 1; i <= 12; i++) push('.grid-rows-' + i + ' { grid-template-rows: repeat(' + i + ', minmax(0, 1fr)); }')
  push('.grid-rows-none { grid-template-rows: none; }')
  for (let i = 1; i <= 6; i++) push('.row-span-' + i + ' { grid-row: span ' + i + ' / span ' + i + '; }')
  push('.row-span-full { grid-row: 1 / -1; }')
  for (let i = 1; i <= 13; i++) push('.col-start-' + i + ' { grid-column-start: ' + i + '; }')
  for (let i = 1; i <= 13; i++) push('.col-end-' + i + ' { grid-column-end: ' + i + '; }')
  push('.col-auto { grid-column: auto; }')
  for (let i = 1; i <= 7; i++) push('.row-start-' + i + ' { grid-row-start: ' + i + '; }')
  for (let i = 1; i <= 7; i++) push('.row-end-' + i + ' { grid-row-end: ' + i + '; }')
  push('.row-auto { grid-row: auto; }')
  for (let i = 0; i <= 12; i++) push('.auto-cols-' + (i === 0 ? 'auto' : 'fr-' + i) + ' { grid-auto-columns: ' + (i === 0 ? 'auto' : 'minmax(0, ' + i + 'fr)') + '; }')
  for (let i = 0; i <= 12; i++) push('.auto-rows-' + (i === 0 ? 'auto' : 'fr-' + i) + ' { grid-auto-rows: ' + (i === 0 ? 'auto' : 'minmax(0, ' + i + 'fr)') + '; }')
  push('.grid-flow-row { grid-auto-flow: row; }')
  push('.grid-flow-col { grid-auto-flow: column; }')
  push('.grid-flow-dense { grid-auto-flow: dense; }')
  push('.grid-flow-row-dense { grid-auto-flow: row dense; }')
  push('.grid-flow-col-dense { grid-auto-flow: column dense; }')

  // columns
  for (let i = 1; i <= 12; i++) push('.columns-' + i + ' { columns: ' + i + '; }')
  push('.columns-auto { columns: auto; }')
  push('.columns-3xs { columns: 16rem; }')
  push('.columns-2xs { columns: 18rem; }')
  push('.columns-xs { columns: 20rem; }')
  push('.columns-sm { columns: 24rem; }')
  push('.columns-md { columns: 28rem; }')
  push('.columns-lg { columns: 32rem; }')
  push('.columns-xl { columns: 36rem; }')
  push('.columns-2xl { columns: 42rem; }')
  push('.columns-3xl { columns: 48rem; }')

  // text-indent
  for (const n of SPACING) push('.indent-' + kk(n) + ' { text-indent: ' + px(n) + 'px; }')
  push('.-indent-px { text-indent: -1px; }')

  // vertical-align
  const VA = ['baseline','top','middle','bottom','text-top','text-bottom','sub','super']
  for (const v of VA) push('.align-' + v + ' { vertical-align: ' + v.replace('-', '-') + '; }')

  // break
  for (const v of ['auto','avoid','all','avoid-page','page','left','right','column']) {
    push('.break-before-' + v + ' { break-before: ' + v + '; }')
    push('.break-after-' + v + ' { break-after: ' + v + '; }')
  }
  for (const v of ['auto','avoid','avoid-page','avoid-column']) push('.break-inside-' + v + ' { break-inside: ' + v + '; }')

  // mix-blend-mode
  const BLEND = ['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity','plus-darker','plus-lighter']
  for (const v of BLEND) push('.mix-blend-' + v + ' { mix-blend-mode: ' + v + '; }')
  // bg-blend
  const BGB = ['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity']
  for (const v of BGB) push('.bg-blend-' + v + ' { background-blend-mode: ' + v + '; }')

  // isolation / will-change
  push('.isolate { isolation: isolate; }')
  push('.isolation-auto { isolation: auto; }')
  push('.will-change-auto { will-change: auto; }')
  push('.will-change-scroll { will-change: scroll-position; }')
  push('.will-change-contents { will-change: contents; }')
  push('.will-change-transform { will-change: transform; }')

  // touch-action
  for (const v of ['auto','none','pan-x','pan-left','pan-right','pan-y','pan-up','pan-down','pinch-zoom','manipulation']) push('.touch-' + v + ' { touch-action: ' + v + '; }')

  // resize / appearance
  for (const v of ['none','y','x','both']) push('.resize-' + v + ' { resize: ' + v + '; }')
  push('.appearance-none { appearance: none; -webkit-appearance: none; }')
  push('.appearance-auto { appearance: auto; }')

  // caret-color
  for (const [name, arr] of Object.entries(COLORS)) {
    for (let i = 0; i < SHADES.length; i += 2) push('.caret-' + name + '-' + SHADES[i] + ' { caret-color: ' + arr[i] + '; }')
  }
  for (const v of ['auto','transparent','current','white','black']) push('.caret-' + v + ' { caret-color: ' + (v === 'white' ? '#fff' : v === 'black' ? '#000' : v) + '; }')

  // color-scheme
  for (const v of ['normal','light','dark','light-dark','only-light','only-dark']) push('.scheme-' + v + ' { color-scheme: ' + v + '; }')

  // content-*
  push('.content-none { content: none; }')
  push('.content-empty { content: ""; }')

  // perspective
  for (const n of [0,1,2,4,6,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64]) push('.perspective-' + n + ' { perspective: ' + (n * 4) + 'px; }')
  push('.perspective-none { perspective: none; }')
  push('.perspective-dramatic { perspective: 100px; }')
  push('.perspective-near { perspective: 300px; }')
  push('.perspective-normal { perspective: 500px; }')
  push('.perspective-midrange { perspective: 800px; }')
  push('.perspective-distant { perspective: 1200px; }')

  // transform-style / backface
  push('.transform-none { transform: none; }')
  push('.transform { transform: translate(0) rotate(0) scale(1); }')
  push('.transform-gpu { transform: translateZ(0); }')
  push('.transform-style-flat { transform-style: flat; }')
  push('.transform-style-3d { transform-style: preserve-3d; }')
  push('.backface-visible { backface-visibility: visible; }')
  push('.backface-hidden { backface-visibility: hidden; }')

  // animation-delay / duration
  for (const n of [0,75,100,150,200,300,500,700,1000]) push('.animation-delay-' + n + ' { animation-delay: ' + n + 'ms; }')
  for (const n of [75,100,150,200,300,500,700,1000]) push('.animation-duration-' + n + ' { animation-duration: ' + n + 'ms; }')
  push('.animation-once { animation-iteration-count: 1; }')
  push('.animation-loop { animation-iteration-count: infinite; }')

  // font-family
  push('.font-sans { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }')
  push('.font-serif { font-family: Georgia, "Times New Roman", serif; }')
  push('.font-mono { font-family: "SF Mono", Consolas, "Courier New", monospace; }')

  // float / clear
  for (const v of ['right','left','none','start','end']) push('.float-' + v + ' { float: ' + v + '; }')
  for (const v of ['left','right','both','none','start','end']) push('.clear-' + v + ' { clear: ' + v + '; }')

  // box-decoration / bg-clip / bg-origin
  push('.box-decoration-clone { box-decoration-break: clone; }')
  push('.box-decoration-slice { box-decoration-break: slice; }')
  push('.bg-clip-border { background-clip: border-box; }')
  push('.bg-clip-padding { background-clip: padding-box; }')
  push('.bg-clip-content { background-clip: content-box; }')
  push('.bg-clip-text { background-clip: text; -webkit-background-clip: text; color: transparent; }')
  push('.bg-origin-border { background-origin: border-box; }')
  push('.bg-origin-padding { background-origin: padding-box; }')
  push('.bg-origin-content { background-origin: content-box; }')

  // bg-repeat / bg-size / bg-position
  for (const v of ['repeat','no-repeat','repeat-x','repeat-y','round','space']) push('.bg-' + v + ' { background-repeat: ' + v + '; }')
  push('.bg-auto { background-size: auto; }')
  push('.bg-cover { background-size: cover; }')
  push('.bg-contain { background-size: contain; }')
  for (const v of ['bottom','center','left','left-bottom','left-top','right','right-bottom','right-top','top']) push('.bg-' + v + ' { background-position: ' + v.replace(/-/g, ' ') + '; }')
  push('.bg-fixed { background-attachment: fixed; }')
  push('.bg-local { background-attachment: local; }')
  push('.bg-scroll { background-attachment: scroll; }')

  // object-fit / object-position
  for (const v of ['contain','cover','fill','none','scale-down']) push('.object-' + v + ' { object-fit: ' + v + '; }')
  for (const v of ['bottom','center','left','left-bottom','left-top','right','right-bottom','right-top','top']) push('.object-' + v + ' { object-position: ' + v.replace(/-/g, ' ' ) + '; }')

  // aspect
  push('.aspect-auto { aspect-ratio: auto; }')
  push('.aspect-square { aspect-ratio: 1/1; }')
  push('.aspect-video { aspect-ratio: 16/9; }')
  push('.aspect-4-3 { aspect-ratio: 4/3; }')
  push('.aspect-3-2 { aspect-ratio: 3/2; }')
  push('.aspect-2-3 { aspect-ratio: 2/3; }')
  push('.aspect-9-16 { aspect-ratio: 9/16; }')
  push('.aspect-21-9 { aspect-ratio: 21/9; }')

  // text-overflow
  push('.text-ellipsis { text-overflow: ellipsis; }')
  push('.text-clip { text-overflow: clip; }')

  // box-sizing
  push('.box-border { box-sizing: border-box; }')
  push('.box-content { box-sizing: content-box; }')

  // table
  push('.table-auto { table-layout: auto; }')
  push('.table-fixed { table-layout: fixed; }')
  push('.border-collapse { border-collapse: collapse; }')
  push('.border-separate { border-collapse: separate; }')
  push('.border-spacing-0 { border-spacing: 0; }')
  for (const n of [1,2,4,8]) push('.border-spacing-' + n + ' { border-spacing: ' + px(n) + 'px; }')

  // list / caption
  push('.list-none { list-style-type: none; }')
  push('.list-disc { list-style-type: disc; }')
  push('.list-decimal { list-style-type: decimal; }')
  push('.list-inside { list-style-position: inside; }')
  push('.list-outside { list-style-position: outside; }')
  push('.caption-top { caption-side: top; }')
  push('.caption-bottom { caption-side: bottom; }')

  // scroll
  push('.scroll-auto { scroll-behavior: auto; }')
  push('.scroll-smooth { scroll-behavior: smooth; }')
  push('.snap-none { scroll-snap-type: none; }')
  push('.snap-x { scroll-snap-type: x var(--x-snap, proximity); }')
  push('.snap-y { scroll-snap-type: y var(--x-snap, proximity); }')
  push('.snap-both { scroll-snap-type: both var(--x-snap, proximity); }')
  push('.snap-mandatory { --x-snap: mandatory; }')
  push('.snap-proximity { --x-snap: proximity; }')
  push('.snap-start { scroll-snap-align: start; }')
  push('.snap-end { scroll-snap-align: end; }')
  push('.snap-center { scroll-snap-align: center; }')
  push('.snap-align-none { scroll-snap-align: none; }')
  push('.snap-normal { scroll-snap-stop: normal; }')
  push('.snap-always { scroll-snap-stop: always; }')

  // scroll-margin / scroll-padding
  for (const n of SPACING) {
    push('.scroll-m-' + kk(n) + ' { scroll-margin: ' + px(n) + 'px; }')
    push('.scroll-p-' + kk(n) + ' { scroll-padding: ' + px(n) + 'px; }')
  }

  // overscroll
  for (const v of ['auto','contain','none']) push('.overscroll-' + v + ' { overscroll-behavior: ' + v + '; }')

  // white-space 补
  for (const v of ['normal','nowrap','pre','pre-line','pre-wrap','break-spaces']) push('.whitespace-' + v + ' { white-space: ' + v + '; }')

  // word-break / overflow-wrap / hyphens
  push('.break-normal { word-break: normal; overflow-wrap: normal; }')
  push('.break-words { overflow-wrap: break-word; }')
  push('.break-all { word-break: break-all; }')
  push('.break-keep { word-break: keep-all; }')
  push('.hyphens-none { hyphens: none; }')
  push('.hyphens-manual { hyphens: manual; }')
  push('.hyphens-auto { hyphens: auto; }')

  // line-height 补完整
  for (const [k,v] of Object.entries({3:'12px',4:'16px',5:'20px',6:'24px',7:'28px',8:'32px',9:'36px',10:'40px'})) push('.leading-' + k + ' { line-height: ' + v + '; }')

  // 补字号精确值
  for (const [k,v] of Object.entries({xs:12,sm:14,base:16,lg:18,xl:20,'2xl':24,'3xl':30,'4xl':36,'5xl':48,'6xl':60,'7xl':72,'8xl':96,'9xl':128})) {
    push('.text-' + k + ' { font-size: ' + v + 'px; }')
  }

  // 补字距
  for (const [k,v] of Object.entries({tighter:'-0.05em',tight:'-0.025em',normal:'0',wide:'0.025em',wider:'0.05em',widest:'0.1em'})) push('.tracking-' + k + ' { letter-spacing: ' + v + '; }')

  push('')
}

// ============ 批 2：变体 × 关键类 ============
const KEY_CLASSES = [
  'block','inline-block','inline','flex','inline-flex','grid','hidden','contents',
  'items-start','items-center','items-end','items-stretch','items-baseline',
  'justify-start','justify-center','justify-end','justify-between','justify-around',
  'flex-row','flex-col','flex-wrap','flex-nowrap','flex-1','flex-auto','flex-none','grow','shrink-0',
  'grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-6','grid-cols-12',
  'col-span-1','col-span-2','col-span-3','col-span-4','col-span-6','col-span-12','col-span-full',
  'gap-0','gap-1','gap-2','gap-3','gap-4','gap-5','gap-6','gap-8','gap-10','gap-12',
  'p-0','p-1','p-2','p-3','p-4','p-5','p-6','p-8','p-10','p-12',
  'px-1','px-2','px-3','px-4','px-6','px-8',
  'py-1','py-2','py-3','py-4','py-6','py-8',
  'pt-2','pt-4','pt-8','pb-2','pb-4','pb-8','pl-2','pl-4','pr-2','pr-4',
  'm-0','m-1','m-2','m-4','m-6','m-8','m-auto','mx-auto','my-auto',
  'mt-1','mt-2','mt-4','mt-6','mt-8','mb-1','mb-2','mb-4','mb-6','mb-8','ml-2','ml-4','mr-2','mr-4',
  'w-1-2','w-1-3','w-2-3','w-1-4','w-3-4','w-full','w-auto','w-screen',
  'h-full','h-screen','h-auto',
  'max-w-sm','max-w-md','max-w-lg','max-w-xl','max-w-2xl','max-w-full',
  'text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl',
  'font-normal','font-medium','font-semibold','font-bold',
  'text-left','text-center','text-right','truncate','uppercase','lowercase',
  'underline','line-through','italic','not-italic',
  'bg-white','bg-black','bg-transparent','bg-gray-100','bg-gray-200','bg-gray-500','bg-gray-900',
  'bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500',
  'text-white','text-black','text-gray-500','text-gray-700','text-red-500','text-blue-500','text-green-500',
  'border','border-2','border-0','border-solid','border-dashed','border-dotted',
  'border-gray-200','border-gray-300','border-blue-500','border-red-500',
  'rounded','rounded-sm','rounded-md','rounded-lg','rounded-xl','rounded-full',
  'shadow','shadow-sm','shadow-md','shadow-lg','shadow-xl','shadow-none',
  'opacity-0','opacity-25','opacity-50','opacity-75','opacity-100',
  'static','relative','absolute','fixed','sticky',
  'overflow-hidden','overflow-auto',
  'visible','invisible',
  'pointer-events-none','pointer-events-auto',
  'cursor-pointer','cursor-default','cursor-not-allowed',
  'scale-75','scale-90','scale-95','scale-100','scale-105','scale-110','scale-125',
  'rotate-45','rotate-90','rotate-180',
  'transition','transition-none','transition-all','transition-colors','transition-opacity','transition-transform',
  'duration-100','duration-200','duration-300','duration-500',
  'ease-linear','ease-in','ease-out','ease-in-out',
  'translate-x-0','translate-x-1','translate-x-2','translate-x-4','translate-x-8','translate-x-full',
  'translate-y-0','translate-y-1','translate-y-2','translate-y-4','translate-y-8','translate-y-full',
]

function patch2(push) {
  push('/* ===== 批 2：响应式变体 ===== */')
  const BP = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }
  for (const [name, width] of Object.entries(BP)) {
    push('@media (min-width: ' + width + 'px) {')
    for (const c of KEY_CLASSES) {
      const decl = cssFor(c)
      if (!decl) continue
      push('  .' + name + '\\:' + c + ' { ' + decl + ' }')
    }
    push('}')
    push('')
  }

  // hover / focus / active / disabled
  const PSEUDOS = {
    'hover': ':hover',
    'focus': ':focus',
    'active': ':active',
    'focus-visible': ':focus-visible',
    'focus-within': ':focus-within',
    'disabled': ':disabled',
    'checked': ':checked',
    'required': ':required',
    'invalid': ':invalid',
    'visited': ':visited',
    'target': ':target',
    'empty': ':empty',
  }
  push('/* ===== 批 2：状态变体 ===== */')
  for (const [prefix, sel] of Object.entries(PSEUDOS)) {
    for (const c of KEY_CLASSES) {
      const decl = cssFor(c)
      if (!decl) continue
      push('.' + prefix + '\\:' + c + sel + ' { ' + decl + ' }')
    }
    push('')
  }

  // first / last / odd / even
  push('/* ===== 批 2：结构变体 ===== */')
  const STRUCT = {
    'first': ':first-child',
    'last': ':last-child',
    'only': ':only-child',
    'odd': ':nth-child(odd)',
    'even': ':nth-child(even)',
    'first-of-type': ':first-of-type',
    'last-of-type': ':last-of-type',
  }
  for (const [prefix, sel] of Object.entries(STRUCT)) {
    for (const c of KEY_CLASSES) {
      const decl = cssFor(c)
      if (!decl) continue
      push('.' + prefix + '\\:' + c + sel + ' { ' + decl + ' }')
    }
    push('')
  }

  // dark mode
  push('/* ===== 批 2：暗色模式 ===== */')
  for (const c of KEY_CLASSES) {
    const decl = cssFor(c)
    if (!decl) continue
    push('.dark .dark\\:' + c + ' { ' + decl + ' }')
  }
  push('')

  // group / peer
  push('/* ===== 批 2：group / peer ===== */')
  const GROUP_STATES = { 'group-hover': ':hover', 'group-focus': ':focus', 'group-active': ':active' }
  for (const [prefix, sel] of Object.entries(GROUP_STATES)) {
    for (const c of KEY_CLASSES) {
      const decl = cssFor(c)
      if (!decl) continue
      push('.group' + sel + ' .' + prefix + '\\:' + c + ' { ' + decl + ' }')
    }
  }
  const PEER_STATES = { 'peer-hover': ':hover', 'peer-focus': ':focus', 'peer-checked': ':checked', 'peer-disabled': ':disabled' }
  for (const [prefix, sel] of Object.entries(PEER_STATES)) {
    for (const c of KEY_CLASSES) {
      const decl = cssFor(c)
      if (!decl) continue
      push('.peer' + sel + ' ~ .' + prefix + '\\:' + c + ' { ' + decl + ' }')
    }
  }
  push('')
}

// ============ 批 3：方向 / 打印 / 动效 / aria ============
function patch3(push) {
  push('/* ===== 批 3：方向 / 打印 / 动效 ===== */')

  // rtl / ltr
  for (const c of KEY_CLASSES) {
    const decl = cssFor(c)
    if (!decl) continue
    push('[dir="rtl"] .rtl\\:' + c + ' { ' + decl + ' }')
    push('[dir="ltr"] .ltr\\:' + c + ' { ' + decl + ' }')
  }
  push('')

  // print
  push('@media print {')
  for (const c of KEY_CLASSES) {
    const decl = cssFor(c)
    if (!decl) continue
    push('  .print\\:' + c + ' { ' + decl + ' }')
  }
  push('}')
  push('')

  // motion-safe / motion-reduce
  push('@media (prefers-reduced-motion: no-preference) {')
  for (const c of KEY_CLASSES) {
    const decl = cssFor(c)
    if (!decl) continue
    push('  .motion-safe\\:' + c + ' { ' + decl + ' }')
  }
  push('}')
  push('@media (prefers-reduced-motion: reduce) {')
  for (const c of KEY_CLASSES) {
    const decl = cssFor(c)
    if (!decl) continue
    push('  .motion-reduce\\:' + c + ' { ' + decl + ' }')
  }
  push('}')
  push('')

  // aria
  push('/* ===== 批 3：aria 变体 ===== */')
  const ARIA = ['aria-checked','aria-disabled','aria-expanded','aria-hidden','aria-pressed','aria-readonly','aria-required','aria-selected','aria-busy','aria-current']
  const ARIA_SEL = {
    'aria-checked': '[aria-checked="true"]',
    'aria-disabled': '[aria-disabled="true"]',
    'aria-expanded': '[aria-expanded="true"]',
    'aria-hidden': '[aria-hidden="true"]',
    'aria-pressed': '[aria-pressed="true"]',
    'aria-readonly': '[aria-readonly="true"]',
    'aria-required': '[aria-required="true"]',
    'aria-selected': '[aria-selected="true"]',
    'aria-busy': '[aria-busy="true"]',
    'aria-current': '[aria-current="true"]',
  }
  for (const a of ARIA) {
    for (const c of ['hidden','block','flex','opacity-50','opacity-100','cursor-not-allowed']) {
      const decl = cssFor(c)
      if (!decl) continue
      push('.' + a + '\\:' + c + ARIA_SEL[a] + ' { ' + decl + ' }')
    }
  }
  push('')

  // has / not / supports（基础）
  for (const c of ['hidden','block','flex','opacity-100']) {
    const decl = cssFor(c)
    if (!decl) continue
    push('.has\\:checked:has(:checked) { ' + decl + ' }')
    push('.not\\:hidden:not(:hover) { display: none; }')
  }
  push('')
}

export function extraRules() {
  const L = []
  const push = s => L.push(s)
  patch1(push)
  patch2(push)
  patch3(push)
  return L
}
