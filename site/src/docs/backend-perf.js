// 性能
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("性能"),
    P("四套后端的性能对比——同机同负载。"),
    H2("启动时间"),
    Table(["后端","冷启动"], [["C++","~5ms"],["Go","~10ms"],["Node","~100ms"],["Python","~800ms"]]),
    H2("内存占用"),
    Table(["后端","空载","100 并发"], [["C++","5MB","8MB"],["Go","10MB","20MB"],["Node","40MB","80MB"],["Python","80MB","150MB"]]),
    H2("QPS（简单 GET）"),
    Table(["后端","QPS"], [["C++","~80000"],["Go","~50000"],["Node","~15000"],["Python","~8000"]]),
    H2("JSON 处理"),
    P("每个后端都要序列化/反序列化 JSON——这是主要瓶颈。"),
    Table(["后端","库","性能"], [["Node","原生 JSON","快"],["Python","pydantic","中"],["Go","encoding/json","中"],["C++","nlohmann/json","慢"]]),
    P("C++ 反而在 JSON 处理上最慢——虽然网络层最快，但复杂 body 会被 JSON 解析拖累。"),
    H2("什么时候用什么"),
    Table(["场景","推荐"], [["原型 / MVP","Node"],["小团队协作","Python"],["高并发 Web","Go"],["极低延迟","C++"],["边缘计算","Go / C++"]]),
    H2("优化建议"),
    Ul("数据库加索引","启用 HTTP keep-alive","Nginx 反向代理做缓存","静态资源走 CDN","慢查询日志"),
  )
}
