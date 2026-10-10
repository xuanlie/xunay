// persist 持久化
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("persist 持久化"),
    P("signal 自动持久化到 storage。"),
    H2("引入"),
    Code("import { persist } from 'xunay/persist'", "js"),
    H2("用法"),
    Code("// 一行搞定\nconst count = persist(0, 'counter')\ncount(1)         // 自动存\ncount()          // 自动读，刷新恢复\n\n// 高级\nconst theme = persist('light', {\n  key: 'theme',\n  storage: 'local',\n  ttl: 86400,\n})", "js"),
    H2("版本迁移"),
    Code("const user = persistWithMigration({ name: '' }, {\n  key: 'user',\n  version: 2,\n  migrations: {\n    '1->2': (old) => ({ ...old, email: '' }),\n  },\n})", "js"),
  )
}
