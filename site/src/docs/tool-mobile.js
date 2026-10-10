// mobile 移动端
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("mobile 移动端"),
    P("移动端辅助工具：滚动锁定、设备检测、手势、断点。"),
    H2("引入"),
    Code("import { lockScroll, isMobile, isTouch, breakpoint, swipe, longpress } from 'xunay/mobile'", "js"),
    H2("滚动锁定"),
    P("Modal / Drawer 打开时锁住 body 滚动，关闭时恢复。iOS Safari 也支持（会记录滚动位置）。"),
    Code("const unlock = lockScroll()\n// ... 打开弹窗\nunlock()  // 关闭弹窗时解锁", "js"),
    H2("设备检测"),
    Code("isMobile()    // true / false\nisTouch()     // true / false（触摸设备）", "js"),
    H2("响应式断点"),
    Code("const bp = breakpoint({ sm: 640, md: 768, lg: 1024, xl: 1280 })\n\n// bp.value 是 'xs' | 'sm' | 'md' | 'lg' | 'xl'\neffect(() => {\n  console.log('当前断点:', bp.value)\n})", "js"),
    H2("滑动手势"),
    Code("swipe(el, {\n  onSwipeLeft: () => next(),\n  onSwipeRight: () => prev(),\n  onSwipeUp: () => {},\n  onSwipeDown: () => {},\n  threshold: 50,     // 最小滑动距离\n  timeLimit: 800,    // 超时不算\n})", "js"),
    H2("长按"),
    Code("longpress(el, () => {\n  console.log('长按 500ms 触发')\n}, 500)", "js"),
    H2("内置移动端适配"),
    P("kit 里的组件已经自动适配移动端："),
    Table(["组件","移动端行为"], [["Modal","底部弹出 + 滚动锁定 + ESC 关闭"],["Drawer","全宽 + 滑动关闭"],["Table","横滑容器"],["Tabs","横滑"],["Pagination","简化（上/下页 + 当前页）"],["Form","单列"],["Carousel","左右滑动切换"],["Calendar","左右滑切月"],["Sortable","触摸拖拽"],["SplitPane","触摸拖动"],["Tooltip","点击触发（自动检测触摸设备）"],["Popover","点击触发（自动检测）"]]),
    H2("CSS 移动端适配"),
    P("ui.css 里内置了："),
    Ul("安全区变量 --x-safe-top / --x-safe-bottom / --x-safe-left / --x-safe-right","触摸区最小 44×44px（iOS HIG 建议）","6 个断点（xs / sm / md / lg / xl）","触摸设备去 hover 效果","iOS 100vh 问题（用 100dvh）","输入框 font-size 16px 防止自动缩放"),
    H2("辅助 class"),
    Code("// 隐藏 / 显示\n.hide-mobile    // 移动端隐藏\n.hide-desktop   // 桌面隐藏\n\n// 布局\n.full-height    // 100vh / 100dvh\n.x-swipe        // 横滑容器（scroll-snap）", "css"),
    Tip("用 isTouch() 而不是 window.innerWidth 判断是否触摸设备，更准确。"),
  )
}
