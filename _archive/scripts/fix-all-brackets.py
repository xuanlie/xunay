#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

fixed = 0
for i in range(1, len(lines)):
    cur = lines[i].rstrip()
    prev = lines[i-1].rstrip()
    # 情况：当前行以 ')),' 结尾（缺一个 ]），上一行以 ',' 结尾且缩进相同
    if cur.endswith("')),"):
        if not cur.endswith("']),"):  # 已经修过的不再修
            indent_cur = len(lines[i]) - len(lines[i].lstrip())
            indent_prev = len(lines[i-1]) - len(lines[i-1].lstrip())
            if indent_cur == indent_prev and prev.endswith(","):
                lines[i] = cur[:-4] + "']])," + "\n"
                fixed += 1
                print(f"修了 {i+1} 行")

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f"共修 {fixed} 处")
