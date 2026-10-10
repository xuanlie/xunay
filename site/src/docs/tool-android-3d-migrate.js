// Babylon 迁移到 OpenGL ES
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("从 Babylon.js 迁移到 OpenGL ES"),
    P("Web 端 3D 用 Babylon，Android 端用原生 OpenGL ES 2.0。API 完全不同。"),
    H2("概念对照"),
    Table(["Babylon","Android 3D"], [["Engine / Scene","GLSurfaceView + Renderer"],["MeshBuilder.CreateBox","cube({...})"],["MeshBuilder.CreateSphere","sphere({...})"],["MeshBuilder.CreateCylinder","cylinder({...})"],["MeshBuilder.CreateTorus","torus({...})"],["SceneLoader.ImportMesh","model({ src: \"x.obj\" })"],["StandardMaterial","metalness / roughness"],["new HemisphericLight","lights: [{ dir, color }]"],["Camera / ArcRotateCamera","camera.distance + 手指拖拽"],["scene.registerBeforeRender","onDrawFrame"],["mesh.rotation.y += 0.01","spin: { axis, speed }"],["animation","暂不支持"]]),
    H2("不可替代的"),
    Ul("PBR 完整模型（metalnessMap / roughnessMap / normalMap）","阴影贴图","后处理管线","骨骼动画","粒子系统","物理引擎","GUI 层"),
    H2("可以替代的"),
    Ul("简单几何体 —— 用内置 8 种",".obj 静态模型 —— 支持","固定方向光 —— 支持","材质颜色 —— 支持","逐物体旋转 / 浮动 —— 支持","纹理 —— triplanar 支持"),
    H2("迁移建议"),
    P("Babylon 场景通常复杂度远超 Android 3D 能承接的范围。建议："),
    Ul("简单 3D（少量几何 + 单色 + 简单动画）→ 可以迁移","复杂 PBR 模型 → 换 Filament（Google 的 PBR 引擎）","游戏引擎 → 换 Godot / Unity","粒子 / 物理 → 换 Filament 或原生"),
    H2("3D 路支持的核心"),
    Code("scene({ ... })\\ncube / sphere / plane / cylinder / cone / torus / pyramid\\nmodel({ src: \"x.obj\" })", "xuy"),
    H2("例子对照"),
    Code("// Babylon\\nBABYLON.MeshBuilder.CreateBox(\"box\", { size: 1 }, scene)\\n\\n// Android 3D\\ncube({ size: 1, color: \"#ff6600\", position: [0, 0, 0] })", "xuy"),
  )
}
