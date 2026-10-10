// page / goto / back
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("page / goto / back"),
    P("多页路由。每个 page 生成独立 Activity。"),
    H2("签名"),
    Code("page(\"name\", () => tag(...))   // 声明页面\\ngoto(\"name\")                    // 跳转\\nback()                          // 返回", "xuy"),
    H2("示例"),
    Code("page(\"home\", () => div(null,\\n  span(null, \"首页\"),\\n  button({ on: { click: () => goto(\"about\") } }, \"去关于\")\\n))\\n\\npage(\"about\", () => div(null,\\n  span(null, \"关于页\"),\\n  button({ on: { click: () => back() } }, \"返回\")\\n))", "xuy"),
    H2("生成的工程"),
    Code("MainActivity.java     ← 第一个 page\\nAboutActivity.java    ← 第二个 page\\nactivity_main.xml\\nactivity_about.xml\\nAndroidManifest.xml  ← 自动注册所有 Activity", "txt"),
    H2("命名规则"),
    Table(["page 名","Activity","Layout"], [["home（第一个）","MainActivity","activity_main"],["about","AboutActivity","activity_about"],["user-profile","UserprofileActivity","activity_user_profile"]]),
    H2("ROUTES 自动填"),
    Code("protected void onCreate(Bundle savedInstanceState) {\\n    ...\\n    ROUTES.put(\"about\", AboutActivity.class);\\n}\\n\\nprivate void gotoPage(String name) {\\n    java.lang.Class<?> cls = ROUTES.get(name);\\n    if (cls == null) return;\\n    Intent it = new Intent(this, cls);\\n    startActivity(it);\\n}", "java"),
    H2("切换页面"),
    P("用 startActivity 启动新 Activity。返回用 Android 系统返回键或 onBackPressed()。"),
    H2("不支持的"),
    Ul("跳转传参（用 localStorage 代替）","路由守卫","命名参数 :id","嵌套路由","history API"),
  )
}
