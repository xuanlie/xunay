#!/usr/bin/env node
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { parseStateFile } from '../ai/lib/parse-state.mjs'
import { verify } from '../ai/lib/verify-state.mjs'
import { readTodo, writeTodo } from '../ai/lib/todo-state.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = parseInt(process.env.PORT || '12350', 10)

// ============ 连接配置 ============
const XAI_HOME = path.join(os.homedir(), '.xai')
const AI_CONFIG_FILE = path.join(XAI_HOME, 'ai.json')
const CONN_FILE = path.join(XAI_HOME, 'connections.json')
const ACTIVE_FILE = path.join(XAI_HOME, 'active.txt')
fs.mkdirSync(XAI_HOME, { recursive: true })

const DEFAULT_CONN = {
  id: 'local',
  name: '本地',
  type: 'local',
  cwd: process.cwd()
}

function loadConns() {
  if (!fs.existsSync(CONN_FILE)) {
    fs.writeFileSync(CONN_FILE, JSON.stringify([DEFAULT_CONN], null, 2))
    return [DEFAULT_CONN]
  }
  try { return JSON.parse(fs.readFileSync(CONN_FILE, 'utf8')) } catch (e) { return [DEFAULT_CONN] }
}
function saveConns(c) { fs.writeFileSync(CONN_FILE, JSON.stringify(c, null, 2), 'utf8') }
function activeId() { return fs.existsSync(ACTIVE_FILE) ? fs.readFileSync(ACTIVE_FILE, 'utf8').trim() : 'local' }
function setActive(id) { fs.writeFileSync(ACTIVE_FILE, id, 'utf8') }
function activeConn() { return loadConns().find(c => c.id === activeId()) || loadConns()[0] }

