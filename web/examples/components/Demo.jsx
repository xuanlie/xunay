import { useState, useEffect } from 'react'

export default function Demo() {
  const [n, setN] = useState(0)
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ padding: '16px', border: '1px solid #98c379', borderRadius: '8px', background: '#21252b' }}>
      <div style={{ color: '#98c379', fontWeight: 'bold', marginBottom: '12px' }}>
        这是一个真正的 .jsx 文件（用 JSX 语法）
      </div>
      <div>n = {n}</div>
      <div>现在时间 = {time}</div>
      <button onClick={() => setN(n + 1)} style={{ marginTop: '8px', padding: '4px 12px' }}>
        +1
      </button>
    </div>
  )
}
