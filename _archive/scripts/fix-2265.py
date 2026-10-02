#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# 把错误的开头补上 [
s = s.replace(
    "    ('api-ctx', 'ctx(default)'),\n      ('H1','ctx(default)'),",
    "    ('api-ctx', 'ctx(default)', [\n      ('H1','ctx(default)'),"
)

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("已补 [")
