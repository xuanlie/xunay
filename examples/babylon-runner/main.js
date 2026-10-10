import { signal, effect, mount } from '../../core/src/index.js'
import { div, span } from '../../core/src/tags-entry.js'
import { Card, Text, Btn } from '../../core/src/kit-entry.js'
import {
  createScene, createLight, Box, Ground,
  GridMaterial, animate, fpsMonitor, adaptiveScaling,
  isMobile, mobilePreset,
} from '../../core/src/babylon.js'
import {
  createGameLoop, createInput, createStateMachine,
  createScore, createLoading, createSpawner, createPool,
} from '../../core/src/game.js'
import {
  createHaptics, preventGestures, applyMobileDefaults, deviceInfo,
} from '../../core/src/game-mobile.js'

const BABYLON = window.BABYLON

applyMobileDefaults()
const mobile = isMobile()
const dev = deviceInfo()
const haptics = createHaptics()

// ============ 状态 ============
const fps = signal(0)
const score = createScore({ key: 'xunay_runner' })
const speed = signal(0)          // 当前速度 m/s
const lane = signal(1)            // 0 / 1 / 2

const sm = createStateMachine('loading', {
  loading: {},
  playing: { enter: () => haptics.light() },
  ended:   { enter: () => haptics.medium() },
})

// ============ Loading ============
const loading = createLoading({ steps: [
  '初始化引擎', '编译着色器', '构建轨道', '就绪',
]})
loading.bindDOM('loading-bar', 'loading-text')
await loading.run()
document.getElementById('loading').classList.add('hide')

// ============ 场景 ============
const { engine, scene, onFrame } = createScene({
  canvas: document.getElementById('cv'),
  clearColor: [0.15, 0.18, 0.28, 1],
  camera: { type: 'free', position: [0, 6, 16], target: [0, 0.5, 0], attach: false },
  light: false,
  ambientColor: [0.4, 0.4, 0.5],
})
if (mobile) mobilePreset(engine, { scale: 2 })
preventGestures(document.getElementById('cv'))

createLight({ type: 'hemi', intensity: 1.2, groundColor: [0.3, 0.35, 0.45], diffuse: '#ffffff' })
createLight({ type: 'directional', direction: [-1, -2, -1], intensity: 1.5, position: [10, 20, 10], diffuse: '#ffffff' })

// 轨道 (三条车道)
const LANE_X = [-2.5, 0, 2.5]
const TRACK_LENGTH = 200

// 三条跑道: 用三个独立的 Box 更清晰
const LANE_COLORS = ['#2a3a55', '#33475f', '#2a3a55']
for (let i = 0; i < 3; i++) {
  const lane = Box({
    name: 'lane' + i,
    width: 2.4, height: 0.1, depth: TRACK_LENGTH,
    position: [LANE_X[i], -0.05, 0],
    color: LANE_COLORS[i],
    material: 'standard',
    metallic: 0, roughness: 1,
  })
}
// 侧边护栏
for (const x of [-4.2, 4.2]) {
  Box({
    name: 'rail', width: 0.3, height: 1.2, depth: TRACK_LENGTH,
    position: [x, 0.5, 0], color: '#66ccff', material: 'standard',
    emissiveColor: '#1a3a55',
  })
}

// 玩家
const player = Box({
  name: 'player', size: 0.9,
  position: [0, 0.55, 8], color: '#88ddff',
  metallic: 0.1, roughness: 0.6, emissiveColor: '#4488bb',
})
player.mesh.scaling.y = 1.2

// 相机跟随

// ============ 障碍物对象池 ============
const obstacles = []
function createObstacle() {
  return Box({
    name: 'obstacle', size: 0.9,
    position: [0, -5, 0],   // 隐藏
    color: '#ff6677', metallic: 0.1, roughness: 0.7, emissiveColor: '#cc3333',
  })
}
function spawnObstacle() {
  const ob = createObstacle()
  const laneIdx = Math.floor(Math.random() * 3)
  ob.mesh.position.set(LANE_X[laneIdx], 0.55, -60)
  ob.alive = true
  ob.lane = laneIdx
  obstacles.push(ob)
  return ob
}
function despawnObstacle(ob) {
  ob.dispose()
}

// ============ 输入 ============
const input = createInput()

// 键盘 + 触摸滑动
function tryMoveLane(dir) {
  if (!sm.is('playing')) return
  const cur = lane()
  const next = Math.max(0, Math.min(2, cur + dir))
  if (next === cur) return
  lane(next)
  haptics.light()
}

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase()
  if (k === 'arrowleft' || k === 'a') tryMoveLane(-1)
  else if (k === 'arrowright' || k === 'd') tryMoveLane(1)
})

// 触摸滑动
let touchStartX = 0
let touchActive = false
const canvasEl = document.getElementById('cv')
canvasEl.addEventListener('touchstart', e => {
  e.preventDefault()
  touchStartX = e.touches[0].clientX
  touchActive = true
}, { passive: false })
canvasEl.addEventListener('touchend', e => {
  e.preventDefault()
  if (!touchActive) return
  touchActive = false
  const dx = (e.changedTouches[0].clientX - touchStartX)
  if (Math.abs(dx) > 30) tryMoveLane(dx > 0 ? 1 : -1)
}, { passive: false })

