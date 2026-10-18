import test from 'node:test'
import assert from 'node:assert/strict'
import { compile } from '../src/index.js'

const cases = [
  {
    name: '三元表达式中的 JSX',
    source: 'const App = ({ ok }) => <div>{ok ? <b /> : <i />}</div>',
    residual: /<\s*\/?\s*(?:div|b|i)\b/,
  },
  {
    name: 'map 回调中的 JSX',
    source: 'const App = () => <div>{items.map(x => <span>{x}</span>)}</div>',
    residual: /<\s*\/?\s*(?:div|span)\b/,
  },
  {
    name: '函数参数中的 JSX',
    source: 'const App = () => <div>{fn(<A />)}</div>',
    residual: /<\s*\/?\s*(?:div|A)\b/,
  },
  {
    name: 'JSX 属性中的嵌套 JSX',
    source: 'const App = () => <Comp child={<span />} />',
    residual: /<\s*\/?\s*span\b/,
  },
]

for (const item of cases) {
  test(item.name, () => {
    const output = compile(item.source)

    assert.equal(typeof output, 'string', '编译结果必须是字符串')
    assert.doesNotMatch(
      output,
      item.residual,
      `编译结果残留 JSX：\n${output}`,
    )
  })
}
