// 表单绑定
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("表单绑定"),
    Tip("从 xunay/model 引入：import { model, modelCheck, modelNum } from 'xunay/model'"),
    P("xunay 没有内置 v-model——但可以用几个工具函数简化双向绑定。"),
    H2("手写双向绑定"),
    Code("import { signal, input } from 'xunay'\n\nconst name = signal('')\n\ninput({\n  value: () => name(),\n  on: { input: e => name(e.target.value) }\n})", "xuy"),
    H2("model 辅助"),
    P("把上面的模式封成函数："),
    Code("export function model(sig) {\n  return {\n    value: () => sig(),\n    on: {\n      input: e => sig(e.target.value),\n      change: e => sig(e.target.value)\n    }\n  }\n}\n\n// 用\ninput({ class: 'input', ...model(name) })", "xuy"),
    H2("数字输入"),
    Code("export function modelNum(sig) {\n  return {\n    value: () => sig(),\n    on: { input: e => sig(Number(e.target.value) || 0) }\n  }\n}\n\ninput({ type: 'number', ...modelNum(age) })", "xuy"),
    H2("复选框"),
    Code("export function modelCheck(sig) {\n  return {\n    checked: () => sig(),\n    on: { change: e => sig(e.target.checked) }\n  }\n}\n\ninput({ type: 'checkbox', ...modelCheck(agree) })", "xuy"),
    H2("下拉框"),
    Code("const color = signal('red')\n\nselect({\n  value: () => color(),\n  on: { change: e => color(e.target.value) }\n},\n  ...['red', 'green', 'blue'].map(c =>\n    option({ value: c, selected: () => color() === c }, c)\n  )\n)", "xuy"),
    H2("多字段表单"),
    Code("import { signal, batch, div, input, button } from 'xunay'\n\nfunction Form() {\n  const name = signal('')\n  const email = signal('')\n  const agree = signal(false)\n\n  const submit = () => {\n    console.log({ name: name(), email: email(), agree: agree() })\n  }\n\n  return div(null,\n    input({ placeholder: '姓名', ...model(name) }),\n    input({ placeholder: '邮箱', ...model(email) }),\n    label(null,\n      input({ type: 'checkbox', ...modelCheck(agree) }),\n      ' 我同意条款'\n    ),\n    button({ on: { click: submit }, disabled: () => !agree() }, '提交')\n  )\n}", "xuy"),
    H2("实时校验"),
    Code("import { signal, computed } from 'xunay'\n\nconst email = signal('')\nconst emailErr = computed(() => {\n  const v = email()\n  if (!v) return ''\n  if (!/^[^@]+@[^@]+$/.test(v)) return '邮箱格式不正确'\n  return ''\n})\n\ninput({\n  class: () => 'input' + (emailErr() ? ' error' : ''),\n  ...model(email)\n})\nshow(emailErr, () => div({ class: 'error-msg' }, () => emailErr()))", "xuy"),
    H2("受控 vs 非受控"),
    Table(["","受控","非受控"], [["值来源","signal","DOM 自己"],["读写","双向绑定","只读取"],["适用","需要实时校验/联动","简单输入"]]),
    H2("完整示例：多步表单"),
    Code("import { signal, div, input, button, show, mount } from 'xunay'\n\nfunction MultiStep() {\n  const step = signal(1)\n  const name = signal('')\n  const email = signal('')\n  const pwd = signal('')\n\n  const next = () => step(step() + 1)\n  const prev = () => step(step() - 1)\n\n  return div({ class: 'wizard' },\n    div({ class: 'steps' }, () => '步骤 ' + step() + ' / 3'),\n\n    show(() => step() === 1, () =>\n      div(null,\n        input({ placeholder: '姓名', ...model(name) }),\n        button({ on: { click: next }, disabled: () => !name() }, '下一步')\n      )\n    ),\n    show(() => step() === 2, () =>\n      div(null,\n        input({ placeholder: '邮箱', ...model(email) }),\n        button({ on: { click: prev } }, '上一步'),\n        button({ on: { click: next }, disabled: () => !email() }, '下一步')\n      )\n    ),\n    show(() => step() === 3, () =>\n      div(null,\n        input({ type: 'password', placeholder: '密码', ...model(pwd) }),\n        button({ on: { click: prev } }, '上一步'),\n        button({ on: { click: () => console.log('提交') }, disabled: () => !pwd() }, '完成')\n      )\n    )\n  )\n}\n\nmount(() => MultiStep(), '#app')", "xuy"),
  )
}
