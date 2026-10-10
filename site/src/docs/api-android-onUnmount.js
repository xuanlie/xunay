// onUnmount(fn)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("onUnmount(fn)"),
    P("组件销毁时执行一次。对应 Android 的 onDestroy。"),
    H2("签名"),
    Code("onUnmount(() => { /* 清理 */ })", "xuy"),
    H2("示例"),
    Code("onUnmount(() => {\\n  console.log(\"bye\")\\n  clearInterval(timerId)\\n})", "xuy"),
    H2("生成的 Java"),
    Code("@Override\\nprotected void onDestroy() {\\n    super.onDestroy();\\n    android.util.Log.d(\"xunay\", String.valueOf(\"bye\"));\\n    clearIntervalFn((long) ((Number) timerId).doubleValue());\\n}", "java"),
    H2("用途"),
    Ul("清理定时器 setInterval","取消网络请求","保存状态到 SharedPreferences","注销事件监听"),
    H2("注意事项"),
    Ul("只在用户主动退出 / 系统回收时执行","进程被杀时不保证执行","不要在这里做耗时操作"),
  )
}
