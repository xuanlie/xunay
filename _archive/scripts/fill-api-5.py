#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

swap("    ('api-kit-select', 'kit: Select', []),", r"""    ('api-kit-select', 'kit: Select', [
      ('H1','kit: Select'),
      ('P','下拉选择组件。'),
      ('H2','引入'),
      ('Code',"import { Select } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['label','标签'],
        ['options','[{ value, label }]'],
        ['value','当前值'],
        ['onChange','(v) => void'],
        ['placeholder','占位选项'],
        ['error','错误提示'],
      ]),
      ('H2','示例'),
      ('Code',"import { Select } from 'xunay/kit'\nimport { signal, div } from 'xunay'\n\nfunction Form() {\n  const city = signal('bj')\n  return div(null,\n    Select({\n      label: '城市',\n      value: () => city(),\n      onChange: v => city(v),\n      options: [\n        { value: 'bj', label: '北京' },\n        { value: 'sh', label: '上海' },\n        { value: 'gz', label: '广州' }\n      ]\n    })\n  )\n}",'xuy'),
    ]),""", "api-kit-select")

swap("    ('api-kit-checkbox', 'kit: Checkbox', []),", r"""    ('api-kit-checkbox', 'kit: Checkbox', [
      ('H1','kit: Checkbox'),
      ('P','复选框组件。'),
      ('H2','引入'),
      ('Code',"import { Checkbox } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['label','文字标签'],
        ['checked','布尔或函数'],
        ['onChange','(checked) => void'],
        ['disabled','禁用'],
      ]),
      ('H2','示例'),
      ('Code',"import { Checkbox } from 'xunay/kit'\nimport { signal, div } from 'xunay'\n\nfunction Form() {\n  const agree = signal(false)\n  return div(null,\n    Checkbox({\n      label: '我同意条款',\n      checked: () => agree(),\n      onChange: v => agree(v)\n    })\n  )\n}",'xuy'),
    ]),""", "api-kit-checkbox")

swap("    ('api-kit-radio', 'kit: Radio', []),", r"""    ('api-kit-radio', 'kit: Radio', [
      ('H1','kit: Radio'),
      ('P','单选框组件。'),
      ('H2','引入'),
      ('Code',"import { Radio } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['label','文字标签'],
        ['checked','布尔或函数'],
        ['onChange','(checked) => void'],
        ['name','同组 name'],
      ]),
      ('H2','示例'),
      ('Code',"import { Radio } from 'xunay/kit'\nimport { signal, div } from 'xunay'\n\nfunction Form() {\n  const gender = signal('male')\n  return div(null,\n    Radio({ label: '男', name: 'g', checked: () => gender() === 'male', onChange: () => gender('male') }),\n    Radio({ label: '女', name: 'g', checked: () => gender() === 'female', onChange: () => gender('female') })\n  )\n}",'xuy'),
    ]),""", "api-kit-radio")

swap("    ('api-kit-card', 'kit: Card', []),", r"""    ('api-kit-card', 'kit: Card', [
      ('H1','kit: Card'),
      ('P','卡片容器组件。'),
      ('H2','引入'),
      ('Code',"import { Card } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['title','标题'],
        ['extra','右上角额外内容'],
        ['footer','底部内容'],
        ['shadow','是否阴影'],
      ]),
      ('H2','示例'),
      ('Code',"import { Card } from 'xunay/kit'\nimport { div, p } from 'xunay'\n\nCard({\n  title: '用户信息',\n  extra: () => '更多',\n  footer: () => '底部'\n}, p(null, '卡片内容'))",'xuy'),
    ]),""", "api-kit-card")

swap("    ('api-kit-textarea', 'kit: Textarea', []),", r"""    ('api-kit-textarea', 'kit: Textarea', [
      ('H1','kit: Textarea'),
      ('P','多行文本框。跟 Input 类似，多了 rows。'),
      ('H2','引入'),
      ('Code',"import { Textarea } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['label','标签'],
        ['value','值'],
        ['onChange','(v) => void'],
        ['rows','行数（默认 4）'],
        ['error','错误提示'],
        ['placeholder','占位符'],
      ]),
      ('H2','示例'),
      ('Code',"import { Textarea } from 'xunay/kit'\nimport { signal, div } from 'xunay'\n\nfunction Form() {\n  const bio = signal('')\n  return div(null,\n    Textarea({\n      label: '个人简介',\n      value: () => bio(),\n      onChange: v => bio(v),\n      rows: 6,\n      placeholder: '介绍一下自己…'\n    }),\n    div(null, () => bio().length + ' 字符')\n  )\n}",'xuy'),
    ]),""", "api-kit-textarea")

swap("    ('api-kit-modal', 'kit: Modal', []),", r"""    ('api-kit-modal', 'kit: Modal', [
      ('H1','kit: Modal'),
      ('P','模态框组件。'),
      ('H2','引入'),
      ('Code',"import { Modal } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['open','是否显示'],
        ['title','标题'],
        ['onClose','关闭回调'],
        ['footer','底部内容'],
        ['maskClose','点遮罩关闭'],
      ]),
      ('H2','示例'),
      ('Code',"import { Modal } from 'xunay/kit'\nimport { signal, div, button } from 'xunay'\n\nfunction App() {\n  const open = signal(false)\n  return div(null,\n    button({ on: { click: () => open(true) } }, '打开'),\n    Modal({\n      open: () => open(),\n      title: '提示',\n      onClose: () => open(false),\n      footer: () => button({ on: { click: () => open(false) } }, '确定')\n    }, '这是内容')\n  )\n}",'xuy'),
    ]),""", "api-kit-modal")

swap("    ('api-kit-badge', 'kit: Badge', []),", r"""    ('api-kit-badge', 'kit: Badge', [
      ('H1','kit: Badge'),
      ('P','徽标组件——显示数字或状态。'),
      ('H2','引入'),
      ('Code',"import { Badge } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['text','文字'],
        ['type','"primary" | "success" | "warn" | "danger"'],
        ['dot','是否只显示小圆点'],
      ]),
      ('H2','示例'),
      ('Code',"import { Badge } from 'xunay/kit'\nimport { div, span, signal } from 'xunay'\n\nconst count = signal(3)\n\ndiv(null,\n  span(null, '消息'),\n  Badge({ text: () => count(), type: 'danger' }),\n  Badge({ text: '成功', type: 'success' }),\n  Badge({ dot: true, type: 'primary' })\n)",'xuy'),
    ]),""", "api-kit-badge")

swap("    ('api-kit-tabs', 'kit: Tabs', []),", r"""    ('api-kit-tabs', 'kit: Tabs', [
      ('H1','kit: Tabs'),
      ('P','标签页组件。'),
      ('H2','引入'),
      ('Code',"import { Tabs } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','说明'],[
        ['items','[{ key, label, content }]'],
        ['value','当前选中的 key'],
        ['onChange','(key) => void'],
      ]),
      ('H2','示例'),
      ('Code',"import { Tabs } from 'xunay/kit'\nimport { signal, div } from 'xunay'\n\nfunction Page() {\n  const tab = signal('a')\n  return Tabs({\n    value: () => tab(),\n    onChange: k => tab(k),\n    items: [\n      { key: 'a', label: '概览', content: () => div(null, '概览内容') },\n      { key: 'b', label: '设置', content: () => div(null, '设置内容') },\n      { key: 'c', label: '关于', content: () => div(null, '关于内容') }\n    ]\n  })\n}",'xuy'),
    ]),""", "api-kit-tabs")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("API kit 8 篇已填")
