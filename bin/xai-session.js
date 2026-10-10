#!/usr/bin/env node
import readline from 'node:readline'
import { exec, spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const SESSION_DIR = path.join(process.cwd(), '.xai')
const SESSION_FILE = path.join(SESSION_DIR, 'session.log')
const SERVER = process.env.XAI_SERVER || 'http://localhost:12350'

fs.mkdirSync(SESSION_DIR, { recursive: true })

let buffer = ''
if (fs.existsSync(SESSION_FILE)) {
  buffer = fs.readFileSync(SESSION_FILE, 'utf8')
}

function record(header, body) {
  const entry = '\\n$ ' + header + '\\n' + (body || '(无输出)') + '\\n'
  buffer += entry
  fs.appendFileSync(SESSION_FILE, entry, 'utf8')
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'xai> ',
  terminal: true,
})

console.log('')
console.log('  xai session')
console.log('  server: ' + SERVER)
console.log('  log:    ' + SESSION_FILE)
console.log('  /help 看特殊命令')
console.log('')

rl.prompt()

rl.on('line', async (line) => {
  const input = line.trim()
  if (!input) { rl.prompt(); return }

  if (input.startsWith('/')) {
    const parts = input.slice(1).split(/\\s+/)
    await handleSpecial(parts[0], parts.slice(1).join(' '))
    rl.prompt()
    return
  }

  await runLocal(input)
  rl.prompt()
})

rl.on('SIGINT', () => {
  console.log('')
  console.log('再见')
  process.exit(0)
})

async function handleSpecial(cmd, arg) {
  switch (cmd) {
    case 'exit':
    case 'q':
      console.log('退出')
      process.exit(0)

    case 'show': {
      console.log('')
      console.log('--- 累积内容 (' + buffer.length + ' 字符) ---')
      console.log(buffer || '(空)')
      console.log('--- 结束 ---')
      console.log('')
      return
    }

    case 'clear': {
      buffer = ''
      fs.writeFileSync(SESSION_FILE, '', 'utf8')
      console.log('已清空')
      return
    }

    case 'copy': {
      if (!buffer) { console.log('无可复制内容'); return }
      await copyToClipboard(buffer)
      return
    }

    case 'server': {
      if (arg) {
        process.env.XAI_SERVER = arg
        console.log('server 已设为 ' + arg)
      } else {
        console.log('当前 server: ' + SERVER)
      }
      return
    }

    case 'verify': {
      try {
        const r = await fetch(SERVER + '/api/verify', { method: 'POST' })
        const data = await r.json()
        const errs = data.errors || []
        const warns = data.warnings || []
        let text
        if (errs.length === 0 && warns.length === 0) text = '✓ 通过'
        else text = [...warns.map(w => '⚠ ' + w), ...errs.map(e => '✗ ' + e)].join('\\n')
        console.log(text)
        record('/verify', text)
      } catch (e) {
        console.log('server 连不上：' + SERVER)
      }
      return
    }

    case 'state': {
      try {
        const r = await fetch(SERVER + '/api/state')
        const data = await r.json()
        const h = data.header || {}
        const text = (h.name || '未命名') + ' v' + (h.version || '?')
        console.log(text)
        record('/state', text)
      } catch (e) {
        console.log('server 连不上：' + SERVER)
      }
      return
    }

    case 'help':
      console.log('')
      console.log('  特殊命令:')
      console.log('    /show     显示累积内容')
      console.log('    /copy     复制累积到剪贴板')
      console.log('    /clear    清空累积')
      console.log('    /verify   调 server 校验')
      console.log('    /state    调 server 显示项目名')
      console.log('    /server <url>  切换 server 地址')
      console.log('    /exit     退出')
      console.log('')
      console.log('  其他行都当本地命令执行，输出累积')
      console.log('')
      return

    default:
      console.log('未知命令 /' + cmd + '，试 /help')
  }
}

function runLocal(cmd) {
  return new Promise(resolve => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 10, shell: true }, (err, stdout, stderr) => {
      let out = ''
      if (stdout) out += stdout
      if (stderr) out += (out ? '\\n' : '') + stderr
      if (out) process.stdout.write(out)
      if (err && !out) out = '命令失败: ' + err.message
      record(cmd, out.replace(/\\n$/, ''))
      resolve()
    })
  })
}

function copyToClipboard(text) {
  return new Promise(resolve => {
    const ps = spawn('powershell', ['-NoProfile', '-Command', '$input | Set-Clipboard'])
    let err = ''
    ps.stderr.on('data', c => err += c)
    ps.on('close', code => {
      if (code === 0) console.log('✓ 已复制 ' + text.length + ' 字符到剪贴板')
      else {
        const fallback = path.join(SESSION_DIR, 'clipboard.txt')
        fs.writeFileSync(fallback, text, 'utf8')
        console.log('剪贴板失败，已写入文件: ' + fallback)
      }
      resolve()
    })
    ps.stdin.write(text)
    ps.stdin.end()
  })
}
