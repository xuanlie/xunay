import { client } from './client.js'

export const api = {
  getTodos: () => client.get('/rpc/getTodos'),
  addTodo: (title) => client.post('/rpc/addTodo', { title }),
  toggleTodo: (id) => client.post('/rpc/toggleTodo', { id }),
  deleteTodo: (id) => client.post('/rpc/deleteTodo', { id }),
  updateTodo: (id, title) => client.post('/rpc/updateTodo', { id, title }),
}

export function connectWS(onChange) {
  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${location.host}/ws`)
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'todos_changed') onChange()
      } catch (_) {}
    }
    ws.onclose = () => setTimeout(connect, 2000)
    ws.onerror = () => ws.close()
  }
  connect()
}
