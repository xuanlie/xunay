// 速查 · UI
import { D, H1, H2, P, Code, Table, Tip } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('速查 · UI'),
    P('HTML 标签 / 属性 / 事件 / CSS 全部速查。'),

    H2('HTML 标签'),
    Table(['标签', 'Android 生成'], [
      ['div section main aside nav header footer', 'LinearLayout'],
      ['span p h1~h6 label', 'TextView'],
      ['button', 'Button'],
      ['input textarea', 'EditText'],
      ['input type=checkbox', 'CheckBox'],
      ['input type=radio', 'RadioButton'],
      ['input type=switch', 'Switch'],
      ['img', 'ImageView'],
      ['progress', 'ProgressBar'],
      ['slider', 'SeekBar'],
      ['ul ol li', 'LinearLayout'],
      ['table tr td th', 'LinearLayout / TextView'],
      ['a', 'TextView'],
      ['select', 'android.widget.Spinner'],
      ['option', '（进 Spinner 的 ArrayAdapter）'],
      ['form', 'LinearLayout'],
      ['video audio', 'android.widget.VideoView'],
      ['hr', 'View'],
    ]),

    H2('元素创建'),
    Code(`div(null, '内容')
div({ class: 'box' }, '内容')
div({ class: () => cond() ? 'on' : 'off' }, '内容')
button({ on: { click: () => n(1) } }, '点我')
input({ placeholder: '请输入', value: () => text() })
img({ src: 'a.png' })`, 'js'),

    H2('事件'),
    Table(['on.xxx', '转 Android'], [
      ['click', 'setOnClickListener'],
      ['input', 'TextWatcher'],
      ['change', 'OnCheckedChange / Spinner'],
      ['submit', 'button type=submit 自动'],
      ['blur / focus', 'setOnFocusChangeListener'],
      ['keydown / keyup', 'setOnKeyListener'],
      ['scroll', 'setOnScrollChangeListener'],
      ['mousedown / up', 'setOnTouchListener'],
      ['touchstart / end', 'setOnTouchListener'],
    ]),
    Code(`button({ on: {
  click: () => n(1),
  focus: () => focused(true),
  blur: () => focused(false)
} }, '按钮')`, 'js'),

    H2('属性'),
    Code(`div({
  class: 'box',
  id: 'main',
  style: () => ({ width: n() + '%' })
})
input({ value: () => text(), on: { input: e => text(e.target.value) } })
input({ disabled: () => !ok() })
img({ src: 'a.png', alt: '图' })
a({ href: 'page' }, '链接')
input({ type: 'checkbox', checked: () => agree() })`, 'js'),

    H2('CSS · 尺寸'),
    Code(`.a { width: 100px; height: 50%; padding: 8px; margin: 4px; }
.b { width: wrap; height: match; }
.c { gap: 8px; row-gap: 4px; }`, 'css'),

    H2('CSS · 颜色'),
    Code(`.a { color: #fff; background: #2563eb; }
.b { background: linear-gradient(90deg, #f00, #00f); }
.c { background-image: linear-gradient(...); }
.d { border-radius: 8px; border: 1px solid #000; }
.e { outline: 3px solid #f00; }`, 'css'),

    H2('CSS · 字体文本'),
    Code(`.a { font-size: 16px; font-weight: bold; font-family: monospace; }
.b { line-height: 1.5; letter-spacing: 0.1em; }
.c { text-align: center; text-transform: uppercase; }
.d { text-overflow: ellipsis; white-space: nowrap; }
.e { text-shadow: 2px 2px 4px #000; }`, 'css'),

    H2('CSS · 布局'),
    Code(`.a { display: flex; flex-direction: row; flex-wrap: wrap;
     justify-content: center; align-items: center; gap: 8px; }
.b { flex: 1; }
.c { display: grid; grid-template-columns: repeat(3, 1fr); }`, 'css'),

    H2('CSS · 定位'),
    Code(`.a { position: relative; top: 10px; left: 20px; }
.b { position: absolute; top: 0; right: 0; z-index: 5; }
.c { position: fixed; inset: 0; }`, 'css'),

    H2('CSS · 视觉'),
    Code(`.a { opacity: 0.8; visibility: hidden; }
.b { box-shadow: 0 4px 8px; }
.c { transform: rotate(20deg) scale(1.2) translate(10px, 20px); }
.d { overflow: hidden; }
.e { filter: grayscale(100%) brightness(1.2) blur(4px); }
.f { backdrop-filter: blur(10px); }`, 'css'),

    H2('CSS · 动画'),
    Code(`.a { animation: x-fade 0.3s; }
.b { animation: x-scale 0.5s; }
.c { animation: x-slide-up 0.3s; }
.d { animation: x-skeleton 1s infinite; }

@keyframes myAnim {
  0%   { opacity: 0; }
  50%  { opacity: 1; }
  100% { opacity: 0; }
}`, 'css'),

    H2('CSS · 交互'),
    Code(`.a { background: #2563eb; }
.a:active { background: #1d4ed8; }       /* 按下变色 */
.b { background: #16a34a; }
.b:active { opacity: 0.5; }              /* 按下变淡 */`, 'css'),

    H2('CSS · 自定义字体'),
    Code(`@font-face {
  font-family: 'MyFont';
  src: url('examples/assets/fonts/my.ttf');
}
.title { font-family: 'MyFont'; }`, 'css'),

    H2('CSS · background-size / position'),
    Code(`.a { background-size: cover; }
.b { background-size: contain; }
.c { background-size: 100% 100%; }
.d { background-position: top left; }
.e { background-position: bottom center; }
.f { background-position: 100% 0%; }`, 'css'),

    H2('CSS · 伪类 / 伪元素'),
    Code(`.a:active { }           /* 按下 */
.a:first-child { }        /* 第一个 */
.a:last-child { }         /* 最后一个 */
.a::before { content: '●'; }  /* 生成独立 View */
.a::after  { content: '▸'; }`, 'css'),

    H2('CSS · 变量 / 媒体查询'),
    Code(`:root { --primary: #2563eb; }
.btn { color: var(--primary); }

@media (prefers-color-scheme: dark) { body { background: #111; } }
@media (orientation: landscape) { .a { flex-direction: row; } }
@media (min-width: 600px) { .a { width: 50%; } }`, 'css'),

    H2('下拉框'),
    Code(`select(null,
  option({ value: 'a' }, '选项 A'),
  option({ value: 'b', selected: true }, '选项 B'),
  option({ value: 'c' }, '选项 C')
)`, 'js'),

    Tip('CSS 支持 70+ 项，完整列表看 tool-android-css 文档。'),
  )
}
