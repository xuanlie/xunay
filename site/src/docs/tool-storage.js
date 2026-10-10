// storage 存储
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("storage 存储"),
    P("键值存储。支持 TTL 过期、响应式、跨标签页同步。"),
    H2("引入"),
    Code("import { storage, session, memory } from 'xunay/storage'", "js"),
    H2("基础用法"),
    Code("storage.set('name', 'XuNay')\nstorage.get('name')        // 'XuNay'\nstorage.has('name')        // true\nstorage.remove('name')\nstorage.clear()", "js"),
    H2("TTL 过期"),
    Code("storage.set('tmp', 'x', 60)   // 60 秒后自动失效\nstorage.get('tmp')          // 60 秒内返回 'x'，之后返回 null", "js"),
    H2("三种后端"),
    Table(["后端","存储位置","持久性"], [["storage","localStorage","永久"],["session","sessionStorage","标签页关闭清"],["memory","内存","刷新清"]]),
    H2("自定义前缀"),
    Code("const store = createStore({\n  backend: 'local',\n  prefix: 'myapp:',\n  ttl: 3600,           // 默认 1 小时过期\n  onChange: (k, v) => console.log('变了', k, v),\n})", "js"),
    H2("响应式版本"),
    Code("const name = storage.ref('name', 'Guest')\n\n// 读\nname.value          // 'Guest'\n\n// 写（自动存 + 自动更新订阅者）\nname.value = 'Leo'", "js"),
  )
}
