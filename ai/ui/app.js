const API = '/api'

const $ = id => document.getElementById(id)
const el = (tag, props = {}, ...children) => {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v
    else if (k === 'html') e.innerHTML = v
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v)
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v)
    else if (k === 'value' && (tag === 'input' || tag === 'textarea')) e.value = v == null ? '' : v
    else if (v === false || v == null) e.removeAttribute(k)
    else if (v === true) e.setAttribute(k, '')
    else e.setAttribute(k, v)
  }
  for (const c of children.flat()) {
    if (c == null) continue
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  }
  return e
}

let state = { header: {}, structure: {}, rules: [], todo: [], history: '' }
let selected = null
let verifyResult = null
let fileContent = null
let view = 'board'
let sessionContent = ''
let conns = []
let activeId = 'local'
let connMenuOpen = false
let connTesting = false
let previewUrl = localStorage.getItem('xai-preview') || 'http://localhost:8080'
let previewKey = 0
const PRESETS = [
  { id: 'openai',   label: 'OpenAI',   provider: 'openai',    base: 'https://api.openai.com/v1',              model: 'gpt-4o-mini' },
  { id: 'deepseek', label: 'DeepSeek', provider: 'openai',    base: 'https://api.deepseek.com/v1',            model: 'deepseek-chat' },
  { id: 'claude',   label: 'Claude',   provider: 'anthropic', base: 'https://api.anthropic.com/v1',           model: 'claude-3-5-sonnet-20241022' },
  { id: 'mimo',     label: 'MiMo',     provider: 'openai',    base: '',                                       model: 'mimo-7b-rl' },
  { id: 'glm',      label: '智谱 GLM', provider: 'openai',    base: 'https://open.bigmodel.cn/api/paas/v4',   model: 'glm-4-flash' },
  { id: 'moonshot', label: 'Moonshot', provider: 'openai',    base: 'https://api.moonshot.cn/v1',             model: 'moonshot-v1-8k' },
  { id: 'ollama',   label: 'Ollama',   provider: 'openai',    base: 'http://localhost:11434/v1',              model: 'llama3.2' },
  { id: 'custom',   label: '自定义',   provider: 'openai',    base: '',                                       model: '' }
]

function presetById(id) { return PRESETS.find(p => p.id === id) }
function presetByCfg(provider, base) {
  const exact = PRESETS.find(p => p.provider === provider && p.base && p.base === base)
  return exact || PRESETS.find(p => p.id === 'custom')
}

let aiConfig = { provider: 'openai', base: '', model: '', keyHint: '', hasKey: false }
let aiPreset = 'openai'
let aiMessages = []
let aiInput = ''
let aiBusy = false
let aiCfgOpen = false
let aiMode = 'chat'  // 'chat' | 'code'

async function api(path, opts) {
  const r = await fetch(API + path, opts)
  return r.json()
}

async function loadAll() {
  const [st, cs, se] = await Promise.all([
    api('/state').catch(() => ({ header: {}, structure: {}, rules: [], todo: [], history: '' })),
    api('/conn/list'),
    api('/session').catch(() => ({ content: '' }))
  ])
  state = st
  conns = cs.list || []
  activeId = cs.active || 'local'
  sessionContent = se.content || ''
}

// ==================== render ====================
function render() {
  const app = $('app')
  app.innerHTML = ''
  app.appendChild(renderHeader())
  app.appendChild(renderBody())
}

