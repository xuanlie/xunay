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

# ============ devtool ============
swap("    ('core-devtool', 'Devtool', []),", r"""    ('core-devtool', 'Devtool', [
      ('H1','Devtool'),
      ('P','xunay 内置一套调试钩子——devtools 面板靠它工作。你也可以挂钩子做自定义监控。'),
      ('H2','6 个钩子'),
      ('Table',['钩子','触发时机','参数'],[
        ['onSignalCreate','创建 signal 时','signal 函数'],
        ['onSignalSet','写 signal 时','signal, 旧值, 新值, 写入次数'],
        ['onEffectCreate','创建 effect 时','effect 对象'],
        ['onEffectRun','effect 重跑时','effect, 耗时ms'],
        ['onScopeCreate','创建 scope 时','scope 对象'],
        ['onScopeDispose','销毁 scope 时','scope 对象'],
      ]),
      ('H2','挂载钩子'),
      ('Code',"const rt = window.__XUNAY_RUNTIME__\nif (rt && rt.hooks) {\n  rt.hooks.onSignalCreate = s => {\n    console.log('新 signal:', s())\n  }\n  rt.hooks.onEffectRun = (e, ms) => {\n    if (ms > 5) console.warn('慢 effect:', ms.toFixed(2), 'ms')\n  }\n}",'xuy'),
      ('H2','内置 DevTools'),
      ('P','xunay 自带一个调试面板——右下角悬浮按钮，点击打开。'),
      ('Code',"import { openDevtools } from 'xunay/devtools'\n\n// 手动打开\nopenDevtools()\n\n// 或页面加载自动挂按钮（推荐）\nimport 'xunay/devtools'",'xuy'),
      ('H2','devtools 面板内容'),
      ('Table',['Tab','内容'],[
        ['网络','所有 fetch/XHR 请求 + 详情'],
        ['Signals','所有 signal 的值 + 写入历史'],
        ['控制台','log/warn/error + 输入 JS'],
        ['性能','FCP/LCP/请求分解/长任务'],
      ]),
      ('H2','配置开关'),
      ('P','在 package.json 里加 xunay 字段控制是否打包 devtools：'),
      ('Code',"{\n  \"xunay\": {\n    \"devtools\": true\n  }\n}",'json'),
      ('P','`true` 打包并显示；`false` 完全剔除——产物里没有按钮代码。'),
      ('H2','自定义监控'),
      ('P','比如统计每秒 effect 重跑次数：'),
      ('Code',"const rt = window.__XUNAY_RUNTIME__\nlet count = 0\nsetInterval(() => {\n  console.log('effect 重跑频率:', count, '/s')\n  count = 0\n}, 1000)\n\nif (rt && rt.hooks) {\n  rt.hooks.onEffectRun = () => count++\n}",'xuy'),
      ('H2','上报慢 effect'),
      ('Code',"const rt = window.__XUNAY_RUNTIME__\nif (rt && rt.hooks) {\n  rt.hooks.onEffectRun = (e, ms) => {\n    if (ms > 16) {\n      // 超过一帧的耗时\n      fetch('/api/perf', {\n        method: 'POST',\n        body: JSON.stringify({ duration: ms, deps: e.deps.length })\n      })\n    }\n  }\n}",'xuy'),
      ('H2','和 effect 计数结合'),
      ('P','每个 effect 对象上有 runs、totalMs、lastMs 字段：'),
      ('Code',"rt.hooks.onEffectCreate = (e) => {\n  setTimeout(() => {\n    console.log('effect 跑了 ' + e.runs + ' 次，累计 ' + e.totalMs + 'ms')\n  }, 5000)\n}",'xuy'),
      ('H2','完整示例：自定义性能面板'),
      ('Code',"import { div, span, signal, onMount, onUnmount, mount } from 'xunay'\n\nfunction PerfPanel() {\n  const effectRuns = signal(0)\n  const slowEffects = signal(0)\n  const signals = signal(0)\n\n  onMount(() => {\n    const rt = window.__XUNAY_RUNTIME__\n    if (!rt || !rt.hooks) return\n    rt.hooks.onSignalCreate = () => signals(signals() + 1)\n    rt.hooks.onEffectRun = (e, ms) => {\n      effectRuns(effectRuns() + 1)\n      if (ms > 5) slowEffects(slowEffects() + 1)\n    }\n  })\n\n  return div({ class: 'perf' },\n    div(null, 'Signals: ', () => signals()),\n    div(null, 'Effect 重跑: ', () => effectRuns()),\n    div(null, '慢 effect: ', () => slowEffects())\n  )\n}\n\nmount(() => PerfPanel(), '#app')",'xuy'),
    ]),""", "devtool")

