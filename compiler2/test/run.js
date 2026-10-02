import { compile } from '../src/index.js'
import fs from 'fs'

const src = fs.readFileSync(new URL('./example.xuy', import.meta.url), 'utf8')
console.log('=== 编译前 ===')
console.log(src)
console.log('\n=== 编译后 ===')
console.log(compile(src))
