#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

# ex-life
swap("    ('ex-life', '生命游戏', []),", r"""    ('ex-life', '生命游戏', [
      ('H1','生命游戏'),
      ('P','康威生命游戏——Canvas 渲染 + 状态更新。'),
      ('H2','核心逻辑'),
      ('Code',"// 计算下一帧\nfunction next(cells, rows, cols) {\n  const out = []\n  for (let y = 0; y < rows; y++) {\n    out[y] = []\n    for (let x = 0; x < cols; x++) {\n      let n = 0\n      for (let dy = -1; dy <= 1; dy++)\n        for (let dx = -1; dx <= 1; dx++) {\n          if (dx === 0 && dy === 0) continue\n          const yy = (y + dy + rows) % rows\n          const xx = (x + dx + cols) % cols\n          if (cells[yy][xx]) n++\n        }\n      out[y][x] = cells[y][x] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0)\n    }\n  }\n  return out\n}",'js'),
      ('H2','完整代码'),
      ('Code',"import { div, h1, button, canvas, signal, onMount, onUnmount, mount } from 'xunay'\n\nconst COLS = 60, ROWS = 40, CELL = 10\n\nconst running = signal(false)\nconst gen = signal(0)\n\nconst cells = signal(Array.from({ length: ROWS }, () =>\n  Array.from({ length: COLS }, () => Math.random() > 0.7 ? 1 : 0)\n))\n\nlet ctx = null\nlet timer = null\n\nfunction draw() {\n  if (!ctx) return\n  const data = cells()\n  ctx.fillStyle = '#0d1117'\n  ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL)\n  ctx.fillStyle = '#8b5cf6'\n  for (let y = 0; y < ROWS; y++) {\n    for (let x = 0; x < COLS; x++) {\n      if (data[y][x]) ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1)\n    }\n  }\n}\n\nfunction tick() {\n  const cur = cells()\n  const out = []\n  for (let y = 0; y < ROWS; y++) {\n    out[y] = []\n    for (let x = 0; x < COLS; x++) {\n      let n = 0\n      for (let dy = -1; dy <= 1; dy++)\n        for (let dx = -1; dx <= 1; dx++) {\n          if (!dx && !dy) continue\n          if (cur[(y + dy + ROWS) % ROWS][(x + dx + COLS) % COLS]) n++\n        }\n      out[y][x] = cur[y][x] ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0)\n    }\n  }\n  cells(out)\n  gen(g => g + 1)\n  draw()\n}\n\nconst start = () => {\n  if (running()) return\n  running(true)\n  timer = setInterval(tick, 100)\n}\n\nconst stop = () => {\n  running(false)\n  clearInterval(timer)\n}\n\nonMount(() => {\n  draw()\n  onUnmount(() => clearInterval(timer))\n})\n\nmount(() => div({ class: 'life' },\n  h1(null, '生命游戏'),\n  div(null, () => '代际: ' + gen()),\n  canvas({\n    width: COLS * CELL,\n    height: ROWS * CELL,\n    ref: el => { ctx = el.getContext('2d') }\n  }),\n  div({ class: 'row' },\n    button({ on: { click: start } }, '开始'),\n    button({ on: { click: stop } }, '暂停'),\n    button({ on: { click: () => { cells(Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => Math.random() > 0.7 ? 1 : 0))); gen(0); draw() } } }, '重置')\n  )\n), '#app')",'xuy'),
    ]),""", "ex-life")

