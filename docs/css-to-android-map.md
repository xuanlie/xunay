# CSS → Android 映射表

数据来源：
- `site/src/style.css`（文档站样式）
- `core/src/ui.css`（组件库样式）
- `android/src/css-android.js`（翻译层）

## 覆盖率

| 状态 | 数量 | 说明 |
|---|---|---|
| ✅ 支持 | ~60 | 完整映射到原生 |
| ⚠ 部分 | ~8 | 近似处理或简化 |
| ⚪ 忽略 | ~25 | 浏览器专属，Android 无对应 |
| ❌ 未做 | ~10 | 有需求但未实现 |
| **合计** | **~103** | |

---

## 一、盒模型

| CSS | Android | 状态 |
|---|---|---|
| `width` / `height` | `layout_width` / `layout_height`（dp / match_parent / wrap_content） | ✅ |
| `min-width` / `min-height` | `setMinimumWidth` / `setMinimumHeight` | ✅ |
| `max-width` / `max-height` | Java 里近似处理（部分告警） | ⚠ |
| `padding` / `padding-*` | `android:paddingTop/Right/Bottom/Left` | ✅ |
| `margin` / `margin-*` | `android:layout_marginTop/Right/Bottom/Left` | ✅ |

## 二、Flex 布局

| CSS | Android | 状态 |
|---|---|---|
| `display: flex` | `LinearLayout`（默认 `orientation=vertical`） | ✅ |
| `flex-direction: row/column` | `android:orientation` / `app:flexDirection` | ✅ |
| `flex-wrap: wrap` | `FlexboxLayout` + `app:flexWrap` | ✅ |
| `flex: N`（简写） | `layout_weight=N` + `0dp` | ✅ |
| `flex-grow` | `layout_weight` | ✅ |
| `flex-shrink` | 近似（warning） | ⚠ |
| `align-items` | `layout_gravity` / `app:alignItems` | ✅ |
| `align-self` | 未单独处理 | ⚠ |
| `justify-content` | `gravity` / `app:justifyContent` | ✅ |
| `gap` / `row-gap` / `column-gap` | 子元素 `layout_marginLeft` / `marginTop` | ✅ |

## 三、Grid 布局

| CSS | Android | 状态 |
|---|---|---|
| `display: grid` | `FlexboxLayout` | ✅ |
| `grid-template-columns: repeat(N, 1fr)` | 子元素 `app:layout_flexBasisPercent="(100/N)%"` + `layout_width="0dp"` | ✅ |
| `grid-template-rows` | 部分支持 | ⚠ |
| `grid-auto-flow` / `grid-template-areas` | 未实现 | ❌ |

## 四、定位

| CSS | Android | 状态 |
|---|---|---|
| `position: absolute` | 父节点 → `FrameLayout`，子节点 `layout_gravity` + `layout_margin*` | ✅ |
| `position: fixed` | 全屏 `FrameLayout` | ✅ |
| `position: relative` | `setTranslationX/Y` | ✅ |
| `top` / `right` / `bottom` / `left` | `layout_margin*` + `layout_gravity` | ✅ |
| `inset: 0` | `layout_width="match_parent"` + `layout_height="match_parent"` | ✅ |
| `z-index` | 忽略（靠 FrameLayout 内顺序） | ⚪ |

## 五、文字

| CSS | Android | 状态 |
|---|---|---|
| `color` | `android:textColor` | ✅ |
| `font-size` | `android:textSize`（sp） | ✅ |
| `font-weight` | `android:textStyle="bold"` | ✅ |
| `font-style: italic` | `android:textStyle="italic"` | ✅ |
| `font-family`（mono/serif/sans） | `setTypeface(MONOSPACE/SERIF/SANS_SERIF)` | ✅ |
| `font`（简写） | 只解析 size / line-height | ⚠ |
| `line-height` | `android:lineSpacingMultiplier` / `lineSpacingExtra` | ✅ |
| `letter-spacing` | `android:letterSpacing` | ✅ |
| `text-align` | `android:gravity` | ✅ |
| `text-transform` | `setText(toUpperCase/toLowerCase)` | ✅ |
| `text-decoration` | `Paint.UNDERLINE_TEXT_FLAG` / `STRIKE_THRU_TEXT_FLAG` | ✅ |
| `text-overflow: ellipsis` | `setEllipsize(TruncateAt.END)` | ✅ |
| `white-space: nowrap` | `setSingleLine(true)` | ✅ |
| `word-break: break-word` | `setSingleLine(false)` + `setMaxLines(100)` | ✅ |
| `text-shadow` | 未实现（`setShadowLayer` 可做） | ❌ |

## 六、背景 / 边框

| CSS | Android | 状态 |
|---|---|---|
| `background` / `background-color` | `android:background` / `setBackgroundColor` | ✅ |
| `background-image: linear-gradient` | `GradientDrawable(Orientation, colors)` | ✅ |
| `background-size` / `background-position` / `background-repeat` | 需 BitmapDrawable，未实现 | ❌ |
| `background-clip: text` | 需 shader，未实现 | ❌ |
| `border`（简写） | `GradientDrawable.setStroke` | ✅ |
| `border-width` / `border-color` / `border-style` | `setStroke` | ✅ |
| `border-radius` | `setCornerRadius` / `setCornerRadii`（四角） | ✅ |
| `border-top/right/bottom/left` | 内部追加贴边 `View` 当边框线 | ✅ |
| `border-image` | 未实现 | ❌ |
| `box-shadow` | `setElevation` | ✅ |
| `outline` | 忽略 | ⚪ |

