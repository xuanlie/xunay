// 3D Filament API
import { D, H1, H2, H3, P, Code, Ul, Tip, Warn, Note, Table } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('3D Filament API'),
    P('android-3d-filament/ 路：Filament 1.51.6，glTF 2.0 + PBR + 骨骼动画 + 粒子 + 音效 + 后处理。'),

    H2('编译'),
    Code('node bin/xuyc-filament.js scene.xuy --out build/filament --build --install\n# 或统一入口\nnode bin/xuyc.js scene.xuy --target=filament --build --install', 'bash'),

    H2('scene —— 全局配置'),
    Code('scene({\n  bg: "#0e1116",\n  autoRotate: true,\n  ibl: 50000,\n  shadows: true,\n  bloom: { strength: 0.5 },\n  ssao: { radius: 0.5, intensity: 1.5 },\n  aa: "fxaa",\n  tonemap: "filmic",\n  camera: { distance: 10, fov: 45 },\n  lights: [\n    { dir: [0.5, -1, -0.3], color: "#ffffff", intensity: 3.0 }\n  ]\n})', 'xuy'),
    Table(['字段', '说明'], [
      ['bg', '背景色'],
      ['autoRotate', '相机绕 Y 自动转'],
      ['ibl', '间接光强度（默认 30000）'],
      ['shadows', '是否开启阴影'],
      ['bloom', '{ strength } 泛光'],
      ['ssao', '{ radius, intensity } 环境光遮蔽'],
      ['aa', '"fxaa" / "none" 抗锯齿'],
      ['tonemap', '"aces" / "filmic" 色调映射'],
      ['camera', '{ distance, fov, center }，不填按 bbox 自动算'],
      ['lights', '方向光 { dir, color, intensity }'],
    ]),

    H2('7 种几何体'),
    P('跟老路一样（cube / sphere / plane / cylinder / cone / torus / pyramid）。参数同。'),
    Code('cube({ color: "#f60", size: 1, spin: { axis: [0, 1, 0], speed: 2 } })\nsphere({ color: "#0cf", size: 1, metalness: 0.9, roughness: 0.1 })\ntorus({ color: "#0f8", radius: 0.8, tube: 0.3 })', 'xuy'),

    H2('外部 glTF / glb'),
    Code('// 本地文件\nmodel({ src: "examples/models/drone.gltf" })\nmodel({ src: "examples/models/box.glb" })\n\n// 远程（构建时自动下载 .bin + 纹理）\nmodel({ src: "https://example.com/scene.gltf" })', 'xuy'),
    Note('支持 Draco 压缩、KHR_texture_transform。自动解析 .bin 和纹理打包进 assets。'),

    H2('model 全部选项'),
    Code('model({\n  src: "x.gltf",\n  position: [0, 0, 0],\n  rotate: [0, 1.57, 0],\n  scale: [1, 1, 1],\n  normalize: true,\n  targetSize: 3,\n  count: 12,\n  spread: 20,\n  spreadY: 4,\n  anim: 0,\n  animSpeed: 1.5\n})', 'xuy'),
    Table(['选项', '说明'], [
      ['normalize', '自动缩到合理大小（推荐用于外部模型）'],
      ['targetSize', '最长维度缩到多少（默认 2）'],
      ['count / spread / spreadY', '实例化 N 份 + 随机散布'],
      ['anim / animSpeed', '播第 N 个动画 + 速率'],
    ]),
    Tip('大模型一定加 normalize: true，否则相机距离会到 617 之类的极端值。'),

    H2('粒子系统'),
    Code('particles({\n  count: 200,\n  spread: 10,\n  spreadY: 8,\n  size: 0.15,\n  color: "#ffcc00",\n  gravity: -3,\n  speed: 4,\n  life: 4,\n  position: [0, 0, 0]\n})', 'xuy'),
    Table(['参数', '默认', '说明'], [
      ['count', '50', '粒子数'],
      ['spread / spreadY', '5 / 5', '初始散布'],
      ['size', '0.1', '球半径'],
      ['gravity', '-9.8', '重力加速度（负值下落）'],
      ['speed', '3', '初速度'],
      ['life', '3', '寿命秒，过期重生'],
    ]),

    H2('音效'),
    Code('audio({\n  name: "ding",\n  src: "examples/audios/ding.wav",\n  autoplay: true,\n  loop: false,\n  volume: 0.8\n})', 'xuy'),
    P('运行时 API（在事件里）：'),
    Code('playAudio("ding")\npauseAudio("ding")\nstopAudio("ding")\nsetAudioVolume("ding", 0.5)', 'xuy'),
    Note('Android 会自动设 STREAM_MUSIC + 强制媒体音量到最大。'),

    H2('纹理'),
    Code('cube({ texture: "examples/textures/checker.png", texScale: 0.5 })', 'xuy'),
    P('程序化几何体走真 UV（TEXCOORD_0）。外部 glTF 的 UV / 法线 / metallicRoughness 全保留。'),

    H2('混合场景'),
    Code('scene({ bg: "#0e1116", lights: [...] })\n\nplane({ color: "#333", size: 20, position: [0, -3, 0] })  // 程序化\ncube({ color: "#f60", size: 1.5, spin: {...} })            // 程序化\nmodel({ src: "drone.gltf", normalize: true })               // 外部\nparticles({ count: 100, color: "#fc0", gravity: -3 })        // 粒子\naudio({ name: "bgm", src: "bgm.mp3", autoplay: true })       // 音效', 'xuy'),

    H2('限制'),
    Table(['项', '状态'], [
      ['KTX2 / webp 纹理', '❌ 只 jpg / png'],
      ['KHR_materials_clearcoat / transmission', '⚠️ 忽略'],
      ['Draco 压缩 glTF', '✅'],
      ['多相机 / 分屏', '❌'],
      ['光照烘焙', '❌'],
      ['阴影', '✅'],
      ['glTF 多动画', '✅ 播所有'],
    ]),
  )
}
