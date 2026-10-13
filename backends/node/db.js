import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'xunay.config.json'), 'utf8'))
const dbPath = path.join(ROOT, cfg.database.sqlite.path)

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.exec(fs.readFileSync(path.join(ROOT, 'shared/schema.sql'), 'utf8'))

export function listTodos() {
  return db.prepare('SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC')
    .all()
    .map(r => ({ ...r, done: !!r.done }))
}

export function insertTodo(t) {
  db.prepare('INSERT INTO todos (id, title, done, created_at) VALUES (?, ?, 0, ?)')
    .run(t.id, t.title, t.created_at)
  return t.id
}

export function toggleTodo(id) {
  const row = db.prepare('SELECT done FROM todos WHERE id = ?').get(id)
  if (!row) return
  db.prepare('UPDATE todos SET done = ? WHERE id = ?').run(row.done ? 0 : 1, id)
}

export function deleteTodo(id) {
  db.prepare('DELETE FROM todos WHERE id = ?').run(id)
}

export function saveToken(token, ip, expiresAt) {
  db.prepare('INSERT INTO tokens (token, ip, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .run(token, ip, Date.now(), expiresAt)
}

export function checkToken(token) {
  const row = db.prepare('SELECT 1 FROM tokens WHERE token = ? AND expires_at > ?')
    .get(token, Date.now())
  return !!row
}

export function cleanupTokens() {
  db.prepare('DELETE FROM tokens WHERE expires_at < ?').run(Date.now())
}
