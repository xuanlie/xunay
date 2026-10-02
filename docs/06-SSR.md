SSR

服务端

    import { renderToString } from 'xunay/ssr'

    const html = renderToString(() => div(null, 'hello'))

客户端

    import { hydrate } from 'xunay'

    hydrate(App, '#app')

注意

  SSR 只生成 HTML 字符串
  hydrate 清空后重新渲染（简化版）
