import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { get, post, handle, wrapAuth } from './mini.js'
import { initDB, checkToken } from './db.js'
import * as handlers from './handlers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'xunay.config.json'), 'utf8'))
const routes = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/routes.json'), 'utf8')).routes

globalThis.checkToken = checkToken
initDB()

const PORT = parseInt(process.env.XUNAY_PORT, 10) || cfg.ports.node

for (const r of routes) {
  const fn = handlers[r.handler]
  if (!fn) { console.error('缺少 handler: ' + r.handler); process.exit(1) }
  const wrapped = r.auth ? wrapAuth(fn) : fn
  if (r.method === 'GET') get(r.path, wrapped)
  else post(r.path, wrapped)
}

console.log(`加载 ${routes.length} 个路由`)
http.createServer(handle).listen(PORT, () => {
  console.log(`XuNay Node 后端 :${PORT}`)
})
