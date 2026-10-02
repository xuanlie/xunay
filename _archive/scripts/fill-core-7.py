#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

# ============ lazy ============
swap("    ('core-lazy', 'lazy', []),", r"""    ('core-lazy', 'lazy', [
      ('H1','lazy'),
      ('P','lazy 是"延迟加载的组件"——第一次渲染时才加载模块，加载期间显示空，加载完再渲染。类似 React.lazy + Suspense。'),
      ('H2','基础用法'),
      ('Code',"import { lazy } from 'xunay'\n\nconst HeavyChart = lazy(() => import('./Chart.js'))\n\n// 用的时候\ndiv(null, HeavyChart({ data }))",'xuy'),
      ('H2','工作流程'),
      ('P','1. 第一次调用 HeavyChart 时触发 loader；2. loader 返回 Promise；3. 加载期间返回 null；4. 加载完拿到组件，重新渲染。'),
      ('H2','加载失败'),
      ('P','loader 拒绝时错误会抛出，用 err 捕获或让父级处理。'),
      ('Code',"import { lazy, err, div } from 'xunay'\n\nconst Lazy = lazy(() => import('./Missing.js'))\n\nerr(() => Lazy({}), () => div(null, '模块加载失败'))",'xuy'),
      ('H2','加载中状态'),
      ('P','lazy 不内置加载态。要显示 loading，包一层：'),
      ('Code',"import { lazy, signal, show, div, span } from 'xunay'\n\nconst loading = signal(true)\nconst Heavy = lazy(() => {\n  return import('./Heavy.js').then(m => {\n    loading(false)\n    return m\n  })\n})\n\ndiv(null,\n  show(() => loading(), () => span(null, '加载中...')),\n  () => loading() ? null : Heavy({})\n)",'xuy'),
      ('H2','路由懒加载'),
      ('Code',"const pages = {\n  '/': lazy(() => import('./pages/Home.js')),\n  '/about': lazy(() => import('./pages/About.js')),\n  '/todo': lazy(() => import('./pages/Todo.js'))\n}\n\nfunction Router() {\n  return div(null, () => {\n    const Page = pages[route()]\n    return Page ? Page({}) : div(null, '404')\n  })\n}",'xuy'),
      ('H2','为什么有用'),
      ('Table',['场景','不用 lazy','用 lazy'],[
        ['首屏体积','全部打进去','只打首屏'],
        ['加载时机','立即','用到才加载'],
        ['首屏速度','慢','快'],
        ['后续切换','无延迟','可能有延迟'],
      ]),
      ('H2','与代码分割配合'),
      ('P','lazy 配合动态 import 才能触发代码分割。esbuild / vite 看到 import() 会拆成独立 chunk。'),
      ('Code',"// 静态引入：打进同一个 bundle\nimport { Heavy } from './Heavy.js'\n\n// 动态引入：拆成独立文件\nconst Heavy = lazy(() => import('./Heavy.js'))",'xuy'),
      ('H2','实现原理'),
      ('Code',"// 简化的 lazy 实现\nfunction lazy(loader) {\n  const comp = signal(null)\n  const error = signal(null)\n  let started = false\n  return function Lazy(...args) {\n    if (!started) {\n      started = true\n      loader().then(m => comp(m.default || m)).catch(e => error(e))\n    }\n    if (error()) throw error()\n    const c = comp()\n    return c ? c(...args) : null\n  }\n}",'js'),
      ('H2','完整示例：按需加载图表'),
      ('Code',"import { lazy, div, button, signal, show, span, mount } from 'xunay'\n\nconst showChart = signal(false)\nconst loading = signal(false)\n\nconst Chart = lazy(() => {\n  loading(true)\n  return import('./Chart.js').then(m => {\n    loading(false)\n    return m\n  })\n})\n\nmount(() => div(null,\n  button({ on: { click: () => showChart(true) } }, '显示图表'),\n  show(() => loading(), () => span(null, '加载中...')),\n  show(() => showChart(), () => Chart({ data: [1, 2, 3] }))\n), '#app')",'xuy'),
      ('H2','常见陷阱'),
      ('H3','陷阱 1：loader 立即执行了'),
      ('Code',"// 错误：loader 立即执行\nconst Heavy = lazy(import('./Heavy.js'))\n\n// 正确：传函数\nconst Heavy = lazy(() => import('./Heavy.js'))",'xuy'),
      ('H3','陷阱 2：加载中返回 null 导致布局跳动'),
      ('Code',"// 错误：加载完布局跳动\ndiv(null, () => loading() ? null : Heavy({}))\n\n// 正确：占位保持尺寸\ndiv({ style: { minHeight: '200px' } },\n  () => loading() ? span(null, '加载中') : Heavy({})\n)",'xuy'),
    ]),""", "lazy")

