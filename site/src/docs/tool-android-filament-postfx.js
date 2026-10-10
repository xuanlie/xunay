// Filament 后处理
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Filament 后处理"),
    H2("Bloom（泛光）"),
    Code("scene({ bloom: { strength: 0.8 } })", "xuy"),
    H2("SSAO（环境光遮蔽）"),
    Code("scene({ ssao: { radius: 0.5, intensity: 1.5 } })", "xuy"),
    P("物体接触处变暗，立体感强。"),
    H2("抗锯齿"),
    Code("scene({ aa: \"fxaa\" })", "xuy"),
    Table(["值","生成"], [["fxaa","AntiAliasing.FXAA"],["none","NONE"]]),
    H2("色调映射"),
    Code("scene({ tonemap: \"filmic\" })", "xuy"),
    Table(["值","生成"], [["aces","ACES（电影感，默认）"],["filmic","FILMIC（柔和）"]]),
    H2("全部一起"),
    Code("scene({\n  bg: \"#0e1116\",\n  ssao: { radius: 0.5 },\n  aa: \"fxaa\",\n  tonemap: \"filmic\",\n  bloom: { strength: 0.5 }\n})", "xuy"),
  )
}
