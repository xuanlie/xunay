#!/usr/bin/env python3
import re

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed = 0
for i in range(1, len(lines)):
    cur = lines[i]
    prev = lines[i-1]
    cur_s = cur.rstrip()
    prev_s = prev.rstrip()
    if not cur_s.endswith("']),"): continue
    if cur_s.endswith("']]),"): continue
    if not prev_s.endswith("'],"): continue
    indent_cur = len(cur) - len(cur.lstrip())
    indent_prev = len(prev) - len(prev.lstrip())
    if indent_cur != indent_prev: continue
    new_line = cur_s[:-3] + "]]),"
    lines[i] = new_line + "\n"
    fixed += 1
    print(f"修了 {i+1} 行")

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f"共修 {fixed} 处")
