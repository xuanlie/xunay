p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

old = "for x in b[1]) + '),'"
new = "for x in b[1:]) + '),'"

if old in s:
    s = s.replace(old, new)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)
    print("改好了")
else:
    print("没找到，请贴 grep 结果")
