import fs from 'node:fs'

export function readTodo(stateFile) {
  const md = fs.readFileSync(stateFile, 'utf8')
  const m = md.match(/```json todo\s*\n([\s\S]*?)```/)
  if (!m) return []
  try { return JSON.parse(m[1]) } catch (e) { return [] }
}

export function writeTodo(stateFile, todos) {
  let md = fs.readFileSync(stateFile, 'utf8')
  const json = JSON.stringify(todos, null, 2)
  md = md.replace(
    /```json todo\s*\n[\s\S]*?```/,
    '```json todo\n' + json + '\n```'
  )
  fs.writeFileSync(stateFile, md, 'utf8')
}

export function listTodo(stateFile) {
  const todos = readTodo(stateFile)
  const lines = []
  todos.forEach((t, i) => {
    const n = String(i + 1).padStart(2, ' ')
    const mark = t.done ? '☑' : '☐'
    lines.push(n + '. ' + mark + ' ' + t.text)
  })
  return lines.join('\n')
}

export function addTodo(stateFile, text) {
  const todos = readTodo(stateFile)
  todos.push({ text, done: false })
  writeTodo(stateFile, todos)
  return todos.length
}

export function doneTodo(stateFile, n) {
  const todos = readTodo(stateFile)
  const i = n - 1
  if (i < 0 || i >= todos.length) throw new Error('序号 ' + n + ' 超出范围')
  todos[i].done = true
  writeTodo(stateFile, todos)
  return todos[i].text
}

export function undoDoneTodo(stateFile, n) {
  const todos = readTodo(stateFile)
  const i = n - 1
  if (i < 0 || i >= todos.length) throw new Error('序号 ' + n + ' 超出范围')
  todos[i].done = false
  writeTodo(stateFile, todos)
  return todos[i].text
}

export function removeTodo(stateFile, n) {
  const todos = readTodo(stateFile)
  const i = n - 1
  if (i < 0 || i >= todos.length) throw new Error('序号 ' + n + ' 超出范围')
  const [removed] = todos.splice(i, 1)
  writeTodo(stateFile, todos)
  return removed.text
}