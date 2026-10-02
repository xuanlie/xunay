#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(max(0, 3400), min(len(lines), 3415)):
    if "['超时','后端阻塞 / 数据库慢'])" in lines[i]:
        lines[i] = lines[i].replace("['超时','后端阻塞 / 数据库慢'])", "['超时','后端阻塞 / 数据库慢']]),")
        print(f"修了第 {i+1} 行")
        break

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("done")