# ex-markdown
swap("    ('ex-markdown', 'Markdown 编辑器', []),", r"""    ('ex-markdown', 'Markdown 编辑器', [
      ('H1','Markdown 编辑器'),
      ('P','左侧输入，右侧实时预览。'),
      ('H2','代码'),
      ('Code',"import { div, textarea, h1, signal, computed, effect, mount } from 'xunay'\n\nconst text = signal(localStorage.getItem('md') || '# 标题\\n\\n**加粗** 和 *斜体*\\n\\n- 项目 1\\n- 项目 2\\n')\n\neffect(() => localStorage.setItem('md', text()))\n\nfunction md(src) {\n  return src\n    .replace(/^### (.+)$/gm, '<h3>$1</h3>')\n    .replace(/^## (.+)$/gm, '<h2>$1</h2>')\n    .replace(/^# (.+)$/gm, '<h1>$1</h1>')\n    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')\n    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')\n    .replace(/^- (.+)$/gm, '<li>$1</li>')\n    .replace(/(<li>[\\s\\S]*?<\\/li>)/g, '<ul>$1</ul>')\n    .replace(/`([^`]+)`/g, '<code>$1</code>')\n    .replace(/\\n\\n/g, '</p><p>')\n    .replace(/^/, '<p>').replace(/$/, '</p>')\n}\n\nconst html = computed(() => md(text()))\n\nmount(() => div({ class: 'md-app' },\n  div({ class: 'md-pane' },\n    div({ class: 'md-header' }, '编辑'),\n    textarea({\n      class: 'md-input',\n      value: () => text(),\n      on: { input: e => text(e.target.value) }\n    })\n  ),\n  div({ class: 'md-pane' },\n    div({ class: 'md-header' }, '预览'),\n    div({ class: 'md-preview', html: () => html() })\n  )\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'computed 做派生数据',
        'html 属性渲染 HTML',
        'effect 持久化到 localStorage'),
      ('H2','注意'),
      ('Warn','html 属性会直接写 innerHTML。真实项目必须先 sanitize 再渲染。'),
    ]),""", "ex-markdown")

# ex-calendar
swap("    ('ex-calendar', '日历', []),", r"""    ('ex-calendar', '日历', [
      ('H1','日历'),
      ('P','月视图——日期网格 + 事件标记。'),
      ('H2','代码'),
      ('Code',"import { div, h1, button, span, signal, computed, list, show, mount } from 'xunay'\n\nconst today = new Date()\nconst year = signal(today.getFullYear())\nconst month = signal(today.getMonth())\nconst events = signal({\n  [`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`]: ['会议 10:00']\n})\n\nconst days = computed(() => {\n  const y = year(), m = month()\n  const first = new Date(y, m, 1)\n  const lastDay = new Date(y, m + 1, 0).getDate()\n  const startWeekday = first.getDay()\n  const out = []\n  for (let i = 0; i < startWeekday; i++) out.push({ type: 'blank', key: 'b' + i })\n  for (let d = 1; d <= lastDay; d++) {\n    const key = y + '-' + m + '-' + d\n    out.push({ type: 'day', day: d, key, events: events()[key] || [] })\n  }\n  return out\n})\n\nconst title = computed(() => year() + ' 年 ' + (month() + 1) + ' 月')\n\nconst prev = () => {\n  if (month() === 0) { year(y => y - 1); month(11) }\n  else month(m => m - 1)\n}\nconst next = () => {\n  if (month() === 11) { year(y => y + 1); month(0) }\n  else month(m => m + 1)\n}\n\nconst weekdays = ['日', '一', '二', '三', '四', '五', '六']\n\nmount(() => div({ class: 'calendar' },\n  div({ class: 'cal-header' },\n    button({ on: { click: prev } }, '‹'),\n    h1(null, () => title()),\n    button({ on: { click: next } }, '›')\n  ),\n  div({ class: 'cal-week' }, ...weekdays.map(w => span({ class: 'cal-wd' }, w))),\n  div({ class: 'cal-grid' },\n    list(days, d => d.key, d =>\n      d.type === 'blank'\n        ? div({ class: 'cal-cell blank' })\n        : div({ class: 'cal-cell' },\n            span({ class: 'cal-day' }, String(d.day)),\n            show(() => d.events.length > 0, () =>\n              div({ class: 'cal-events' },\n                list(d.events, e => e, e => div({ class: 'cal-event' }, e))\n              )\n            )\n          )\n    )\n  )\n), '#app')",'xuy'),
    ]),""", "ex-calendar")

