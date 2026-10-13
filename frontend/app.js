// V053 修复：sig→signal, app→mount；标签从 element.js 导入
import { signal, mount, list } from '/xunay/index.js'
import { div, input, button, ul, li, span } from '/xunay/index.js'
import { initToken } from './api/client.js'
import { api, connectWS } from './api/todos.js'

const todos = signal([])
const inputVal = signal('')
const status = signal('加载中...')

async function load() {
  try {
    const items = await api.getTodos()
    todos(items.map(t => ({ ...t, done: !!t.done })))
    status(`${items.length} 条`)
  } catch (e) {
    status('加载失败：' + e.message)
  }
}

async function add() {
  const t = inputVal().trim()
  if (!t) return
  try {
    await api.addTodo(t)
    inputVal('')
    await load()
  } catch (e) {
    status('添加失败：' + e.message)
  }
}

async function toggle(id) {
  try {
    await api.toggleTodo(id)
    await load()
  } catch (e) {
    status('切换失败：' + e.message)
  }
}

async function remove(id) {
  try {
    await api.deleteTodo(id)
    await load()
  } catch (e) {
    status('删除失败：' + e.message)
  }
}

mount(() => div(null,
  div({ class: 'row' },
    input({
      type: 'text',
      placeholder: '输入待办，回车添加',
      value: () => inputVal(),
      on: {
        input: e => inputVal(e.target.value),
        keydown: e => { if (e.key === 'Enter') add() },
      },
    }),
    button({ on: { click: add } }, '添加'),
  ),
  div({ class: 'status' }, () => status()),
  ul(null,
    list(
      todos,
      t => t.id,
      t => li(null,
        span({
          class: t.done ? 'title done' : 'title',
          on: { click: () => toggle(t.id) },
        }, t.title),
        button({ on: { click: () => remove(t.id) } }, '删除'),
      ),
    ),
  ),
), '#app')

;(async () => {
  try {
    await initToken()
    await load()
    connectWS(load)
  } catch (e) {
    status('初始化失败：' + e.message)
  }
})()
