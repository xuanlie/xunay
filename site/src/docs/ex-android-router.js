// 例子：多页路由
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("例子：多页路由"),
    P("两个页面，互相跳转，用 back() 返回。"),
    H2("源码"),
    Code("page(\"home\", () => div(null,\\n  span(null, \"首页\"),\\n  button({ on: { click: () => goto(\"about\") } }, \"去关于\")\\n))\\n\\npage(\"about\", () => div(null,\\n  span(null, \"关于页\"),\\n  button({ on: { click: () => back() } }, \"返回\")\\n))", "xuy"),
    H2("生成的工程"),
    P("每个 page 生成一个独立的 Activity + 布局文件。"),
    Code("app/src/main/java/com/xunay/app/MainActivity.java\\napp/src/main/java/com/xunay/app/AboutActivity.java\\napp/src/main/res/layout/activity_main.xml\\napp/src/main/res/layout/activity_about.xml", "txt"),
    H2("ROUTES 自动填"),
    P("buildJava 里根据 pages 列表自动生成路由映射。每个页面的 onCreate 填所有其它页面的映射："),
    Code("private static final java.util.Map<String, java.lang.Class<?>> ROUTES = new java.util.HashMap<>();\\n\\nprotected void onCreate(Bundle savedInstanceState) {\\n    super.onCreate(savedInstanceState);\\n    setContentView(R.layout.activity_main);\\n    ROUTES.put(\"about\", AboutActivity.class);\\n    ...\\n}\\n\\nprivate void gotoPage(String name) {\\n    java.lang.Class<?> cls = ROUTES.get(name);\\n    if (cls == null) return;\\n    android.content.Intent it = new android.content.Intent(this, cls);\\n    startActivity(it);\\n}", "java"),
    H2("AndroidManifest"),
    P("所有 Activity 自动注册。第一个带 LAUNCHER，其余普通："),
    Code("<application ...>\\n    <activity android:name=\".MainActivity\" android:exported=\"true\">\\n        <intent-filter>\\n            <action android:name=\"android.intent.action.MAIN\"/>\\n            <category android:name=\"android.intent.category.LAUNCHER\"/>\\n        </intent-filter>\\n    </activity>\\n    <activity android:name=\".AboutActivity\">\\n    </activity>\\n</application>", "xml"),
    H2("goto 与 back"),
    Table(["调用","生成"], [["goto(\"about\")","startActivity(Intent(this, AboutActivity.class))"],["back()","onBackPressed()"]]),
    H2("命名规则"),
    Table(["page 名","Activity","Layout"], [["home（第一个）","MainActivity","activity_main"],["about","AboutActivity","activity_about"],["user-profile","UserprofileActivity","activity_user_profile"]]),
    H2("跑起来"),
    Code(".\\run.ps1 -Entry examples/test-router2.xuy", "powershell"),
    H2("限制"),
    Ul("第一个 page 必须是 MainActivity","跳转传参不支持","返回栈由 Android 系统管理","路由守卫不支持"),
  )
}
