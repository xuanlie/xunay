// Filament DSL 支持
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Filament DSL 支持"),
    P("Filament 路支持的 .xuy 语法。跟老 3D 路共用一套 DSL。"),
    H2("scene"),
    Code("scene({\n  bg: \"#0e1116\",\n  autoRotate: true,\n  ibl: 50000,\n  camera: { distance: 6, fov: 45, center: [0, 0, 0] },\n  lights: [\n    { dir: [0.5, -1, -0.3], color: \"#ffffff\", intensity: 3.0 }\n  ]\n})", "xuy"),
    Ul("bg —— 背景色","autoRotate —— 相机绕 Y 自转（触摸后停）","ibl —— 间接光强度，默认 30000","camera.distance —— 相机距离；不填则按 bbox 自动算","camera.center —— 相机看向的中心；不填则按 bbox 中心","lights —— 最多 8 个方向光 { dir, color, intensity }"),
    H2("七种几何体"),
    Table(["函数","参数"], [["cube","color / size / position / metalness / roughness"],["sphere","+ segments"],["plane","color / size / position"],["cylinder","+ height / segments"],["cone","+ height / segments"],["torus","radius / tube / position / segments"],["pyramid","size / height / position"],["model","src(.gltf) / position / rotate / scale"]]),
    H2("逐物体动画"),
    Code("cube({\n  color: \"#ff6600\",\n  size: 1.2,\n  position: [-3, 0, 0],\n  spin: { axis: [0, 1, 0], speed: 2 },\n  bob: { amp: 0.5, speed: 0.1 },\n  rotate: [0, 0, 30]\n})", "xuy"),
    Ul("rotate —— 静态旋转 [x, y, z]（度，编译时转四元数）","spin —— 持续旋转 { axis: [x,y,z], speed: 圈/秒 }","bob —— 上下浮动 { amp: 幅度, speed: 频率 }"),
    H2("PBR + 纹理"),
    Code("sphere({\n  color: \"#00ccff\",\n  size: 1.5,\n  metalness: 0.9,\n  roughness: 0.1\n})\n\ncube({\n  texture: \"examples/textures/checker.png\",\n  texScale: 0.5\n})", "xuy"),
    P("程序化几何体带真 UV（TEXCOORD_0），纹理按 UV 平铺。外部 glTF 的 UV / 法线贴图 / metallicRoughness 全保留。"),
  )
}