## 七、显示 / 视觉

| CSS | Android | 状态 |
|---|---|---|
| `display: none` | `android:visibility="gone"` | ✅ |
| `visibility: hidden` | `android:visibility="gone"` | ✅ |
| `opacity` | `android:alpha` | ✅ |
| `transform: rotate/scale/translate` | `setRotation` / `setScaleX/Y` / `setTranslationX/Y` | ✅ |
| `transform-origin` | 未实现 | ❌ |
| `overflow: hidden` | `setClipToPadding(true)`（限 ViewGroup） | ✅ |
| `overflow: auto` | 外包装 `ScrollView` | ✅ |
| `overflow-x: auto` | 外包装 `HorizontalScrollView` | ✅ |
| `overflow-y: auto` | 外包装 `ScrollView` | ✅ |
| `object-fit: cover/contain` | `ImageView.setScaleType(CENTER_CROP/FIT_CENTER)` | ✅ |
| `filter: brightness/blur` | 未实现（`ui.css` 里只在 hover） | ❌ |
| `backdrop-filter` | 未实现（Android 12+ RenderEffect） | ❌ |

## 八、动画

| CSS | Android | 状态 |
|---|---|---|
| `animation: x-fade` | `setAlpha(0)` → `animate().alpha(1)` | ✅ |
| `animation: x-scale` | `setScale(0.95)` + `setAlpha(0)` → `animate()` | ✅ |
| `animation: x-slide-up` | `setTranslationY(200)` → `animate().translationY(0)` | ✅ |
| `animation: x-slide-down` | `setTranslationY(-200)` → `animate()` | ✅ |
| `animation: x-skeleton` | `ObjectAnimator.ofFloat(view, "alpha", 0.4, 1)` 循环 | ✅ |
| 自定义 `@keyframes`（其他名字） | 只报 warning | ⚠ |
| `transition` | 只报 warning（`ui.css` 里全在 `:hover`） | ⚠ |

## 九、CSS 变量 / 单位

| 特性 | Android | 状态 |
|---|---|---|
| `var(--x-*)` | 展开为真实值（`parseCSS` 里 `expandVars`） | ✅ |
| `calc()` | 简单表达式展开 | ✅ |
| `px` | 直接当 `dp` | ✅ |
| `rem` / `em` | 按 16 倍折算 | ✅ |
| `vh` / `vw` | Java 里按屏幕尺寸动态算（`getResources().getDisplayMetrics()`） | ✅ |
| `%` | `50%` → `match_parent` 或 `flexBasisPercent`，其他近似 | ⚠ |

## 十、选择器

| 特性 | Android | 状态 |
|---|---|---|
| 类选择器 `.card` | 匹配 `class: 'card'` | ✅ |
| 标签选择器 `div` / `button` | 匹配 `node.name` | ✅ |
| id 选择器 `#id` | 匹配 `id` prop | ✅ |
| 后代 `A B` | 支持 | ✅ |
| 子 `A > B` | 支持 | ✅ |
| `:first-child` / `:last-child` / `:only-child` | 支持 | ✅ |
| `:hover` / `:active` / `:focus` / `:disabled` | **自动跳过** | ⚪ |
| `::before` / `::after` | 生成 `<View>` 子节点 | ✅ |
| `@media (max-width/max-height/orientation/prefers-color-scheme)` | Java `if` 判断 | ✅ |
| 属性选择器 `[type=x]` | 部分支持 | ⚠ |
| `:nth-child(even)` 等复杂伪类 | 未实现 | ❌ |

## 十一、明确不做的（浏览器专属）

| 属性 | 原因 |
|---|---|
| `cursor` | Android 无鼠标光标 |
| `-webkit-*` / `-moz-*` | 渲染引擎私有前缀 |
| `scrollbar-width` | Android ScrollView 无此项 |
| `scroll-snap-align` / `scroll-snap-type` | 需自定义 View |
| `touch-action` | Android 用 `requestDisallowInterceptTouchEvent` |
| `user-select` | `setTextIsSelectable(false)`（部分做） |
| `pointer-events` | Android 用 `setClickable` + `setFocusable` |
| `list-style` | Android 无 HTML 列表 |
| `resize` | Android 无 textarea resize |
| `box-sizing` | Android 默认就是 border-box |
| `vertical-align` | 依赖 inline-block |
| `scroll-behavior: smooth` | Android 需要 `ObjectAnimator` |
| `appearance` / `accent-color` | 浏览器原生控件样式 |

---

## 已知限制

1. **`ui.css` 里 135 处 `var(--x-*)`** —— 全部展开成功，颜色是对的
2. **`@keyframes` 只认 5 个预设名**（x-fade / x-scale / x-slide-up / x-slide-down / x-skeleton）；自定义名字输出 warning
3. **`transition`** 全部输出 warning，不生成动画（`ui.css` 里都在 `:hover` 下，静态页无意义）
4. **`grid` 只支持 `repeat(N, 1fr)`**；`grid-template-areas` / `grid-auto-flow` 未做
5. **`border-radius: 50%`** → `9999f` 圆形；四角不同用 `setCornerRadii` 数组
6. **`font: 15px/1.75 ...`** 简写只解析 size 和 line-height，font-family 忽略
7. **中文文本**：写 `.xuy` 时用 VSCode 手写（PowerShell here-string 会吃成 `?`）