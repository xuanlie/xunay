#!/usr/bin/env python3

p = "myapp/src/devtools.js"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# 在 IIFE 开头包 try
old = "(function () {\n  if (typeof window === 'undefined' || window.__XD__) return\n"
new = "(function () {\n  try {\n  if (typeof window === 'undefined' || window.__XD__) return\n"

if old in s:
    s = s.replace(old, new, 1)
    print("✓ 加了 try")
else:
    print("⚠ 开头没匹配")

# 在文件末尾的 "})()" 前加 catch
# 找到最后一个 "})()"
idx = s.rstrip().rfind("})()")
if idx > 0:
    s = s[:idx] + "} catch (e) { console.error('[devtools] 崩溃', e) }\n})()" + s[idx+4:]
    print("✓ 加了 catch")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
