// select / option
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("select / option"),
    P("原生下拉选择器，生成 Android Spinner + ArrayAdapter。"),
    Code("import { div, select, option, app } from xunay\n\napp(() => div(null,\n  select(null,\n    option({ value: \"a\" }, \"选项 A\"),\n    option({ value: \"b\", selected: true }, \"选项 B\")\n  )\n), \"#app\")", "xuy"),
    Code("android.widget.Spinner __sp = findViewById(R.id.v1);\nString[] __items = new String[]{\"选项 A\", \"选项 B\"};\nandroid.widget.ArrayAdapter<String> __ad = new android.widget.ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, __items);\n__sp.setAdapter(__ad);\n__sp.setSelection(1);", "java"),
    Table(["option 属性","说明"], [["value","值（未映射到 Java，label 用作显示）"],["selected","默认选中"]]),
  )
}
