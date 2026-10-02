#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到 1179 行（下标 1178），把"不打印'"改成"不打印"
for i in range(max(0, 1175), min(len(lines), 1185)):
    if "不打印'" in lines[i]:
        lines[i] = lines[i].replace("不打印'", "不打印")
        print(f"修了第 {i+1} 行")

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("done")
