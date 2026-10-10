// localStorage
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("localStorage"),
    P("同步持久化，映射到 SharedPreferences。"),
    H2("API"),
    Table(["调用","返回"], [["localStorage.getItem(key)","String | null"],["localStorage.setItem(key, value)","void"],["localStorage.removeItem(key)","void"],["localStorage.clear()","void"]]),
    H2("示例"),
    Code("const name = s(\"\")\\n\\nonMount(() => {\\n  const v = localStorage.getItem(\"userName\")\\n  if (v != null) name(v)\\n})\\n\\nconst save = () => {\\n  localStorage.setItem(\"userName\", name())\\n}", "xuy"),
    H2("生成的 Java"),
    Code("private android.content.SharedPreferences getPrefs() {\\n    return getSharedPreferences(\"xunay-kv\", MODE_PRIVATE);\\n}\\nprivate String getPref(String key) {\\n    return getPrefs().getString(key, null);\\n}\\nprivate void setPref(String key, String value) {\\n    getPrefs().edit().putString(key, value).apply();\\n}", "java"),
    H2("存储位置"),
    P("数据存在 app 的私有目录：/data/data/com.xunay.app/shared_prefs/xunay-kv.xml"),
    H2("类型"),
    P("只支持 String。要存数字 / 布尔 / 对象，自己转换："),
    Code("localStorage.setItem(\"count\", String(n()))\\nconst c = Number.parseInt(localStorage.getItem(\"count\"))\\nn(c)", "xuy"),
    H2("注意事项"),
    Ul("同步 API，大量读写会卡主线程","getItem 返回 null 时用 != null 判断","不要存大对象（SharedPreferences 没有大小限制但不适合）"),
  )
}
