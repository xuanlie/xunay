// 虚拟列表
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("虚拟列表"),
    P("10000 项列表——只渲染可见的 50 项。"),
    H2("代码"),
    Code("import { div, h1, span, signal, computed, list, onMount, onUnmount, mount } from 'xunay'\n\nconst ITEM_H = 32\nconst PAGE_SIZE = 50\nconst BUFFER = 5\n\nconst all = signal(Array.from({ length: 10000 }, (_, i) => ({\n  id: i + 1,\n  title: '第 ' + (i + 1) + ' 项'\n})))\n\nconst scrollTop = signal(0)\nconst viewportH = signal(500)\n\nconst startIdx = computed(() => Math.max(0, Math.floor(scrollTop() / ITEM_H) - BUFFER))\nconst endIdx = computed(() => Math.min(all().length, Math.ceil((scrollTop() + viewportH()) / ITEM_H) + BUFFER))\n\nconst visible = computed(() => all().slice(startIdx(), endIdx()))\nconst offsetY = computed(() => startIdx() * ITEM_H)\nconst totalH = computed(() => all().length * ITEM_H)\n\nconst container = ref()\nfunction ref() { let v; return function(x) { if (arguments.length) v = x; return v } }\n\nonMount(() => {\n  const el = document.querySelector('.vl-container')\n  if (!el) return\n  const onScroll = () => scrollTop(el.scrollTop)\n  el.addEventListener('scroll', onScroll)\n  onUnmount(() => el.removeEventListener('scroll', onScroll))\n})\n\nmount(() => div({ class: 'vl' },\n  h1(null, '虚拟列表'),\n  div(null, () => '共 ' + all().length + ' 项，渲染 ' + (endIdx() - startIdx()) + ' 项'),\n  div({\n    class: 'vl-container',\n    style: 'height: 500px; overflow-y: auto; position: relative'\n  },\n    div({\n      class: 'vl-spacer',\n      style: () => 'height: ' + totalH() + 'px; position: relative'\n    },\n      div({\n        class: 'vl-window',\n        style: () => 'transform: translateY(' + offsetY() + 'px)'\n      },\n        list(visible, i => i.id, i =>\n          div({\n            class: 'vl-item',\n            style: 'height: ' + ITEM_H + 'px; line-height: ' + ITEM_H + 'px'\n          }, i.title)\n        )\n      )\n    )\n  )\n), '#app')", "xuy"),
    H2("原理"),
    Ul("10 万个数据全在内存","DOM 只渲染可视区的 ±5 项","滚动时更新 startIdx / endIdx","用 transform 位移可见区域"),
  )
}