# ex-kanban
swap("    ('ex-kanban', '看板', []),", r"""    ('ex-kanban', '看板', [
      ('H1','看板'),
      ('P','拖拽任务卡——三列布局。'),
      ('H2','代码'),
      ('Code',"import { div, h1, span, button, signal, list, mount } from 'xunay'\n\nconst columns = ['todo', 'doing', 'done']\nconst titles = { todo: '待做', doing: '进行中', done: '已完成' }\n\nconst tasks = signal([\n  { id: 1, title: '写文档', status: 'todo' },\n  { id: 2, title: '修 bug', status: 'doing' },\n  { id: 3, title: '开会', status: 'done' },\n])\n\nconst byStatus = s => tasks().filter(t => t.status === s)\n\nfunction move(id, dir) {\n  tasks(list => list.map(t => {\n    if (t.id !== id) return t\n    const i = columns.indexOf(t.status)\n    const next = columns[Math.max(0, Math.min(columns.length - 1, i + dir))]\n    return { ...t, status: next }\n  }))\n}\n\nfunction add(status) {\n  const title = prompt('任务标题')\n  if (!title) return\n  tasks(l => [...l, { id: Date.now(), title, status }])\n}\n\nfunction remove(id) {\n  tasks(l => l.filter(t => t.id !== id))\n}\n\nmount(() => div({ class: 'kanban' },\n  h1(null, '看板'),\n  div({ class: 'kb-cols' },\n    ...columns.map(col =>\n      div({ class: 'kb-col' },\n        div({ class: 'kb-col-head' },\n          span(null, titles[col]),\n          button({ class: 'kb-add', on: { click: () => add(col) } }, '+')\n        ),\n        div({ class: 'kb-list' },\n          list(() => byStatus(col), t => t.id, t =>\n            div({ class: 'kb-card' },\n              div({ class: 'kb-title' }, t.title),\n              div({ class: 'kb-actions' },\n                col !== 'todo' && button({ on: { click: () => move(t.id, -1) } }, '←'),\n                col !== 'done' && button({ on: { click: () => move(t.id, 1) } }, '→'),\n                button({ class: 'del', on: { click: () => remove(t.id) } }, '×')\n              )\n            )\n          )\n        )\n      )\n    )\n  )\n), '#app')",'xuy'),
    ]),""", "ex-kanban")

# ex-dashboard
swap("    ('ex-dashboard', '仪表盘', []),", r"""    ('ex-dashboard', '仪表盘', [
      ('H1','仪表盘'),
      ('P','数据看板——卡片 + 图表 + 实时刷新。'),
      ('H2','代码'),
      ('Code',"import { div, h1, span, canvas, signal, computed, onMount, onUnmount, mount } from 'xunay'\n\nconst revenue = signal([120, 200, 150, 300, 250, 400, 350])\nconst users = signal(1234)\nconst orders = signal(56)\nconst rate = signal(4.8)\n\nconst total = computed(() => revenue().reduce((a, b) => a + b, 0))\nconst avg = computed(() => Math.round(total() / revenue().length))\n\nlet ctx = null\nfunction drawChart() {\n  if (!ctx) return\n  const w = 400, h = 200\n  ctx.clearRect(0, 0, w, h)\n  const data = revenue()\n  const max = Math.max(...data)\n  const bw = w / data.length - 10\n  ctx.fillStyle = '#8b5cf6'\n  data.forEach((v, i) => {\n    const bh = (v / max) * (h - 30)\n    ctx.fillRect(i * (bw + 10) + 5, h - bh - 20, bw, bh)\n  })\n  ctx.fillStyle = '#666'\n  ctx.font = '10px sans-serif'\n  data.forEach((v, i) => ctx.fillText(String(v), i * (bw + 10) + 5, h - 6))\n}\n\nconst stat = (label, val, sub) => div({ class: 'stat' },\n  div({ class: 'stat-label' }, label),\n  div({ class: 'stat-value' }, () => String(val())),\n  sub && div({ class: 'stat-sub' }, sub)\n)\n\nonMount(() => {\n  drawChart()\n  const id = setInterval(() => {\n    revenue(r => [...r.slice(1), Math.round(Math.random() * 500)])\n    users(u => u + Math.round(Math.random() * 10 - 5))\n    orders(o => o + Math.round(Math.random() * 4 - 2))\n    rate(r => Math.round((r + (Math.random() - 0.5) * 0.1) * 10) / 10)\n    drawChart()\n  }, 2000)\n  onUnmount(() => clearInterval(id))\n})\n\nmount(() => div({ class: 'dashboard' },\n  h1(null, '数据看板'),\n  div({ class: 'stats' },\n    stat('总营收', total, '近 7 期'),\n    stat('平均', avg, '每期'),\n    stat('用户', users),\n    stat('订单', orders),\n    stat('评分', rate)\n  ),\n  div({ class: 'chart-wrap' },\n    canvas({ width: 400, height: 200, ref: el => ctx = el.getContext('2d') })\n  )\n), '#app')",'xuy'),
    ]),""", "ex-dashboard")

