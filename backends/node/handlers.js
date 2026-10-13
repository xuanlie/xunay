import crypto from 'crypto'
import { listTodos, insertTodo, toggleTodo, deleteTodo, saveToken, cleanupTokens } from './db.js'
import { Todo, TodoIn } from './schemas.js'

const TTL = 300 * 1000

export function handleToken(ctx) {
  cleanupTokens()
  const token = crypto.randomBytes(16).toString('hex')
  saveToken(token, ctx.req.socket.remoteAddress || '', Date.now() + TTL)
  ctx.ok({ token })
}

export function handleGetTodos(ctx) {
  ctx.ok(listTodos())
}

export async function handleAddTodo(ctx) {
  const t = await ctx.body(Todo)
  ctx.ok({ id: insertTodo(t) })
}

export async function handleToggleTodo(ctx) {
  const t = await ctx.body(TodoIn)
  t.validateId()
  toggleTodo(t.id)
  ctx.ok(null)
}

export async function handleDeleteTodo(ctx) {
  const t = await ctx.body(TodoIn)
  t.validateId()
  deleteTodo(t.id)
  ctx.ok(null)
}

export async function handleUpdateTodo(ctx) {
  // TODO: 实现
  ctx.fail('未实现')
}
