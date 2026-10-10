// 调试
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("调试"),
    P("四套后端各自的调试方式。"),
    H2("Node"),
    Code("# 直接跑，输出到终端\nnode backends/node/server.js\n\n# 带调试器\nnode --inspect backends/node/server.js\n# 打开 chrome://inspect", "bash"),
    H2("Python"),
    Code("# 加 --reload 自动重启\npython -m uvicorn backend.main:app --reload --port 12342\n\n# 断点\n# 在代码里写\nimport pdb; pdb.set_trace()\n\n# 或用 VSCode 附加调试器", "bash"),
    H2("Go"),
    Code("# 直接跑\ngo run .\n\n# dlv 调试\ndlv debug .\n\n# pprof 性能分析\nimport _ \"net/http/pprof\"\n// 访问 /debug/pprof/", "bash"),
    H2("C++"),
    Code("# gdb 调试\ngdb ./server\n(gdb) run\n(gdb) bt    # 打印堆栈\n(gdb) p var # 打印变量\n\n# valgrind 检查内存\nvalgrind --leak-check=full ./server", "bash"),
    H2("通用调试"),
    H3("curl 测试接口"),
    Code("# GET\ncurl http://localhost:12342/rpc/token\n\n# POST 带 token\ncurl -X POST http://localhost:12342/rpc/addTodo \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer xxx' \\\n  -d '{\"title\":\"test\"}'", "bash"),
    H3("查看端口占用"),
    Code("ss -ltnp | grep 1234", "bash"),
    H3("看日志"),
    Code("# systemd 服务\njournalctl -u xunay -f\n\n# 直接跑后台 + tail\nnohup bash bin/start.sh > /tmp/backend.log 2>&1 &\ntail -f /tmp/backend.log", "bash"),
    H2("前端 devtools"),
    P("用 devtools 的网络面板看请求——URL、状态码、响应体、耗时全在。"),
    H2("常见问题"),
    Table(["症状","可能原因"], [["404","路由没注册 / 路径写错"],["401","token 过期 / 没带 Authorization"],["CORS 错误","后端没开 CORS"],["连接拒绝","后端没启动 / 端口冲突"],["超时","后端阻塞 / 数据库慢"]]),
  )
}