# ex-file-tree
swap("    ('ex-file-tree', '文件树', []),", r"""    ('ex-file-tree', '文件树', [
      ('H1','文件树'),
      ('P','递归组件——可折叠的文件树。'),
      ('H2','代码'),
      ('Code',"import { div, span, signal, list, show, mount } from 'xunay'\n\nconst tree = {\n  name: 'root', type: 'dir', children: [\n    { name: 'src', type: 'dir', children: [\n      { name: 'main.js', type: 'file', size: 1024 },\n      { name: 'utils.js', type: 'file', size: 512 },\n      { name: 'components', type: 'dir', children: [\n        { name: 'Button.js', type: 'file', size: 800 },\n        { name: 'Modal.js', type: 'file', size: 1200 }\n      ]}\n    ]},\n    { name: 'README.md', type: 'file', size: 2048 }\n  ]\n}\n\nfunction TreeNode({ node, depth = 0 }) {\n  const open = signal(depth < 2)\n\n  if (node.type === 'file') {\n    return div({ class: 'tree-node file', style: 'padding-left: ' + (depth * 16 + 20) + 'px' },\n      span({ class: 'tree-icon' }, '📄'),\n      span({ class: 'tree-name' }, node.name),\n      span({ class: 'tree-size' }, (node.size / 1024).toFixed(1) + ' KB')\n    )\n  }\n\n  return div({ class: 'tree-dir' },\n    div({\n      class: 'tree-node dir',\n      style: 'padding-left: ' + (depth * 16 + 4) + 'px',\n      on: { click: () => open(!open()) }\n    },\n      span({ class: 'tree-toggle' }, () => open() ? '▼' : '▶'),\n      span({ class: 'tree-icon' }, '📁'),\n      span({ class: 'tree-name' }, node.name),\n      span({ class: 'tree-count' }, node.children.length)\n    ),\n    show(open, () =>\n      div(null, list(node.children, c => c.name, c => TreeNode({ node: c, depth: depth + 1 })))\n    )\n  )\n}\n\nmount(() => div({ class: 'file-tree' },\n  div({ class: 'tree-header' }, '项目文件'),\n  TreeNode({ node: tree, depth: 0 })\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        '递归组件',
        'signal 独立——每个目录一个 open 状态',
        'tree 结构用 list 递归渲染'),
    ]),""", "ex-file-tree")

