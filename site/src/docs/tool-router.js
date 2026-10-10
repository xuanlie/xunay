// router 路由
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("router 路由"),
    P("hash / history 两种模式，支持参数、守卫、查询串。"),
    H2("引入"),
    Code("import { createRouter } from 'xunay/router'", "js"),
    H2("用法"),
    Code("const router = createRouter({\n  mode: 'hash',\n  routes: [\n    { path: '/', component: Home },\n    { path: '/user/:id', component: (p) => User(p.id) },\n  ],\n})\n\nrouter.view()\nrouter.push('/user/123')\nrouter.replace('/about')\nrouter.back()\n\nrouter.path()      // '/user/123'\nrouter.params()    // { id: '123' }\nrouter.query()     // { q: 'xxx' }\n\nrouter.beforeEach((to) => {\n  if (to.startsWith('/admin') && !auth.isValid()) return '/login'\n})", "js"),
  )
}
