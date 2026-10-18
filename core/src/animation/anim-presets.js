// XuNay 预设动画 · 120+ 个
import { anim } from './anim.js'

const T = {
  up: 'translateY(30px)', down: 'translateY(-30px)',
  left: 'translateX(30px)', right: 'translateX(-30px)',
  bigUp: 'translateY(100px)', bigDown: 'translateY(-100px)',
  bigLeft: 'translateX(100px)', bigRight: 'translateX(-100px)',
}
const mk = (from, to) => (el, o = {}) => anim(el, [from, to], o)

// ===== 淡入淡出 =====
export const fadeIn = mk({ opacity: 0 }, { opacity: 1 })
export const fadeOut = mk({ opacity: 1 }, { opacity: 0 })
export const fadeInUp = mk({ opacity: 0, transform: T.up }, { opacity: 1, transform: 'none' })
export const fadeInDown = mk({ opacity: 0, transform: T.down }, { opacity: 1, transform: 'none' })
export const fadeInLeft = mk({ opacity: 0, transform: T.left }, { opacity: 1, transform: 'none' })
export const fadeInRight = mk({ opacity: 0, transform: T.right }, { opacity: 1, transform: 'none' })
export const fadeOutUp = mk({ opacity: 1, transform: 'none' }, { opacity: 0, transform: T.up })
export const fadeOutDown = mk({ opacity: 1, transform: 'none' }, { opacity: 0, transform: T.down })
export const fadeOutLeft = mk({ opacity: 1, transform: 'none' }, { opacity: 0, transform: T.left })
export const fadeOutRight = mk({ opacity: 1, transform: 'none' }, { opacity: 0, transform: T.right })
export const fadeInTopLeft = mk({ opacity: 0, transform: 'translate(-30px,-30px)' }, { opacity: 1, transform: 'none' })
export const fadeInTopRight = mk({ opacity: 0, transform: 'translate(30px,-30px)' }, { opacity: 1, transform: 'none' })
export const fadeInBottomLeft = mk({ opacity: 0, transform: 'translate(-30px,30px)' }, { opacity: 1, transform: 'none' })
export const fadeInBottomRight = mk({ opacity: 0, transform: 'translate(30px,30px)' }, { opacity: 1, transform: 'none' })

// ===== 滑动 =====
export const slideInUp = mk({ transform: T.bigUp }, { transform: 'none' })
export const slideInDown = mk({ transform: T.bigDown }, { transform: 'none' })
export const slideInLeft = mk({ transform: T.bigLeft }, { transform: 'none' })
export const slideInRight = mk({ transform: T.bigRight }, { transform: 'none' })
export const slideOutUp = mk({ transform: 'none' }, { transform: T.bigUp })
export const slideOutDown = mk({ transform: 'none' }, { transform: T.bigDown })
export const slideOutLeft = mk({ transform: 'none' }, { transform: T.bigLeft })
export const slideOutRight = mk({ transform: 'none' }, { transform: T.bigRight })