// ============ 游戏循环 ============
let playerX = 0
let baseSpeed = 8
const MAX_SPEED = 25
const SPEED_INCREASE = 0.3

const loop = createGameLoop({
  fixedStep: 1/60,
  onFixed: (dt) => {
    if (!sm.is('playing')) return

    // 速度递增
    baseSpeed = Math.min(MAX_SPEED, baseSpeed + SPEED_INCREASE * dt)
    speed(Math.round(baseSpeed))

    // 车道切换平滑
    const targetX = LANE_X[lane()]
    playerX += (targetX - playerX) * Math.min(1, dt * 15)
    player.mesh.position.x = playerX
    player.mesh.rotation.z = (targetX - playerX) * 0.3

    // 移动障碍物
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i]
      ob.mesh.position.z += baseSpeed * dt
      // 出场
      if (ob.mesh.position.z > 12) {
        despawnObstacle(ob)
        obstacles.splice(i, 1)
        continue
      }
      // 碰撞检测
      const dx = ob.mesh.position.x - player.mesh.position.x
      const dz = ob.mesh.position.z - player.mesh.position.z
      if (Math.abs(dx) < 0.7 && Math.abs(dz) < 0.7) {
        endGame()
        return
      }
    }
  },
})

// ============ 生成器 ============
const spawner = createSpawner({
  interval: 0.7,
  max: 20,
  spawn: spawnObstacle,
  despawn: despawnObstacle,
})
// 每帧调用
onFrame((dt) => {
  if (!sm.is('playing')) return
  spawner.update(dt * (baseSpeed / 8))   // 速度越快生成越密
})

// ============ 游戏流程 ============
function startGame() {
  sm.goto('playing')
  score.reset()
  baseSpeed = 8
  speed(8)
  lane(1)
  playerX = 0
  player.mesh.position.set(0, 0.55, 8)
  obstacles.forEach(o => o.dispose())
  obstacles.length = 0
  spawner.reset()
  document.getElementById('end').classList.remove('show')
  loop.start()
}

function endGame() {
  sm.goto('ended')
  const isRecord = score.commit()
  loop.stop()
  obstacles.forEach(o => o.dispose())
  obstacles.length = 0
  showEnd(isRecord)
}

function showEnd(isRecord) {
  const endEl = document.getElementById('end')
  endEl.classList.add('show')
  endEl.innerHTML = `
    <div style="font-size:52px;color:#66ccff;font-weight:700">${score.score()}</div>
    <div style="font-size:14px;color:#888">${isRecord ? '🎉 新纪录!' : '最高 ' + score.best()}</div>
    <div id="end-btn" style="margin-top:12px"></div>
  `
  mount(() => Btn({ onClick: startGame }, '再跑一次'), '#end-btn')
  const btn = document.querySelector('#end-btn button')
  if (btn) btn.style.cssText = 'padding:12px 32px;font-size:16px;background:#66ccff;color:#0a0a12;border:0;border-radius:12px;cursor:pointer;font-weight:600'
}

// ============ 计分: 距离 ============
let distance = 0
setInterval(() => {
  if (!sm.is('playing')) return
  distance += baseSpeed / 60
  if (Math.floor(distance) > score.score()) {
    score.set(Math.floor(distance))
  }
}, 100)

// ============ HUD ============
function StatCard(label, value) {
  return div({ style: { display: 'flex', flexDirection: 'column', minWidth: '72px' } },
    div({ style: { fontSize: '10px', color: '#888', letterSpacing: '1px', marginBottom: '2px' } }, label),
    div({ style: {
      fontSize: '22px', fontWeight: '600', color: '#66ccff',
      fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"',
      height: '28px', lineHeight: '28px', width: '72px',
      contain: 'layout paint', textAlign: 'left',
    } }, value),
  )
}
mount(() => Card({ flat: true },
  div({ style: { display: 'flex', gap: '20px', alignItems: 'baseline' } },
    StatCard('DIST', () => String(score.score())),
    StatCard('SPEED', () => String(speed())),
    StatCard('BEST', () => String(score.best())),
    StatCard('FPS', () => String(fps())),
  )
), '#hud-top')

mount(() => Card({ flat: true },
  Text({ size: 'sm' },
    span({ style: { color: '#66ccff', fontWeight: 600 } }, 'XuNay'),
    ' × ',
    span({ style: { color: '#fff', fontWeight: 600 } }, 'Runner'),
  )
), '#hud-title')

mount(() => Card({ flat: true },
  Btn({ block: true, onClick: endGame }, '结束'),
), '#hud-btns')

// ============ 性能 ============
fpsMonitor(engine, fps, 1000)
adaptiveScaling(engine, { targetFps: mobile ? 45 : 55 })

// ============ 启动 ============
distance = 0
startGame()

window.__demo = { engine, scene, score, speed, lane, sm, loop, obstacles }
console.log('[runner] 跑酷挂载 · mobile=' + mobile)
