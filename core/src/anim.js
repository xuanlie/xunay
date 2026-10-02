// XuNay 动画核心
export function anim(el, keyframes, options = {}) {
  return el.animate(keyframes, {
    duration: 300,
    easing: 'cubic-bezier(.4,0,.2,1)',
    fill: 'both',
    ...options
  })
}

export const fadeIn = (el, o) => anim(el, [{ opacity: 0 }, { opacity: 1 }], o)
export const fadeOut = (el, o) => anim(el, [{ opacity: 1 }, { opacity: 0 }], o)

const DIR = { up: 'translateY(20px)', down: 'translateY(-20px)', left: 'translateX(20px)', right: 'translateX(-20px)' }
export const slideIn = (el, dir = 'up', o) => anim(el, [{ opacity: 0, transform: DIR[dir] || DIR.up }, { opacity: 1, transform: 'none' }], o)
export const slideOut = (el, dir = 'up', o) => anim(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: DIR[dir] || DIR.up }], o)

export const scale = (el, o) => anim(el, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }], o)
export const pulse = (el, o) => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 400, ...o })
export const shake = (el, o) => anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300, ...o })
export const bounce = (el, o) => anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-20px)' }, { transform: 'translateY(0)' }], { duration: 500, ...o })
export const flip = (el, o) => anim(el, [{ transform: 'rotateY(0)' }, { transform: 'rotateY(180deg)' }], { duration: 400, ...o })
export const spin = (el, o) => anim(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 600, ...o })
export const blur = (el, o) => anim(el, [{ filter: 'blur(10px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 }], o)

export const presets = { fadeIn, fadeOut, slideIn, slideOut, scale, pulse, shake, bounce, flip, spin, blur }

export function stagger(els, fn, delay = 50) {
  els.forEach((el, i) => fn(el, { delay: i * delay }))
}
