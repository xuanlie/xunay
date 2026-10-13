#!/usr/bin/env node
// test/backends.test.js —— 5 端一致性测试（每端独立端口）

import { spawn, execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// 每端独立端口，彻底避免冲突
const BACKENDS = [
  { name: 'node',   cwd: 'backends/node',   port: 12351,
    cmd: 'node', args: ['server.js'] },
  { name: 'python', cwd: 'backends/python', port: 12352,
    cmd: '.venv/bin/python',
    args: ['-m', 'granian', '--interface', 'asgi', 'main:app',
           '--host', '0.0.0.0', '--port', '12352', '--workers', '1'] },
  { name: 'go',     cwd: 'backends/go',     port: 12353,
    cmd: '/tmp/xunay-go', args: [] },
  { name: 'cpp',    cwd: 'backends/cpp',    port: 12354,
    cmd: './server', args: [] },
  { name: 'rust',   cwd: 'backends/rust',   port: 12355,
    cmd: './target/release/xunay-backend', args: [] },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchJSON(base, pathname, opts = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 3000)
  try {
    const res = await fetch(base + pathname, { ...opts, signal: ctrl.signal })
    const text = await res.text()
    try { return { status: res.status, json: JSON.parse(text) } }
    catch { return { status: res.status, json: null, raw: text } }
  } finally {
    clearTimeout(timer)
  }
}

async function waitReady(base, timeoutMs = 15000) {
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 1000)
    try {
      const r = await fetch(base + '/rpc/token', { signal: ctrl.signal })
      clearTimeout(timer)
      if (r.ok) return true
    } catch { clearTimeout(timer) }
    await sleep(300)
  }
  return false
}

async function killPort(port) {
  // V072 修复：跨平台端口清理
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
      const pids = [...new Set(out.split('\n').map(l => l.trim().split(/\s+/).pop()).filter(Boolean))]
      for (const pid of pids) {
        try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' }) } catch {}
      }
    } else if (process.platform === 'darwin') {
      execSync(`lsof -ti:${port} | xargs -r kill -9 2>/dev/null || true`, { shell: true })
    } else {
      execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { shell: true })
    }
  } catch {}
  await sleep(500)
}

async function startBackend(b) {
  await killPort(b.port)
  const base = `http://127.0.0.1:${b.port}`
  const proc = spawn(b.cmd, b.args, {
    cwd: path.join(ROOT, b.cwd),
    env: { ...process.env, XUNAY_DB: 'sqlite', XUNAY_ROOT: ROOT,
           XUNAY_PORT: String(b.port) },
    stdio: 'pipe',
  })
  let out = ''
  proc.stdout.on('data', d => { out += d })
  proc.stderr.on('data', d => { out += d })

  const ok = await waitReady(base, 15000)
  if (!ok) {
    try { proc.kill('SIGKILL') } catch {}
    await killPort(b.port)
    throw new Error(`${b.name} 启动超时\n--- 日志 ---\n${out || '(无输出)'}`)
  }
  return proc
}

async function stopBackend(proc, port) {
  if (proc) {
    try { proc.kill('SIGTERM') } catch {}
    await sleep(400)
    try { proc.kill('SIGKILL') } catch {}
  }
  await killPort(port)
}

function assert(cond, msg) {
  if (!cond) throw new Error('断言失败: ' + msg)
}

function assertShape(r, name) {
  assert(r.json !== null, `${name}: 响应不是 JSON: ${r.raw?.slice(0, 200)}`)
  assert(typeof r.json.ok === 'boolean', `${name}: 缺 ok`)
  assert('data' in r.json, `${name}: 缺 data`)
  assert('error' in r.json, `${name}: 缺 error`)
  if (!r.json.ok) {
    assert(r.json.data === null, `${name}: 失败时 data 应为 null`)
    assert(typeof r.json.error === 'string', `${name}: 失败时 error 应为字符串`)
  } else {
    assert(r.json.error === null, `${name}: 成功时 error 应为 null`)
  }
}