function renderHeader() {
  const h = state.header || {}
  const active = conns.find(c => c.id === activeId) || { name: '?', type: 'local' }

  const tabBar = el('div', { class: 'tabs' },
    el('button', { class: 'tab' + (view === 'board' ? ' active' : ''), onClick: () => { view = 'board'; render() } }, '看板'),
    el('button', { class: 'tab' + (view === 'session' ? ' active' : ''), onClick: () => { view = 'session'; render() } }, '终端'),
    el('button', { class: 'tab' + (view === 'preview' ? ' active' : ''), onClick: () => { view = 'preview'; render() } }, '预览'),
    el('button', { class: 'tab' + (view === 'ai' ? ' active' : ''), onClick: () => { view = 'ai'; loadAIConfig(); render() } }, 'AI')
  )

  const connBtn = el('button', {
    class: 'conn-btn',
    onClick: (e) => { e.stopPropagation(); connMenuOpen = !connMenuOpen; render() }
  },
    el('span', { class: 'dot ' + (active.type === 'ssh' ? 'ssh' : 'local') }),
    el('span', { class: 'conn-name' }, active.name),
    el('span', { class: 'conn-arrow' }, '▾')
  )

  const header = el('header', {},
    el('div', { class: 'brand' },
      el('span', { class: 'brand-name' }, h.name || 'xai'),
      el('span', { class: 'brand-ver' }, h.version ? 'v' + h.version : '')
    ),
    tabBar,
    el('div', { class: 'spacer' }),
    view === 'board' ? el('button', { class: 'btn-primary', onClick: runVerify }, verifyResultText()) : null,
    el('div', { class: 'conn-wrap' }, connBtn, connMenuOpen ? renderConnMenu() : null)
  )

  return header
}

function verifyResultText() {
  if (!verifyResult) return 'Verify'
  const e = (verifyResult.errors || []).length
  const w = (verifyResult.warnings || []).length
  if (e === 0 && w === 0) return '✓ 通过'
  return '✗ ' + e + ' 错误'
}

function renderConnMenu() {
  return el('div', { class: 'conn-menu', onClick: e => e.stopPropagation() },
    ...conns.map(c => el('div', {
      class: 'conn-item' + (c.id === activeId ? ' active' : ''),
      onClick: () => pickConn(c.id)
    },
      el('span', { class: 'conn-item-icon' }, c.type === 'ssh' ? '🖥' : '💻'),
      el('div', { class: 'conn-item-main' },
        el('div', { class: 'conn-item-name' }, c.name),
        el('div', { class: 'conn-item-sub' }, c.type === 'ssh' ? (c.user + '@' + c.host) : '本机')
      ),
      c.id !== 'local' ? el('button', {
        class: 'icon-btn',
        onClick: (e) => { e.stopPropagation(); removeConn(c.id) }
      }, '×') : null
    )),
    el('div', { class: 'conn-add', onClick: showAddConn }, '+ 添加 SSH 连接')
  )
}

function renderBody() {
  if (view === 'session') return renderSession()
  if (view === 'preview') return renderPreview()
  if (view === 'ai') return renderAI()
  return renderBoard()
}

async function loadAIConfig() {
  try {
    aiConfig = await api('/ai/config')
    const p = presetByCfg(aiConfig.provider || 'openai', aiConfig.base || '')
    aiPreset = p ? p.id : 'custom'
    render()
  } catch (e) {}
}

