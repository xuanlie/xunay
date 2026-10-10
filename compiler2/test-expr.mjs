import { compile } from './src/index.js'
const src = `const x = arr.map(a => div(null, a.id))
const y = cond ? span(null, 'A') : p(null, 'B')`
console.log(compile(src))