#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# 把 ]),, 替换成 ]),
count = s.count("]),,")
s = s.replace("]),,", "]),")
print(f"修了 {count} 处")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
