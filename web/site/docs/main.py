#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os

_ROOT_HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # docs/main.py → site/

# ─── 读 core 版本号 ───
try:
    XUNAY_VERSION = json.load(open(os.path.join(_ROOT_HERE, '../../core/package.json'), encoding='utf-8'))['version']
except Exception:
    XUNAY_VERSION = '1.2.8'

# ─── 从 core/src/kit*.js 提取真实参数 ───
import json as _json
_KIT_PARAMS = {}
try:
    _KIT_PARAMS = _json.load(open(os.path.join(_ROOT_HERE, '_kit_params.json'), encoding='utf-8'))
except Exception as e:
    print('[warn] _kit_params.json 加载失败:', e)
    pass

# 响应式参数
REACTIVE_PROPS = {'value', 'checked', 'open', 'active', 'selected', 'page', 'current'}

def _is_valid_prop(p):
    if not p or not isinstance(p, str): return False
    if p in ('true', 'false', 'null', 'undefined'): return False
    if p.isdigit(): return False
    return True

def _detect_reactive(real_p):
    hits = [p for p in real_p if p in REACTIVE_PROPS]
    return (len(hits) > 0, hits)

def _default_for(prop):
    M = {
        'type': "'text'", 'size': "'md'", 'placeholder': "''",
        'disabled': 'false', 'rows': '4', 'max': '100',
        'min': '0', 'step': '1', 'width': 'auto',
    }
    return M.get(prop, '——')

def _note_for(prop):
    if prop.startswith('on') and len(prop) > 2: return "回调"
    if prop in REACTIVE_PROPS: return "可传 signal（响应式）"
    M = {
        'label': '标签', 'hint': '提示', 'error': '错误信息',
        'value': '值', 'type': '类型', 'size': '尺寸',
        'disabled': '禁用', 'placeholder': '占位文字', 'name': '名称',
        'title': '标题', 'desc': '描述', 'items': '数据项',
        'options': '选项列表', 'active': '激活项', 'open': '开关',
        'width': '宽度', 'height': '高度', 'text': '文本',
    }
    return M.get(prop, '')

def _fix_api_kit(slug, content):
    if not slug.startswith('api-kit-'):
        return content
    name_lower = slug[8:]
    real = None
    real_name = name_lower
    for k in _KIT_PARAMS:
        if k.lower() == name_lower.lower():
            real = k
            real_name = k
            break
    if not real:
        return content
    real_p_raw = _KIT_PARAMS[real] or []
    real_p = [p for p in real_p_raw if _is_valid_prop(p)]

    import_line = ''
    for item in content:
        if item[0] == 'Code' and isinstance(item[1], str) and 'import' in item[1]:
            import_line = item[1]
            break
    if not import_line:
        import_line = "import { " + real_name + " } from 'xunay/kit/ui'"

    needs_reactive, reactive_hits = _detect_reactive(real_p)

    out = []
    for item in content:
        if item[0] == 'Table' and len(item) >= 3:
            rows = []
            for pname in real_p:
                rows.append([pname, "——", _default_for(pname), _note_for(pname)])
            out.append(('Table', ['参数','类型','默认','说明'], rows))
        else:
            out.append(item)

    PRIORITY = ['value','checked','label','placeholder','title','text','items','options','active','open','type','size']
    def pick_priority(p):
        if p in PRIORITY: return PRIORITY.index(p)
        if p.startswith('on'): return 100
        return 200
    sorted_p = sorted(real_p, key=pick_priority)
    example_props = []
    for p in sorted_p:
        if len(example_props) >= 3: break
        if p.startswith('on') and len(p) > 2:
            example_props.append(p + ": () => {}")
        elif p in REACTIVE_PROPS:
            example_props.append(p + ": mySignal")
        elif p in ('label', 'placeholder', 'title', 'text'):
            example_props.append(p + ": 'example'")
        elif p in ('items', 'options'):
            example_props.append(p + ": []")
        elif p in ('active', 'open', 'disabled', 'block'):
            example_props.append(p + ": false")
        elif p == 'size':
            example_props.append(p + ": 'md'")
        elif p == 'value':
            example_props.append(p + ": ''")
        elif p == 'type':
            example_props.append(p + ": 'text'")
    if not example_props:
        example_props = ["/* see table above */"]

    example_code = import_line + "\n\n" + real_name + "({ " + ", ".join(example_props) + " })"
    usage_blocks = [
        ('H2', '基础用法'),
        ('Code', example_code, 'js'),
    ]

    reactive_blocks = []
    if needs_reactive:
        first = reactive_hits[0]
        init = "''" if first == 'value' else "false"
        reactive_blocks = [
            ('H2', '响应式'),
            ('P', '这些参数可以直接传 signal，值变化时 DOM 会自动更新：'),
            ('Code',
             "import { signal } from 'xunay'\n" + import_line + "\n\n"
             "const v = signal(" + init + ")\n\n"
             + real_name + "({ " + first + ": v })",
             'js'),
            ('Tip', '不要写成 ' + first + ': v() —— 传函数给 render.js，让它挂 effect。'),
        ]

    insert_at = len(out)
    for i in range(len(out) - 1, -1, -1):
        if out[i][0] == 'Tip':
            insert_at = i
            break

    return out[:insert_at] + usage_blocks + reactive_blocks + out[insert_at:]

