#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseStateFile } from '../ai/lib/parse-state.mjs'
import { renderState, renderSnapshot } from '../ai/lib/render-state.mjs'
import { verify } from '../ai/lib/verify-state.mjs'
import { appendHistory } from '../ai/lib/write-state.mjs'

const args = process.argv.slice(2)
const cmd = args[0] || 'state'

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

function loadState() {
  const f = findStateFile(process.cwd())
  if (!f) {
    console.error('xai: 找不到 AI-STATE.md')
    process.exit(1)
  }
  return { path: f, state: parseStateFile(f) }
}

switch (cmd) {
  case 'state': {
    const { state } = loadState()
    console.log(renderState(state))
    break
  }
  case 'snapshot': {
    const { state } = loadState()
    console.log(renderSnapshot(state))
    break
  }
  case 'verify': {
    const stateFile = findStateFile(process.cwd())
    if (!stateFile) {
      console.error('xai: 找不到 AI-STATE.md')
      process.exit(1)
    }
    const projectRoot = path.dirname(stateFile)
    const { errors, warnings } = verify(projectRoot)
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✓ 通过')
    } else {
      for (const w of warnings) console.log('⚠ ' + w)
      for (const e of errors) console.log('✗ ' + e)
      process.exitCode = 1
    }
    break
  }
  case 'log': {
    const title = args[1]
    if (!title) {
      console.error('用法: xai log "标题" --files "a,b,c"')
      process.exit(1)
    }
    const fi = args.indexOf('--files')
    const files = fi >= 0 && args[fi + 1] ? args[fi + 1].split(',').map(s => s.trim()) : []
    const stateFile = findStateFile(process.cwd())
    if (!stateFile) {
      console.error('xai: 找不到 AI-STATE.md')
      process.exit(1)
    }
    appendHistory(stateFile, title, files)
    console.log('✓ 已记录: ' + title)
    break
  }
  case 'todo': {
    const stateFile = findStateFile(process.cwd())
    if (!stateFile) {
      console.error('xai: 找不到 AI-STATE.md')
      process.exit(1)
    }
    const { listTodo, addTodo, doneTodo, undoDoneTodo, removeTodo } = await import('../ai/lib/todo-state.mjs')
    const sub = args[1] || 'list'
    try {
      if (sub === 'list') {
        console.log(listTodo(stateFile) || '(空)')
      } else if (sub === 'add') {
        const text = args[2]
        if (!text) { console.error('用法: xai todo add "文本"'); process.exit(1) }
        const n = addTodo(stateFile, text)
        console.log('OK #' + n + ': ' + text)
      } else if (sub === 'done') {
        const n = parseInt(args[2], 10)
        if (!n) { console.error('用法: xai todo done <序号>'); process.exit(1) }
        console.log('OK 完成: ' + doneTodo(stateFile, n))
      } else if (sub === 'undo') {
        const n = parseInt(args[2], 10)
        if (!n) { console.error('用法: xai todo undo <序号>'); process.exit(1) }
        console.log('OK 取消完成: ' + undoDoneTodo(stateFile, n))
      } else if (sub === 'rm') {
        const n = parseInt(args[2], 10)
        if (!n) { console.error('用法: xai todo rm <序号>'); process.exit(1) }
        console.log('OK 已删: ' + removeTodo(stateFile, n))
      } else {
        console.error('未知子命令: ' + sub)
        process.exit(1)
      }
    } catch (e) {
      console.error('ERR ' + e.message)
      process.exit(1)
    }
    break
  }
  case 'new': {
    const { spawn } = await import('node:child_process')
    const here = path.dirname(fileURLToPath(import.meta.url))
    const child = spawn('node', [path.join(here, 'xai-session.js')], { stdio: 'inherit', cwd: process.cwd() })
    process.on('SIGINT', () => { child.kill(); process.exit(0) })
    child.on('exit', code => process.exit(code || 0))
    break
  }
  case 'serve': {
    const { spawn } = await import('node:child_process')
    const here = path.dirname(fileURLToPath(import.meta.url))
    const child = spawn('node', [path.join(here, 'xai-server.js')], { stdio: 'inherit' })
    process.on('SIGINT', () => { child.kill(); process.exit(0) })
    break
  }
  case 'init': {
    const name = args[1]
    if (!name) {
      console.error('用法: xai init <项目名>')
      process.exit(1)
    }
    const here = path.dirname(fileURLToPath(import.meta.url))
    const tplDir = path.join(here, '..', 'templates', 'blog')
    const target = path.resolve(name)
    if (fs.existsSync(target)) {
      console.error('目录已存在: ' + target)
      process.exit(1)
    }
    fs.cpSync(tplDir, target, {
      recursive: true,
      filter: (src) => !src.includes('.xai')
    })
    // 替换 AI-STATE.md 的 name 和目录名
    const stateF = path.join(target, 'AI-STATE.md')
    if (fs.existsSync(stateF)) {
      let md = fs.readFileSync(stateF, 'utf8')
      md = md.replace(/"name":\s*"[^"]*"/, '"name": "' + name + '"')
      const today = new Date().toISOString().slice(0, 10)
      md = md.replace(/"updated":\s*"[^"]*"/, '"updated": "' + today + '"')
      fs.writeFileSync(stateF, md, 'utf8')
    }
    console.log('')
    console.log('OK 已创建 ' + target)
    console.log('')
    console.log('  下一步:')
    console.log('    cd ' + name)
    console.log('    xai serve')
    console.log('')
    break
  }
  case 'help':
  case '--help':
  case '-h': {
    console.log('xai — AI 的项目状态助理')
    console.log('')
    console.log('  xai state      显示项目状态（人类可读）')
    console.log('  xai snapshot   输出给 AI 读的紧凑快照')
    console.log('  xai verify     校验代码与 AI-STATE 一致')
    console.log('  xai log "..."  追加历史条目')
    console.log('  xai help       显示帮助')
    break
  }
  default: {
    console.error('xai: 未知命令 ' + cmd)
    process.exit(1)
  }
}