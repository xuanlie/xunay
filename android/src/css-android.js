// android/src/css-android.js ?? CSS ? Android ?????
export const SUPPORTED_CSS = new Set([
  'width','height','min-width','max-width','min-height','max-height',
  'padding','padding-top','padding-right','padding-bottom','padding-left',
  'margin','margin-top','margin-right','margin-bottom','margin-left',
  'color','background','background-color','background-image',
  'text-overflow','word-break','object-fit','background-size','background-position','background-repeat',
  'font-size','font-weight','font-style','font-family','line-height','letter-spacing',
  'text-align','text-transform','text-decoration','white-space',
  'border','border-width','border-color','border-style','border-radius',
  'border-top','border-right','border-bottom','border-left',
  'display','flex-direction','flex-shrink','flex-grow','flex-wrap','order','align-content','flex',
  'grid','grid-template-columns','grid-template-rows','grid-auto-flow','grid-gap','grid-row-gap','grid-column-gap',
  'align-items','align-self','justify-content','gap','row-gap','column-gap',
  'position','top','right','bottom','left','inset','z-index',
  'opacity','visibility','box-shadow','transform','overflow','overflow-x','overflow-y',
  'user-select','outline','transition','animation',
])
const IGNORED_CSS = new Set([
  'cursor','content','touch-action','scrollbar-width','scroll-snap-align','scroll-snap-type',
  'border-collapse','border-spacing','filter','backdrop-filter',
  '-webkit-font-smoothing','-moz-osx-font-smoothing','-webkit-overflow-scrolling',
  '-webkit-tap-highlight-color','-webkit-user-drag',
])
function _px(v) {
  v = String(v).trim()
  if (/^-?[\d.]+px$/.test(v)) return v.replace(/px$/, '')
  if (/^-?[\d.]+rem$/.test(v)) return String(parseFloat(v) * 16)
  if (/^-?[\d.]+em$/.test(v)) return String(parseFloat(v) * 16)
  return v
}
function _vh(v) {
  v = String(v).trim()
  const m = v.match(/^([\d.]+)vh$/)
  if (m) return parseFloat(m[1]) / 100
  return null
}
function _vw(v) {
  v = String(v).trim()
  const m = v.match(/^([\d.]+)vw$/)
  if (m) return parseFloat(m[1]) / 100
  return null
}
function _color(v) {
  v = String(v).trim()
  if (/^(transparent|none|normal|auto|currentcolor|inherit)$/i.test(v)) return '#00000000'
  if (v === 'white') return '#ffffff'
  if (v === 'black') return '#000000'
  if (v === 'red') return '#ff0000'
  if (v === 'blue') return '#0000ff'
  if (v === 'green') return '#00ff00'
  return v
}
export function translateCss(css, ctx, nodeName) {
  const out = {
    containerType: null, containerAttrs: [], selfAttrs: [], selfJava: [],
    childCommon: [], _gap: null, _gapAxis: 'top', _gridCols: null, _isAbsolute: false, _wrapOuter: null, _borders: null, _horiz: false,
  }
  if (!css || typeof css !== 'object') return out
  ctx.warnings = ctx.warnings || []
  const __KW = new Set(['inherit', 'initial', 'unset', 'currentcolor'])
  for (const k of Object.keys(css)) {
    if (__KW.has(String(css[k]).toLowerCase())) delete css[k]
  }
  // transparent / none ?????? #00000000
  for (const k of Object.keys(css)) {
    if ((k === 'background' || k === 'background-color') && /^(transparent|none)$/i.test(String(css[k]).trim())) {
      css[k] = '#00000000'
    }
  }
  for (const k of Object.keys(css)) {
    if (SUPPORTED_CSS.has(k)) continue
    if (IGNORED_CSS.has(k)) continue
    if (k.startsWith('--')) continue
    ctx.warnings.push('??? CSS: ' + k + ' = ' + css[k] + ' (' + nodeName + ')')
  }
  const isContainer = ['div','section','main','aside','nav','header','footer','ul','ol','li','form'].includes(nodeName)
  const display = String(css.display || '').toLowerCase()
  const __isFlexDisplay = display.includes('flex')
  const __isGridDisplay = display.includes('grid') || !!css['grid-template-columns']
  const __defaultDir = (__isFlexDisplay || __isGridDisplay) ? 'row' : 'column'
  const flexDir = String(css['flex-direction'] || __defaultDir).toLowerCase()
  const horiz = flexDir === 'row' || flexDir === 'row-reverse'
  const isGrid = __isGridDisplay
  let gridCols = null
  if (isGrid) {
    const gtc = String(css['grid-template-columns'] || '')
    let m = gtc.match(/repeat\(\s*(\d+)\s*,\s*1?fr\s*\)/)
    if (m) gridCols = parseInt(m[1])
    else if (/^1?fr$/.test(gtc.trim())) gridCols = 1
    else {
      const parts = gtc.trim().split(/\s+/).filter(Boolean)
      if (parts.length > 1) gridCols = parts.length
    }
  }
  // grid-column: span N / grid-row: span N → 占多格
  if (isGrid && (css['grid-column'] || css['grid-row'])) {
    const __cs = String(css['grid-column'] || '').match(/span\s+(\d+)/)
    const __rs = String(css['grid-row'] || '').match(/span\s+(\d+)/)
    if (__cs) out.selfJava.push('__v.setTag("grid-col-span:' + __cs[1] + '");')
    if (__rs) out.selfJava.push('__v.setTag("grid-row-span:' + __rs[1] + '");')
  }
  if (isGrid && css['grid-auto-flow'] === 'column') {
    out.containerAttrs.push('app:flexDirection="column"')
  }
  if (isGrid && css['grid-auto-flow'] === 'column') {
    out.containerAttrs.push('app:flexDirection="column"')
  }
  const __useFlexbox = isContainer && (isGrid ||
    (css['flex-wrap'] && css['flex-wrap'] !== 'nowrap') ||
    css['flex-grow'] || css['flex-shrink'] || css['order'] || css['align-content']
  )
  if (isContainer) {
    if (display.includes('none')) out.selfAttrs.push('android:visibility="gone"')
    if (__useFlexbox) {
      out.containerType = 'com.google.android.flexbox.FlexboxLayout'
      if (isGrid) {
        out.containerAttrs.push('app:flexDirection="row"')
        out.containerAttrs.push('app:flexWrap="wrap"')
        if (gridCols) out._gridCols = gridCols
      } else {
        out.containerAttrs.push('app:flexDirection="' + (horiz ? 'row' : 'column') + '"')
        out.containerAttrs.push('app:flexWrap="' + String(css['flex-wrap'] || 'nowrap').replace(/-/g, '_') + '"')
      }
    } else {
      out.containerType = 'LinearLayout'
      out.containerAttrs.push('android:orientation="' + (horiz ? 'horizontal' : 'vertical') + '"')
    }
  }
  const jc = String(css['justify-content'] || '').toLowerCase()
  if (__useFlexbox) {
    if (jc === 'center')        out.containerAttrs.push('app:justifyContent="center"')
    if (jc === 'flex-end')      out.containerAttrs.push('app:justifyContent="flex_end"')
    if (jc === 'space-between') out.containerAttrs.push('app:justifyContent="space_between"')
    if (jc === 'space-around')  out.containerAttrs.push('app:justifyContent="space_around"')
    if (jc === 'space-evenly')  out.containerAttrs.push('app:justifyContent="space_evenly"')
  } else {
    if (jc === 'center')   out.containerAttrs.push('android:gravity="center' + (horiz ? '' : '_vertical') + '"')
    if (jc === 'flex-end') out.containerAttrs.push('android:gravity="' + (horiz ? 'end' : 'bottom') + '"')
  }
  const ai = String(css['align-items'] || '').toLowerCase()
  if (__useFlexbox) {
    if (ai === 'center')     out.containerAttrs.push('app:alignItems="center"')
    if (ai === 'flex-start') out.containerAttrs.push('app:alignItems="flex_start"')
    if (ai === 'flex-end')   out.containerAttrs.push('app:alignItems="flex_end"')
    if (ai === 'stretch')    out.containerAttrs.push('app:alignItems="stretch"')
  } else {
    if (ai === 'center')     out.childCommon.push('android:layout_gravity="center"')
    if (ai === 'flex-start') out.childCommon.push('android:layout_gravity="start"')
    if (ai === 'flex-end')   out.childCommon.push('android:layout_gravity="end"')
    if (ai === 'stretch')    out.childCommon.push(horiz ? 'android:layout_height="match_parent"' : 'android:layout_width="match_parent"')
  }
  const gap = css.gap || css['row-gap'] || css['column-gap']
  if (gap) { out._gap = _px(gap); out._gapAxis = horiz ? 'left' : 'top' }

  out._horiz = horiz

  // ===== P1 =====
  if (css['flex-grow'] !== undefined && !out.selfAttrs.some(a => a.startsWith('android:layout_weight='))) {
    const __g = parseFloat(String(css['flex-grow']))
    if (__g > 0) {
      out.selfAttrs.push('android:layout_weight="' + __g + '"')
      out.selfAttrs.push('android:layout_width="0dp"')
    }
  }
  if (css['flex-shrink'] !== undefined) {
    const __sh = parseFloat(String(css['flex-shrink']))
    if (__sh === 0) out.selfJava.push('if (' + e + '.getLayoutParams() instanceof android.widget.LinearLayout.LayoutParams) ((android.widget.LinearLayout.LayoutParams) ' + e + '.getLayoutParams()).weight = 0;')
  }
  if (css['align-self']) {
    const __as = String(css['align-self']).toLowerCase()
    if (__as === 'center') out.selfAttrs.push('android:layout_gravity="center"')
    else if (__as === 'flex-start') out.selfAttrs.push('android:layout_gravity="start"')
    else if (__as === 'flex-end') out.selfAttrs.push('android:layout_gravity="end"')
    else if (__as === 'stretch') out.selfAttrs.push('android:layout_width="match_parent"')
    else if (__as === 'baseline') out.selfAttrs.push('android:layout_gravity="center_vertical"')
  }
  if (css['align-content']) {
    const __ac = String(css['align-content']).toLowerCase()
    const __acMap = { 'flex-start': 'flex_start', 'flex-end': 'flex_end', 'center': 'center', 'space-between': 'space_between', 'space-around': 'space_around', 'stretch': 'stretch' }
    if (__acMap[__ac]) out.containerAttrs.push('app:alignContent="' + __acMap[__ac] + '"')
  }
  if (css['z-index'] !== undefined) {
    const __z = parseFloat(String(css['z-index']))
    if (!isNaN(__z)) out.selfJava.push(e + '.setElevation(' + __z + 'f);')
  }
  if (css.order !== undefined) ctx.warnings.push('order (' + nodeName + ')')

  for (const __s of ['top','right','bottom','left']) {
    const __val = css['border-' + __s]
    if (__val === undefined) continue
    const __v = String(__val).trim().toLowerCase()
    if (__v === 'none' || __v === '0' || __v === '0px') continue
    const __m1 = __v.match(/^([\d.]+)(?:px|em|rem)?\s+(?:solid|dashed|dotted)\s+(.+)$/)
    const __m2 = __v.match(/^([\d.]+)(?:px|em|rem)?\s+(?:solid|dashed|dotted)$/)
    let __w = 0, __cl = '#000000'
    if (__m1) { __w = parseFloat(__m1[1]); __cl = _color(__m1[2]) }
    else if (__m2) { __w = parseFloat(__m2[1]) }
    else {
      const __m3 = __v.match(/^([\d.]+)(?:px|em|rem)?$/)
      if (__m3) __w = parseFloat(__m3[1])
    }
    if (__w <= 0) continue
    if (!out._borders) out._borders = {}
    out._borders[__s] = { w: __w, color: __cl }
  }

  // flex: N ?? ? layout_weight + 0dp????????
  if (css.flex !== undefined) {
    let __grow = 0
    const __fv = String(css.flex).trim()
    if (__fv === 'none') { __grow = 0 }
    else if (/^[\d.]+$/.test(__fv)) { __grow = parseFloat(__fv) }
    else if (__fv === 'auto') { __grow = 1 }
    else {
      const __p = __fv.split(/\s+/)
      __grow = parseFloat(__p[0]) || 0
    }
    if (__grow > 0) {
      out.selfAttrs.push('android:layout_weight="' + __grow + '"')
      // ??????????? 0dp????? ? ?? 0dp + weight
      // ?LinearLayout ??????????????? weight ???
      out.selfAttrs.push('android:layout_width="0dp"')
    }
  }
  for (const [k, prop] of [['width','layout_width'],['height','layout_height']]) {
    const v = String(css[k] || '').trim()
    if (!v) continue
    if (v === 'match' || v === '100%' || v === 'fill') out.selfAttrs.push('android:' + prop + '="match_parent"')
    else if (v === 'wrap' || v === 'auto')             out.selfAttrs.push('android:' + prop + '="wrap_content"')
    else if (k === 'height' && _vh(v) !== null) {
      const __r = _vh(v)
      out.selfAttrs.push('android:layout_height="0dp"')
      out.selfJava.push('__v.getLayoutParams().height = (int)(getResources().getDisplayMetrics().heightPixels * ' + __r + 'f); __v.requestLayout();')
    } else if (k === 'width' && _vw(v) !== null) {
      const __r = _vw(v)
      out.selfAttrs.push('android:layout_width="0dp"')
      out.selfJava.push('__v.getLayoutParams().width = (int)(getResources().getDisplayMetrics().widthPixels * ' + __r + 'f); __v.requestLayout();')
    } else if (/^[\d.]+/.test(v)) {
      out.selfAttrs.push('android:' + prop + '="' + _px(v) + 'dp"')
    }
  }
  for (const [k, prefix] of [['padding','padding'],['margin','layout_margin']]) {
    const v = String(css[k] || '').trim()
    if (!v) continue
    const parts = v.split(/\s+/).map(_px).map(x => /^-?[\d.]+$/.test(x) ? x : '')
    const t = parts[0], r = parts[1] || parts[0], b = parts[2] || parts[0], l = parts[3] || r
    for (const p of [[t,'Top'],[r,'Right'],[b,'Bottom'],[l,'Left']]) {
      if (p[0]) out.selfAttrs.push('android:' + prefix + p[1] + '="' + p[0] + 'dp"')
    }
  }
  for (const k of Object.keys(css)) {
    const m = k.match(/^(padding|margin)-(top|right|bottom|left)$/)
    if (!m) continue
    const prefix = m[1] === 'margin' ? 'layout_margin' : 'padding'
    const side = m[2][0].toUpperCase() + m[2].slice(1)
    const __pv = _px(css[k])
    if (/^-?[\d.]+$/.test(__pv)) out.selfAttrs.push('android:' + prefix + side + '="' + __pv + 'dp"')
  }
  if (css.visibility === 'hidden') out.selfAttrs.push('android:visibility="invisible"')
else if (css.visibility === 'gone') out.selfAttrs.push('android:visibility="gone"')
  if (css.opacity != null) out.selfAttrs.push('android:alpha="' + css.opacity + '"')
  const e = '__v'
  if (css['min-width'] && /^[\d.]+(px|dp|em|rem)?$/.test(String(css['min-width']).trim())) out.selfJava.push(e + '.setMinimumWidth((int)(' + _px(css['min-width']) + ' * getResources().getDisplayMetrics().density));')
  if (css['min-height'] && /^[\d.]+(px|dp|em|rem)?$/.test(String(css['min-height']).trim())) out.selfJava.push(e + '.setMinimumHeight((int)(' + _px(css['min-height']) + ' * getResources().getDisplayMetrics().density));')
  for (const [__k, __fn] of [['max-width','setMaxWidth'],['max-height','setMaxHeight']]) {
  const __v = String(css[__k] || '').trim()
  if (!__v) continue
  if (/^[\d.]+(px|dp|em|rem)?$/.test(__v)) {
    out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').' + __fn + '((int)(' + _px(__v) + ' * getResources().getDisplayMetrics().density));')
  } else if (/^([\d.]+)%$/.test(__v)) {
    const __pct = parseFloat(__v.match(/^([\d.]+)%$/)[1]) / 100
    const __axis = __k === 'max-width' ? 'widthPixels' : 'heightPixels'
    out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').' + __fn + '((int)(getResources().getDisplayMetrics().' + __axis + ' * ' + __pct + 'f));')
  }
}
  if (css.filter) {
    const __fv = String(css.filter)
    const __ops = []
    const __val = (m) => m[2] ? parseFloat(m[1]) / 100 : parseFloat(m[1])
    let __m2
    let __re

    __re = /grayscale\(\s*([\d.]+)(%?)\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('gray:' + __val([null, __m2[1], __m2[2]]))

    __re = /brightness\(\s*([\d.]+)(%?)\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('bright:' + __val([null, __m2[1], __m2[2]]))

    __re = /contrast\(\s*([\d.]+)(%?)\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('contrast:' + __val([null, __m2[1], __m2[2]]))

    __re = /saturate\(\s*([\d.]+)(%?)\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('sat:' + __val([null, __m2[1], __m2[2]]))

    __re = /invert\(\s*([\d.]+)(%?)\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('invert:' + __val([null, __m2[1], __m2[2]]))

    __re = /sepia\(\s*([\d.]+)(%?)\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('sepia:' + __val([null, __m2[1], __m2[2]]))

    __re = /hue-rotate\(\s*(-?[\d.]+)deg\s*\)/g
    while ((__m2 = __re.exec(__fv))) __ops.push('hue:' + __m2[1])

    if (__ops.length > 0) {
      const __cmLines = []
      for (const __op of __ops) {
        const __i = __op.indexOf(':')
        const k = __op.slice(0, __i)
        const v = __op.slice(__i + 1)
        if (k === 'gray')   __cmLines.push('__cm.setSaturation(1.0f - ' + v + 'f);')
        if (k === 'sat')    __cmLines.push('__cm.setSaturation(' + v + 'f);')
        if (k === 'bright') __cmLines.push('{ float[] __b = { ' + v + 'f,0,0,0,0, 0,' + v + 'f,0,0,0, 0,0,' + v + 'f,0,0, 0,0,0,1,0 }; __cm.postConcat(new android.graphics.ColorMatrix(__b)); }')
        if (k === 'contrast') __cmLines.push('{ float __t = (1.0f - ' + v + 'f) * 127.5f; float[] __c = { ' + v + 'f,0,0,0,__t, 0,' + v + 'f,0,0,__t, 0,0,' + v + 'f,0,__t, 0,0,0,1,0 }; __cm.postConcat(new android.graphics.ColorMatrix(__c)); }')
        if (k === 'invert') __cmLines.push('{ float __iv = ' + v + 'f; float[] __i = { -1+2*__iv,0,0,0,0, 0,-1+2*__iv,0,0,0, 0,0,-1+2*__iv,0,0, 0,0,0,1,0 }; __cm.postConcat(new android.graphics.ColorMatrix(__i)); }')
        if (k === 'sepia')  __cmLines.push('{ float __v = ' + v + 'f; float[] __sp = { 1-__v*0.607f, __v*0.769f, __v*0.189f, 0, 0, __v*0.349f, 1-__v*0.314f, __v*0.168f, 0, 0, __v*0.272f, __v*0.534f, 1-__v*0.869f, 0, 0, 0,0,0,1,0 }; __cm.postConcat(new android.graphics.ColorMatrix(__sp)); }')
        if (k === 'hue')    __cmLines.push('{ float __deg = ' + v + 'f; float __c = (float)Math.cos(__deg*Math.PI/180); float __s2 = (float)Math.sin(__deg*Math.PI/180); float[] __h = { 0.213f+__c*0.787f-__s2*0.213f, 0.715f-__c*0.715f-__s2*0.715f, 0.072f-__c*0.072f+__s2*0.928f, 0, 0, 0.213f-__c*0.213f+__s2*0.143f, 0.715f+__c*0.285f+__s2*0.140f, 0.072f-__c*0.072f-__s2*0.283f, 0, 0, 0.213f-__c*0.213f-__s2*0.787f, 0.715f-__c*0.715f+__s2*0.715f, 0.072f+__c*0.928f+__s2*0.072f, 0, 0, 0,0,0,1,0 }; __cm.postConcat(new android.graphics.ColorMatrix(__h)); }')
      }
      out.selfJava.push('{ final android.graphics.ColorMatrix __cm = new android.graphics.ColorMatrix(); ' + __cmLines.join(' ') + ' ' + e + '.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null); ' + e + '.post(() -> { android.graphics.drawable.Drawable __bg = ' + e + '.getBackground(); if (__bg != null) { __bg = __bg.mutate(); __bg.setColorFilter(new android.graphics.ColorMatrixColorFilter(__cm)); ' + e + '.setBackground(__bg); ' + e + '.invalidate(); } }); }')
    }

    const __blurM = __fv.match(/blur\(\s*([\d.]+)px\s*\)/)
    if (__blurM) {
      const __br = parseFloat(__blurM[1])
      out.selfJava.push('if (android.os.Build.VERSION.SDK_INT >= 31) { ' + e + '.setRenderEffect(android.graphics.RenderEffect.createBlurEffect(' + __br + 'f, ' + __br + 'f, android.graphics.Shader.TileMode.CLAMP)); }')
    }
  }

  if (css['backdrop-filter']) {
    const __bf = String(css['backdrop-filter'])
    const __bM = __bf.match(/blur\(\s*([\d.]+)px\s*\)/)
    const __bgM = __bf.match(/grayscale\(\s*([\d.]+)%?\s*\)/)
    const __brM = __bf.match(/brightness\(\s*([\d.]+)%?\s*\)/)
    if (__bM) {
      const __br = parseFloat(__bM[1])
      out.selfJava.push('if (android.os.Build.VERSION.SDK_INT >= 31) { ' + e + '.setRenderEffect(android.graphics.RenderEffect.createBlurEffect(' + __br + 'f, ' + __br + 'f, android.graphics.Shader.TileMode.CLAMP)); }')
    }
    if (__bgM || __brM) {
      const __cmLines2 = []
      if (__bgM) {
        const __g = parseFloat(__bgM[1]) / (__bf.includes('%') ? 100 : 1)
        __cmLines2.push('__cm.setSaturation(1.0f - ' + __g + 'f);')
      }
      if (__brM) {
        const __v2 = parseFloat(__brM[1]) / (__bf.includes('%') ? 100 : 1)
        __cmLines2.push('{ float[] __b2 = { ' + __v2 + 'f,0,0,0,0, 0,' + __v2 + 'f,0,0,0, 0,0,' + __v2 + 'f,0,0, 0,0,0,1,0 }; __cm.postConcat(new android.graphics.ColorMatrix(__b2)); }')
      }
      out.selfJava.push('{ final android.graphics.ColorMatrix __cm = new android.graphics.ColorMatrix(); ' + __cmLines2.join(' ') + ' ' + e + '.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null); ' + e + '.post(() -> { android.graphics.drawable.Drawable __bg = ' + e + '.getBackground(); if (__bg != null) { __bg = __bg.mutate(); __bg.setColorFilter(new android.graphics.ColorMatrixColorFilter(__cm)); ' + e + '.setBackground(__bg); ' + e + '.invalidate(); } }); }')
    }
  }

  if (css['text-shadow']) {
    const __m = String(css['text-shadow']).match(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(#[0-9a-fA-F]{3,8}|\w+))?/)
    if (__m) {
      const __dx = parseFloat(__m[1])
      const __dy = parseFloat(__m[2])
      const __r = parseFloat(__m[3])
      const __col = __m[4] || '#000000'
      let __h = String(__col).replace('#', '')
      if (__h.length === 3) __h = __h.split('').map(x => x + x).join('')
      const __argb = '0xFF' + __h.toUpperCase()
      out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').setShadowLayer(' + __r + 'f, ' + __dx + 'f, ' + __dy + 'f, ' + __argb + ');')
    }
  }
  if (css['text-transform']) {
    const op = css['text-transform'] === 'uppercase' ? 'toUpperCase' : css['text-transform'] === 'lowercase' ? 'toLowerCase' : null
    if (op) out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) { android.widget.TextView __tv = (android.widget.TextView) ' + e + '; CharSequence __s = __tv.getText(); if (__s != null) __tv.setText(__s.toString().' + op + '()); }')
  }
  if (String(css['white-space']).includes('nowrap')) out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').setSingleLine(true);')
  if (String(css['text-overflow']).includes('ellipsis')) {
    out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').setEllipsize(android.text.TextUtils.TruncateAt.END);')
  }
  if (String(css['word-break']).includes('break')) {
    out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) { android.widget.TextView __tv = (android.widget.TextView) ' + e + '; __tv.setSingleLine(false); __tv.setMaxLines(100); }')
  }
  if (String(css['object-fit']).includes('cover')) {
    out.selfJava.push('if (' + e + ' instanceof android.widget.ImageView) ((android.widget.ImageView) ' + e + ').setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);')
  }
  if (String(css['object-fit']).includes('contain')) {
    out.selfJava.push('if (' + e + ' instanceof android.widget.ImageView) ((android.widget.ImageView) ' + e + ').setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);')
  }

  // background-size → ImageView.setScaleType
  if (css['background-size'] !== undefined) {
    const bs = String(css['background-size']).toLowerCase().trim()
    const applyST = (mode) => out.selfJava.push('if (' + e + ' instanceof android.widget.ImageView) ((android.widget.ImageView) ' + e + ').setScaleType(android.widget.ImageView.ScaleType.' + mode + ');')
    if (bs === 'cover') applyST('CENTER_CROP')
    else if (bs === 'contain') applyST('FIT_CENTER')
    else if (bs === '100% 100%' || bs === '100%' || bs === 'fill' || bs === 'stretch') applyST('FIT_XY')
    else if (bs === 'auto') applyST('FIT_CENTER')
    else {
      const m2 = bs.match(/^([d.]+)(px|%)?s+([d.]+)(px|%)?$/)
      if (m2) ctx.warnings.push('background-size 具体尺寸（简化成 FIT_XY）: ' + bs + ' (' + nodeName + ')')
      else ctx.warnings.push('background-size: ' + bs + ' (' + nodeName + ')')
      applyST('FIT_XY')
    }
  }
  if (css['background-position'] !== undefined) {
    const bp = String(css['background-position']).toLowerCase().trim()
    // 解析 "x y" 或 "x" 或关键字
    let __horiz = 0   // -1 左, 0 中, 1 右
    let __vert = 0    // -1 上, 0 中, 1 下
    if (bp === 'center' || bp === 'center center') { __horiz = 0; __vert = 0 }
    else {
      const parts = bp.split(/\s+/)
      const parseAxis = (tok, isY) => {
        if (tok === 'left') return -1
        if (tok === 'right') return 1
        if (tok === 'top') return -1
        if (tok === 'bottom') return 1
        if (tok === 'center') return 0
        if (tok.endsWith('%')) {
          const __p = parseFloat(tok)
          return __p < 33 ? -1 : __p > 66 ? 1 : 0
        }
        if (tok.endsWith('px')) return 0
        return 0
      }
      if (parts.length === 1) {
        const __tok = parts[0]
        if (__tok === 'top' || __tok === 'bottom') { __vert = parseAxis(__tok, true); __horiz = 0 }
        else { __horiz = parseAxis(__tok, false); __vert = 0 }
      } else {
        // CSS 允许 "top right" 或 "right top" 两种顺序
        const __isVert = (t) => (t === 'top' || t === 'bottom')
        const __isHoriz = (t) => (t === 'left' || t === 'right' || t === 'center' || t.endsWith('%') || t.endsWith('px'))
        if (__isVert(parts[0]) && __isHoriz(parts[1])) {
          __vert = parseAxis(parts[0], true)
          __horiz = parseAxis(parts[1], false)
        } else {
          __horiz = parseAxis(parts[0], false)
          __vert = parseAxis(parts[1], true)
        }
      }
    }
    const __gParts = []
    if (__horiz === -1) __gParts.push('android.view.Gravity.LEFT')
    else if (__horiz === 1) __gParts.push('android.view.Gravity.RIGHT')
    else __gParts.push('android.view.Gravity.CENTER_HORIZONTAL')
    if (__vert === -1) __gParts.push('android.view.Gravity.TOP')
    else if (__vert === 1) __gParts.push('android.view.Gravity.BOTTOM')
    else __gParts.push('android.view.Gravity.CENTER_VERTICAL')
    out.selfJava.push('if (' + e + ' instanceof android.widget.ImageView) ((android.widget.ImageView) ' + e + ').setForegroundGravity(' + __gParts.join(' | ') + ');')
  }
  if (css['background-repeat'] === 'no-repeat' || css['background-repeat'] === 'repeat') {
    // 简化：仅在 ImageView 上提示（已由 scaleType 决定）
  }
  if (css['font-family']) {
    const ffRaw = String(css['font-family']).trim()
    const ff = ffRaw.toLowerCase().replace(/['"]/g, '').trim()
    let tf = null
    if (ff === 'monospace' || ff === 'mono') tf = 'MONOSPACE'
    else if (ff === 'serif') tf = 'SERIF'
    else if (ff === 'sans-serif' || ff === 'sans' || ff === 'system-ui') tf = 'SANS_SERIF'
    if (tf) {
      out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').setTypeface(android.graphics.Typeface.' + tf + ');')
    } else {
      const __fname = ffRaw.replace(/['"]/g, '').trim()
      const __tryExts = ['ttf', 'otf', 'woff2', 'woff']
      const __tries = __tryExts.map(x => 'fonts/' + __fname + '.' + x).map(p => '"' + p + '"').join(', ')
      out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) { android.graphics.Typeface __tf = null; String[] __paths = { ' + __tries + ' }; for (String __p : __paths) { try { __tf = android.graphics.Typeface.createFromAsset(getAssets(), __p); android.util.Log.i("XunayFont", "loaded: " + __p); break; } catch (Exception __e) {} } if (__tf != null) ((android.widget.TextView) ' + e + ').setTypeface(__tf); else android.util.Log.w("XunayFont", "all failed for ' + __fname + '"); }')
    }
  }
  if (css['user-select'] === 'none') out.selfJava.push('if (' + e + ' instanceof android.widget.TextView) ((android.widget.TextView) ' + e + ').setTextIsSelectable(false);')
  if (String(css.overflow || '').includes('hidden')) {
    const __hasRadius = !!css['border-radius']
    if (__hasRadius) {
      out.selfJava.push('if (android.os.Build.VERSION.SDK_INT >= 21) { ' + e + '.addOnLayoutChangeListener((v, l, t, r, b, ol, ot, or, ob) -> { v.setOutlineProvider(new android.view.ViewOutlineProvider() { public void getOutline(android.view.View vv, android.graphics.Outline o) { float r = (float) (' + String(css['border-radius']).replace(/px$/, '') + ' * vv.getResources().getDisplayMetrics().density); o.setRoundRect(0, 0, vv.getWidth(), vv.getHeight(), r); } }); v.setClipToOutline(true); }); }')
    } else {
      out.selfJava.push('if (android.os.Build.VERSION.SDK_INT >= 21) ' + e + '.setClipToOutline(true);')
    }
    out.selfJava.push('if (' + e + ' instanceof android.view.ViewGroup) ((android.view.ViewGroup) ' + e + ').setClipChildren(true);')
  }

  const __ov = String(css.overflow || '').toLowerCase()
  const __ovx = String(css['overflow-x'] || '').toLowerCase()
  const __ovy = String(css['overflow-y'] || '').toLowerCase()
  if (__ov.includes('auto') || __ovy.includes('auto')) {
    out._wrapOuter = 'ScrollView'
  } else if (__ovx.includes('auto')) {
    out._wrapOuter = 'HorizontalScrollView'
  }
  if (css.transform) {
    const v = String(css.transform)
    let m
    if ((m = v.match(/rotate\((-?[\d.]+)deg\)/))) out.selfJava.push(e + '.setRotation(' + m[1] + 'f);')
    if ((m = v.match(/scale\((-?[\d.]+)\)/)))     out.selfJava.push(e + '.setScaleX(' + m[1] + 'f); ' + e + '.setScaleY(' + m[1] + 'f);')
    if ((m = v.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/))) out.selfJava.push(e + '.setTranslationX(' + m[1] + 'f); ' + e + '.setTranslationY(' + m[2] + 'f);')
  }
  if (css.position === 'relative') {
    if (css.top)  out.selfJava.push(e + '.setTranslationY(' + _px(css.top) + 'f);')
    if (css.left) out.selfJava.push(e + '.setTranslationX(' + _px(css.left) + 'f);')
  }
  if (css['box-shadow']) {
    const nums = String(css['box-shadow']).match(/-?\d+(?:\.\d+)?/g) || []
    const el = nums[1] || nums[0]
    if (el) out.selfJava.push(e + '.setElevation(' + el + 'f);')
  }
  // position: absolute / fixed ? layout_gravity + margin?????? FrameLayout?
  if (css.position === 'absolute' || css.position === 'fixed') {
    out._isAbsolute = true
    const _getVal = (side) => {
      if (css[side] !== undefined) return _px(css[side])
      if (css.inset !== undefined) {
        const parts = String(css.inset).trim().split(/\s+/)
        if (parts.length === 1) return _px(parts[0])
        const idx = { top: 0, right: 1, bottom: 2, left: 3 }[side]
        const v = parts[idx] !== undefined ? parts[idx]
          : (idx === 0 ? parts[0] : idx === 1 ? parts[1] : idx === 2 ? parts[2] : parts[3])
        return _px(v)
      }
      return null
    }
    const top = _getVal('top')
    const right = _getVal('right')
    const bottom = _getVal('bottom')
    const left = _getVal('left')
    const grav = []
    if (top !== null) grav.push('top')
    if (bottom !== null) grav.push('bottom')
    if (left !== null) grav.push('left')
    if (right !== null) grav.push('right')
    if (grav.length) out.selfAttrs.push('android:layout_gravity="' + grav.join('|') + '"')
    if (top !== null) out.selfAttrs.push('android:layout_marginTop="' + top + 'dp"')
    if (right !== null) out.selfAttrs.push('android:layout_marginRight="' + right + 'dp"')
    if (bottom !== null) out.selfAttrs.push('android:layout_marginBottom="' + bottom + 'dp"')
    if (left !== null) out.selfAttrs.push('android:layout_marginLeft="' + left + 'dp"')
    if (css.position === 'fixed') {
      out.selfAttrs.push('android:layout_width="match_parent"')
      out.selfAttrs.push('android:layout_height="match_parent"')
    } else if (css.position === 'absolute') {
      const __fillH = left === '0' && right === '0'
      const __fillV = top === '0' && bottom === '0'
      if (!css.width) out.selfAttrs.push('android:layout_width="' + (__fillH ? 'match_parent' : 'wrap_content') + '"')
      if (!css.height) out.selfAttrs.push('android:layout_height="' + (__fillV ? 'match_parent' : 'wrap_content') + '"')
      if (__fillH && __fillV) {
        for (let i = out.selfAttrs.length - 1; i >= 0; i--) {
          if (out.selfAttrs[i].indexOf('android:layout_gravity=') === 0 || out.selfAttrs[i].indexOf('android:layout_margin') === 0) {
            out.selfAttrs.splice(i, 1)
          }
        }
      }
    }
  }

  if (css.transition) ctx.warnings.push('transition ??? animate prop')
  if (css.animation) {
    const __m = String(css.animation).match(/([a-zA-Z][\w-]*)\s+([\d.]+)s/)
    if (__m) {
      const __name = __m[1]
      const __dur = Math.round(parseFloat(__m[2]) * 1000) || 300
      const __inf = /infinite/.test(String(css.animation))
      const __e = '__v'
      if (ctx.keyframes && ctx.keyframes[__name]) {
        const __frames = ctx.keyframes[__name]
        let __from = __frames['0%'] || __frames['from'] || {}
        let __to = __frames['100%'] || __frames['to'] || {}
        // 3+ 帧：用 0% 和中间帧做往返（简化）
        const __allKeys = Object.keys(__frames)
        if (__allKeys.length >= 3) {
          const __midKey = __allKeys[Math.floor(__allKeys.length / 2)]
          if (__midKey !== '0%' && __midKey !== '100%') __to = __frames[__midKey]
        }
        const __keys = new Set([...Object.keys(__from), ...Object.keys(__to)])
        for (const __k of __keys) {
          const __fv = __from[__k], __tv = __to[__k]
          if (__k === 'opacity') {
            const f = parseFloat(__fv ?? 0), t = parseFloat(__tv ?? 1)
            out.selfJava.push('{ android.animation.ObjectAnimator a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "alpha", ' + f + 'f, ' + t + 'f); a.setDuration(' + __dur + ');' + (__inf ? ' a.setRepeatCount(android.animation.ValueAnimator.INFINITE); a.setRepeatMode(android.animation.ValueAnimator.REVERSE);' : '') + ' a.start(); }')
          }
          if (__k === 'transform') {
            const rf = String(__fv||'').match(/rotate\(\s*(-?[\d.]+)deg/), rt = String(__tv||'').match(/rotate\(\s*(-?[\d.]+)deg/)
            if (rf && rt) out.selfJava.push('{ android.animation.ObjectAnimator a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "rotation", ' + rf[1] + 'f, ' + rt[1] + 'f); a.setDuration(' + __dur + ');' + (__inf ? ' a.setRepeatCount(android.animation.ValueAnimator.INFINITE);' : '') + ' a.start(); }')
            const sf = String(__fv||'').match(/scale\(\s*(-?[\d.]+)/), st = String(__tv||'').match(/scale\(\s*(-?[\d.]+)/)
            if (sf && st) {
              out.selfJava.push('{ android.animation.ObjectAnimator a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "scaleX", ' + sf[1] + 'f, ' + st[1] + 'f); a.setDuration(' + __dur + ');' + (__inf ? ' a.setRepeatCount(android.animation.ValueAnimator.INFINITE);' : '') + ' a.start(); }')
              out.selfJava.push('{ android.animation.ObjectAnimator a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "scaleY", ' + sf[1] + 'f, ' + st[1] + 'f); a.setDuration(' + __dur + ');' + (__inf ? ' a.setRepeatCount(android.animation.ValueAnimator.INFINITE);' : '') + ' a.start(); }')
            }
            const tf = String(__fv||'').match(/translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/), tt = String(__tv||'').match(/translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/)
            if (tf && tt) {
              out.selfJava.push('{ android.animation.ObjectAnimator a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "translationX", ' + tf[1] + 'f, ' + tt[1] + 'f); a.setDuration(' + __dur + ');' + (__inf ? ' a.setRepeatCount(android.animation.ValueAnimator.INFINITE); a.setRepeatMode(android.animation.ValueAnimator.REVERSE);' : '') + ' a.start(); }')
              out.selfJava.push('{ android.animation.ObjectAnimator a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "translationY", ' + tf[2] + 'f, ' + tt[2] + 'f); a.setDuration(' + __dur + ');' + (__inf ? ' a.setRepeatCount(android.animation.ValueAnimator.INFINITE); a.setRepeatMode(android.animation.ValueAnimator.REVERSE);' : '') + ' a.start(); }')
            }
          }
        }
        return out
      }
      if (__name === 'x-fade') {
        out.selfJava.push(__e + '.setAlpha(0f);')
        out.selfJava.push(__e + '.animate().alpha(1f).setDuration(' + __dur + ').start();')
      } else if (__name === 'x-scale') {
        out.selfJava.push(__e + '.setScaleX(0.95f); ' + __e + '.setScaleY(0.95f); ' + __e + '.setAlpha(0f);')
        out.selfJava.push(__e + '.animate().scaleX(1f).scaleY(1f).alpha(1f).setDuration(' + __dur + ').start();')
      } else if (__name === 'x-slide-up') {
        out.selfJava.push(__e + '.setTranslationY(200f);')
        out.selfJava.push(__e + '.animate().translationY(0f).setDuration(' + __dur + ').start();')
      } else if (__name === 'x-slide-down') {
        out.selfJava.push(__e + '.setTranslationY(-200f);')
        out.selfJava.push(__e + '.animate().translationY(0f).setDuration(' + __dur + ').start();')
      } else if (__name === 'x-skeleton') {
        out.selfJava.push('{ android.animation.ObjectAnimator __a = android.animation.ObjectAnimator.ofFloat(' + __e + ', "alpha", 0.4f, 1f); __a.setDuration(' + __dur + ');' + (__inf ? ' __a.setRepeatCount(android.animation.ValueAnimator.INFINITE); __a.setRepeatMode(android.animation.ValueAnimator.REVERSE);' : '') + ' __a.start(); }')
      } else {
        ctx.warnings.push('?? animation: ' + __name)
      }
    }
  }
  // 伪类状态由 gen.js 处理
  return out
}