ROOT = _ROOT_HERE  # 指向 site/
OUT_DOCS = os.path.join(ROOT, 'src', 'docs')
OUT_INDEX = os.path.join(ROOT, 'src', 'docs-index.xuy')
OUT_NAV = os.path.join(ROOT, 'src', 'docs-nav.xuy')

HEADER = """// {title}
import {{ D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid }} from '../docs-kit.xuy'

export function Doc() {{
  return D(
{body}
  )
}}
"""

def render_block(b):
    t = b[0]
    if t in ('H1','H2','H3','P','Quote','Tip','Warn','Danger'):
        return '    ' + t + '(' + json.dumps(b[1], ensure_ascii=False) + '),'
    if t == 'Code':
        lang = b[2] if len(b) > 2 else 'xuy'
        return '    Code(' + json.dumps(b[1], ensure_ascii=False) + ', ' + json.dumps(lang) + '),'
    if t in ('Ul','Ol'):
        return '    ' + t + '(' + ','.join(json.dumps(x, ensure_ascii=False) for x in b[1:]) + '),'
    if t == 'Table':
        h = ','.join(json.dumps(x, ensure_ascii=False) for x in b[1])
        r = ','.join('[' + ','.join(json.dumps(c, ensure_ascii=False) for c in row) + ']' for row in b[2])
        return '    Table([' + h + '], [' + r + ']),'
    if t == 'ChartDemo':
        # b[1] = type (str), b[2] = opts (dict)
        typ = json.dumps(b[1], ensure_ascii=False)
        opts = json.dumps(b[2] if len(b) > 2 else {}, ensure_ascii=False)
        return '    ChartDemo(' + typ + ', ' + opts + '),'
    if t == 'IconGrid':
        n = b[1] if len(b) > 1 else 60
        return '    IconGrid(' + str(n) + '),'
    return ''

def render_doc(title, blocks):
    return HEADER.format(title=title, body='\n'.join(render_block(b) for b in blocks))

# ============ 文档目录 ============

# ══════════════════════════════════════════════
#  汇总 GROUPS（从 xuy/ 下各模块加载）
# ══════════════════════════════════════════════
import sys, importlib
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from xuy._order import ORDER
GROUPS = []
for _name in ORDER:
    _mod = importlib.import_module(f'xuy.{_name}')
    GROUPS.append((_mod.GROUP, _mod.DOCS))
print(f'[main] 已加载 {len(GROUPS)} 个分组')


os.makedirs(OUT_DOCS, exist_ok=True)
total = 0
indexes = []
nav_data = []

# 支持两种形式：
#   2 元组：('组名', [子项...])
#   3 元组：('slug', '标题', [内容...]) —— 自动归到最近的组
groups_map = {}
group_order = []

for entry in GROUPS:
    if len(entry) == 2:
        group, items = entry
    else:
        slug, title, content = entry
        group = group_order[-1] if group_order else '默认'
        items = [(slug, title, content)]

    if group not in groups_map:
        groups_map[group] = []
        group_order.append(group)
    groups_map[group].extend(items)

for group in group_order:
    items = groups_map[group]
    nav_items = []
    for slug, title, content in items:
        fn = os.path.join(OUT_DOCS, slug + '.xuy')
        # 手写文档不覆盖：GROUPS 里空 content + 文件已存在 = 手写
        if not content:
            if os.path.exists(fn):
                var = 'D_' + slug.replace('-', '_')
                indexes.append((var, slug, title))
                nav_items.append({'slug': slug, 'title': title})
                total += 1
                continue
            content = [('H1', title), ('P', '此章节待补充。')]
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(render_doc(title, _fix_api_kit(slug, content)))
        var = 'D_' + slug.replace('-', '_')
        indexes.append((var, slug, title))
        nav_items.append({'slug': slug, 'title': title})
        total += 1
    nav_data.append({'group': group, 'items': nav_items})

with open(OUT_INDEX, 'w', encoding='utf-8') as f:
    f.write('// 自动生成，请勿手改\n')
    f.write('// 每个文档懒加载（code splitting），首屏只加载框架+路由+侧栏\n')
    f.write('export const docMap = {\n')
    for var, slug, title in indexes:
        f.write("  '" + slug + "': () => import('./docs/" + slug + ".xuy').then(m => m.Doc),\n")
    f.write('}\n\nexport const docTitle = {\n')
    for var, slug, title in indexes:
        f.write("  '" + slug + "': " + json.dumps(title, ensure_ascii=False) + ",\n")
    f.write('}\n')

with open(OUT_NAV, 'w', encoding='utf-8') as f:
    f.write('// 自动生成，请勿手改\nexport const nav = ')
    f.write(json.dumps(nav_data, ensure_ascii=False, indent=2))
    f.write('\n')

print('生成 ' + str(total) + ' 篇文档')


