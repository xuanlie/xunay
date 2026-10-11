import { signal, effect, mount } from '../../core/src/index.js'
import { div, span } from '../../core/src/tags-entry.js'
import { Btn, Card, Text, Slider } from '../../core/src/kit-entry.js'
import {
  createScene, createLight,
  Box, Sphere, Ground, Torus,
  GridMaterial, Particles, animate, onPointer,
  adaptiveScaling, fpsMonitor,
  setupTouchGestures, isMobile, mobilePreset,
} from '../../core/src/babylon.js'

const BABYLON = window.BABYLON

// ============ 状态 ============
const fps       = signal(0)
const score     = signal(0)
const meshCount = signal(6)
const speed     = signal(0.8)
const hue       = signal(200)
const autoScale = signal(true)
const log       = signal('点立方体 +10 · 拖背景旋转')

// ============ 场景 ============
const { engine, scene, onFrame } = createScene({
  canvas: document.getElementById('cv'),
  clearColor: [0.02, 0.02, 0.04, 1],
  camera: { type: 'arc', radius: 12, minRadius: 4, maxRadius: 40, wheelPrecision: 30 },
  light: false,
  fog: { color: [0.02, 0.02, 0.04], density: 0.015 },
})

// 移动端: 检测 + 手势 + 性能预设
const mobile = isMobile()
if (mobile) {
  mobilePreset(engine, { scale: 2 })
  console.log('[babylon] 移动端模式: 半分辨率 + 触摸手势')
}
setupTouchGestures(document.getElementById('cv'), null, {
  speed: 1.2, pinchSpeed: 1.0,
  minRadius: 4, maxRadius: 35,
})

createLight({ type: 'hemi', intensity: 0.4, groundColor: [0.05, 0.05, 0.1] })
createLight({ type: 'directional', direction: [-1, -2, -1], intensity: 1.2, position: [5, 10, 5],
  shadows: { shadowMapSize: 1024, shadowBlurKernel: 32 } })
createLight({ type: 'point', position: [0, 5, 0], intensity: 0.6, diffuse: '#66ccff', range: 20 })

const gm = GridMaterial({
  majorUnitFrequency: 5, minorUnitVisibility: 0.3, gridRatio: 1,
  mainColor: [0.1, 0.15, 0.25], lineColor: [0.3, 0.5, 0.9], opacity: 0.55,
})
const ground = Ground({ width: 40, height: 40, position: [0, -1.5, 0], receiveShadow: true })
ground.mesh.material = gm

// ============ 立方体 ============
let cubes = []
function rebuild(n) {
  for (const c of cubes) c.dispose()
  cubes = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = n === 1 ? 0 : 4
    const box = Box({
      name: 'box' + i, size: 1.2,
      position: [Math.cos(a) * r, 0, Math.sin(a) * r],
      color: '#66ccff', metallic: 0.6, roughness: 0.35,
      castShadow: true, receiveShadow: true,
    })
    onPointer({
      mesh: box.mesh,
      enter: () => { box.mesh.scaling = new BABYLON.Vector3(1.15, 1.15, 1.15) },
      leave: () => { box.mesh.scaling = new BABYLON.Vector3(1, 1, 1) },
      click: () => {
        score(score() + 10)
        log('命中 #' + i + '  +10')
        animate({ target: box.mesh, property: 'scaling',
          from: [1.3, 1.3, 1.3], to: [1, 1, 1], duration: 0.3, easing: 'BackEase' })
      },
    })
    cubes.push(box)
  }
}
effect(() => rebuild(meshCount()))

// ============ 中心球 + 环 + 粒子 ============
const centerBall = Sphere({
  name: 'core', diameter: 1.8, color: '#ff66cc', metallic: 0.9, roughness: 0.1,
  position: [0, 0, 0], emissiveColor: '#661144', castShadow: true,
})
animate({ target: centerBall.mesh, property: 'scaling',
  from: [1, 1, 1], to: [1.15, 1.15, 1.15], duration: 1.2, loop: true, easing: 'SineEase' })

const ring = Torus({ diameter: 6, thickness: 0.1, position: [0, 1.5, 0], color: '#66ffcc' })
animate({ target: ring.mesh, property: 'rotation',
  from: [0, 0, 0], to: [0, Math.PI * 2, 0], duration: 8, loop: true })

