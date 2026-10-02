import { readFileSync, writeFileSync } from "node:fs"
const p = "site/src/style.css"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.sidebar2", s)

// 找到 Sidebar 段，替换
const startMark = "/* ============ Sidebar ============ */"
const endMark = "/* ============ Content ============ */"
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark)
if (i1 < 0 || i2 < 0) throw new Error("未找到 Sidebar 段")

const newSidebar = `/* ============ Sidebar ============ */
.sidebar {
  position: fixed; top: 60px; left: 0; bottom: 0; width: 264px;
  background: #fbfbfd;
  border-right: 1px solid rgba(0,0,0,0.05);
  overflow-y: auto; padding: 20px 0 60px; z-index: 90;
}
.sidebar::-webkit-scrollbar { width: 5px; }
.sidebar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 3px; }
.sidebar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }
.sidebar-body { padding: 0 12px; }

.nav-group { margin-bottom: 22px; }
.nav-group-title {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.8px; color: #9ca3af;
  padding: 8px 12px 6px;
  text-transform: uppercase;
  transition: color .15s;
}
.nav-group-title:hover { color: #6366f1; }

.nav-item {
  display: block; padding: 6px 12px; margin: 1px 0;
  font-size: 13.5px; color: #4b5563;
  border-radius: 6px;
  position: relative;
  transition: background .15s, color .15s, padding-left .2s cubic-bezier(.2,.9,.3,1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  line-height: 1.5;
}
.nav-item::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%) scaleY(0);
  width: 3px; height: 16px; border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
  transition: transform .2s cubic-bezier(.2,.9,.3,1);
  transform-origin: center;
}
.nav-item:hover {
  background: rgba(99,102,241,0.05);
  color: #1f2937;
  text-decoration: none;
}
.nav-item:hover::before { transform: translateY(-50%) scaleY(0.6); }
.nav-item.on {
  background: rgba(99,102,241,0.08);
  color: #4f46e5; font-weight: 600;
}
.nav-item.on::before { transform: translateY(-50%) scaleY(1); }

`
s = s.slice(0, i1) + newSidebar + s.slice(i2)
writeFileSync(p, s)
console.log("侧栏已重做")
