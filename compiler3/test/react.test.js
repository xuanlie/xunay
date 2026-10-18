import test from 'node:test'
import assert from 'node:assert/strict'
import { parse } from '@babel/parser'
import { compileReact } from '../src/react.js'

function checkSyntax(code) {
  parse(code, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript'],
  })
}

test('React 编译器：useState 转为 signal', () => {
  const out = compileReact(`
    function Counter() {
      const [count, setCount] = useState(0)
      return <button onClick={() => setCount(v => v + 1)}>{count}</button>
    }
  `)

  assert.match(out, /count\s*=\s*signal\(0\)/)
  assert.match(out, /count\(\)/)
  assert.match(out, /createElement/)
  checkSyntax(out)
})

test('React 编译器：对象简写属性保留正确语义', () => {
  const out = compileReact(`
    function Counter() {
      const [count, setCount] = useState(0)
      const data = { count }
      return <div>{count}</div>
    }
  `)

  assert.match(out, /\{\s*count\s*:\s*count\(\)\s*\}/)
  checkSyntax(out)
})

test('React 编译器：函数参数遮蔽状态变量', () => {
  const out = compileReact(`
    function Counter() {
      const [count, setCount] = useState(0)
      function calculate(count) {
        return count + 1
      }
      return <div>{count}</div>
    }
  `)

  assert.match(out, /function calculate\(count\)\s*\{\s*return count \+ 1/)
  checkSyntax(out)
})

test('React 编译器：不同组件允许使用同名状态', () => {
  const out = compileReact(`
    function First() {
      const [count, setCount] = useState(0)
      return <div>{count}</div>
    }

    function Second() {
      const [count, setCount] = useState(1)
      return <span>{count}</span>
    }
  `)

  assert.equal((out.match(/signal\(/g) || []).length, 2)
  checkSyntax(out)
})

test('React 编译器：函数式 setter 不被破坏', () => {
  const out = compileReact(`
    function Counter() {
      const [count, setCount] = useState(0)
      return <button onClick={() => setCount(v => v + 1)}>{count}</button>
    }
  `)

  assert.match(out, /setCount\s*=\s*count/)
  assert.match(out, /setCount\(v\s*=>\s*v\s*\+\s*1\)/)
  checkSyntax(out)
})

test('React 编译器：多个 useState 独立转换', () => {
  const out = compileReact(`
    function Counter() {
      const [count, setCount] = useState(0)
      const [name, setName] = useState('XuNay')
      return <div title={name} onClick={() => setCount(count + 1)}>
        {count} {name}
      </div>
    }
  `)

  assert.match(out, /count\s*=\s*signal\(0\)/)
  assert.match(out, /name\s*=\s*signal\(['"]XuNay['"]\)/)
  assert.match(out, /count\(\)/)
  assert.match(out, /name\(\)/)
  assert.match(out, /setCount\s*\(/)
  checkSyntax(out)
})

test('React 编译器：对象与数组初始值', () => {
  const out = compileReact(`
    function App() {
      const [data, setData] = useState({ value: 1 })
      const [items, setItems] = useState([1, 2, 3])
      return <div>{data.value} {items.length}</div>
    }
  `)

  assert.match(out, /signal\(\s*\{\s*value:\s*1\s*\}\s*\)/)
  assert.match(out, /signal\(\s*\[\s*1\s*,\s*2\s*,\s*3\s*\]\s*\)/)
  checkSyntax(out)
})

test('React 编译器：条件表达式中的 JSX', () => {
  const out = compileReact(`
    function App() {
      const [visible, setVisible] = useState(true)
      return <div>{visible ? <span>yes</span> : <b>no</b>}</div>
    }
  `)

  assert.match(out, /visible\(\)/)
  assert.match(out, /createElement\(["']span["']/)
  assert.match(out, /createElement\(["']b["']/)
  checkSyntax(out)
})

test('React 编译器：map 中的 JSX', () => {
  const out = compileReact(`
    function App({ items }) {
      const [selected, setSelected] = useState(0)
      return <div>{items.map(item => <span>{selected}: {item}</span>)}</div>
    }
  `)

  assert.match(out, /createElement\(["']span["']/)
  assert.match(out, /selected\(\)/)
  checkSyntax(out)
})


test('React 编译器：嵌套函数局部变量不改写为 signal', () => {
  const out = compileReact(`
    function App() {
      const [count, setCount] = useState(1)
      function inner() {
        const count = 99
        return count
      }
      return <div>{count} {inner()}</div>
    }
  `)

  assert.match(out, /const count = 99\s*return count\b/)
  assert.match(out, /\(\) => \(count\(\)\)/)
  checkSyntax(out)
})

test('React 编译器：JSX 回调参数不误改写为 signal', () => {
  const out = compileReact(`
    function App() {
      const [count, setCount] = useState(1)
      return <div>{[1, 2].map(count => <span>{count}</span>)}</div>
    }
  `)

  assert.match(out, /map\(count\s*=>/)
  assert.match(out, /createElement\("span", \{[^}]*\}, \(\) => \(count\)\)/)
  checkSyntax(out)
})

test('React 编译器：JSX 属性中的对象简写属性不产生重叠编辑', () => {
  const out = compileReact(`
    function App() {
      const [count, setCount] = useState(1)
      return <div data={{ count }} />
    }
  `)

  assert.match(out, /count:\s*count\(\)/)
  checkSyntax(out)
})

test('React 编译器：var 局部变量遮蔽 signal', () => {
  const out = compileReact(`
    function App() {
      const [count, setCount] = useState(1)
      function inner() {
        var count = 99
        return count
      }
      return <div>{inner()} {count}</div>
    }
  `)

  assert.match(out, /var count\s*=\s*99\s*return count\b/)
  assert.match(out, /\(\)\s*=>\s*\(count\(\)\)/)
  checkSyntax(out)
})

test('React 编译器：catch 参数遮蔽 signal', () => {
  const out = compileReact(`
    function App() {
      const [error, setError] = useState(null)
      try {
        throw 1
      } catch (error) {
        console.log(error)
      }
      return <div>{error}</div>
    }
  `)

  assert.match(out, /catch\s*\(\s*error\s*\)/)
  assert.match(out, /console\.log\(error\)/)
  assert.match(out, /\(\)\s*=>\s*\(error\(\)\)/)
  checkSyntax(out)
})

test('React 编译器：for 循环 let 变量遮蔽 signal', () => {
  const out = compileReact(`
    function App() {
      const [count, setCount] = useState(1)
      for (let count = 0; count < 2; count++) {
        console.log(count)
      }
      return <div>{count}</div>
    }
  `)

  assert.match(out, /for\s*\(\s*let count\s*=\s*0/)
  assert.match(out, /console\.log\(count\)/)
  assert.match(out, /\(\)\s*=>\s*\(count\(\)\)/)
  checkSyntax(out)
})

test('React 编译器：for-of 解构变量遮蔽 signal', () => {
  const out = compileReact(`
    function App() {
      const [item, setItem] = useState(0)
      for (const { item } of [{ item: 1 }, { item: 2 }]) {
        console.log(item)
      }
      return <div>{item}</div>
    }
  `)

  assert.match(out, /for\s*\(const\s*\{\s*item\s*\}/)
  assert.match(out, /console\.log\(item\)/)
  assert.match(out, /\(\)\s*=>\s*\(item\(\)\)/)
  checkSyntax(out)
})

test('React 编译器：嵌套函数读取外层 signal，局部同名变量不改写', () => {
  const out = compileReact(`
    function App() {
      const [count, setCount] = useState(1)
      function outer() {
        function inner() {
          return count
        }
        return inner()
      }
      function local() {
        const count = 99
        return count
      }
      return <div>{outer()} {local()} {count}</div>
    }
  `)

  assert.match(out, /function inner\(\)\s*\{\s*return count\(\)/)
  assert.match(out, /const count\s*=\s*99\s*return count\b/)
  assert.match(out, /\(\)\s*=>\s*\(count\(\)\)/)
  checkSyntax(out)
})
