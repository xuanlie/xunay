// 3D 老路 API
import { D, H1, H2, H3, P, Code, Ul, Tip, Warn, Note, Table } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('3D 老路 API'),
    P('android-3d/ 路：手写 OpenGL ES 2.0，只吃 .obj。给 AI 写 3D 场景用。'),

    H2('编译'),
    Code('node bin/xuyc-3d.js scene.xuy --out build/android-3d\n# 或统一入口\nnode bin/xuyc.js scene.xuy --target=3d --out build/android-3d --build', 'bash'),

    H2('scene —— 全局配置'),
    Code('scene({\n  bg: "#1a1a2e",\n  autoRotate: true,\n  camera: { distance: 10, fov: 45 },\n  lights: [\n    { dir: [0.7, 1.0, 0.5], color: "#ffddaa", intensity: 1.2 },\n    { dir: [-0.5, 0.3, -1.0], color: "#6699ff", intensity: 1.0 }\n  ]\n})', 'xuy'),
    Table(['字段', '说明'], [
      ['bg', '背景色 #hex'],
      ['autoRotate', '相机绕 Y 自动旋转'],
      ['camera.distance', '相机离原点距离'],
      ['camera.fov', '视角（默认 45）'],
      ['lights', '最多 8 个方向光 { dir, color, intensity }'],
    ]),

    H2('7 种几何体'),
    Table(['函数', '参数'], [
      ['cube', 'color / size / position'],
      ['sphere', 'color / size / position / segments'],
      ['plane', 'color / size / position'],
      ['cylinder', 'color / size / height / position / segments'],
      ['cone', 'color / size / height / position / segments'],
      ['torus', 'color / radius / tube / position / segments'],
      ['pyramid', 'color / size / height / position'],
    ]),
    Code('cube({ color: "#ff6600", size: 1, position: [0, 0, 0] })\nsphere({ color: "#00ccff", size: 1, position: [0, 0, 0], segments: 16 })\nplane({ color: "#888", size: 8, position: [0, -1, 0] })\ncylinder({ color: "#fc0", size: 0.8, height: 1.5 })\ncone({ color: "#ff0", size: 1, height: 1.5 })\ntorus({ color: "#0f8", radius: 0.8, tube: 0.3 })\npyramid({ color: "#f36", size: 1, height: 1.5 })', 'xuy'),

    H2('逐物体变换'),
    Table(['属性', '说明'], [
      ['position', '[x, y, z] 世界坐标'],
      ['rotate', '[x, y, z] 静态旋转（度）'],
      ['spin', '{ axis: [x,y,z], speed: 圈/秒 } 持续旋转'],
      ['bob', '{ amp, speed } 上下浮动'],
    ]),
    Code('cube({\n  color: "#f60",\n  size: 1.2,\n  position: [-3, 0, 0],\n  spin: { axis: [0, 1, 0], speed: 2 },\n  bob: { amp: 0.5, speed: 0.1 },\n  rotate: [0, 0, 30]\n})', 'xuy'),

    H2('PBR 材质'),
    Code('sphere({ color: "#0cf", size: 1.5, metalness: 0.9, roughness: 0.1 })', 'xuy'),
    Table(['参数', '范围', '含义'], [
      ['metalness', '0~1', '0 绝缘 / 1 金属'],
      ['roughness', '0~1', '0 镜面 / 1 散射'],
    ]),

    H2('纹理'),
    Code('cube({ texture: "examples/textures/checker.png", texScale: 0.5 })', 'xuy'),
    Note('triplanar 投影：按法线选平面从世界坐标算 UV，不需要 UV 化顶点。有接缝伪影。'),

    H2('OBJ 模型'),
    Code('model({ src: "examples/models/cube.obj", color: "#f60", scale: 2, position: [0, 0, 0] })', 'xuy'),
    Warn('只支持 .obj 的 v/f。不支持四边形、材质分组、.mtl。'),

    H2('限制'),
    Ul(
      '只 .obj，不支持 .gltf / .fbx / .stl',
      '无骨骼动画、粒子、物理',
      '无阴影、透明',
      '纹理用 triplanar 近似（有接缝）',
      '光源固定 8 个（GLSL ES 2.0 无动态数组）',
      '法线 per-face 不平滑',
    ),

    Tip('要 glTF / PBR / 骨骼动画 / 粒子 / 音效，用 android-3d-filament/ 路。'),
  )
}
