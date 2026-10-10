#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const routes = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/routes.json'), 'utf8')).routes

let out = '// 自动生成，请勿手改\n'
out += '// 源：shared/routes.json\n'
out += '// 用 node bin/sync-routes.js 同步\n\n'
out += 'export const ROUTES = [\n'
for (const r of routes) {
  out += `  { name: ${JSON.stringify(r.name)}, method: ${JSON.stringify(r.method)}, path: ${JSON.stringify(r.path)}, auth: ${r.auth} },\n`
}
out += ']\n'

fs.writeFileSync(path.join(ROOT, 'core/src/rpc-routes.js'), out)
console.log('已同步 ' + routes.length + ' 个路由到 core/src/rpc-routes.js')
