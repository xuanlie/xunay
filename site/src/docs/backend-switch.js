// 切换后端
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("切换后端"),
    P("改一行配置切四套后端——前端不用动。"),
    H2("配置文件"),
    Code("// xunay.config.json\n{\n  \"backend\": \"node\",\n  \"ports\": {\n    \"node\": 12341,\n    \"python\": 12342,\n    \"go\": 12343,\n    \"cpp\": 12344\n  }\n}", "json"),
    H2("切换命令"),
    Code("# 手动改 backend 字段\n# 或用脚本\nnode bin/switch.js python", "bash"),
    H2("启动"),
    Code("bash bin/start.sh\n# 自动读 xunay.config.json 的 backend 字段，\n# 从对应端口启动对应语言的服务", "bash"),
    H2("start.sh 逻辑"),
    Code("#!/bin/bash\nBACKEND=$(node -e \"console.log(JSON.parse(require('fs').readFileSync('xunay.config.json')).backend)\")\nPORT=$(node -e \"console.log(JSON.parse(require('fs').readFileSync('xunay.config.json')).ports['$BACKEND'])\")\n\ncase \"$BACKEND\" in\n  python) cd backends/python && exec python -m uvicorn main:app --port $PORT ;;\n  go)     cd backends/go && exec go run . ;;\n  cpp)    cd backends/cpp/build && exec ./server ;;\n  node)   cd backends/node && exec node server.js ;;\nesac", "bash"),
    H2("前端需要改吗"),
    P("不用。前端只发请求到相对路径 /rpc/xxx，具体哪个后端响应由反向代理或启动脚本决定。"),
    H2("切换时机"),
    Table(["场景","推荐"], [["开发","Node（启动快）"],["生产小项目","Python（功能全）"],["高并发","Go"],["极低延迟","C++"]]),
  )
}
