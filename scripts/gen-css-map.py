#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""?? xunay ? CSS ????? CSS ? Android ?????
???python scripts/gen-css-map.py
???docs/css-to-android-map.md
"""
import re, os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANDROID_JS = os.path.join(ROOT, 'android', 'src', 'css-android.js')
CSS_FILES = [
    ('site/src/style.css', os.path.join(ROOT, 'site', 'src', 'style.css')),
    ('core/src/ui.css',    os.path.join(ROOT, 'core', 'src', 'ui.css')),
]
OUT = os.path.join(ROOT, 'docs', 'css-to-android-map.md')

MAP = {
    'width': 'layout_width (dp / match_parent / wrap_content)',
    'height': 'layout_height',
    'min-width': 'setMinimumWidth',
    'max-width': '? ?????warning?',
    'min-height': 'setMinimumHeight',
    'max-height': '? ?????warning?',
    'padding': 'android:paddingTop/Right/Bottom/Left',
    'padding-top': 'android:paddingTop',
    'padding-right': 'android:paddingRight',
    'padding-bottom': 'android:paddingBottom',
    'padding-left': 'android:paddingLeft',
    'margin': 'android:layout_marginTop/Right/Bottom/Left',
    'margin-top': 'android:layout_marginTop',
    'margin-right': 'android:layout_marginRight',
    'margin-bottom': 'android:layout_marginBottom',
    'margin-left': 'android:layout_marginLeft',
    'color': 'android:textColor',
    'background': 'android:background / setBackgroundColor',
    'background-color': 'setBackgroundColor',
    'background-image': 'GradientDrawable (linear-gradient)',
    'font': '? ???? size/line-height ??',
    'font-size': 'android:textSize',
    'font-weight': 'android:textStyle="bold"',
    'font-style': 'android:textStyle="italic"',
    'font-family': 'setTypeface(MONOSPACE/SERIF/SANS_SERIF)',
    'line-height': 'android:lineSpacingMultiplier / lineSpacingExtra',
    'letter-spacing': 'android:letterSpacing',
    'text-align': 'android:gravity',
    'text-transform': 'setText(toUpperCase/toLowerCase)',
    'text-decoration': 'Paint.UNDERLINE / STRIKE_THRU',
    'text-overflow': 'setEllipsize(TruncateAt.END)',
    'white-space': 'setSingleLine / setMaxLines',
    'word-break': 'setSingleLine(false) + setMaxLines',
    'object-fit': 'ImageView.setScaleType(CENTER_CROP / FIT_CENTER)',
    'border': 'GradientDrawable.setStroke',
    'border-width': 'GradientDrawable.setStroke',
    'border-color': 'GradientDrawable.setStroke',
    'border-style': '? ??? solid/dashed/dotted',
    'border-radius': 'GradientDrawable.setCornerRadius / setCornerRadii',
    'border-top': '?????? View ????',
    'border-right': '?????? View ????',
    'border-bottom': '?????? View ????',
    'border-left': '?????? View ????',
    'display': 'flex?LinearLayout / grid?FlexboxLayout / none?GONE',
    'flex': 'layout_weight + 0dp',
    'flex-direction': 'android:orientation / app:flexDirection',
    'flex-wrap': 'FlexboxLayout app:flexWrap',
    'flex-grow': 'android:layout_weight',
    'flex-shrink': '? ????',
    'align-items': 'android:layout_gravity / app:alignItems',
    'align-self': '? ?????',
    'justify-content': 'android:gravity / app:justifyContent',
    'gap': '??? layout_marginLeft / marginTop',
    'row-gap': '??? layout_marginTop',
    'column-gap': '??? layout_marginLeft',
    'position': 'absolute/fixed ? FrameLayout + layout_gravity',
    'top': 'layout_marginTop / layout_gravity',
    'right': 'layout_marginRight / layout_gravity',
    'bottom': 'layout_marginBottom / layout_gravity',
    'left': 'layout_marginLeft / layout_gravity',
    'inset': '???? ? layout_margin / match_parent',
    'z-index': '? ???? FrameLayout ????',
    'opacity': 'android:alpha',
    'visibility': 'android:visibility',
    'box-shadow': 'setElevation',
    'transform': 'setRotation / setScaleX/Y / setTranslationX/Y',
    'transform-origin': '? ???',
    'overflow': 'auto?ScrollView / hidden?setClipToPadding',
    'overflow-x': 'auto?HorizontalScrollView',
    'overflow-y': 'auto?ScrollView',
    'animation': '?? keyframes ? ObjectAnimator / animate()',
    'transition': '? ? warning',
    'user-select': 'setTextIsSelectable(false)',
    'outline': '? ??',
    'backdrop-filter': '? ????Android 12+ RenderEffect?',
    '-webkit-backdrop-filter': '? ???',
    'background-clip': '? ????text-clip ? shader?',
    '-webkit-background-clip': '? ???',
    '-webkit-text-fill-color': '? ???',
    'border-image': '? ???',
    'pointer-events': '? ??',
    'list-style': '? ??',
    'scroll-behavior': '? ??',
}

def extract_set(name, text):
    m = re.search(name + r"\s*=\s*new Set\(\[(.*?)\]\)", text, re.S)
    if not m:
        return set()
    return set(re.findall(r"'([^']+)'", m.group(1)))

def scan_css(path):
    if not os.path.exists(path):
        return Counter()
    css = open(path, encoding='utf-8').read()
    props = Counter()
    for m in re.finditer(r'(^|[\s;{])([a-z][a-z0-9-]*)\s*:', css, re.M):
        props[m.group(2)] += 1
    return props

def classify(prop, supported, ignored):
    if prop.startswith('--'):
        return '? ??', '??????'
    if prop in supported:
        return '? ??', MAP.get(prop, '')
    if prop in ignored or prop.startswith('-webkit-') or prop.startswith('-moz-'):
        return '? ??', MAP.get(prop, '????? / Android ???')
    if prop in MAP and MAP[prop].startswith('?'):
        return '? ??', MAP[prop]
    if prop in MAP and MAP[prop].startswith('?'):
        return '? ??', MAP[prop]
    return '? ???', MAP.get(prop, '???')

def main():
    src = open(ANDROID_JS, encoding='utf-8').read()
    supported = extract_set('SUPPORTED_CSS', src)
    ignored = extract_set('IGNORED_CSS', src)

    scans = [(name, scan_css(path)) for name, path in CSS_FILES]
    all_props = sorted(set().union(*[set(c) for _, c in scans]))

    lines = []
    lines.append('# CSS ? Android ???')
    lines.append('')
    lines.append('? `scripts/gen-css-map.py` ??????????')
    for name, _ in scans:
        lines.append('- `' + name + '`')
    lines.append('- `android/src/css-android.js`?SUPPORTED_CSS / IGNORED_CSS?')
    lines.append('')
    lines.append('## ???')
    lines.append('')
    total = len(all_props)
    ok = sum(1 for p in all_props if classify(p, supported, ignored)[0] == '? ??' or classify(p, supported, ignored)[0] == '? ??')
    part = sum(1 for p in all_props if classify(p, supported, ignored)[0] == '? ??')
    skip = sum(1 for p in all_props if classify(p, supported, ignored)[0] == '? ??')
    miss = sum(1 for p in all_props if classify(p, supported, ignored)[0] in ('? ??', '? ???'))
    lines.append('| ?? | ?? | ?? |')
    lines.append('|---|---|---|')
    lines.append('| ? ?? | ' + str(ok) + ' | ' + str(round(ok*100/total, 1)) + '% |')
    lines.append('| ? ?? | ' + str(part) + ' | ' + str(round(part*100/total, 1)) + '% |')
    lines.append('| ? ????????? | ' + str(skip) + ' | ' + str(round(skip*100/total, 1)) + '% |')
    lines.append('| ? ?? | ' + str(miss) + ' | ' + str(round(miss*100/total, 1)) + '% |')
    lines.append('| **??** | **' + str(total) + '** | 100% |')
    lines.append('')
    lines.append('## ???')
    lines.append('')
    header = '| ?? | ' + ' | '.join(n for n, _ in scans) + ' | ?? | ?? |'
    lines.append(header)
    lines.append('|---|---' * (len(scans) + 3) + '|')
    for p in all_props:
        counts = [str(c.get(p, 0)) for _, c in scans]
        st, note = classify(p, supported, ignored)
        lines.append('| `' + p + '` | ' + ' | '.join(counts) + ' | ' + st + ' | ' + note + ' |')
    lines.append('')

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, 'w', encoding='utf-8').write('\n'.join(lines))
    print('Written:', OUT)
    print('????:', total, ' ??:', ok, ' ??:', part, ' ??:', skip, ' ??:', miss)

if __name__ == '__main__':
    main()