function renderAI() {
  const cfg = aiConfig
  const configured = cfg.base && cfg.model && cfg.hasKey

  const head = el('div', { class: 'ai-head' },
    el('div', { class: 'ai-head-left' },
      el('span', { class: 'ai-dot ' + (configured ? 'ok' : 'off') }),
      el('span', { class: 'ai-head-text' },
        configured ? (cfg.model + ' · ' + cfg.base.replace(/^https?:\/\//, '')) : '未配置 AI'
      ),
      el('div', { class: 'mode-switch' },
        el('button', { class: 'mode-btn' + (aiMode === 'chat' ? ' active' : ''), onClick: () => { aiMode = 'chat'; render() } }, '对话'),
        el('button', { class: 'mode-btn' + (aiMode === 'code' ? ' active' : ''), onClick: () => { aiMode = 'code'; render() } }, '改代码')
      )
    ),
    el('button', { class: 'btn-sm', onClick: () => { aiCfgOpen = !aiCfgOpen; render() } }, aiCfgOpen ? '收起' : '配置')
  )

  let cfgPanel = null
  if (aiCfgOpen) {
    const baseIn = el('input', { class: 'field-input', value: cfg.base, placeholder: 'https://api.openai.com/v1' })
    const modelIn = el('input', { class: 'field-input', value: cfg.model, placeholder: 'gpt-4o-mini / deepseek-chat / ...' })
    const keyIn = el('input', { class: 'field-input', type: 'password', placeholder: cfg.hasKey ? ('当前: ' + cfg.keyHint + '（留空不改）') : 'sk-...' })

    const presetBtns = el('div', { class: 'preset-row' },
      ...PRESETS.map(pr => el('button', {
        class: 'preset-btn' + (aiPreset === pr.id ? ' active' : ''),
        onClick: () => {
          aiPreset = pr.id
          baseIn.value = pr.base
          modelIn.value = pr.model
          // 重绘按钮高亮
          document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
          document.querySelector('.preset-btn[data-id="' + pr.id + '"]')?.classList.add('active')
          baseIn.focus()
        },
        'data-id': pr.id
      }, pr.label))
    )

    cfgPanel = el('div', { class: 'ai-cfg' },
      el('div', { class: 'field' },
        el('span', { class: 'field-label' }, '预设'),
        presetBtns
      ),
      el('label', { class: 'field' }, el('span', { class: 'field-label' }, 'API Base URL'), baseIn),
      el('label', { class: 'field' }, el('span', { class: 'field-label' }, '模型'), modelIn),
      el('label', { class: 'field' }, el('span', { class: 'field-label' }, 'API Key'), keyIn),
      el('div', { class: 'ai-cfg-actions' },
        el('button', { class: 'btn-ghost', onClick: () => { aiCfgOpen = false; render() } }, '取消'),
        el('button', { class: 'btn-primary', onClick: async () => {
          const pr = presetById(aiPreset)
          const body = {
            provider: pr ? pr.provider : 'openai',
            base: baseIn.value.trim(),
            model: modelIn.value.trim()
          }
          if (keyIn.value.trim()) body.key = keyIn.value.trim()
          await api('/ai/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          aiCfgOpen = false
          await loadAIConfig()
        }}, '保存')
      )
    )
  }

  const chatArea = el('div', { class: 'ai-chat' },
    ...aiMessages.map((m, idx) => {
      if (m.plan) {
        return renderPlan(m, idx)
      }
      return el('div', { class: 'ai-msg ai-msg-' + m.role },
        el('div', { class: 'ai-msg-role' }, m.role === 'user' ? '你' : 'AI'),
        el('div', { class: 'ai-msg-body' }, m.content)
      )
    }),
    aiMessages.length === 0 ? el('div', { class: 'empty' }, configured ? '问点什么，或让 AI 改代码' : '先点右上"配置"填入 API') : null,
    aiBusy ? el('div', { class: 'ai-msg ai-msg-assistant' }, el('div', { class: 'ai-msg-role' }, 'AI'), el('div', { class: 'ai-msg-body ai-busy' }, '思考中...')) : null
  )

  const input = el('textarea', {
    class: 'ai-input',
    placeholder: configured ? '输入你的需求，回车发送' : '请先配置 AI',
    value: aiInput,
    disabled: aiBusy,
    onInput: (e) => { aiInput = e.target.value },
    onKeydown: async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        await sendAI()
      }
    }
  })
  setTimeout(() => input.focus(), 0)

  return el('div', { class: 'ai' },
    head,
    cfgPanel,
    chatArea,
    el('div', { class: 'ai-bar' },
      input,
      el('button', { class: 'btn-primary', disabled: !configured || aiBusy, onClick: sendAI }, '发送')
    )
  )
}

async function sendAI() {
  if (!aiInput.trim() || aiBusy) return
  const msg = aiInput.trim()
  aiInput = ''
  aiMessages.push({ role: 'user', content: msg })
  aiBusy = true
  render()

  try {
    let r
    if (aiMode === 'code') {
      r = await api('/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
    } else {
      const history = aiMessages.slice(0, -1)
      r = await api('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history })
      })
    }
    if (r.error) {
      aiMessages.push({ role: 'assistant', content: '❌ ' + r.error })
    } else if (aiMode === 'code' && r.plan) {
      aiMessages.push({ role: 'assistant', plan: r.plan, applied: false, verify: null, summary: r.plan.summary })
    } else {
      aiMessages.push({ role: 'assistant', content: r.text || '(空)' })
    }
  } catch (e) {
    aiMessages.push({ role: 'assistant', content: '❌ 请求异常: ' + e.message })
  } finally {
    aiBusy = false
    render()
    setTimeout(() => {
      const chat = document.querySelector('.ai-chat')
      if (chat) chat.scrollTop = chat.scrollHeight
    }, 0)
  }
}

function renderPlan(m, idx) {
  const plan = m.plan
  const files = plan.files || []
  return el('div', { class: 'plan-card' },
    el('div', { class: 'plan-head' },
      el('span', { class: 'plan-icon' }, m.applied ? '✓' : '✨'),
      el('span', { class: 'plan-summary' }, plan.summary || '改动计划'),
      el('span', { class: 'plan-count' }, files.length + ' 个文件')
    ),
    el('div', { class: 'plan-files' },
      ...files.map((f, i) => renderPlanFile(f, i, idx))
    ),
    m.verify ? el('div', { class: 'plan-verify ' + ((m.verify.errors || []).length ? 'bad' : 'good') },
      (m.verify.errors || []).length
        ? '✗ verify 失败: ' + (m.verify.errors || []).join(' / ')
        : '✓ verify 通过'
    ) : null,
    m.applied ? null : el('div', { class: 'plan-actions' },
      el('button', { class: 'btn-ghost', onClick: () => { aiMessages[idx].plan = null; render() } }, '丢弃'),
      el('button', { class: 'btn-primary', onClick: () => applyPlan(idx) }, '全部应用')
    )
  )
}

function renderPlanFile(f, i, msgIdx) {
  const orig = f.original || ''
  const newContent = f.content || ''
  const diffLines = computeDiff(orig, newContent)

  return el('div', { class: 'plan-file' },
    el('div', { class: 'plan-file-head' },
      el('span', { class: 'plan-file-icon' }, f.isNew ? '✚' : '●'),
      el('span', { class: 'plan-file-path' }, f.path),
      el('span', { class: 'plan-file-stat' },
        diffLines.filter(d => d.t === '+').length + ' +  ' +
        diffLines.filter(d => d.t === '-').length + ' -'
      )
    ),
    el('pre', { class: 'plan-diff' },
      ...diffLines.slice(0, 30).map(d =>
        el('div', { class: 'diff-line diff-' + (d.t === '+' ? 'add' : d.t === '-' ? 'del' : 'ctx') }, (d.t === ' ' ? '  ' : d.t + ' ') + d.s)
      ),
      diffLines.length > 30 ? el('div', { class: 'diff-line diff-ctx' }, '... 还有 ' + (diffLines.length - 30) + ' 行') : null
    )
  )
}

function computeDiff(a, b) {
  const la = a.split('\n')
  const lb = b.split('\n')
  const out = []
  // 简单 LCS
  const m = la.length, n = lb.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = la[i-1] === lb[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1])
  }
  let i = m, j = n
  const stack = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && la[i-1] === lb[j-1]) { stack.push({ t: ' ', s: la[i-1] }); i--; j-- }
    else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) { stack.push({ t: '+', s: lb[j-1] }); j-- }
    else { stack.push({ t: '-', s: la[i-1] }); i-- }
  }
  return stack.reverse()
}

