// 例子：Filament 场景
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("例子：Filament 场景"),
    P("7 种几何体 + PBR + spin / bob / autoRotate，跑在 Filament 引擎上。"),
    H2("源码"),
    Code("scene({\n  bg: \"#1a1a2e\",\n  autoRotate: true,\n  camera: { distance: 10, fov: 45 },\n  lights: [\n    { dir: [0.7, 1.0, 0.5], color: \"#ffddaa\", intensity: 1.2 },\n    { dir: [-0.5, 0.3, -1.0], color: \"#6699ff\", intensity: 1.0 }\n  ]\n})\n\ncube({ color: \"#ff6600\", size: 1.2, position: [-3, 0, 0], spin: { axis: [0, 1, 0], speed: 2 } })\nsphere({ color: \"#00ccff\", size: 1.2, position: [-1, 0, 0], bob: { amp: 0.5, speed: 0.1 }, metalness: 0.9, roughness: 0.1 })\ncylinder({ color: \"#ffcc00\", size: 0.8, height: 1.5, position: [1, 0, 0], spin: { axis: [0, 1, 0], speed: -3 }, metalness: 1.0, roughness: 0.2 })\ncone({ color: \"#ffff00\", size: 1, height: 1.5, position: [3, 0, 0], rotate: [0, 0, 30] })\ntorus({ color: \"#00ff88\", radius: 0.8, tube: 0.3, position: [-2, 0, 2], spin: { axis: [1, 0, 0], speed: 1.5 } })\npyramid({ color: \"#ff3366\", size: 1, height: 1.5, position: [0, 0, 2], bob: { amp: 0.3, speed: 0.15 } })\nplane({ color: \"#444455\", size: 8, position: [0, -1.8, 0] })", "xuy"),
    H2("运行"),
    Code("node bin/xuyc-filament.js examples/scene-anim.xuy --out build/filament --build\nadb install --no-streaming -t -r build/filament/app/build/outputs/apk/debug/app-debug.apk\nadb shell am force-stop com.xunay.filament\nadb shell am start -n com.xunay.filament/.MainActivity", "powershell"),
    H2("外部 glTF 例子"),
    P("加载外部 Draco 压缩 glTF（飞行器，39 mesh + 10 贴图）。"),
    Code("scene({ bg: \"#0e1116\", autoRotate: true,\n  lights: [{ dir: [0.5, -1, -0.3], color: \"#ffffff\", intensity: 3.0 }] })\n\nmodel({ src: \"examples/models/drone.gltf\" })", "xuy"),
    H2("自带动画例子"),
    P("BoxAnimated.gltf（两个盒子，一个绕轴转，一个上下移）。"),
    Code("scene({ bg: \"#0e1116\",\n  lights: [{ dir: [0.5, -1, -0.3], color: \"#ffffff\", intensity: 3.0 }] })\n\nmodel({ src: \"examples/models/BoxAnimated.gltf\" })", "xuy"),
    H2("例子一览"),
    Table(["文件","内容"], [["filament-test.xuy","3 形状 + 双光源"],["filament-shapes.xuy","7 种几何体"],["scene3d / scene-shapes / scene-anim","老例子同一份，新路直接跑"],["scene-pbr / scene-tex","PBR + 纹理"],["filament-drone.xuy","外部 Draco glTF"],["filament-anim-box.xuy","glTF 自带动画"]]),
  )
}
