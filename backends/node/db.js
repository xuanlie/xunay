import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, 'data.json')

let state = { todos: [], tokens: [], nextId: 1 }

export function initDB() {
  if (fs.existsSync(DB_FILE)) {
    try { state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) } catch (e) {}
  }
  save()
}

function save() { fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2)) }

export function listTodos() { return [...state.todos].sort((a, b) => b.id - a.id) }

export function insertTodo(t) {
  t.id = state.nextId++
  state.todos.push(t)
  save()
  return t.id
}

export function toggleTodo(id) {
  const t = state.todos.find(x => x.id === id)
  if (t) { t.done = !t.done; save() }
}

export function deleteTodo(id) {
  state.todos = state.todos.filter(x => x.id !== id)
  save()
}

export function saveToken(token, ip, expiresAt) {
  state.tokens.push({ token, ip, expires_at: expiresAt })
  save()
}

export function checkToken(token) {
  const now = Date.now()
  state.tokens = state.tokens.filter(t => t.expires_at > now)
  return state.tokens.some(t => t.token === token)
}
