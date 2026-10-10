// 3D OBJ 加载细节
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("3D OBJ 加载"),
    P("支持 .obj 格式，自动按面片三角化，算法线。"),
    H2("用法"),
    Code("model({\\n  src: \"examples/cube.obj\",\\n  color: \"#ff6600\",\\n  scale: 2,\\n  position: [0, 0, 0]\\n})", "xuy"),
    H2("打包流程"),
    Ul("1. CLI 读 scene.objects 找 model","2. 读 src 文件到内存","3. 记录 basename 到 obj.assetName","4. gen.js 生成 assets.open(\"cube.obj\")","5. CLI 写文件时把 obj 内容也写进 app/src/main/assets/"),
    H2("ObjLoader"),
    P("逐行读，遇到 v 记顶点，f 记面片。"),
    Code("public static float[] load(InputStream in, float r, float g, float b, float scale) {\\n    BufferedReader br = new BufferedReader(new InputStreamReader(in));\\n    List<float[]> positions = new ArrayList<>();\\n    List<int[]> faces = new ArrayList<>();\\n    String line;\\n    while ((line = br.readLine()) != null) {\\n        line = line.trim();\\n        if (line.startsWith(\"v \")) { /* 顶点 */ }\\n        else if (line.startsWith(\"f \")) { /* 面片 */ }\\n    }\\n    // 三角化 + 法线计算\\n}", "java"),
    H2("法线计算"),
    P("每个面片算一条法线（叉积），三个顶点共用。"),
    Code("float ux = p1[0]-p0[0], uy = p1[1]-p0[1], uz = p1[2]-p0[2];\\nfloat vx = p2[0]-p0[0], vy = p2[1]-p0[1], vz = p2[2]-p0[2];\\nfloat nx = uy*vz - uz*vy;\\nfloat ny = uz*vx - ux*vz;\\nfloat nz = ux*vy - uy*vx;\\n// 归一化", "java"),
    H2("已知限制"),
    Ul("不支持四边形面（>3 顶点的面取前 3 个）","不支持 UV 坐标（纹理靠 triplanar）","不支持平滑法线（每个面独立法线）","不支持材质分组","不支持 .mtl 文件","不支持嵌套 / 组合模型"),
    H2(".obj 文件要求"),
    Ul("UTF-8 编码","v 行是 x y z","f 行是 v1 v2 v3 或 v1/vt1/vn1","不支持二进制 .obj"),
    H2("性能建议"),
    Ul("单模型 < 10000 顶点","总顶点数 < 50000","大量模型拆成多个 .obj"),
  )
}
