import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.detail", s)

const fails = []
function must(from, to, label) {
  if (!s.includes(from)) { fails.push(label); return }
  s = s.replace(from, to)
}

// ===== 1. S 加字段 =====
must(
`    nets: [], logs: [], signals: [], btn: null
  }`,
`    nets: [], logs: [], signals: [], btn: null,
    sigMeta: new WeakMap(),
    _selSig: null
  }`,
"1.S加字段")

// ===== 2. hookSignals 加 onSignalSet =====
must(
`        if (origCreate) origCreate(s)
      }
    }`,
`        S.sigMeta.set(s, { createdAt: Date.now(), writes: [] })
        if (origCreate) origCreate(s)
      }
      const origSet = rt.hooks.onSignalSet
      rt.hooks.onSignalSet = (sg, o, n, c) => {
        const m = S.sigMeta.get(sg)
        if (m) {
          m.writes.push({ t: Date.now(), from: o, to: n })
          if (m.writes.length > 50) m.writes.shift()
        }
        if (origSet) origSet(sg, o, n, c)
      }
    }`,
"2.onSignalSet")

writeFileSync(p, s)
if (fails.length) { console.log("失败:", fails.join(", ")); process.exit(1) }
console.log("基础补丁完成")