Particles({
  capacity: 300, emitter: centerBall.mesh,
  color1: [0.4, 0.8, 1.0, 1.0], color2: [1.0, 0.4, 0.8, 1.0], colorDead: [0, 0, 0, 0],
  minSize: 0.05, maxSize: 0.2, minLifeTime: 0.5, maxLifeTime: 1.5,
  emitRate: 80, gravity: [0, 1.5, 0],
  direction1: [-0.5, -0.5, -0.5], direction2: [0.5, 0.5, 0.5],
  minEmitPower: 1, maxEmitPower: 3,
})

// ============ 每帧 ============
onFrame((dt) => {
  const s = speed(), h = hue()
  for (let i = 0; i < cubes.length; i++) {
    const m = cubes[i].mesh
    m.rotation.y += dt * s
    m.rotation.x += dt * s * 0.6
    const c = BABYLON.Color3.FromHSV((h + i * (360 / Math.max(1, cubes.length))) % 360, 0.8, 0.95)
    if (cubes[i].material) {
      cubes[i].material.albedoColor = c
      cubes[i].material.emissiveColor = new BABYLON.Color3(c.r * 0.15, c.g * 0.15, c.b * 0.15)
    }
  }
  const hc = BABYLON.Color3.FromHSV((h + 180) % 360, 0.8, 0.9)
  centerBall.material.albedoColor = hc
  centerBall.material.emissiveColor = new BABYLON.Color3(hc.r * 0.3, hc.g * 0.3, hc.b * 0.3)
})

// ============ 性能 ============
fpsMonitor(engine, fps, 500)
let scalerTimer = null
effect(() => {
  if (scalerTimer) { clearInterval(scalerTimer); scalerTimer = null }
  if (autoScale()) scalerTimer = adaptiveScaling(engine, { targetFps: 55 })
})

setInterval(() => score(score() + 1), 2000)

// ============================================================
// kit HUD
// ============================================================

// 顶部统计卡
mount(() => Card({ flat: true },
  div({ style: { display: 'flex', gap: '20px', alignItems: 'baseline' } },
    div(null,
      Text({ size: 'xs', dim: true }, 'FPS'),
      Text({ size: 'xl', bold: true }, () => String(fps())),
    ),
    div(null,
      Text({ size: 'xs', dim: true }, 'SCORE'),
      Text({ size: 'xl', bold: true }, () => String(score())),
    ),
    div(null,
      Text({ size: 'xs', dim: true }, 'MESHES'),
      Text({ size: 'xl', bold: true }, () => String(meshCount())),
    ),
  )
), '#hud-top')

// 标题
mount(() => Card({ flat: true },
  Text({ size: 'sm' },
    span({ style: { color: '#66ccff', fontWeight: 600 } }, 'XuNay'),
    ' × ',
    span({ style: { color: '#fff', fontWeight: 600 } }, 'Babylon.js'),
  )
), '#hud-title')

// 底部 log
mount(() => Card({ flat: true },
  Text({ size: 'xs', dim: true }, () => log())
), '#hud-log')

// 控制面板
mount(() => Card({ title: '控制' },
  div({ style: { display: 'flex', flexDirection: 'column', gap: '12px' } },

    div(null,
      Text({ size: 'xs', dim: true }, () => '立方体 ' + meshCount()),
      Slider({ value: meshCount, min: 1, max: 30, step: 1, onChange: v => meshCount(v) }),
    ),

    div(null,
      Text({ size: 'xs', dim: true }, () => '速度 ' + speed().toFixed(2)),
      Slider({ value: () => speed() * 100, min: 0, max: 300, step: 10, onChange: v => speed(v / 100) }),
    ),

    div(null,
      Text({ size: 'xs', dim: true }, () => '色相 ' + hue()),
      Slider({ value: hue, min: 0, max: 360, step: 5, onChange: v => hue(v) }),
    ),

    Btn({ type: 'default', block: true, onClick: () => autoScale(!autoScale()) },
      () => '自适应: ' + (autoScale() ? '开' : '关')),
  )
), '#hud-ctrl')

document.getElementById('boot').classList.add('hide')
window.__demo = { engine, scene, BABYLON, fps, score, meshCount, speed, hue, log, autoScale }
console.log('[babylon] demo v4 kit HUD 挂载')
