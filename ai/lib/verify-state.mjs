import fs from 'node:fs'
import path from 'node:path'
import { parseStateFile } from './parse-state.mjs'

const SCAN_DIRS = [
  { dir: 'pages', ext: '.xuy' },
  { dir: 'components', ext: '.xuy' },
]

export function verify(projectRoot) {
  const errors = []
  const warnings = []
  const stateFile = path.join(projectRoot, 'AI-STATE.md')

  if (!fs.existsSync(stateFile)) {
    errors.push('找不到 AI-STATE.md')
    return { errors, warnings }
  }

  const state = parseStateFile(stateFile)

  const declared = new Map()
  for (const [group, items] of Object.entries(state.structure || {})) {
    if (!Array.isArray(items)) continue
    for (const it of items) {
      if (!it.path) continue
      declared.set(it.path, group)
      const full = path.join(projectRoot, it.path)
      if (!fs.existsSync(full)) {
        errors.push('[声明缺失] ' + it.path + '（在 structure.' + group + ' 声明，但文件不存在）')
      }
    }
  }

  for (const { dir, ext } of SCAN_DIRS) {
    const full = path.join(projectRoot, dir)
    if (!fs.existsSync(full)) continue
    for (const f of fs.readdirSync(full)) {
      if (!f.endsWith(ext)) continue
      const rel = dir + '/' + f
      if (!declared.has(rel)) {
        errors.push('[未声明] ' + rel + '（文件存在，但未在 AI-STATE.md 里声明）')
      }
    }
  }

  return { errors, warnings }
}