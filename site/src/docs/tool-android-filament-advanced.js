// Filament 高级功能
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Filament 高级功能"),
    H2("模型实例化"),
    Code("model({\n  src: \"x.gltf\",\n  count: 12,\n  spread: 20,\n  spreadY: 4\n})", "xuy"),
    P("生成 N 份独立 node + N 份 animation，随机散布，每个独立播动画。"),
    Table(["参数","说明"], [["count","份数，默认 1"],["spread","XZ 散布范围"],["spreadY","Y 散布范围"]]),
    H2("粒子系统"),
    Code("particles({\n  count: 200,\n  spread: 10,\n  spreadY: 8,\n  size: 0.15,\n  color: \"#ffcc00\",\n  gravity: -3,\n  speed: 4,\n  life: 4\n})", "xuy"),
    Table(["参数","说明"], [["count","粒子数，默认 50"],["spread / spreadY","散布范围"],["size","球半径"],["gravity","重力，负值下落"],["speed","初速度"],["life","寿命秒"]]),
    H2("音效"),
    Code("audio({\n  name: \"ding\",\n  src: \"examples/audios/ding.wav\",\n  autoplay: true,\n  volume: 0.8\n})", "xuy"),
    P("MediaPlayer + AssetFileDescriptor。运行时 playAudio / pauseAudio / stopAudio / setAudioVolume。"),
    H2("远程 glTF 加载"),
    Code("model({ src: \"https://example.com/model.gltf\", normalize: true })", "xuy"),
    P("CLI 检测 https:// 前缀自动下载 .gltf + 依赖 .bin / 纹理到 .xunay-cache/remote/。支持 .gltf 和 .glb。"),
    H2("模型归一化"),
    Code("model({ src: \"x.gltf\", normalize: true, targetSize: 3 })", "xuy"),
    P("编译时算 bbox，最长维度缩到 targetSize（默认 2），中心移到原点。相机距离也自动算。"),
    H2("多动画 + 阴影"),
    Code("model({ src: \"x.gltf\", anim: 2 })\nscene({ shadows: true })", "xuy"),
  )
}
