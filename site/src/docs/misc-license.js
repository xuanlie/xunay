// 许可
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("许可"),
    H2("MIT License"),
    P("xunay 使用 MIT 协议——最宽松的开源协议之一。"),
    H2("你可以"),
    Ul("商用","修改源码","分发","私有使用","再许可"),
    H2("你必须"),
    Ul("保留版权声明","保留许可声明"),
    H2("你不必"),
    Ul("开源你的修改","提供担保","承担任何责任"),
    H2("完整文本"),
    Code("MIT License\n\nCopyright (c) 2024 XuNay\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.", "txt"),
    H2("第三方"),
    P("xunay 核心零依赖。可选模块可能引第三方："),
    Table(["模块","依赖"], [["core","无"],["kit","无"],["devtools","无"],["compiler2","esbuild（构建时）"],["backends/python","fastapi / pydantic / granian"]]),
  )
}
