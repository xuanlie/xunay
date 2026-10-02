#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

old = """os.makedirs(OUT_DOCS, exist_ok=True)
total = 0
indexes = []
nav_data = []

for group, items in GROUPS:
    nav_items = []
    for slug, title, content in items:
        if not content:
            content = [('H1', title), ('P', '此章节待补充。')]
        fn = os.path.join(OUT_DOCS, slug + '.xuy')
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(render_doc(title, content))
        var = 'D_' + slug.replace('-', '_')
        indexes.append((var, slug, title))
        nav_items.append({'slug': slug, 'title': title})
        total += 1
    nav_data.append({'group': group, 'items': nav_items})
"""

new = """os.makedirs(OUT_DOCS, exist_ok=True)
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
        if not content:
            content = [('H1', title), ('P', '此章节待补充。')]
        fn = os.path.join(OUT_DOCS, slug + '.xuy')
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(render_doc(title, content))
        var = 'D_' + slug.replace('-', '_')
        indexes.append((var, slug, title))
        nav_items.append({'slug': slug, 'title': title})
        total += 1
    nav_data.append({'group': group, 'items': nav_items})
"""

if old not in s:
    print("未命中主循环")
else:
    s = s.replace(old, new)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)
    print("改好了")
