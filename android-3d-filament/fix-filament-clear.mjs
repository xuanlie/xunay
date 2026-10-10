import fs from 'node:fs'
const f = 'app/src/main/java/com/xunay/filament/MainActivity.java'
let s = fs.readFileSync(f, 'utf8')

// 删掉 view.setClearColor 那行
const bad = '        view.setClearColor(0.06f, 0.06f, 0.10f, 1.0f);\n'
if (!s.includes(bad)) { console.error('MISS 1'); process.exit(1) }
s = s.replace(bad, '')

// 在 createRenderer 之后加 ClearOptions
const anchor = '        renderer = engine.createRenderer();\n'
const add = anchor + `        {
            Renderer.ClearOptions opts = new Renderer.ClearOptions();
            opts.clear = true;
            opts.clearColor[0] = 0.06f;
            opts.clearColor[1] = 0.06f;
            opts.clearColor[2] = 0.10f;
            opts.clearColor[3] = 1.0f;
            renderer.setClearOptions(opts);
        }
`
if (!s.includes(anchor)) { console.error('MISS 2'); process.exit(1) }
s = s.replace(anchor, add)

fs.writeFileSync(f, s, 'utf8')
console.log('OK 已改 MainActivity.java')
