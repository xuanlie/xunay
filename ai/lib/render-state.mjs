const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

export function renderState(state) {
  const lines = []
  const h = state.header || {}
  lines.push(C.bold + (h.name || '未命名') + C.reset + ' ' + C.dim + '· v' + (h.version || '?') + C.reset)
  lines.push('')

  const s = state.structure || {}
  if (Object.keys(s).length) {
    lines.push(C.cyan + '── 结构 ──' + C.reset)
    for (const [group, items] of Object.entries(s)) {
      if (!Array.isArray(items) || !items.length) continue
      lines.push(C.dim + group + '/' + C.reset)
      for (const it of items) {
        const name = (it.path || '').split('/').pop()
        const desc = it.desc ? ' ' + C.dim + it.desc + C.reset : ''
        const mark = it.added ? ' ' + C.green + '✚ 新增' + C.reset : ''
        lines.push('  ' + name + desc + mark)
      }
    }
    lines.push('')
  }

  if (state.rules && state.rules.length) {
    lines.push(C.cyan + '── 约定 ──' + C.reset)
    for (const r of state.rules) lines.push('• ' + r)
    lines.push('')
  }

  if (state.todo && state.todo.length) {
    lines.push(C.cyan + '── TODO ──' + C.reset)
    for (const t of state.todo.filter(t => !t.done)) lines.push('☐ ' + t.text)
    for (const t of state.todo.filter(t => t.done)) lines.push(C.dim + '☑ ' + t.text + C.reset)
    lines.push('')
  }

  if (state.history) {
    lines.push(C.cyan + '── 历史 ──' + C.reset)
    const entries = state.history.split(/\n(?=###\s)/).slice(0, 5)
    for (const e of entries) {
      const first = e.split('\n')[0].replace(/^###\s*/, '')
      lines.push(C.dim + first + C.reset)
    }
  }

  return lines.join('\n')
}

export function renderSnapshot(state) {
  const h = state.header || {}
  const lines = []
  lines.push('# ' + (h.name || '未命名') + ' · v' + (h.version || '?'))
  lines.push('')

  const s = state.structure || {}
  if (Object.keys(s).length) {
    lines.push('## 结构')
    for (const [group, items] of Object.entries(s)) {
      if (!Array.isArray(items) || !items.length) continue
      lines.push(group + '/')
      for (const it of items) {
        const name = (it.path || '').split('/').pop()
        const desc = it.desc ? '  ' + it.desc : ''
        const mark = it.added ? '  [新增 ' + it.added + ']' : ''
        lines.push('  ' + name + desc + mark)
      }
    }
    lines.push('')
  }

  if (state.rules && state.rules.length) {
    lines.push('## 约定')
    for (const r of state.rules) lines.push('- ' + r)
    lines.push('')
  }

  if (state.todo && state.todo.length) {
    lines.push('## TODO')
    for (const t of state.todo) lines.push('- [' + (t.done ? 'x' : ' ') + '] ' + t.text)
    lines.push('')
  }

  if (state.history) {
    lines.push('## 历史')
    const entries = state.history.split(/\n(?=###\s)/).slice(0, 5)
    for (const e of entries) {
      lines.push(e.split('\n')[0].replace(/^###\s*/, ''))
    }
  }

  return lines.join('\n')
}