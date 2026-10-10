import fs from 'node:fs'

export function appendHistory(stateFile, title, files) {
  let md = fs.readFileSync(stateFile, 'utf8')
  const now = new Date().toISOString().slice(0, 10)
  let entry = '### ' + now + ' · ' + title + '\n\n'
  if (files && files.length) {
    for (const f of files) {
      const verb = fs.existsSync(f) ? '修改' : '新增'
      entry += '- ' + verb + ' ' + f + '\n'
    }
  }
  entry += '- 修改 AI-STATE.md\n'

  const marker = '## 历史'
  const i = md.indexOf(marker)
  if (i < 0) {
    md += '\n\n## 历史\n\n' + entry + '\n'
  } else {
    const insertAt = i + marker.length
    const after = md.slice(insertAt)
    const nextSection = after.search(/\n##\s/)
    if (nextSection < 0) {
      md = md.slice(0, insertAt) + '\n\n' + entry + after.replace(/^\s*/, '')
    } else {
      md = md.slice(0, insertAt) + '\n\n' + entry + '\n' + after.slice(nextSection + 1)
    }
  }

  md = md.replace(/"updated":\s*"[^"]*"/, '"updated": "' + now + '"')
  fs.writeFileSync(stateFile, md, 'utf8')
  return entry
}