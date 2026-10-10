// auth 令牌管理
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("auth 令牌管理"),
    P("管登录令牌——存哪、啥时过期、自动刷新、什么时候该重新登录。"),
    H2("引入"),
    Code("import { auth } from 'xunay/auth'", "js"),
    H2("最简用法"),
    Code("// 登录成功后\nauth.set('服务器返回的 token')\n\n// 判断是否登录\nif (auth.isValid()) {\n  // 已登录\n}\n\n// 退出登录\nauth.clear()", "js"),
    H2("响应式（推荐）"),
    Code("import { effect } from 'xunay'\nimport { auth } from 'xunay/auth'\n\neffect(() => {\n  if (auth.isValid()) {\n    return 用户界面\n  }\n  return 登录界面\n})\n\n// token 过期时自动切到登录页", "js"),
    H2("配置"),
    Code("auth.config({\n  expiresIn: 7200,              // 2 小时过期\n  refreshBefore: 60,            // 过期前 60 秒自动刷新\n  refresh: async (old) => {\n    const r = await fetch('/refresh')\n    return (await r.json()).token\n  },\n  onExpire: () => go('/login'),\n})", "js"),
    H2("存储方式"),
    Table(["storage","特点"], [["local","关浏览器还在，最常用"],["session","关标签页就没，更安全"],["cookie","服务器也能读，SSR 用"],["memory","刷新就没了，最安全"]]),
    Code("const auth = createAuth({\n  storage: 'cookie',\n  expiresIn: 3600,\n})", "js"),
    H2("完整 API"),
    Table(["方法","说明"], [["auth.set(v)","写入 token"],["auth.get()","读一次（不订阅）"],["auth.token()","读 token（响应式）"],["auth.clear()","清除"],["auth.isValid()","是否有效"],["auth.isEmpty()","是否为空"],["auth.expiresAt()","过期时间戳"],["auth.remaining()","剩余秒数"],["auth.refresh()","手动刷新"],["auth.config(o)","更新配置"]]),
    H2("跨标签页同步"),
    P("用 local 存储时，一个标签页登录，其他标签页自动同步。不用手动处理。"),
    H2("rpc 自动集成"),
    P("如果同时用了 xunay/rpc，auth 的 token 会自动加到 X-Token 头。"),
    Tip("要真正安全，token 必须由服务器设成 httpOnly cookie。前端 JS 无法防控制台读取。"),
  )
}