// ===== 缩放 =====
export const scale = mk({ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' })
export const scaleUp = mk({ transform: 'scale(1)' }, { transform: 'scale(1.1)' })
export const scaleDown = mk({ transform: 'scale(1)' }, { transform: 'scale(.9)' })
export const zoomIn = mk({ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' })
export const zoomOut = mk({ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.3)' })
export const zoomInUp = mk({ opacity: 0, transform: 'scale(.1) translateY(100px)' }, { opacity: 1, transform: 'scale(1) translateY(0)' })
export const zoomInDown = mk({ opacity: 0, transform: 'scale(.1) translateY(-100px)' }, { opacity: 1, transform: 'scale(1) translateY(0)' })
export const zoomInLeft = mk({ opacity: 0, transform: 'scale(.1) translateX(-100px)' }, { opacity: 1, transform: 'scale(1) translateX(0)' })
export const zoomInRight = mk({ opacity: 0, transform: 'scale(.1) translateX(100px)' }, { opacity: 1, transform: 'scale(1) translateX(0)' })
export const zoomOutUp = mk({ opacity: 1, transform: 'scale(1) translateY(0)' }, { opacity: 0, transform: 'scale(.1) translateY(-100px)' })
export const zoomOutDown = mk({ opacity: 1, transform: 'scale(1) translateY(0)' }, { opacity: 0, transform: 'scale(.1) translateY(100px)' })
export const zoomOutLeft = mk({ opacity: 1, transform: 'scale(1) translateX(0)' }, { opacity: 0, transform: 'scale(.1) translateX(-100px)' })
export const zoomOutRight = mk({ opacity: 1, transform: 'scale(1) translateX(0)' }, { opacity: 0, transform: 'scale(.1) translateX(100px)' })

// ===== 旋转 =====
export const rotate = (el, o) => anim(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 600, ...o })
export const rotateIn = mk({ opacity: 0, transform: 'rotate(-200deg)' }, { opacity: 1, transform: 'rotate(0)' })
export const rotateOut = mk({ opacity: 1, transform: 'rotate(0)' }, { opacity: 0, transform: 'rotate(200deg)' })
export const rotateInDownLeft = mk({ opacity: 0, transform: 'rotate(-45deg)', transformOrigin: 'left bottom' }, { opacity: 1, transform: 'rotate(0)', transformOrigin: 'left bottom' })
export const rotateInDownRight = mk({ opacity: 0, transform: 'rotate(45deg)', transformOrigin: 'right bottom' }, { opacity: 1, transform: 'rotate(0)', transformOrigin: 'right bottom' })
export const rotateInUpLeft = mk({ opacity: 0, transform: 'rotate(45deg)', transformOrigin: 'left bottom' }, { opacity: 1, transform: 'rotate(0)', transformOrigin: 'left bottom' })
export const rotateInUpRight = mk({ opacity: 0, transform: 'rotate(-45deg)', transformOrigin: 'right bottom' }, { opacity: 1, transform: 'rotate(0)', transformOrigin: 'right bottom' })
export const rotateOutDownLeft = mk({ opacity: 1, transform: 'rotate(0)', transformOrigin: 'left bottom' }, { opacity: 0, transform: 'rotate(45deg)', transformOrigin: 'left bottom' })
export const rotateOutDownRight = mk({ opacity: 1, transform: 'rotate(0)', transformOrigin: 'right bottom' }, { opacity: 0, transform: 'rotate(-45deg)', transformOrigin: 'right bottom' })
export const rotateOutUpLeft = mk({ opacity: 1, transform: 'rotate(0)', transformOrigin: 'left bottom' }, { opacity: 0, transform: 'rotate(-45deg)', transformOrigin: 'left bottom' })
export const rotateOutUpRight = mk({ opacity: 1, transform: 'rotate(0)', transformOrigin: 'right bottom' }, { opacity: 0, transform: 'rotate(45deg)', transformOrigin: 'right bottom' })
export const spin = (el, o) => anim(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 1000, ...o })
export const spinSlow = (el, o) => anim(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 3000, ...o })
export const spinFast = (el, o) => anim(el, [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 400, ...o })

// ===== 翻转 =====
export const flip = mk({ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(360deg)' })
export const flipX = mk({ transform: 'perspective(400px) rotateX(0)' }, { transform: 'perspective(400px) rotateX(360deg)' })
export const flipY = mk({ transform: 'perspective(400px) rotateY(0)' }, { transform: 'perspective(400px) rotateY(360deg)' })
export const flipInX = mk({ opacity: 0, transform: 'perspective(400px) rotateX(90deg)' }, { opacity: 1, transform: 'perspective(400px) rotateX(0)' })
export const flipInY = mk({ opacity: 0, transform: 'perspective(400px) rotateY(90deg)' }, { opacity: 1, transform: 'perspective(400px) rotateY(0)' })
export const flipOutX = mk({ opacity: 1, transform: 'perspective(400px) rotateX(0)' }, { opacity: 0, transform: 'perspective(400px) rotateX(90deg)' })
export const flipOutY = mk({ opacity: 1, transform: 'perspective(400px) rotateY(0)' }, { opacity: 0, transform: 'perspective(400px) rotateY(90deg)' })

// ===== 弹跳 =====
export const bounce = (el, o) => anim(el, [
  { transform: 'translateY(0)' }, { transform: 'translateY(-30px)' },
  { transform: 'translateY(0)' }, { transform: 'translateY(-15px)' },
  { transform: 'translateY(0)' }
], { duration: 800, ...o })
export const bounceIn = mk({ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'scale(1)' })
export const bounceOut = mk({ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.3)' })
export const bounceInUp = mk({ opacity: 0, transform: 'translateY(300px)' }, { opacity: 1, transform: 'translateY(0)' })
export const bounceInDown = mk({ opacity: 0, transform: 'translateY(-300px)' }, { opacity: 1, transform: 'translateY(0)' })
export const bounceInLeft = mk({ opacity: 0, transform: 'translateX(-300px)' }, { opacity: 1, transform: 'translateX(0)' })
export const bounceInRight = mk({ opacity: 0, transform: 'translateX(300px)' }, { opacity: 1, transform: 'translateX(0)' })
export const bounceOutUp = mk({ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-300px)' })
export const bounceOutDown = mk({ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(300px)' })
export const bounceOutLeft = mk({ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(-300px)' })
export const bounceOutRight = mk({ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(300px)' })

// ===== 回弹 =====
export const backInUp = mk({ opacity: 0, transform: 'translateY(100px) scale(.7)' }, { opacity: 1, transform: 'translateY(0) scale(1)' })
export const backInDown = mk({ opacity: 0, transform: 'translateY(-100px) scale(.7)' }, { opacity: 1, transform: 'translateY(0) scale(1)' })
export const backInLeft = mk({ opacity: 0, transform: 'translateX(-100px) scale(.7)' }, { opacity: 1, transform: 'translateX(0) scale(1)' })
export const backInRight = mk({ opacity: 0, transform: 'translateX(100px) scale(.7)' }, { opacity: 1, transform: 'translateX(0) scale(1)' })
export const backOutUp = mk({ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(-100px) scale(.7)' })
export const backOutDown = mk({ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(100px) scale(.7)' })
export const backOutLeft = mk({ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: 'translateX(-100px) scale(.7)' })
export const backOutRight = mk({ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: 'translateX(100px) scale(.7)' })

// ===== 强调 / 注意 =====
export const pulse = (el, o) => anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 500, ...o })
export const heartbeat = (el, o) => anim(el, [
  { transform: 'scale(1)' }, { transform: 'scale(1.15)' },
  { transform: 'scale(1)' }, { transform: 'scale(1.1)' },
  { transform: 'scale(1)' }
], { duration: 800, ...o })
export const ping = (el, o) => anim(el, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 800, ...o })
export const shake = (el, o) => anim(el, [
  { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
  { transform: 'translateX(10px)' }, { transform: 'translateX(-8px)' },
  { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }
], { duration: 500, ...o })
export const shakeX = (el, o) => anim(el, [
  { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
  { transform: 'translateX(10px)' }, { transform: 'translateX(-6px)' },
  { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }
], { duration: 500, ...o })
export const shakeY = (el, o) => anim(el, [
  { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' },
  { transform: 'translateY(10px)' }, { transform: 'translateY(-6px)' },
  { transform: 'translateY(6px)' }, { transform: 'translateY(0)' }
], { duration: 500, ...o })
export const headShake = (el, o) => anim(el, [
  { transform: 'translateX(0)' }, { transform: 'translateX(-6px) rotateY(-9deg)' },
  { transform: 'translateX(5px) rotateY(7deg)' }, { transform: 'translateX(-3px) rotateY(-5deg)' },
  { transform: 'translateX(2px) rotateY(3deg)' }, { transform: 'translateX(0)' }
], { duration: 700, ...o })
export const swing = (el, o) => anim(el, [
  { transform: 'rotate(0)' }, { transform: 'rotate(15deg)' },
  { transform: 'rotate(-10deg)' }, { transform: 'rotate(5deg)' },
  { transform: 'rotate(-5deg)' }, { transform: 'rotate(0)' }
], { duration: 700, ...o })
export const tada = (el, o) => anim(el, [
  { transform: 'scale(1) rotate(0)' }, { transform: 'scale(.9) rotate(-3deg)' },
  { transform: 'scale(.9) rotate(-3deg)' }, { transform: 'scale(1.1) rotate(3deg)' },
  { transform: 'scale(1.1) rotate(-3deg)' }, { transform: 'scale(1.1) rotate(3deg)' },
  { transform: 'scale(1.1) rotate(-3deg)' }, { transform: 'scale(1.1) rotate(3deg)' },
  { transform: 'scale(1) rotate(0)' }
], { duration: 900, ...o })
export const wobble = (el, o) => anim(el, [
  { transform: 'translateX(0) rotate(0)' },
  { transform: 'translateX(-20px) rotate(-5deg)' },
  { transform: 'translateX(18px) rotate(3deg)' },
  { transform: 'translateX(-14px) rotate(-3deg)' },
  { transform: 'translateX(10px) rotate(2deg)' },
  { transform: 'translateX(-6px) rotate(-1deg)' },
  { transform: 'translateX(0) rotate(0)' }
], { duration: 800, ...o })
export const jello = (el, o) => anim(el, [
  { transform: 'skewX(0) skewY(0)' }, { transform: 'skewX(-12deg) skewY(-12deg)' },
  { transform: 'skewX(6deg) skewY(6deg)' }, { transform: 'skewX(-4deg) skewY(-4deg)' },
  { transform: 'skewX(2deg) skewY(2deg)' }, { transform: 'skewX(0) skewY(0)' }
], { duration: 700, ...o })
export const rubberBand = (el, o) => anim(el, [
  { transform: 'scale(1,1)' }, { transform: 'scale(1.25,.75)' },
  { transform: 'scale(.75,1.25)' }, { transform: 'scale(1.15,.85)' },
  { transform: 'scale(.95,1.05)' }, { transform: 'scale(1.05,.95)' },
  { transform: 'scale(1,1)' }
], { duration: 800, ...o })
export const flash = (el, o) => anim(el, [
  { opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }
], { duration: 800, ...o })
export const glow = (el, o) => anim(el, [
  { boxShadow: '0 0 0 rgba(31,111,235,0)' },
  { boxShadow: '0 0 20px rgba(31,111,235,.8)' },
  { boxShadow: '0 0 0 rgba(31,111,235,0)' }
], { duration: 1200, ...o })
export const shimmer = (el, o) => anim(el, [
  { backgroundPosition: '-200% 0' }, { backgroundPosition: '200% 0' }
], { duration: 1500, ...o })
export const breathe = (el, o) => anim(el, [
  { transform: 'scale(1)', opacity: 1 },
  { transform: 'scale(1.05)', opacity: .85 },
  { transform: 'scale(1)', opacity: 1 }
], { duration: 3000, ...o })
export const drift = (el, o) => anim(el, [
  { transform: 'translate(0,0)' }, { transform: 'translate(3px,-3px)' }, { transform: 'translate(0,0)' }
], { duration: 3000, ...o })

// ===== 模糊 =====
export const blur = mk({ filter: 'blur(10px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 })
export const blurIn = mk({ filter: 'blur(20px)', opacity: 0 }, { filter: 'blur(0)', opacity: 1 })
export const blurOut = mk({ filter: 'blur(0)', opacity: 1 }, { filter: 'blur(20px)', opacity: 0 })
export const sharpen = mk({ filter: 'blur(10px)' }, { filter: 'blur(0)' })

// ===== 移动 =====
export const moveUp = mk({ transform: 'translateY(0)' }, { transform: 'translateY(-20px)' })
export const moveDown = mk({ transform: 'translateY(0)' }, { transform: 'translateY(20px)' })
export const moveLeft = mk({ transform: 'translateX(0)' }, { transform: 'translateX(-20px)' })
export const moveRight = mk({ transform: 'translateX(0)' }, { transform: 'translateX(20px)' })

// ===== 特殊 =====
export const lightSpeedIn = mk(
  { opacity: 0, transform: 'translateX(100%) skewX(-30deg)' },
  { opacity: 1, transform: 'translateX(0) skewX(0)' }
)
export const lightSpeedOut = mk(
  { opacity: 1, transform: 'translateX(0) skewX(0)' },
  { opacity: 0, transform: 'translateX(100%) skewX(30deg)' }
)
export const rollIn = mk(
  { opacity: 0, transform: 'translateX(-100%) rotate(-120deg)' },
  { opacity: 1, transform: 'translateX(0) rotate(0)' }
)
export const rollOut = mk(
  { opacity: 1, transform: 'translateX(0) rotate(0)' },
  { opacity: 0, transform: 'translateX(100%) rotate(120deg)' }
)
export const jackInTheBox = mk({ opacity: 0, transform: 'scale(.1) rotate(30deg)' }, { opacity: 1, transform: 'scale(1) rotate(0)' })
export const hinge = (el, o) => anim(el, [
  { transform: 'rotate(0)', transformOrigin: 'top left' },
  { transform: 'rotate(80deg)', transformOrigin: 'top left' },
  { transform: 'rotate(60deg)', transformOrigin: 'top left' },
  { transform: 'rotate(80deg)', transformOrigin: 'top left' },
  { transform: 'rotate(60deg)', transformOrigin: 'top left' },
  { transform: 'rotate(80deg) translateY(700px)', transformOrigin: 'top left', opacity: 0 }
], { duration: 2000, ...o })


// ===== 补充预设 =====
export const fadeInTop = mk({ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' })
export const fadeInBottom = mk({ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' })
export const fadeInFar = mk({ opacity: 0, filter: 'blur(8px)', transform: 'scale(.95)' }, { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' })
export const fadeOutFar = mk({ opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }, { opacity: 0, filter: 'blur(8px)', transform: 'scale(.95)' })
export const scaleIn = mk({ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'scale(1)' })
export const scaleOut = mk({ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.85)' })
export const zoomInTop = mk({ opacity: 0, transform: 'scale(.2) translateY(-50%)' }, { opacity: 1, transform: 'scale(1) translateY(0)' })
export const zoomInBottom = mk({ opacity: 0, transform: 'scale(.2) translateY(50%)' }, { opacity: 1, transform: 'scale(1) translateY(0)' })
export const rotate90 = mk({ transform: 'rotate(0)' }, { transform: 'rotate(90deg)' })
export const rotate180 = mk({ transform: 'rotate(0)' }, { transform: 'rotate(180deg)' })
export const wiggle = (el, o) => anim(el, [
  { transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' },
  { transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' },
  { transform: 'rotate(0)' }
], { duration: 500, ...o })
export const float = (el, o) => anim(el, [
  { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }
], { duration: 2000, iterations: Infinity, ...o })
export const rotate3d = mk({ transform: 'perspective(600px) rotateY(0) rotateX(0)' }, { transform: 'perspective(600px) rotateY(180deg) rotateX(180deg)' })
export const flip3d = mk({ transform: 'perspective(1000px) rotateY(0)' }, { transform: 'perspective(1000px) rotateY(360deg)' })
export const cubeRotate = (el, o) => anim(el, [
  { transform: 'perspective(800px) rotateY(0)' },
  { transform: 'perspective(800px) rotateY(90deg)' },
  { transform: 'perspective(800px) rotateY(180deg)' },
  { transform: 'perspective(800px) rotateY(270deg)' },
  { transform: 'perspective(800px) rotateY(360deg)' }
], { duration: 1600, ...o })
export const perspectiveIn = mk({ opacity: 0, transform: 'perspective(1000px) rotateX(-90deg) translateZ(-200px)' }, { opacity: 1, transform: 'perspective(1000px) rotateX(0) translateZ(0)' })
export const perspectiveOut = mk({ opacity: 1, transform: 'perspective(1000px) rotateX(0) translateZ(0)' }, { opacity: 0, transform: 'perspective(1000px) rotateX(90deg) translateZ(-200px)' })
export const rotateInDown = mk({ opacity: 0, transform: 'rotateX(-90deg)' }, { opacity: 1, transform: 'rotateX(0)' })
export const rotateInUp = mk({ opacity: 0, transform: 'rotateX(90deg)' }, { opacity: 1, transform: 'rotateX(0)' })
export const skewIn = mk({ opacity: 0, transform: 'skewX(30deg)' }, { opacity: 1, transform: 'skewX(0)' })
export const skewOut = mk({ opacity: 1, transform: 'skewX(0)' }, { opacity: 0, transform: 'skewX(30deg)' })
export const slideBounceIn = (el, o) => anim(el, [
  { transform: 'translateY(-100%)' }, { transform: 'translateY(0)' },
  { transform: 'translateY(-15px)' }, { transform: 'translateY(0)' }
], { duration: 800, ...o })
export const dropIn = mk({ opacity: 0, transform: 'translateY(-200%) scale(.7)' }, { opacity: 1, transform: 'translateY(0) scale(1)' })
export const dropOut = mk({ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(200%) scale(.7)' })
export const swingIn = (el, o) => anim(el, [
  { opacity: 0, transform: 'perspective(400px) rotateY(-90deg)' },
  { opacity: 1, transform: 'perspective(400px) rotateY(0)' }
], { duration: 700, ...o })
export const popIn = (el, o) => anim(el, [
  { opacity: 0, transform: 'scale(.3)' },
  { opacity: 1, transform: 'scale(1.1)' },
  { opacity: 1, transform: 'scale(1)' }
], { duration: 400, ...o })
export const popOut = (el, o) => anim(el, [
  { opacity: 1, transform: 'scale(1)' },
  { opacity: 1, transform: 'scale(1.1)' },
  { opacity: 0, transform: 'scale(.3)' }
], { duration: 400, ...o })
export const elastic = mk({ transform: 'scale(1)' }, { transform: 'scale(1.3)' })
export const jelly = (el, o) => anim(el, [
  { transform: 'scale(1,1)' }, { transform: 'scale(1.15,.85)' },
  { transform: 'scale(.9,1.1)' }, { transform: 'scale(1.05,.95)' },
  { transform: 'scale(1,1)' }
], { duration: 700, ...o })
export const blink = (el, o) => anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, iterations: Infinity, direction: 'alternate', ...o })
export const fadeInfinite = (el, o) => anim(el, [{ opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: 2000, iterations: Infinity, ...o })
export const rainbow = (el, o) => anim(el, [
  { filter: 'hue-rotate(0)' }, { filter: 'hue-rotate(360deg)' }
], { duration: 3000, iterations: Infinity, ...o })
export const wave = (el, o) => anim(el, [
  { transform: 'rotate(0)' }, { transform: 'rotate(20deg)' }, { transform: 'rotate(0)' },
  { transform: 'rotate(-20deg)' }, { transform: 'rotate(0)' }
], { duration: 1200, iterations: Infinity, ...o })
export const slideInBounce = (el, o) => anim(el, [
  { transform: 'translateX(-100%)' }, { transform: 'translateX(0)' },
  { transform: 'translateX(-10px)' }, { transform: 'translateX(0)' }
], { duration: 800, ...o })
export const stretchIn = mk({ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' })
export const stretchOut = mk({ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' })
export const compressIn = mk({ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' })
export const compressOut = mk({ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' })
export const unfold = mk({ transform: 'perspective(1000px) rotateX(-90deg)', opacity: 0 }, { transform: 'perspective(1000px) rotateX(0)', opacity: 1 })
export const fold = mk({ transform: 'perspective(1000px) rotateX(0)', opacity: 1 }, { transform: 'perspective(1000px) rotateX(90deg)', opacity: 0 })
export const shimmerText = (el, o) => anim(el, [
  { backgroundPosition: '-200% 0' }, { backgroundPosition: '200% 0' }
], { duration: 2000, iterations: Infinity, ...o })
export const glowPulse = (el, o) => anim(el, [
  { boxShadow: '0 0 0 rgba(31,111,235,0)' },
  { boxShadow: '0 0 30px rgba(31,111,235,.9)' },
  { boxShadow: '0 0 0 rgba(31,111,235,0)' }
], { duration: 1500, iterations: Infinity, ...o })
export const neon = (el, o) => anim(el, [
  { textShadow: '0 0 5px #fff, 0 0 10px #fff' },
  { textShadow: '0 0 20px #fff, 0 0 30px #58a6ff, 0 0 40px #58a6ff' },
  { textShadow: '0 0 5px #fff, 0 0 10px #fff' }
], { duration: 2000, iterations: Infinity, ...o })
export const bobble = (el, o) => anim(el, [
  { transform: 'translateY(0)' }, { transform: 'translateY(-20px)' },
  { transform: 'translateY(0)' }, { transform: 'translateY(-10px)' },
  { transform: 'translateY(0)' }
], { duration: 1200, iterations: Infinity, ...o })
export const bounce2 = (el, o) => anim(el, [
  { transform: 'translateY(0)' }, { transform: 'translateY(-30px)' },
  { transform: 'translateY(0)' }, { transform: 'translateY(-15px)' },
  { transform: 'translateY(0)' }, { transform: 'translateY(-5px)' },
  { transform: 'translateY(0)' }
], { duration: 1500, iterations: Infinity, ...o })

// ===== 预设注册表 =====
export const presets = {
  fadeIn, fadeOut, fadeInUp, fadeInDown, fadeInLeft, fadeInRight,
  fadeOutUp, fadeOutDown, fadeOutLeft, fadeOutRight,
  fadeInTopLeft, fadeInTopRight, fadeInBottomLeft, fadeInBottomRight,
  slideInUp, slideInDown, slideInLeft, slideInRight,
  slideOutUp, slideOutDown, slideOutLeft, slideOutRight,
  scale, scaleUp, scaleDown,
  zoomIn, zoomOut, zoomInUp, zoomInDown, zoomInLeft, zoomInRight,
  zoomOutUp, zoomOutDown, zoomOutLeft, zoomOutRight,
  rotate, rotateIn, rotateOut,
  rotateInDownLeft, rotateInDownRight, rotateInUpLeft, rotateInUpRight,
  rotateOutDownLeft, rotateOutDownRight, rotateOutUpLeft, rotateOutUpRight,
  spin, spinSlow, spinFast,
  flip, flipX, flipY, flipInX, flipInY, flipOutX, flipOutY,
  bounce, bounceIn, bounceOut,
  bounceInUp, bounceInDown, bounceInLeft, bounceInRight,
  bounceOutUp, bounceOutDown, bounceOutLeft, bounceOutRight,
  backInUp, backInDown, backInLeft, backInRight,
  backOutUp, backOutDown, backOutLeft, backOutRight,
  pulse, heartbeat, ping,
  shake, shakeX, shakeY, headShake, swing, tada, wobble, jello,
  rubberBand, flash, glow, shimmer, breathe, drift,
  blur, blurIn, blurOut, sharpen,
  moveUp, moveDown, moveLeft, moveRight,
  lightSpeedIn, lightSpeedOut, rollIn, rollOut, jackInTheBox, hinge,
  fadeInTop, fadeInBottom, fadeInFar, fadeOutFar, scaleIn, scaleOut, zoomInTop, zoomInBottom, rotate90, rotate180, wiggle, float, rotate3d, flip3d, cubeRotate, perspectiveIn, perspectiveOut, rotateInDown, rotateInUp, skewIn, skewOut, slideBounceIn, dropIn, dropOut, swingIn, popIn, popOut, elastic, jelly, blink, fadeInfinite, rainbow, wave, slideInBounce, stretchIn, stretchOut, compressIn, compressOut, unfold, fold, shimmerText, glowPulse, neon, bobble, bounce2,
}
