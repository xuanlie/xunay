import { px, cx } from './kit-util.js'
import { div, span } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'

export function Layout(props, ...children) {
  const { direction = 'column', style = {} } = px(props)
  return div({
    style: {
      display: 'flex', flexDirection: direction,
      minHeight: '100vh', ...style
    }
  }, ...children)
}

export function Grid(props, ...children) {
  const { cols = 12, gap = 16, style = {} } = px(props)
  return div({
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: gap + 'px', ...style
    }
  }, ...children)
}

export function Flex(props, ...children) {
  const { direction = 'row', align, justify, wrap, gap, style = {} } = px(props)
  return div({
    style: {
      display: 'flex', flexDirection: direction,
      alignItems: align, justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap: gap !== undefined ? gap + 'px' : undefined,
      ...style
    }
  }, ...children)
}

export function Affix(props, ...children) {
  const { top = 0, bottom } = px(props)
  const stuck = signal(false)
  effect(() => {
    const onScroll = () => {
      if (bottom !== undefined) {
        stuck(window.innerHeight - (bottom || 0) - document.documentElement.scrollTop < 0)
      } else {
        stuck(window.scrollY >= top)
      }
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    onCleanup(() => window.removeEventListener('scroll', onScroll))
  })
  return div({
    style: () => stuck()
      ? { position: 'fixed', top: bottom !== undefined ? 'auto' : top + 'px', bottom: bottom !== undefined ? bottom + 'px' : 'auto', zIndex: 100 }
      : {}
  }, ...children)
}
