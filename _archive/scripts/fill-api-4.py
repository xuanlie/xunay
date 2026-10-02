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

def alias_api(slug, api_name, full_name, full_desc, example):
    return f"""    ('{slug}', '{api_name}', [
      ('H1','{api_name}'),
      ('P','{full_name} 的短别名。'),
      ('H2','等价'),
      ('Code','{full_name}','js'),
      ('H2','说明'),
      ('P','{full_desc}'),
      ('H2','示例'),
      ('Code',\"\"\"{example}\"\"\",'xuy'),
    ]),"""

# f 别名
swap("    ('api-alias-f', 'f 别名', []),", alias_api(
    "api-alias-f", "f 别名", "effect(fn)", "effect 的短别名。",
    "import { s, f, div } from 'xunay'\\n\\nconst n = s(0)\\n\\nf(() => console.log('n =', n()))\\n\\ndiv(null, () => String(n()))"
), "api-alias-f")

# l 别名
swap("    ('api-alias-l', 'l 别名', []),", alias_api(
    "api-alias-l", "l 别名", "list(arr, key, fn)", "list 的短别名。",
    "import { s, l, ul, li } from 'xunay'\\n\\nconst items = s([1, 2, 3])\\n\\nul(null, l(items, i => i, i => li(null, i)))"
), "api-alias-l")

# m 别名
swap("    ('api-alias-m', 'm 别名', []),", alias_api(
    "api-alias-m", "m 别名", "mount(comp, target)", "mount 的短别名。",
    "import { m, div } from 'xunay'\\n\\nm(() => div(null, 'Hello'), '#app')"
), "api-alias-m")

# app 别名
swap("    ('api-alias-app', 'app 别名', []),", alias_api(
    "api-alias-app", "app 别名", "mount(comp, target)", "mount 的短别名。跟 m 完全一样。",
    "import { app, div } from 'xunay'\\n\\napp(() => div(null, 'Hello'), '#app')"
), "api-alias-app")

# each 别名
swap("    ('api-alias-each', 'each 别名', []),", alias_api(
    "api-alias-each", "each 别名", "list(arr, key, fn)", "list 的短别名。跟 l 完全一样。",
    "import { s, each, ul, li } from 'xunay'\\n\\nconst items = s(['a', 'b'])\\n\\nul(null, each(items, i => i, i => li(null, i)))"
), "api-alias-each")

# bat 别名
swap("    ('api-alias-bat', 'bat 别名', []),", alias_api(
    "api-alias-bat", "bat 别名", "batch(fn)", "batch 的短别名。",
    "import { s, bat, div } from 'xunay'\\n\\nconst a = s(0), b = s(0)\\n\\nbat(() => { a(1); b(2) })"
), "api-alias-bat")

# 剩下两个不是别名，但为了凑成 8 篇
swap("    ('api-kit-btn', 'kit: Btn', []),", r"""    ('api-kit-btn', 'kit: Btn', [
      ('H1','kit: Btn'),
      ('P','kit 里的按钮组件。'),
      ('H2','引入'),
      ('Code',"import { Btn } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['text','string | () => string','按钮文字'],
        ['type','"default" | "primary" | "danger" | "ghost"','样式'],
        ['size','"sm" | "lg"','尺寸'],
        ['block','boolean','撑满整行'],
        ['disabled','boolean | () => boolean','禁用'],
        ['onClick','(e) => void','点击回调'],
        ['icon','VNode','图标'],
      ]),
      ('H2','示例'),
      ('Code',"import { Btn } from 'xunay/kit'\nimport { div, signal } from 'xunay'\n\nconst n = signal(0)\n\ndiv(null,\n  Btn({ text: '+1', type: 'primary', onClick: () => n(v => v + 1) }),\n  Btn({ text: '删除', type: 'danger', onClick: () => n(0) }),\n  Btn({ text: () => '数量: ' + n() })\n)",'xuy'),
    ]),""", "api-kit-btn")

swap("    ('api-kit-input', 'kit: Input', []),", r"""    ('api-kit-input', 'kit: Input', [
      ('H1','kit: Input'),
      ('P','kit 里的输入框组件。带 label / error / hint。'),
      ('H2','引入'),
      ('Code',"import { Input } from 'xunay/kit'",'js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['label','string','标签'],
        ['value','string | () => string','值'],
        ['onChange','(v) => void','值变化回调'],
        ['placeholder','string','占位符'],
        ['error','string','错误提示'],
        ['hint','string','辅助提示'],
        ['type','"text" | "password" | ...','输入类型'],
        ['disabled','boolean','禁用'],
      ]),
      ('H2','示例'),
      ('Code',"import { Input } from 'xunay/kit'\nimport { signal, div } from 'xunay'\n\nfunction Form() {\n  const name = signal('')\n  const err = () => name().length < 2 ? '至少 2 个字' : ''\n\n  return div(null,\n    Input({\n      label: '用户名',\n      value: () => name(),\n      onChange: v => name(v),\n      error: err(),\n      hint: '输入你的名字'\n    })\n  )\n}",'xuy'),
    ]),""", "api-kit-input")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("API 别名 8 篇已填")
