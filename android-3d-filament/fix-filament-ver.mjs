import fs from 'node:fs'
const f = 'app/build.gradle'
let s = fs.readFileSync(f, 'utf8')
const old = "1.51.5"
const neu = "1.51.6"
if (!s.includes(old)) { console.error('MISS 没找到 1.51.5'); process.exit(1) }
s = s.split(old).join(neu)
fs.writeFileSync(f, s, 'utf8')
console.log('OK 改成 1.51.6')
console.log(fs.readFileSync(f, 'utf8').split('\n').filter(l => l.includes('filament')).join('\n'))
