#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 604-607 行附近，把 Table([...]) 补全
for i in range(max(0, 600), min(len(lines), 615)):
    if "['补丁','bug 修复']) " in lines[i] or "['补丁','bug 修复'])," in lines[i]:
        lines[i] = lines[i].replace("['补丁','bug 修复']),", "['补丁','bug 修复']]),")
        print(f"修了第 {i+1} 行")
        break

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("done")
