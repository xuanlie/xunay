// computed(fn)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("computed(fn)"),
    P("派生值。fn 里引用其它 signal，当依赖的 signal 变化时，每次读取都重算。"),
    H2("签名"),
    Code("const double = computed(() => n() * 2)", "xuy"),
    H2("简单形式"),
    Code("const double = computed(() => n() * 2)\\nconst sum = computed(() => a() + b())\\nconst upper = computed(() => name().trim().toUpperCase())", "xuy"),
    H2("多分支形式"),
    Code("const nameErr = computed(() => {\\n  const v = name().trim()\\n  if (!v) return \"\"\\n  if (v.length < 2) return \"至少 2 个字符\"\\n  if (v.length > 20) return \"最多 20 个字符\"\\n  return \"\"\\n})", "xuy"),
    H2("支持的内置"),
    Table(["类别","支持"], [["运算","+ - * / % ** 位运算"],["比较","== != === !== < > <= >="],["逻辑","&& || ! ?? 三元"],["字符串","trim / slice / padStart / includes / replace / match 等 25 个方法"],["正则","/re/.test(v) / v.replace(/re/g, \"\") / v.match(/re/)"],["数组","map / filter / forEach / reduce / find / some / every / join / slice 等"],["Math","floor / ceil / round / abs / min / max / pow / sqrt / random"],["Number","parseInt / parseFloat / isNaN / isInteger"],["JSON","parse / stringify"],["其它","Object.keys/values/entries / Array.from / Date.now / new Date()"]]),
    H2("生成的 Java"),
    P("每个 computed 生成一个独立方法。多分支形式翻译成 Java 的 if-return："),
    Code("private String nameErr() {\\n    String v = name.get().trim();\\n    if ((v == null || v.isEmpty())) {\\n        return \"\";\\n    }\\n    if ((v.length() < 2)) {\\n        return \"至少 2 个字符\";\\n    }\\n    if ((v.length() > 20)) {\\n        return \"最多 20 个字符\";\\n    }\\n    return \"\";\\n}", "java"),
    H2("类型推断"),
    P("js-to-java 迭代 4 轮推导返回类型。单表达式箭头直接取表达式类型；块体箭头扫所有 return 语句。"),
    H2("依赖追踪"),
    P("computed 本身不订阅，只在使用处（txt 模板 / show / disabled / effect）展开到依赖的 signal。"),
    Code("txt`错误: ${nameErr}` → name.subscribe(val -> ...)\\nshow(() => nameErr() !== \"\", ...) → name.subscribe(val -> ...)\\nbutton({ disabled: () => !!nameErr() }) → name.subscribe(val -> ...)", "txt"),
    H2("注意事项"),
    Ul("不能写循环（for / while 只在块体里支持，但 computed 里复杂循环会变慢）","嵌套 computed 引用会递归展开依赖","返回类型推断失败时 fallback 到 Object","不要产生副作用（只用 return）"),
  )
}
