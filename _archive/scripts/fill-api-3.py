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

swap("    ('api-trans', 'trans(duration)', []),", r"""    ('api-trans', 'trans(duration)', [
      ('H1','trans(duration)'),
      ('P','创建过渡助手——返回 enter / leave 两个方法。'),
      ('H2','签名'),
      ('Code','const t = trans(200)','js'),
      ('H2','返回值'),
      ('Table',['方法','参数','行为'],[
        ['t.enter(el)','DOM 元素','淡入'],
        ['t.leave(el, done)','元素 + 回调','淡出后调 done'],
      ]),
      ('H2','示例'),
      ('Code',"import { trans, div, onMount, onUnmount } from 'xunay'\n\nconst fade = trans(200)\n\nconst el = div(null, '内容')\nonMount(() => fade.enter(el))\nonUnmount(() => fade.leave(el, () => {}))",'xuy'),
      ('H2','实现'),
      ('Code',"function trans(d) {\n  return {\n    enter(el) {\n      el.style.transition = 'opacity ' + d + 'ms'\n      el.style.opacity = '0'\n      requestAnimationFrame(() => el.style.opacity = '1')\n    },\n    leave(el, done) {\n      el.style.transition = 'opacity ' + d + 'ms'\n      el.style.opacity = '0'\n      setTimeout(done, d)\n    }\n  }\n}",'js'),
      ('H2','注意'),
      ('P','show 切换是同步的——leave 阶段元素已被移除。需要真过渡时手动控制挂载。'),
    ]),""", "api-trans")

swap("    ('api-renderToString', 'renderToString', []),", r"""    ('api-renderToString', 'renderToString', [
      ('H1','renderToString'),
      ('P','服务端把 vnode 转成 HTML 字符串。'),
      ('H2','签名'),
      ('Code','import { renderToString } from "xunay/ssr"\nconst html = renderToString(vnode)','js'),
      ('H2','示例'),
      ('Code',"import { renderToString, div, h1, p } from 'xunay/ssr'\n\nconst html = renderToString(\n  div({ class: 'app' },\n    h1(null, '标题'),\n    p(null, '正文')\n  )\n)\n// '<div class=\"app\"><h1>标题</h1><p>正文</p></div>'",'xuy'),
      ('H2','不支持'),
      ('Ul',
        'onMount / onUnmount',
        'effect（不收集）',
        '事件绑定',
        'ref'),
      ('H2','限制'),
      ('P','服务端环境没有 document / window。所有用到它们的代码都要判断 typeof window。'),
    ]),""", "api-renderToString")

swap("    ('api-hydrate', 'hydrate', []),", r"""    ('api-hydrate', 'hydrate', [
      ('H1','hydrate'),
      ('P','客户端接管 SSR 渲染的 DOM。'),
      ('H2','签名'),
      ('Code','import { hydrate } from "xunay/ssr"\nhydrate(comp, target)','js'),
      ('H2','示例'),
      ('Code',"import { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nhydrate(App(), '#app')",'xuy'),
      ('H2','行为'),
      ('Table',['DOM 和 vnode','处理'],[
        ['一致','复用 + 挂事件'],
        ['不一致','警告 + 重建'],
      ]),
      ('H2','vs mount'),
      ('Table',['','mount','hydrate'],[
        ['目标','空容器','有内容'],
        ['行为','清空 + 创建','复用'],
      ]),
      ('H2','陷阱'),
      ('P','容器必须已有 SSR 内容。空容器用 mount。'),
    ]),""", "api-hydrate")

swap("    ('api-tag', 'tag(name)', []),", r"""    ('api-tag', 'tag(name)', [
      ('H1','tag(name)'),
      ('P','生成自定义标签工厂。'),
      ('H2','签名'),
      ('Code','const video = tag("video")','js'),
      ('H2','示例'),
      ('Code',"import { tag } from 'xunay'\n\nconst video = tag('video')\nconst canvas = tag('canvas')\n\nvideo({ src: '/a.mp4', controls: true })\ncanvas({ width: 800, height: 600 })",'xuy'),
      ('H2','vs createElement'),
      ('Table',['','tag','createElement'],[
        ['用法','tag("video")(props)','createElement("video", props)'],
        ['复用','可缓存工厂','每次调用'],
      ]),
    ]),""", "api-tag")

swap("    ('api-createElement', 'createElement', []),", r"""    ('api-createElement', 'createElement', [
      ('H1','createElement'),
      ('P','底层 vnode 创建函数。'),
      ('H2','签名'),
      ('Code','createElement(type, props, ...children)','js'),
      ('H2','示例'),
      ('Code',"import { createElement } from 'xunay'\n\ncreateElement('div', { class: 'card' },\n  createElement('h1', null, '标题'),\n  createElement('p', null, '正文')\n)",'xuy'),
      ('H2','返回值'),
      ('Code',"{\n  [ELEMENT]: true,\n  type: 'div',\n  props: { class: 'card' },\n  children: [...],\n}",'js'),
      ('H2','说明'),
      ('P','一般不用直接调——用标签工厂 div/span/button 更短。'),
    ]),""", "api-createElement")

swap("    ('api-tags', 'tags 对象', []),", r"""    ('api-tags', 'tags 对象', [
      ('H1','tags 对象'),
      ('P','所有内置标签工厂的集合。'),
      ('H2','结构'),
      ('Code',"import { tags } from 'xunay'\n\ntags.div({ class: 'x' }, 'hello')\ntags.span(null, 'world')",'xuy'),
      ('H2','内置标签'),
      ('Code','div span p a button input form label ul ol li\nh1 h2 h3 h4 h5 h6 table thead tbody tr td th\nimg br hr pre code blockquote','txt'),
      ('H2','展开'),
      ('Code',"import { tags } from 'xunay'\n\nfor (const name in tags) {\n  console.log(name)\n}",'xuy'),
      ('H2','用途'),
      ('P','动态选择标签时有用：'),
      ('Code',"function Dynamic({ as, ...rest }) {\n  return tags[as](rest, '内容')\n}\nDynamic({ as: 'h1' })",'xuy'),
    ]),""", "api-tags")

swap("    ('api-alias-s', 's 别名', []),", r"""    ('api-alias-s', 's 别名', [
      ('H1','s 别名'),
      ('P','signal 的短别名。'),
      ('H2','等价'),
      ('Code',"import { s, signal } from 'xunay'\ns(0) === signal(0)",'js'),
      ('H2','示例'),
      ('Code',"import { s, div, span } from 'xunay'\n\nconst n = s(0)\n\ndiv(null,\n  span(null, () => String(n())),\n  () => n(v => v + 1)\n)",'xuy'),
    ]),""", "api-alias-s")

swap("    ('api-alias-c', 'c 别名', []),", r"""    ('api-alias-c', 'c 别名', [
      ('H1','c 别名'),
      ('P','computed 的短别名。'),
      ('H2','等价'),
      ('Code',"import { c, computed } from 'xunay'\nc(fn) === computed(fn)",'js'),
      ('H2','示例'),
      ('Code',"import { s, c, div } from 'xunay'\n\nconst n = s(2)\nconst double = c(() => n() * 2)\n\ndiv(null, () => String(double()))",'xuy'),
    ]),""", "api-alias-c")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("API 8 篇已填（trans / renderToString / hydrate / tag / createElement / tags / s / c）")