# ex-code-editor
swap("    ('ex-code-editor', '代码编辑器', []),", r"""    ('ex-code-editor', '代码编辑器', [
      ('H1','代码编辑器'),
      ('P','带行号的编辑器 + 实时预览。'),
      ('H2','代码'),
      ('Code',"import { div, textarea, pre, code, signal, computed, effect, mount } from 'xunay'\nimport { highlight } from '../core/src/hl.js'\n\nconst code_ = signal(localStorage.getItem('editor-code') || 'const n = signal(0)\\nconst double = computed(() => n() * 2)\\n\\ndiv(null, () => String(double()))')\nconst lang = signal('js')\n\neffect(() => localStorage.setItem('editor-code', code_()))\n\nconst lineCount = computed(() => code_().split('\\n').length)\nconst highlighted = computed(() => highlight(code_(), lang()))\n\nmount(() => div({ class: 'editor' },\n  div({ class: 'editor-header' },\n    div({ class: 'editor-lang' },\n      ['js', 'ts', 'html', 'css'].map(l =>\n        button({\n          class: () => 'lang-btn' + (lang() === l ? ' on' : ''),\n          on: { click: () => lang(l) }\n        }, l)\n      )\n    ),\n    div({ class: 'editor-info' }, () => lineCount() + ' 行 · ' + code_().length + ' 字符')\n  ),\n  div({ class: 'editor-body' },\n    div({ class: 'editor-gutter' },\n      ...Array.from({ length: lineCount() }, (_, i) => div({ class: 'ln' }, String(i + 1)))\n    ),\n    textarea({\n      class: 'editor-input',\n      value: () => code_(),\n      on: {\n        input: e => code_(e.target.value),\n        scroll: e => {\n          const g = document.querySelector('.editor-gutter')\n          if (g) g.scrollTop = e.target.scrollTop\n        }\n      },\n      spellcheck: 'false'\n    })\n  ),\n  div({ class: 'editor-preview' },\n    pre(null, code({ html: () => highlighted() }))\n  )\n), '#app')",'xuy'),
    ]),""", "ex-code-editor")

# ex-virtual-list
swap("    ('ex-virtual-list', '虚拟列表', []),", r"""    ('ex-virtual-list', '虚拟列表', [
      ('H1','虚拟列表'),
      ('P','10000 项列表——只渲染可见的 50 项。'),
      ('H2','代码'),
      ('Code',"import { div, h1, span, signal, computed, list, onMount, onUnmount, mount } from 'xunay'\n\nconst ITEM_H = 32\nconst PAGE_SIZE = 50\nconst BUFFER = 5\n\nconst all = signal(Array.from({ length: 10000 }, (_, i) => ({\n  id: i + 1,\n  title: '第 ' + (i + 1) + ' 项'\n})))\n\nconst scrollTop = signal(0)\nconst viewportH = signal(500)\n\nconst startIdx = computed(() => Math.max(0, Math.floor(scrollTop() / ITEM_H) - BUFFER))\nconst endIdx = computed(() => Math.min(all().length, Math.ceil((scrollTop() + viewportH()) / ITEM_H) + BUFFER))\n\nconst visible = computed(() => all().slice(startIdx(), endIdx()))\nconst offsetY = computed(() => startIdx() * ITEM_H)\nconst totalH = computed(() => all().length * ITEM_H)\n\nconst container = ref()\nfunction ref() { let v; return function(x) { if (arguments.length) v = x; return v } }\n\nonMount(() => {\n  const el = document.querySelector('.vl-container')\n  if (!el) return\n  const onScroll = () => scrollTop(el.scrollTop)\n  el.addEventListener('scroll', onScroll)\n  onUnmount(() => el.removeEventListener('scroll', onScroll))\n})\n\nmount(() => div({ class: 'vl' },\n  h1(null, '虚拟列表'),\n  div(null, () => '共 ' + all().length + ' 项，渲染 ' + (endIdx() - startIdx()) + ' 项'),\n  div({\n    class: 'vl-container',\n    style: 'height: 500px; overflow-y: auto; position: relative'\n  },\n    div({\n      class: 'vl-spacer',\n      style: () => 'height: ' + totalH() + 'px; position: relative'\n    },\n      div({\n        class: 'vl-window',\n        style: () => 'transform: translateY(' + offsetY() + 'px)'\n      },\n        list(visible, i => i.id, i =>\n          div({\n            class: 'vl-item',\n            style: 'height: ' + ITEM_H + 'px; line-height: ' + ITEM_H + 'px'\n          }, i.title)\n        )\n      )\n    )\n  )\n), '#app')",'xuy'),
      ('H2','原理'),
      ('Ul',
        '10 万个数据全在内存',
        'DOM 只渲染可视区的 ±5 项',
        '滚动时更新 startIdx / endIdx',
        '用 transform 位移可见区域'),
    ]),""", "ex-virtual-list")