// ============ 执行 ============
async function execLocal(conn, cmd) {
  const { spawnSync } = await import('node:child_process')
  const cwd = conn.cwd || process.cwd()
  let r
  if (cmd === 'xai' || cmd.startsWith('xai ')) {
    const args = cmd.slice(4).trim().split(/\s+/).filter(Boolean)
    const XAI_JS = path.join(__dirname, 'xai.js')
    r = spawnSync('node', [XAI_JS, ...args], { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  } else if (process.platform === 'win32') {
    const wrapped = "[Console]::OutputEncoding=[Text.UTF8Encoding]::new(); $env:NO_COLOR='1'; " + cmd
    r = spawnSync('powershell', ['-NoProfile', '-Command', wrapped], { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  } else {
    r = spawnSync('sh', ['-c', cmd], { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
  }
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') }
}

async function execSSH(conn, cmd) {
  const { Client } = await import('ssh2')
  return new Promise((resolve) => {
    const ssh = new Client()
    let done = false
    const finish = (result) => {
      if (done) return
      done = true
      try { ssh.end() } catch (e) {}
      resolve(result)
    }
    const timer = setTimeout(() => finish({ ok: false, out: 'SSH 超时' }), 30000)

    ssh.on('ready', () => {
      const cwd = conn.cwd || '/root'
      const fullCmd = 'cd ' + JSON.stringify(cwd) + ' && ' + cmd
      ssh.exec(fullCmd, (err, stream) => {
        if (err) { clearTimeout(timer); return finish({ ok: false, out: 'exec 失败: ' + err.message }) }
        let out = ''
        stream.on('data', d => out += d.toString('utf8'))
        stream.stderr.on('data', d => out += d.toString('utf8'))
        stream.on('close', (code) => {
          clearTimeout(timer)
          finish({ ok: code === 0, out })
        })
      })
    })

    ssh.on('error', (e) => {
      clearTimeout(timer)
      finish({ ok: false, out: 'SSH 连接失败: ' + e.message })
    })

    const cfg = {
      host: conn.host,
      port: conn.port || 22,
      username: conn.user,
      readyTimeout: 15000
    }
    if (conn.keyPath) {
      try { cfg.privateKey = fs.readFileSync(conn.keyPath) }
      catch (e) { return finish({ ok: false, out: '密钥读取失败: ' + e.message }) }
    } else if (conn.password) {
      cfg.password = conn.password
    }
    ssh.connect(cfg)
  })
}

async function exec(conn, cmd) {
  if (conn.type === 'ssh') return execSSH(conn, cmd)
  return execLocal(conn, cmd)
}

// ============ HTTP ============
function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise(resolve => {
    let s = ''
    req.on('data', c => s += c)
    req.on('end', () => resolve(s))
  })
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' }

// 会话日志：每个连接一份
function sessionLogPath(connId) {
  return path.join(XAI_HOME, 'sessions', connId + '.log')
}
function ensureSessionDir() { fs.mkdirSync(path.join(XAI_HOME, 'sessions'), { recursive: true }) }

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    return res.end()
  }

  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname

  // ---- 连接管理 ----
  if (p === '/api/conn/list') {
    const conns = loadConns().map(c => ({
      id: c.id, name: c.name, type: c.type,
      host: c.host, user: c.user, cwd: c.cwd
    }))
    return json(res, { list: conns, active: activeId() })
  }

  if (p === '/api/conn/use' && req.method === 'POST') {
    const b = JSON.parse(await readBody(req) || '{}')
    setActive(b.id)
    return json(res, { ok: true })
  }

  if (p === '/api/conn/add' && req.method === 'POST') {
    const b = JSON.parse(await readBody(req) || '{}')
    const conns = loadConns()
    const id = 'c' + Date.now()
    const type = b.type || 'ssh'
    const defaultCwd = type === 'ssh' ? '/root' : process.cwd()
    conns.push({
      id,
      name: b.name,
      type,
      host: b.host,
      port: b.port ? parseInt(b.port, 10) : 22,
      user: b.user,
      password: b.password || '',
      keyPath: b.keyPath || '',
      cwd: b.cwd || defaultCwd
    })
    saveConns(conns)
    return json(res, { ok: true, id })
  }

  if (p === '/api/conn/rm' && req.method === 'POST') {
    const b = JSON.parse(await readBody(req) || '{}')
    const conns = loadConns().filter(c => c.id !== b.id)
    saveConns(conns)
    if (activeId() === b.id) setActive('local')
    return json(res, { ok: true })
  }

  if (p === '/api/conn/test' && req.method === 'POST') {
    const b = JSON.parse(await readBody(req) || '{}')
    const conn = loadConns().find(c => c.id === b.id)
    if (!conn) return json(res, { ok: false, out: '连接不存在' })
    const r = await exec(conn, 'echo xai-ok')
    return json(res, { ok: r.ok && r.out.includes('xai-ok'), out: r.out })
  }

  // ---- 会话日志 ----
  if (p === '/api/session') {
    ensureSessionDir()
    const f = sessionLogPath(activeId())
    const content = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : ''
    return json(res, { content })
  }

  if (p === '/api/session/clear' && req.method === 'POST') {
    ensureSessionDir()
    fs.writeFileSync(sessionLogPath(activeId()), '', 'utf8')
    return json(res, { ok: true })
  }

  // ---- 执行 ----
  if (p === '/api/exec' && req.method === 'POST') {
    const b = JSON.parse(await readBody(req) || '{}')
    const line = (b.line || '').trim()
    if (!line) return json(res, { error: 'empty' }, 400)

    const conn = activeConn()
    const r = await exec(conn, line)

    ensureSessionDir()
    const entry = '\n' + (conn.type === 'ssh' ? '🖥 ' : '💻 ') + conn.name + ' $ ' + line + '\n' + (r.out.trimEnd() || '(无输出)') + '\n'
    fs.appendFileSync(sessionLogPath(conn.id), entry, 'utf8')

    return json(res, { ok: r.ok, out: r.out })
  }

  // ---- 看板相关（复用现有 API）----
  const stateFile = findStateFile(process.cwd())
  if (stateFile) {
    const root = path.dirname(stateFile)

    if (p === '/api/state') {
      const st = parseStateFile(stateFile)
      for (const [group, items] of Object.entries(st.structure || {})) {
        if (!Array.isArray(items)) continue
        for (const it of items) {
          if (!it.path) continue
          try { it.mtime = fs.statSync(path.join(root, it.path)).mtimeMs } catch (e) { it.mtime = null }
        }
      }
      return json(res, st)
    }

    if (p === '/api/file') {
      const rel = url.searchParams.get('p')
      if (!rel) return json(res, { error: 'no path' }, 400)
      const full = path.resolve(root, rel)
      if (!full.startsWith(root)) return json(res, { error: 'denied' }, 403)
      if (!fs.existsSync(full)) return json(res, { error: 'not found' }, 404)
      return json(res, { content: fs.readFileSync(full, 'utf8') })
    }

    if (p === '/api/verify' && req.method === 'POST') return json(res, verify(root))

    if (p === '/api/todo' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}')
      const todos = readTodo(stateFile)
      if (body.op === 'toggle') {
        const i = body.n - 1
        if (i >= 0 && i < todos.length) { todos[i].done = !todos[i].done; writeTodo(stateFile, todos) }
      } else if (body.op === 'add') {
        if (body.text) { todos.push({ text: body.text, done: false }); writeTodo(stateFile, todos) }
      } else if (body.op === 'rm') {
        const i = body.n - 1
        if (i >= 0 && i < todos.length) { todos.splice(i, 1); writeTodo(stateFile, todos) }
      }
      return json(res, { ok: true, todo: readTodo(stateFile) })
    }
  }

  // ---- AI ----
  if (p === '/api/ai/config') {
    if (req.method === 'GET') {
      const cfg = fs.existsSync(AI_CONFIG_FILE)
        ? JSON.parse(fs.readFileSync(AI_CONFIG_FILE, 'utf8'))
        : { base: '', key: '', model: '' }
      // 不返回完整 key，只返回前 6 位
      return json(res, {
        provider: cfg.provider || 'openai',
        base: cfg.base || '',
        model: cfg.model || '',
        keyHint: cfg.key ? cfg.key.slice(0, 8) + '...' : '',
        hasKey: !!cfg.key
      })
    }
    if (req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}')
      let cfg = {}
      if (fs.existsSync(AI_CONFIG_FILE)) {
        try { cfg = JSON.parse(fs.readFileSync(AI_CONFIG_FILE, 'utf8')) } catch (e) {}
      }
      if (body.provider !== undefined) cfg.provider = body.provider
      if (body.base !== undefined) cfg.base = body.base
      if (body.model !== undefined) cfg.model = body.model
      if (body.key !== undefined && body.key !== '') cfg.key = body.key
      fs.writeFileSync(AI_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8')
      return json(res, { ok: true })
    }
  }

  if (p === '/api/ai/chat' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}')
    if (!fs.existsSync(AI_CONFIG_FILE)) return json(res, { error: '未配置 AI' }, 400)
    const cfg = JSON.parse(fs.readFileSync(AI_CONFIG_FILE, 'utf8'))
    if (!cfg.base || !cfg.key || !cfg.model) return json(res, { error: '配置不完整' }, 400)

    // 组装 messages
    let sys = body.system || '你是 xai 助手，帮用户修改项目代码。'
    // 如果有 AI-STATE.md，加进 context
    const stateFile = findStateFile(process.cwd())
    if (stateFile && !body.system) {
      const st = fs.readFileSync(stateFile, 'utf8')
      sys = '你是 xai 助手，帮用户修改这个项目。\n\n项目状态：\n' + st + '\n\n请用中文回答。'
    }
    const messages = [
      { role: 'system', content: sys },
      ...(body.history || []),
      { role: 'user', content: body.message || '' }
    ]

    const provider = cfg.provider || 'openai'
    try {
      if (provider === 'anthropic') {
        // Anthropic Messages API
        const url = cfg.base.replace(/\/$/, '') + '/messages'
        const sysMsg = messages.find(m => m.role === 'system')
        const chatMsgs = messages.filter(m => m.role !== 'system')
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': cfg.key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: cfg.model,
            max_tokens: 4096,
            system: sysMsg ? sysMsg.content : undefined,
            messages: chatMsgs.map(m => ({ role: m.role, content: m.content }))
          })
        })
        const d = await r.json()
        if (!r.ok) return json(res, { error: d.error?.message || ('HTTP ' + r.status) }, 500)
        const text = (d.content || []).map(c => c.text || '').join('') || '(空)'
        return json(res, { ok: true, text })
      }
      // OpenAI 兼容
      const url = cfg.base.replace(/\/$/, '') + '/chat/completions'
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + cfg.key
        },
        body: JSON.stringify({ model: cfg.model, messages, stream: false })
      })
      const d = await r.json()
      if (!r.ok) return json(res, { error: d.error?.message || ('HTTP ' + r.status) }, 500)
      const text = d.choices?.[0]?.message?.content || '(空)'
      return json(res, { ok: true, text })
    } catch (e) {
      return json(res, { error: '请求失败: ' + e.message }, 500)
    }
  }

  // ---- AI plan ----
  if (p === '/api/ai/plan' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}')
    if (!fs.existsSync(AI_CONFIG_FILE)) return json(res, { error: '未配置 AI' }, 400)
    const cfg = JSON.parse(fs.readFileSync(AI_CONFIG_FILE, 'utf8'))
    if (!cfg.base || !cfg.key || !cfg.model) return json(res, { error: '配置不完整' }, 400)

    const stateFile = findStateFile(process.cwd())
    const root = stateFile ? path.dirname(stateFile) : process.cwd()
    let stateText = stateFile ? fs.readFileSync(stateFile, 'utf8') : ''

    // 收集当前项目文件列表
    let fileList = []
    if (stateFile) {
      const parsed = parseStateFile(stateFile)
      for (const [g, items] of Object.entries(parsed.structure || {})) {
        if (!Array.isArray(items)) continue
        for (const it of items) if (it.path) fileList.push(it.path)
      }
    }

    const sys = `你是 xai 助手。用户会让你修改项目。你必须返回严格的 JSON 格式，不要有任何解释文字。

返回格式：
{
  "summary": "一句话描述改动",
  "files": [
    { "path": "components/Comment.xuy", "content": "完整的文件内容", "isNew": true },
    { "path": "pages/Post.xuy", "content": "完整的文件内容", "isNew": false },
    { "path": "AI-STATE.md", "content": "完整的 AI-STATE.md 内容", "isNew": false }
  ]
}

【强制规则】
1. content 必须是完整文件内容，不是 diff
2. 【必须】在 files 里包含 "AI-STATE.md"，且其 content 是更新后的完整内容
3. AI-STATE.md 更新必须同步反映：
   - 新增文件 → 加到 structure 对应组，加 "added": "YYYY-MM-DD"
   - 删除文件 → 从 structure 移除
   - 修改文件 → 保持原位置
   - 在"历史"段顶部插入本次改动（格式：### YYYY-MM-DD · 标题）
   - 如果有完成的 TODO，把对应项 done 改成 true
4. 只返回 JSON，不要 markdown 代码块，不要前后缀，不要解释

当前 AI-STATE.md：
${stateText}

当前文件列表：
${fileList.join('\n')}

今天是：${new Date().toISOString().slice(0, 10)}`

    const url = cfg.provider === 'anthropic'
      ? cfg.base.replace(/\/$/, '') + '/messages'
      : cfg.base.replace(/\/$/, '') + '/chat/completions'

    try {
      let text
      if (cfg.provider === 'anthropic') {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': cfg.key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: cfg.model, max_tokens: 8000, system: sys, messages: [{ role: 'user', content: body.message || '' }] })
        })
        const d = await r.json()
        if (!r.ok) return json(res, { error: d.error?.message || ('HTTP ' + r.status) }, 500)
        text = (d.content || []).map(c => c.text || '').join('')
      } else {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.key },
          body: JSON.stringify({ model: cfg.model, messages: [{ role: 'system', content: sys }, { role: 'user', content: body.message || '' }] })
        })
        const d = await r.json()
        if (!r.ok) return json(res, { error: d.error?.message || ('HTTP ' + r.status) }, 500)
        text = d.choices?.[0]?.message?.content || ''
      }

      // 提取 JSON（可能被 ``` 包裹）
      let clean = text.trim()
      const codeBlock = clean.match(/```(?:json)?\s*\n([\s\S]*?)```/)
      if (codeBlock) clean = codeBlock[1].trim()
      const firstBrace = clean.indexOf('{')
      const lastBrace = clean.lastIndexOf('}')
      if (firstBrace >= 0 && lastBrace > firstBrace) clean = clean.slice(firstBrace, lastBrace + 1)

      let plan
      try { plan = JSON.parse(clean) }
      catch (e) { return json(res, { error: 'AI 返回的不是有效 JSON', raw: text }, 500) }

      // 附加原内容（用于 diff）
      for (const f of (plan.files || [])) {
        const full = path.join(root, f.path)
        f.original = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''
        f.isNew = !f.original
      }

      return json(res, { ok: true, plan })
    } catch (e) {
      return json(res, { error: '请求失败: ' + e.message }, 500)
    }
  }

  if (p === '/api/apply' && req.method === 'POST') {
    const body = JSON.parse(await readBody(req) || '{}')
    const plan = body.plan
    if (!plan || !Array.isArray(plan.files)) return json(res, { error: '无效计划' }, 400)

    const stateFile = findStateFile(process.cwd())
    const root = stateFile ? path.dirname(stateFile) : process.cwd()

    // 备份
    const backupDir = path.join(XAI_HOME, 'backups', Date.now().toString())
    fs.mkdirSync(backupDir, { recursive: true })

    const applied = []
    for (const f of plan.files) {
      const full = path.resolve(root, f.path)
      if (!full.startsWith(root)) continue
      // 备份原文件
      if (fs.existsSync(full)) {
        const bak = path.join(backupDir, f.path.replace(/[\/]/g, '__'))
        fs.copyFileSync(full, bak)
      }
      // 写新内容
      fs.mkdirSync(path.dirname(full), { recursive: true })
      fs.writeFileSync(full, f.content, 'utf8')
      applied.push(f.path)
    }

    // 更新历史
    const stateF = findStateFile(process.cwd())
    if (stateF) {
      try {
        const { appendHistory } = await import('../ai/lib/write-state.mjs')
        appendHistory(stateF, plan.summary || 'AI 改动', applied)
      } catch (e) {}
    }

    // 校验
    let verifyResult = null
    try {
      const root2 = stateF ? path.dirname(stateF) : root
      verifyResult = verify(root2)
    } catch (e) {}

    return json(res, { ok: true, applied, backup: backupDir, verify: verifyResult })
  }

  // ---- /xunay/* → core/src ----
  if (p.startsWith('/xunay/')) {
    const rel = p.slice(7)
    const full = path.join(__dirname, '..', 'core', 'src', rel)
    if (!fs.existsSync(full)) { res.writeHead(404); return res.end('404') }
    const ext = path.extname(full)
    res.writeHead(200, { 'Content-Type': (MIME[ext] || 'text/plain') + '; charset=utf-8' })
    return res.end(fs.readFileSync(full))
  }

  // ---- 静态 ----
  let filePath
  if (p === '/' || p === '/index.html') {
    filePath = path.join(__dirname, '..', 'ai', 'ui', 'index.html')
  } else {
    filePath = path.join(__dirname, '..', 'ai', 'ui', p)
  }
  if (!fs.existsSync(filePath)) { res.writeHead(404); return res.end('404') }
  const ext = path.extname(filePath)
  res.writeHead(200, { 'Content-Type': (MIME[ext] || 'text/plain') + '; charset=utf-8' })
  res.end(fs.readFileSync(filePath))
})

function findStateFile(dir) {
  let cur = path.resolve(dir)
  while (true) {
    const f = path.join(cur, 'AI-STATE.md')
    if (fs.existsSync(f)) return f
    const parent = path.dirname(cur)
    if (parent === cur) return null
    cur = parent
  }
}

server.listen(PORT, () => {
  console.log('')
  console.log('  xai-server')
  console.log('  http://localhost:' + PORT)
  console.log('  项目: ' + process.cwd())
  console.log('  连接配置: ' + CONN_FILE)
  console.log('')
  console.log('  Ctrl+C 停止')
})