async function testBackend(b) {
  const base = `http://127.0.0.1:${b.port}`
  console.log(`\n===== ${b.name} (${b.port}) =====`)
  const proc = await startBackend(b)
  try {
    let r = await fetchJSON(base, '/rpc/token')
    assertShape(r, `${b.name} token`)
    assert(r.json.ok === true, `${b.name}: token 应成功`)
    const token = r.json.data.token
    assert(typeof token === 'string' && token.length === 32,
      `${b.name}: token 应为 32 位，实际 ${token}`)
    console.log(`  ✓ 拿 token: ${token.slice(0, 8)}...`)

    const auth = { 'X-Token': token }

    r = await fetchJSON(base, '/rpc/getTodos', { headers: auth })
    assertShape(r, `${b.name} getTodos`)
    assert(Array.isArray(r.json.data), `${b.name}: data 应为数组`)
    console.log(`  ✓ getTodos: ${r.json.data.length} 条`)

    const title = `test-${b.name}-${Date.now()}`
    r = await fetchJSON(base, '/rpc/addTodo', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    assertShape(r, `${b.name} addTodo`)
    assert(r.json.ok === true, `${b.name}: addTodo 应成功`)
    assert(typeof r.json.data.id === 'string', `${b.name}: 应返回 id 字符串`)
    const id = r.json.data.id
    console.log(`  ✓ addTodo: ${id.slice(0, 8)}...`)

    r = await fetchJSON(base, '/rpc/getTodos', { headers: auth })
    const found = r.json.data.find(t => t.id === id)
    assert(found, `${b.name}: 写后应读到`)
    assert(found.title === title, `${b.name}: title 应匹配`)
    assert(found.done === false, `${b.name}: done 应为 false，实际 ${found.done}`)
    console.log(`  ✓ 读回一致`)

    r = await fetchJSON(base, '/rpc/toggleTodo', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    assertShape(r, `${b.name} toggleTodo`)
    console.log(`  ✓ toggleTodo`)

    r = await fetchJSON(base, '/rpc/addTodo', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    })
    assertShape(r, `${b.name} 空 title`)
    assert(r.json.ok === false, `${b.name}: 空 title 应失败`)
    assert(r.json.error.includes('title'),
      `${b.name}: error 应含 title，实际 "${r.json.error}"`)
    console.log(`  ✓ 空 title 被拒: "${r.json.error}"`)

    r = await fetchJSON(base, '/rpc/getTodos')
    assertShape(r, `${b.name} 无 token`)
    assert(r.json.ok === false, `${b.name}: 无 token 应失败`)
    assert(r.json.error.includes('token'),
      `${b.name}: error 应含 token，实际 "${r.json.error}"`)
    console.log(`  ✓ 无 token 被拒: "${r.json.error}"`)

    r = await fetchJSON(base, '/rpc/deleteTodo', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    assertShape(r, `${b.name} deleteTodo`)
    console.log(`  ✓ deleteTodo`)

    r = await fetchJSON(base, '/rpc/getTodos', { headers: auth })
    assert(!r.json.data.find(t => t.id === id), `${b.name}: 删后不应读到`)
    console.log(`  ✓ 删除生效`)

    return { name: b.name, ok: true }
  } catch (e) {
    console.log(`  ✗ ${e.message}`)
    return { name: b.name, ok: false, error: e.message }
  } finally {
    await stopBackend(proc, b.port)
  }
}

const only = process.argv[2]
const targets = only ? BACKENDS.filter(b => b.name === only) : BACKENDS
if (targets.length === 0) {
  console.error(`未知后端: ${only}（可选: ${BACKENDS.map(b => b.name).join(' / ')}）`)
  process.exit(1)
}

const results = []
for (const b of targets) {
  results.push(await testBackend(b))
}

console.log('\n========================================')
console.log('结果')
console.log('========================================')
for (const r of results) {
  console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}${r.error ? '  ' + r.error.split('\n')[0] : ''}`)
}
process.exit(results.some(r => !r.ok) ? 1 : 0)