# ex-i18n
swap("    ('ex-i18n', '国际化', []),", r"""    ('ex-i18n', '国际化', [
      ('H1','国际化'),
      ('P','多语言切换——上下文传递 + 动态文字。'),
      ('H2','字典'),
      ('Code',"// i18n/dict.js\nexport const dict = {\n  'zh-CN': {\n    hello: '你好',\n    bye: '再见',\n    welcome: '欢迎使用 {name}',\n    count: '共 {n} 条'\n  },\n  'en-US': {\n    hello: 'Hello',\n    bye: 'Bye',\n    welcome: 'Welcome, {name}',\n    count: '{n} items'\n  }\n}",'js'),
      ('H2','上下文'),
      ('Code',"import { ctx, signal } from 'xunay'\nimport { dict } from './dict.js'\n\nexport const locale = signal('zh-CN')\nexport const LocaleCtx = ctx('zh-CN')\n\nexport function t(key, vars) {\n  const l = LocaleCtx.get()\n  let s = (dict[l] && dict[l][key]) || key\n  if (vars) {\n    for (const k in vars) s = s.replace('{' + k + '}', vars[k])\n  }\n  return s\n}",'xuy'),
      ('H2','应用'),
      ('Code',"import { div, h1, p, button, span, signal, mount } from 'xunay'\nimport { locale, LocaleCtx, t } from './i18n/index.xuy'\n\nfunction Content() {\n  const n = signal(3)\n  return div(null,\n    h1(null, t('hello')),\n    p(null, t('welcome', { name: '用户' })),\n    p(null, t('count', { n: n() })),\n    button({ on: { click: () => n(v => v + 1) } }, '+1')\n  )\n}\n\nmount(() => div({ class: 'app' },\n  div({ class: 'lang-switch' },\n    button({ on: { click: () => locale('zh-CN') } }, '中文'),\n    button({ on: { click: () => locale('en-US') } }, 'English')\n  ),\n  () => LocaleCtx.provide(locale(), () => Content())\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'ctx 传递语言',
        'locale 变化时整个子树重渲染',
        't() 函数查字典'),
    ]),""", "ex-i18n")

# ex-theme
swap("    ('ex-theme', '主题切换', []),", r"""    ('ex-theme', '主题切换', [
      ('H1','主题切换'),
      ('P','浅色/深色主题——CSS 变量 + signal。'),
      ('H2','CSS'),
      ('Code',":root {\n  --bg: #ffffff;\n  --fg: #1a1a2e;\n  --card: #f8f9fa;\n  --border: #e5e7eb;\n}\n\n[data-theme=\"dark\"] {\n  --bg: #1a1a2e;\n  --fg: #e8e8f0;\n  --card: #25253a;\n  --border: #3a3a50;\n}\n\nbody { background: var(--bg); color: var(--fg); }",'css'),
      ('H2','代码'),
      ('Code',"import { div, h1, button, span, signal, effect, mount } from 'xunay'\n\nconst theme = signal(localStorage.getItem('theme') || 'light')\n\n// 应用到 document\neffect(() => {\n  document.documentElement.setAttribute('data-theme', theme())\n  localStorage.setItem('theme', theme())\n})\n\n// 跟随系统\nfunction followSystem() {\n  const mq = matchMedia('(prefers-color-scheme: dark)')\n  theme(mq.matches ? 'dark' : 'light')\n  mq.addEventListener('change', e => theme(e.matches ? 'dark' : 'light'))\n}\n\nmount(() => div({ class: 'app' },\n  h1(null, '主题切换'),\n  span(null, () => '当前: ' + theme()),\n  div({ class: 'row' },\n    button({ on: { click: () => theme('light') } }, '浅色'),\n    button({ on: { click: () => theme('dark') } }, '深色'),\n    button({ on: { click: followSystem } }, '跟随系统')\n  )\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'CSS 变量做主题',
        'effect 同步到 document + localStorage',
        'matchMedia 跟随系统'),
    ]),""", "ex-theme")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("示例剩 10 篇已填")
