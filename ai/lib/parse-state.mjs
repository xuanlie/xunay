import fs from 'node:fs'

function extractJson(md, section) {
  const re = new RegExp('```json ' + section + '\\s*\\n([\\s\\S]*?)```', 'm')
  const m = md.match(re)
  if (!m) return null
  try {
    return JSON.parse(m[1])
  } catch (e) {
    throw new Error('AI-STATE.md 的 ' + section + ' 段 JSON 解析失败: ' + e.message)
  }
}

function extractHistory(md) {
  const m = md.match(/##\s+历史\s*\n([\s\S]*)$/)
  return m ? m[1].trim() : ''
}

export function parseState(mdText) {
  return {
    header: extractJson(mdText, 'header') || {},
    structure: extractJson(mdText, 'structure') || {},
    rules: extractJson(mdText, 'rules') || [],
    todo: extractJson(mdText, 'todo') || [],
    history: extractHistory(mdText),
  }
}

export function parseStateFile(file) {
  return parseState(fs.readFileSync(file, 'utf8'))
}