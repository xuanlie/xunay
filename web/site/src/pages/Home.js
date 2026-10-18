// 首页：Hero + 快捷入口 + 特性 + 底部链接
import { div, a, span, button } from '/tmp/xuyg-test/xunay.js'
import { go } from '../router.js'

function copyCmd(e) {
  const cmd = 'npm i xunay'
  if (navigator.clipboard) navigator.clipboard.writeText(cmd)
  const btn = e.currentTarget
  btn.textContent = '已复制'
  setTimeout(() => { btn.textContent = '复制' }, 1200)
}

export function Home() {
  return (() => {
  const _div0 = document.createElement("div")
  _div0.className = 'home'
  const _div1 = document.createElement("div")
  _div1.className = 'home-hero'
  const _div2 = document.createElement("div")
  _div2.className = 'home-logo'
  _div1.appendChild(_div2)
  const _div3 = document.createElement("div")
  _div3.className = 'home-badge'
  _div3.appendChild(document.createTextNode('v1.2.8 · MIT'))
  _div1.appendChild(_div3)
  const _div4 = document.createElement("div")
  _div4.className = 'home-title'
  _div4.appendChild(document.createTextNode('XuNay'))
  _div1.appendChild(_div4)
  const _div5 = document.createElement("div")
  _div5.className = 'home-tagline'
  _div5.appendChild(document.createTextNode('内存最少、速度最快的前端框架'))
  _div1.appendChild(_div5)
  const _div6 = document.createElement("div")
  _div6.className = 'home-cmd'
  const _span7 = document.createElement("span")
  _span7.className = 'home-cmd-prompt'
  _span7.appendChild(document.createTextNode('$'))
  _div6.appendChild(_span7)
  const _span8 = document.createElement("span")
  _span8.className = 'home-cmd-text'
  _span8.appendChild(document.createTextNode('npm i xunay'))
  _div6.appendChild(_span8)
  const _button9 = document.createElement("button")
  _button9.className = 'home-cmd-copy'
  _button9.addEventListener("click", copyCmd)
  _button9.appendChild(document.createTextNode('复制'))
  _div6.appendChild(_button9)
  _div1.appendChild(_div6)
  const _div10 = document.createElement("div")
  _div10.className = 'home-cta'
  const _button11 = document.createElement("button")
  _button11.className = 'home-btn primary'
  _button11.addEventListener("click", () => go('/03-quickstart'))
  _button11.appendChild(document.createTextNode('快速开始'))
  _div10.appendChild(_button11)
  const _a12 = document.createElement("a")
  _a12.className = 'home-btn'
  _a12.setAttribute("href", 'https://github.com/xuanlie/xunay')
  _a12.setAttribute("target", '_blank')
  _a12.appendChild(document.createTextNode('GitHub'))
  _div10.appendChild(_a12)
  _div1.appendChild(_div10)
  _div0.appendChild(_div1)
  const _div13 = document.createElement("div")
  _div13.className = 'home-grid'
  const _div14 = document.createElement("div")
  _div14.className = 'home-card'
  _div14.addEventListener("click", () => go('/01-overview'))
  const _div15 = document.createElement("div")
  _div15.className = 'home-card-icon'
  _div15.appendChild(document.createTextNode('📖'))
  _div14.appendChild(_div15)
  const _div16 = document.createElement("div")
  _div16.className = 'home-card-title'
  _div16.appendChild(document.createTextNode('文档'))
  _div14.appendChild(_div16)
  const _div17 = document.createElement("div")
  _div17.className = 'home-card-desc'
  _div17.appendChild(document.createTextNode('从安装到 API，完整参考'))
  _div14.appendChild(_div17)
  const _div18 = document.createElement("div")
  _div18.className = 'home-card-arrow'
  _div18.appendChild(document.createTextNode('→'))
  _div14.appendChild(_div18)
  _div13.appendChild(_div14)
  const _a19 = document.createElement("a")
  _a19.className = 'home-card'
  _a19.setAttribute("href", '/playground/')
  _a19.setAttribute("target", '_blank')
  const _div20 = document.createElement("div")
  _div20.className = 'home-card-icon'
  _div20.appendChild(document.createTextNode('⚡'))
  _a19.appendChild(_div20)
  const _div21 = document.createElement("div")
  _div21.className = 'home-card-title'
  _div21.appendChild(document.createTextNode('Playground'))
  _a19.appendChild(_div21)
  const _div22 = document.createElement("div")
  _div22.className = 'home-card-desc'
  _div22.appendChild(document.createTextNode('在线写代码，实时预览'))
  _a19.appendChild(_div22)
  const _div23 = document.createElement("div")
  _div23.className = 'home-card-arrow'
  _div23.appendChild(document.createTextNode('→'))
  _a19.appendChild(_div23)
  _div13.appendChild(_a19)
  const _a24 = document.createElement("a")
  _a24.className = 'home-card'
  _a24.setAttribute("href", '/examples/')
  _a24.setAttribute("target", '_blank')
  const _div25 = document.createElement("div")
  _div25.className = 'home-card-icon'
  _div25.appendChild(document.createTextNode('🧩'))
  _a24.appendChild(_div25)
  const _div26 = document.createElement("div")
  _div26.className = 'home-card-title'
  _div26.appendChild(document.createTextNode('案例'))
  _a24.appendChild(_div26)
  const _div27 = document.createElement("div")
  _div27.className = 'home-card-desc'
  _div27.appendChild(document.createTextNode('100+ 可运行示例'))
  _a24.appendChild(_div27)
  const _div28 = document.createElement("div")
  _div28.className = 'home-card-arrow'
  _div28.appendChild(document.createTextNode('→'))
  _a24.appendChild(_div28)
  _div13.appendChild(_a24)
  const _a29 = document.createElement("a")
  _a29.className = 'home-card ai-card'
  _a29.setAttribute("href", '/AI.spec')
  _a29.setAttribute("target", '_blank')
  __rt__.applyStyle(_a29, 'background:linear-gradient(135deg,#f0f7ff,#eef4ff);border-color:#93c5fd')
  const _div30 = document.createElement("div")
  _div30.className = 'home-card-icon'
  _div30.appendChild(document.createTextNode('🤖'))
  _a29.appendChild(_div30)
  const _div31 = document.createElement("div")
  _div31.className = 'home-card-title'
  _div31.appendChild(document.createTextNode('AI.spec'))
  _a29.appendChild(_div31)
  const _div32 = document.createElement("div")
  _div32.className = 'home-card-desc'
  _div32.appendChild(document.createTextNode('AI 专用文档 · 让 AI 秒懂 XuNay'))
  _a29.appendChild(_div32)
  const _div33 = document.createElement("div")
  _div33.className = 'home-card-arrow'
  _div33.appendChild(document.createTextNode('→'))
  _a29.appendChild(_div33)
  _div13.appendChild(_a29)
  _div0.appendChild(_div13)
  const _div34 = document.createElement("div")
  _div34.className = 'home-section-title'
  _div34.appendChild(document.createTextNode('为什么选 XuNay'))
  _div0.appendChild(_div34)
  const _div35 = document.createElement("div")
  _div35.className = 'home-features'
  const _div36 = document.createElement("div")
  _div36.className = 'home-feature'
  const _div37 = document.createElement("div")
  _div37.className = 'home-feature-num'
  _div37.appendChild(document.createTextNode('4.86KB'))
  _div36.appendChild(_div37)
  const _div38 = document.createElement("div")
  _div38.className = 'home-feature-label'
  _div38.appendChild(document.createTextNode('核心 gzip'))
  _div36.appendChild(_div38)
  _div35.appendChild(_div36)
  const _div39 = document.createElement("div")
  _div39.className = 'home-feature'
  const _div40 = document.createElement("div")
  _div40.className = 'home-feature-num'
  _div40.appendChild(document.createTextNode('0'))
  _div39.appendChild(_div40)
  const _div41 = document.createElement("div")
  _div41.className = 'home-feature-label'
  _div41.appendChild(document.createTextNode('虚拟 DOM'))
  _div39.appendChild(_div41)
  _div35.appendChild(_div39)
  const _div42 = document.createElement("div")
  _div42.className = 'home-feature'
  const _div43 = document.createElement("div")
  _div43.className = 'home-feature-num'
  _div43.appendChild(document.createTextNode('Signal'))
  _div42.appendChild(_div43)
  const _div44 = document.createElement("div")
  _div44.className = 'home-feature-label'
  _div44.appendChild(document.createTextNode('细粒度更新'))
  _div42.appendChild(_div44)
  _div35.appendChild(_div42)
  const _div45 = document.createElement("div")
  _div45.className = 'home-feature'
  const _div46 = document.createElement("div")
  _div46.className = 'home-feature-num'
  _div46.appendChild(document.createTextNode('5 行'))
  _div45.appendChild(_div46)
  const _div47 = document.createElement("div")
  _div47.className = 'home-feature-label'
  _div47.appendChild(document.createTextNode('起步代码'))
  _div45.appendChild(_div47)
  _div35.appendChild(_div45)
  _div0.appendChild(_div35)
  const _div48 = document.createElement("div")
  _div48.className = 'home-links'
  const _a49 = document.createElement("a")
  _a49.setAttribute("href", 'https://npmjs.com/package/xunay')
  _a49.setAttribute("target", '_blank')
  _a49.appendChild(document.createTextNode('npm'))
  _div48.appendChild(_a49)
  const _span50 = document.createElement("span")
  _span50.className = 'home-link-sep'
  _span50.appendChild(document.createTextNode('·'))
  _div48.appendChild(_span50)
  const _a51 = document.createElement("a")
  _a51.setAttribute("href", 'https://github.com/xuanlie/xunay')
  _a51.setAttribute("target", '_blank')
  _a51.appendChild(document.createTextNode('GitHub'))
  _div48.appendChild(_a51)
  const _span52 = document.createElement("span")
  _span52.className = 'home-link-sep'
  _span52.appendChild(document.createTextNode('·'))
  _div48.appendChild(_span52)
  const _a53 = document.createElement("a")
  _a53.setAttribute("href", 'https://github.com/xuanlie/xunay/blob/main/LICENSE')
  _a53.setAttribute("target", '_blank')
  _a53.appendChild(document.createTextNode('MIT License'))
  _div48.appendChild(_a53)
  _div0.appendChild(_div48)
  return _div0
})()
}
