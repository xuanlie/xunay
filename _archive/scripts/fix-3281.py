#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 3278-3281 附近，把 Table([...] 补全
for i in range(max(0, 3275), min(len(lines), 3290)):
    if "['CORS_ORIGIN','允许的源'])" in lines[i]:
        lines[i] = lines[i].replace("['CORS_ORIGIN','允许的源'])", "['CORS_ORIGIN','允许的源']]),")
        print(f"修了第 {i+1} 行")
        break

with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("done")