# ============ alias ============
swap("    ('core-alias', '别名', []),", r"""    ('core-alias', '别名', [
      ('H1','别名'),
      ('P','xunay 为常用 API 提供短别名——写 .xuy 时更短，写代码更省。'),
      ('H2','8 个别名'),
      ('Table',['全名','别名','用途'],[
        ['signal','s','信号'],
        ['computed','c','派生'],
        ['effect','f','副作用'],
        ['batch','bat','批量'],
        ['mount','app','挂载'],
        ['mount','m','挂载'],
        ['list','l','列表'],
        ['list','each','列表'],
      ]),
      ('H2','用法'),
      ('Code',"import { s, c, f, bat, m, l } from 'xunay'\n\nconst n = s(0)\nconst double = c(() => n() * 2)\n\nf(() => console.log('n =', n()))\n\nbat(() => {\n  n(1)\n  n(2)\n})\n\nm(() => div(null, l([1,2,3], i => i, i => span(null, i))), '#app')",'xuy'),
      ('H2','什么时候用别名'),
      ('Table',['场景','用全名','用别名'],[
        ['.xuy 文件','','✓ 更短'],
        '教程/文档','✓ 更清晰','',
        '大型项目','✓','',
        '代码高尔夫','','✓'],
      ),
      ('H2','同时导入'),
      ('Code',"// 全名和别名可以一起用\nimport { signal, s, computed, c } from 'xunay'\n\nconst a = signal(0)   // 全名\nconst b = s(0)        // 别名\n// a 和 b 都是 signal",'xuy'),
      ('H2','不支持别名的 API'),
      ('P','以下 API 没有别名，必须用全名：'),
      ('Ul',
        'div / span / button / input 等标签工厂',
        'show / frag / F / txt',
        'onMount / onUnmount / ref / ctx / err / lazy / trans',
        'renderToString / hydrate'),
      ('H2','alias 全局注册'),
      ('P','alias 函数可以把 API 挂到全局：'),
      ('Code',"import { alias, signal } from 'xunay'\n\nalias('n', signal)   // 全局可访问 window.n\n\n// 之后\nconst x = n(0)   // 不用 import",'xuy'),
      ('Warn','全局注册会污染 window。除了快速原型，不推荐用。'),
      ('H2','为什么只有这些别名'),
      ('P','xunay 的别名只覆盖"高频 + 短"的 API。标签工厂（div、span）已经很短，不需要别名；生僻 API（trans、lazy）用全名更好读。'),
      ('H2','完整示例'),
      ('Code',"// 用别名写一个计数器\nimport { s, c, f, m, div, button, span } from 'xunay'\n\nconst n = s(0)\nconst double = c(() => n() * 2)\n\nf(() => console.log('n 变了:', n()))\n\nm(() => div(null,\n  button({ on: { click: () => n(v => v - 1) } }, '-'),\n  span(null, () => n()),\n  button({ on: { click: () => n(v => v + 1) } }, '+'),\n  span(null, () => '双倍: ' + double())\n), '#app')",'xuy'),
      ('H2','和原名的对照表'),
      ('Table',['写法','等价'],[
        ['s(0)','signal(0)'],
        ['c(fn)','computed(fn)'],
        ['f(fn)','effect(fn)'],
        ['bat(fn)','batch(fn)'],
        ['m(comp, target)','mount(comp, target)'],
        ['app(comp, target)','mount(comp, target)'],
        ['l(arr, key, fn)','list(arr, key, fn)'],
        ['each(arr, key, fn)','list(arr, key, fn)'],
      ]),
    ]),""", "alias")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("devtool / alias 已填")
