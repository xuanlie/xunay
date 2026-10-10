// 安全
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("安全"),
    P("xunay 的安全责任——哪些它管，哪些要用户自己管。"),
    H2("xunay 管的"),
    Ul("html 属性默认会经过 sanitize（白名单过滤）","setAttribute 不会执行脚本","事件只绑在 DOM 元素上，不 eval"),
    H2("xunay 不管的"),
    Table(["场景","责任"], [["用户输入直接 set innerHTML","用户"],["API 认证","用户"],["CSRF 保护","用户"],["XSS 转义","用户（除非用 html 属性）"]]),
    H2("html 属性"),
    P("html 属性会写 innerHTML。xunay 提供 sanitize 白名单，只放行安全标签："),
    Code("// 允许的标签\na b i em strong p br hr ul ol li\nh1 h2 h3 h4 h5 h6 code pre blockquote\nspan div table thead tbody tr td th img\n\n// 允许的属性\nhref src alt title class id\n\n// 移除 javascript: 协议\n// 移除 <script> <iframe>", "txt"),
    H2("用 text 而不是 html"),
    P("大部分场景不需要 HTML——直接写文本就安全："),
    Code("// 安全：文本节点\nspan(null, userInput)\n\n// 危险：innerHTML（虽然会 sanitize，但白名单有限）\ndiv({ html: userInput })", "xuy"),
    H2("认证"),
    P("四套后端都用 token——用 HTTPS 传输。"),
    H3("token 存储"),
    Table(["方式","安全","场景"], [["内存（signal）","最安全","SPA"],["sessionStorage","中","同标签页"],["localStorage","有风险","持久登录"],["Cookie HttpOnly","最安全","传统方案"]]),
    H2("CORS"),
    P("后端要明确允许的源——不要用 *。"),
    Code("app.add_middleware(\n    CORSMiddleware,\n    allow_origins=['https://example.com'],   # 不要用 '*'\n    allow_methods=['GET', 'POST'],\n    allow_headers=['Content-Type', 'Authorization']\n)", "py"),
    H2("XSS 防护清单"),
    Ul("用户输入永远不直接写 innerHTML","用 textContent 而不是 innerHTML","html 属性只放可信内容","用 CSP 头限制脚本来源","Cookie 加 HttpOnly + Secure + SameSite"),
    H2("CSRF 防护"),
    P("用 token 认证而非 cookie 认证——天然防 CSRF。"),
    H2("SQL 注入"),
    P("始终用参数化查询："),
    Code("# 错误\nconn.execute(f\"SELECT * FROM todos WHERE id = {id}\")\n\n# 正确\nconn.execute('SELECT * FROM todos WHERE id = ?', (id,))", "py"),
  )
}
