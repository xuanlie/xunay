// 速查 · 3D 老路
import { D, H1, H2, P, Code, Table, Tip } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('速查 · 3D 老路'),
    P('OpenGL ES 2.0 手写路，只吃 .obj。所有 DSL 速查。'),

    H2('scene'),
    Code(`scene({
  bg: '#1a1a2e',
  autoRotate: true,
  camera: { distance: 10, fov: 45 },
  lights: [
    { dir: [0.7, 1.0, 0.5], color: '#ffddaa', intensity: 1.2 },
    { dir: [-0.5, 0.3, -1.0], color: '#6699ff', intensity: 1.0 }
  ]
})`, 'xuy'),

    H2('7 种几何体'),
    Code(`cube({ color: '#f60', size: 1, position: [0, 0, 0] })
sphere({ color: '#0cf', size: 1, position: [0, 0, 0], segments: 16 })
plane({ color: '#888', size: 8, position: [0, -1, 0] })
cylinder({ color: '#fc0', size: 0.8, height: 1.5, position: [0, 0, 0] })
cone({ color: '#ff0', size: 1, height: 1.5, position: [0, 0, 0] })
torus({ color: '#0f8', radius: 0.8, tube: 0.3, position: [0, 0, 0] })
pyramid({ color: '#f36', size: 1, height: 1.5, position: [0, 0, 0] })`, 'xuy'),

    H2('逐物体动画'),
    Code(`cube({
  color: '#f60', size: 1.2, position: [-3, 0, 0],
  spin: { axis: [0, 1, 0], speed: 2 },
  bob: { amp: 0.5, speed: 0.1 },
  rotate: [0, 0, 30]
})`, 'xuy'),

    H2('PBR 材质'),
    Code(`sphere({ color: '#0cf', size: 1.5,
  metalness: 0.9,
  roughness: 0.1
})`, 'xuy'),

    H2('纹理'),
    Code(`cube({ texture: 'examples/assets/textures/checker.png', texScale: 0.5 })`, 'xuy'),

    H2('OBJ 模型'),
    Code(`model({ src: 'examples/assets/models/cube.obj', color: '#f60', scale: 2 })`, 'xuy'),

    H2('运行'),
    Code(`node bin/xuyc.js scene.xuy --target=3d --out build/3d --build`, 'bash'),

    Tip('3D 老路只支持 .obj。要 glTF / PBR / 骨骼动画 / 粒子 / 音效，走 Filament 路。'),
  )
}
