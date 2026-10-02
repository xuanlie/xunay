#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
skip = 0
for i, line in enumerate(lines):
    # 删掉包含 @click=" 的那一行（Vue 示例）
    if '@click=' in line and 'vue' in line.lower():
        print(f"删除第 {i+1} 行")
        continue
    # 同时删掉它的前一行 (H3 Vue 计数器) 如果有
    if "'Vue 3 计数器'" in line:
        print(f"删除第 {i+1} 行")
        continue
    out.append(line)

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(out)
print("done")
