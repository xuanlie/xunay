#!/usr/bin/env node
// 静态服务器：gzip 压缩 + 每次请求 index.html 给 js/css 加 ?v=时间戳
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, 'dist')
const PORT = Number(process.argv[2]) || 8080

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

const COMPRESSIBLE = /\.(js|mjs|css|html|json|svg|txt|map)$/i

function injectVersion(html, v) {
  html = html.replace(/(src|href)="(\.\/[^"?]+\.(?:js|mjs|css))(?:\?[^"]*)?"/g,
    (m, attr, url) => attr + '="' + url + '?v=' + v + '"')
  return html
}

function sendCompressed(req, res, buf, mime, cacheControl) {
  const accept = req.headers['accept-encoding'] || ''
  const headers = {
    'Content-Type': mime,
    'Cache-Control': cacheControl,
    'Vary': 'Accept-Encoding',
  }
  // 只压 > 1KB 且可压的
  if (buf.length < 1024 || !COMPRESSIBLE.test(req.url)) {
    headers['Content-Length'] = buf.length
    res.writeHead(200, headers)
    return res.end(buf)
  }
  if (accept.includes('br')) {
    const out = zlib.brotliCompressSync(buf)
    headers['Content-Encoding'] = 'br'
    headers['Content-Length'] = out.length
    res.writeHead(200, headers)
    return res.end(out)
  }
  if (accept.includes('gzip')) {
    const out = zlib.gzipSync(buf)
    headers['Content-Encoding'] = 'gzip'
    headers['Content-Length'] = out.length
    res.writeHead(200, headers)
    return res.end(out)
  }
  headers['Content-Length'] = buf.length
  res.writeHead(200, headers)
  res.end(buf)
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const filePath = path.join(ROOT, urlPath)

  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden') }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      // 只对 HTML 导航请求做 SPA 回退
      const accept = req.headers.accept || ''
      const wantsHtml = accept.includes('text/html')
      const hasExt = /\.[a-z0-9]+$/i.test(urlPath)
      if (wantsHtml && !hasExt) {
        const idx = path.join(ROOT, 'index.html')
        if (fs.existsSync(idx)) {
          let html = fs.readFileSync(idx, 'utf8')
          html = injectVersion(html, st.mtimeMs.toString(36))
          const buf = Buffer.from(html, 'utf8')
          return sendCompressed(req, res, buf, MIME['.html'], 'no-store')
        }
      }
      res.writeHead(404)
      return res.end('Not Found')
    }

    const ext = path.extname(filePath).toLowerCase()
    const isHtml = ext === '.html'

    if (isHtml) {
      let html = fs.readFileSync(filePath, 'utf8')
      html = injectVersion(html, st.mtimeMs.toString(36))
      const buf = Buffer.from(html, 'utf8')
      sendCompressed(req, res, buf, MIME['.html'], 'no-store')
    } else {
      const buf = fs.readFileSync(filePath)
      const cc = req.url.includes('?v=') ? 'public, max-age=31536000, immutable' : 'no-cache'
      sendCompressed(req, res, buf, MIME[ext] || 'application/octet-stream', cc)
    }
  })
})

server.listen(PORT, () => {
  console.log('静态服务器: http://localhost:' + PORT)
  console.log('  gzip / brotli 压缩已启用（JS 650KB → ~150KB）')
  console.log('  每次刷新 index.html，js/css 引用带新的 ?v=')
  console.log('  Ctrl+C 停止')
})