# ============ trans ============
swap("    ('core-trans', 'trans', []),", r"""    ('core-trans', 'trans', [
      ('H1','trans'),
      ('P','trans 是内置的过渡助手——返回一对 enter / leave 方法，用在 onMount / onUnmount 里做淡入淡出动画。'),
      ('H2','基础用法'),
      ('Code',"import { trans, div, onMount, onUnmount } from 'xunay'\n\nconst fade = trans(200)   // 200ms\n\ndiv(null, '内容')   // 在这个元素上用 fade.enter / fade.leave",'xuy'),
      ('H2','trans 返回什么'),
      ('Code',"const fade = trans(300)\n// 返回：\n{\n  enter(el) { ... },        // 元素出现时调用\n  leave(el, done) { ... }   // 元素消失时调用\n}",'js'),
      ('H2','enter'),
      ('P','设置 opacity: 0，下一帧改 opacity: 1——触发 CSS transition 淡入。'),
      ('Code',"enter(el) {\n  el.style.transition = 'opacity 200ms ease'\n  el.style.opacity = '0'\n  requestAnimationFrame(() => { el.style.opacity = '1' })\n}",'js'),
      ('H2','leave'),
      ('P','设置 opacity: 0，动画结束后调用 done 回调。'),
      ('Code',"leave(el, done) {\n  el.style.transition = 'opacity 200ms ease'\n  el.style.opacity = '0'\n  setTimeout(done, 200)\n}",'js'),
      ('H2','完整用法'),
      ('Code',"import { trans, div, onMount, onUnmount, signal, show, button, mount } from 'xunay'\n\nfunction Modal() {\n  const fade = trans(300)\n  const open = signal(false)\n\n  return div(null,\n    button({ on: { click: () => open(!open()) } }, '切换'),\n    show(() => open(), () => {\n      const overlay = div({ class: 'overlay' }, '模态框')\n      onMount(() => fade.enter(overlay))\n      onUnmount(() => {\n        fade.leave(overlay, () => {})\n      })\n      return overlay\n    })\n  )\n}\n\nmount(() => Modal(), '#app')",'xuy'),
      ('H2','show 的过渡限制'),
      ('Warn','show 切换是同步的——leave 阶段元素已经被移除，动画看不到。需要真过渡时手动控制挂载：'),
      ('Code',"const open = signal(false)\nconst visible = signal(false)\n\nfunction toggle() {\n  if (open()) {\n    open(false)\n    setTimeout(() => visible(false), 300)\n  } else {\n    visible(true)\n    requestAnimationFrame(() => open(true))\n  }\n}\n\ndiv(null,\n  button({ on: { click: toggle } }, '切换'),\n  show(() => visible(), () => {\n    const el = div({ class: () => 'modal' + (open() ? ' in' : '') }, '内容')\n    return el\n  })\n)",'xuy'),
      ('P','配合 CSS：.modal { opacity: 0; transition: opacity .3s } .modal.in { opacity: 1 }。'),
      ('H2','用 CSS 替代 trans'),
      ('P','大多数场景不需要 trans——纯 CSS 更简单：'),
      ('Code',".fade-enter { opacity: 0 }\n.fade-enter-active { opacity: 1; transition: opacity .3s }",'css'),
      ('P','用 class 切换即可。trans 适合需要 JS 精确控制时机的场景。'),
      ('H2','完整示例：列表项淡入'),
      ('Code',"import { div, ul, li, list, onMount, signal, button, mount } from 'xunay'\n\nfunction List() {\n  const items = signal([1, 2, 3])\n\n  return div(null,\n    button({ on: { click: () => items(list => [...list, list.length + 1]) } }, '添加'),\n    ul(null,\n      list(items, i => i, i => {\n        const el = li({ class: 'item-enter' }, '项目 ' + i)\n        onMount(() => {\n          requestAnimationFrame(() => el.classList.add('item-enter-active'))\n        })\n        return el\n      })\n    )\n  )\n}\n\nmount(() => List(), '#app')",'xuy'),
      ('Code',".item-enter { opacity: 0; transform: translateX(-20px) }\n.item-enter-active { opacity: 1; transform: none; transition: all .3s }",'css'),
    ]),""", "trans")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("lazy / trans 已填")
