#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找 1179 行
for i in range(max(0, 1170), min(len(lines), 1185)):
    line = lines[i]
    if "不打印, 'xuy')," in line:
        # 修正：把缺的 " 加回来
        lines[i] = line.replace("不打印, 'xuy'),", '不打印\", \'xuy\'),')
        print(f"修了第 {i+1} 行")
        print("新内容:", lines[i][:100], "...")

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("done")
