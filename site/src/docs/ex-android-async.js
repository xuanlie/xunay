// 例子：异步加载
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("例子：异步加载"),
    P("点击按钮请求网络，加载状态实时更新。"),
    H2("源码"),
    Code("const data = s(\"点按钮加载\")\\nconst loading = s(false)\\n\\nmount(() => div(null,\\n  button({\\n    on: { click: async () => {\\n      loading(true)\\n      data(\"加载中...\")\\n      const r = await fetch(\"https://api.github.com/repos/xuanlie/xunay\")\\n      data(r)\\n      loading(false)\\n    } }\\n  }, \"加载\"),\\n  span(null, txt`loading: ${loading}`),\\n  span(null, txt`data: ${data}`)\\n), \"#app\")", "xuy"),
    H2("流程"),
    Ul("1. 点按钮 → 主线程设 loading=true","2. 整个 async 回调丢到新 Thread","3. await fetch 用 fetchBlocking 同步拿结果","4. data(r) 回主线程更新 UI","5. loading(false) 也回主线程"),
    H2("生成的 Java"),
    Code("button.setOnClickListener(view -> {\\n    new Thread(() -> {\\n        try {\\n            loading.set(true);\\n            data.set(\"加载中...\");\\n            String r = fetchBlocking(\"https://api.github.com/repos/xuanlie/xunay\");\\n            data.set(r);\\n            loading.set(false);\\n        } catch (Exception __e) { __e.printStackTrace(); }\\n    }).start();\\n});", "java"),
    H2("关键点"),
    Ul("async 回调整个在线程里跑","Signal.set 检测线程，子线程自动 post 到主线程","fetchBlocking 同步阻塞，所以 await 直接返回","异常被 catch，不会崩溃"),
    H2("跑起来"),
    Code(".\\run.ps1 -Entry examples\\test-async.xuy", "powershell"),
  )
}
