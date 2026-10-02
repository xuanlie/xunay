#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if "('<script setup>\\nimport { ref } from 'vue'" in lines[i] and '@click=' in lines[i]:
        # 把内部的双引号转义
        old = lines[i]
        new = old.replace('@click="n--"', '@click=\\"n--\\"').replace('@click="n++"', '@click=\\"n++\\"')
        lines[i] = new
        print(f"修了第 {i+1} 行")
        break

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("done")
