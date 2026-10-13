import { client } from './client.js'

export const api = {
  getTodos: () => client.get('/rpc/getTodos'),
  addTodo: (title) => client.post('/rpc/addTodo', { title }),
  toggleTodo: (id) => client.post('/rpc/toggleTodo', { id }),
  deleteTodo: (id) => client.post('/rpc/deleteTodo', { id }),
  updateTodo: (id, title) => client.post('/rpc/updateTodo', { id, title }),
}

export function connectWS(onChange) {
  // V055 修复：指数退避，最多 6 次，成功后重置
  let attempt = 0
  const MAX_ATTEMPTS = 6
  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${location.host}/ws`)
    ws.onopen = () => { attempt = 0 }
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'todos_changed') onChange()
      } catch (_) {}
    }
    ws.onclose = () => {
      if (attempt >= MAX_ATTEMPTS) return
      const delay = Math.min(30000, 1000 * Math.pow(2, attempt))
      attempt++
      setTimeout(connect, delay)
    }
    ws.onerror = () => ws.close()
  }
  connect()
}