async function applyPlan(msgIdx) {
  const m = aiMessages[msgIdx]
  const r = await api('/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: m.plan })
  })
  if (r.error) {
    flash('应用失败: ' + r.error)
    return
  }
  m.applied = true
  m.verify = r.verify
  await loadAll()
  render()
  flash('已应用 ' + r.applied.length + ' 个文件')
}

function renderBoard() {
  const s = state.structure || {}
  const rules = state.rules || []
  const todo = state.todo || []

  const left = el('aside', { class: 'panel-left' },
    section('结构',
      ...Object.entries(s).flatMap(([group, items]) => {
        if (!Array.isArray(items) || !items.length) return []
        return [
          el('div', { class: 'group' }, group),
          ...items.map(it => {
            const name = (it.path || '').split('/').pop()
            const mt = it.mtime ? new Date(it.mtime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
            return el('div', {
              class: 'file-item' + (selected === it.path ? ' sel' : '') + (it.added ? ' added' : ''),
              onClick: () => openFile(it.path)
            },
              el('span', { class: 'file-name' }, name),
              it.added ? el('span', { class: 'tag-new' }, '✚') : null,
              el('span', { class: 'file-time' }, mt)
            )
          })
        ]
      })
    ),
    section('TODO',
      ...todo.map((t, i) => el('div', {
        class: 'todo-item' + (t.done ? ' done' : ''),
        onClick: () => toggleTodo(i + 1)
      },
        el('span', { class: 'todo-check' }, t.done ? '☑' : '☐'),
        el('span', { class: 'todo-text' }, t.text)
      )),
      todo.length === 0 ? el('div', { class: 'empty' }, '(空)') : null,
      el('input', {
        class: 'todo-input',
        placeholder: '+ 加 TODO，回车',
        onKeydown: async (e) => {
          if (e.key === 'Enter' && e.target.value.trim()) {
            await api('/todo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'add', text: e.target.value.trim() }) })
            e.target.value = ''
            await loadAll()
            render()
          }
        }
      })
    )
  )

  const right = el('main', { class: 'panel-right' },
    section('约定',
      rules.length ? el('ul', { class: 'rules' }, ...rules.map(r => el('li', {}, r))) : el('div', { class: 'empty' }, '(无)')
    ),
    section('历史',
      (state.history || '').split(/\n(?=###\s)/).filter(Boolean).slice(0, 20).map(e => {
        const line = e.split('\n')[0].replace(/^###\s*/, '')
        return el('div', { class: 'hist-item' }, line)
      })
    ),
    selected ? section(selected, el('pre', { class: 'file-view' }, fileContent == null ? '加载中...' : fileContent)) : null,
    verifyResult && (verifyResult.errors || []).length ? section('校验错误',
      el('ul', { class: 'errs' }, ...verifyResult.errors.map(x => el('li', {}, x)))
    ) : null
  )

  return el('div', { class: 'board' }, left, right)
}

function section(title, ...children) {
  return el('div', { class: 'sec' },
    el('div', { class: 'sec-title' }, title),
    ...children.filter(Boolean)
  )
}

function renderSession() {
  const active = conns.find(c => c.id === activeId) || { name: '?' }
  const pre = el('pre', { class: 'term-out', id: 'term-out' }, sessionContent || '')
  setTimeout(() => { pre.scrollTop = pre.scrollHeight }, 0)

  const input = el('input', {
    class: 'term-input',
    placeholder: '输入命令，回车执行  (xai verify / ls / git status / ...)',
    onKeydown: async (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        const line = e.target.value.trim()
        e.target.value = ''
        e.target.disabled = true
        const r = await api('/exec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line }) })
        const s = await api('/session')
        sessionContent = s.content || ''
        e.target.disabled = false
        render()
        setTimeout(() => $('term-input')?.focus(), 0)
      }
    }
  })
  setTimeout(() => input.focus(), 0)

  return el('div', { class: 'term' },
    el('div', { class: 'term-head' },
      el('span', { class: 'term-path' }, active.name + ' · ' + (active.type === 'ssh' ? (active.user + '@' + active.host) : '本机')),
      el('div', { class: 'spacer' }),
      el('button', { class: 'btn-sm', onClick: async () => { await api('/session/clear', { method: 'POST' }); sessionContent = ''; render() } }, '清空'),
      el('button', { class: 'btn-sm', onClick: async () => {
        try { await navigator.clipboard.writeText(sessionContent); flash('已复制 ' + sessionContent.length + ' 字符') }
        catch (e) { flash('复制失败') }
      }}, '复制全部')
    ),
    pre,
    el('div', { class: 'term-bar' }, input)
  )
}

function renderPreview() {
  const urlInput = el('input', {
    class: 'preview-url',
    value: previewUrl,
    placeholder: 'http://localhost:8080',
    onKeydown: (e) => {
      if (e.key === 'Enter') {
        previewUrl = e.target.value.trim()
        localStorage.setItem('xai-preview', previewUrl)
        previewKey++
        render()
      }
    }
  })

  const iframe = el('iframe', {
    class: 'preview-frame',
    src: previewUrl,
    key: 'p' + previewKey,
    sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals',
    referrerpolicy: 'no-referrer'
  })

  return el('div', { class: 'preview' },
    el('div', { class: 'preview-head' },
      el('span', { class: 'preview-icon' }, '🌐'),
      urlInput,
      el('button', { class: 'btn-sm', onClick: () => { previewKey++; render() } }, '刷新'),
      el('button', { class: 'btn-sm', onClick: () => window.open(previewUrl, '_blank') }, '新窗口')
    ),
    el('div', { class: 'preview-wrap' }, iframe)
  )
}

function flash(msg) {
  const d = el('div', { class: 'flash' }, msg)
  document.body.appendChild(d)
  setTimeout(() => d.remove(), 2000)
}

// ==================== 操作 ====================
async function openFile(p) {
  selected = p
  fileContent = null
  render()
  const r = await api('/file?p=' + encodeURIComponent(p))
  fileContent = r.content != null ? r.content : (r.error || '(空)')
  render()
}

async function toggleTodo(n) {
  await api('/todo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ op: 'toggle', n }) })
  await loadAll()
  render()
}

async function runVerify() {
  verifyResult = await api('/verify', { method: 'POST' })
  render()
}

async function pickConn(id) {
  activeId = id
  connMenuOpen = false
  await api('/conn/use', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  const s = await api('/session')
  sessionContent = s.content || ''
  render()
}

async function removeConn(id) {
  await api('/conn/rm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
  await loadAll()
  render()
}

// ==================== Modal ====================
function showAddConn() {
  connMenuOpen = false
  const modal = $('modal')
  const form = el('form', {
    class: 'modal-card',
    onSubmit: async (e) => {
      e.preventDefault()
      const fd = new FormData(form)
      const data = Object.fromEntries(fd.entries())
      await api('/conn/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      modal.innerHTML = ''
      await loadAll()
      render()
    }
  },
    el('h2', { class: 'modal-title' }, '添加 SSH 连接'),
    field('name', '名称', 'text', '服务器A'),
    field('host', '主机', 'text', '192.168.1.10'),
    field('port', '端口', 'number', '22'),
    field('user', '用户名', 'text', 'root'),
    field('keyPath', '密钥路径（可选）', 'text', 'C:\\Users\\...\\.ssh\\id_rsa'),
    field('password', '密码（或密钥）', 'password', ''),
    field('cwd', '远程工作目录（默认 /root）', 'text', '/root'),
    el('div', { class: 'modal-actions' },
      el('button', { type: 'button', class: 'btn-ghost', onClick: () => { modal.innerHTML = '' } }, '取消'),
      el('button', { type: 'submit', class: 'btn-primary' }, '保存')
    )
  )
  modal.innerHTML = ''
  modal.appendChild(el('div', { class: 'modal-bg', onClick: () => { modal.innerHTML = '' } }))
  modal.appendChild(form)
}

function field(name, label, type, placeholder) {
  return el('label', { class: 'field' },
    el('span', { class: 'field-label' }, label),
    el('input', { class: 'field-input', name, type, placeholder })
  )
}

// ==================== 启动 ====================
await loadAll()
render()

document.addEventListener('click', () => { if (connMenuOpen) { connMenuOpen = false; render() } })
