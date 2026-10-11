import { signal, effect, mount } from '../../core/src/index.js'
import { div, span } from '../../core/src/tags-entry.js'
import { Card, Text, Btn } from '../../core/src/kit-entry.js'
import {
  createScene, createLight, Sphere, Ground, Torus, Lines,
  GridMaterial, animate, fpsMonitor, adaptiveScaling,
  isMobile, mobilePreset,
} from '../../core/src/babylon.js'
import {
  createGameLoop, createFollowCamera, createInput, createStateMachine,
  createTimer, createScore, createLoading, collide2D,
} from '../../core/src/game.js'
import {
  createVirtualJoystick, createHaptics, preventGestures,
  applyMobileDefaults, deviceInfo,
} from '../../core/src/game-mobile.js'

const BABYLON = window.BABYLON

// ============ 移动端一揽子初始化 ============
applyMobileDefaults()
const mobile = isMobile()
const dev = deviceInfo()
const haptics = createHaptics()

// ============ 状态 ============
const fps = signal(0)
const score = createScore({ key: 'xunay_collect' })
const joystick = createVirtualJoystick({ size: mobile ? 140 : 160 })
if (mobile) joystick.show()

const sm = createStateMachine('loading', {
  loading: {},
  playing: { enter: () => haptics.light() },
  ended:   { enter: () => haptics.medium() },
})

const timer = createTimer({ duration: 45, onEnd: () => endGame() })

// ============ Loading ============
const loading = createLoading({ steps: [
  '初始化引擎', '编译着色器', '构建场景', '生成金币', '就绪',
]})
loading.bindDOM('loading-bar', 'loading-text')
await loading.run()
document.getElementById('loading').classList.add('hide')

// ============ 场景 ============
const { engine, scene, onFrame } = createScene({
  canvas: document.getElementById('cv'),
  clearColor: [0.04, 0.05, 0.08, 1],
  camera: { type: 'arc', radius: 14, alpha: -Math.PI/2, beta: Math.PI/3.2,
    minRadius: 8, maxRadius: 25, cameraLimits: false, attach: false },
  light: false,
  fog: { color: [0.04, 0.05, 0.08], density: 0.02 },
})
if (mobile) mobilePreset(engine, { scale: 2 })
preventGestures(document.getElementById('cv'))

createLight({ type: 'hemi', intensity: 0.6, groundColor: [0.1, 0.1, 0.15] })
createLight({ type: 'directional', direction: [-1, -2, -1], intensity: 1.0, position: [10, 20, 10] })

const gm = GridMaterial({
  majorUnitFrequency: 4, minorUnitVisibility: 0.4, gridRatio: 1,
  mainColor: [0.08, 0.1, 0.15], lineColor: [0.25, 0.45, 0.75], opacity: 0.5,
})
Ground({ width: 44, height: 44, position: [0, -0.6, 0] }).mesh.material = gm

const player = Sphere({
  name: 'player', diameter: 1.1, position: [0, 0.6, 0],
  color: '#66ccff', metallic: 0.5, roughness: 0.3, emissiveColor: '#113355',
})

// 边界
Lines({ name: 'border', points: [
  new BABYLON.Vector3(-20, 0.1, -20), new BABYLON.Vector3(20, 0.1, -20),
  new BABYLON.Vector3(20, 0.1, 20), new BABYLON.Vector3(-20, 0.1, 20),
  new BABYLON.Vector3(-20, 0.1, -20),
], color: '#4488ff' })

// ============ 金币 ============
const COIN_COUNT = 12
const coins = []
function spawnCoin(c) {
  const a = Math.random() * Math.PI * 2
  const r = 3 + Math.random() * 15
  if (c.api) c.api.dispose()
  c.x = Math.cos(a) * r
  c.z = Math.sin(a) * r
  c.api = Torus({
    name: 'coin', diameter: 0.9, thickness: 0.18,
    position: [c.x, 0.6, c.z], rotation: [Math.PI/2, 0, 0],
    color: '#ffcc44', metallic: 0.95, roughness: 0.15, emissiveColor: '#664400',
  })
  c.alive = true
  c.respawnAt = 0
}
for (let i = 0; i < COIN_COUNT; i++) { const c = {}; spawnCoin(c); coins.push(c) }

// ============ 输入 + 相机 ============
const input = createInput({ joystick: joystick.vector })
const follow = createFollowCamera(scene.activeCamera, {
  node: player.mesh,   // ← 关键: 告诉相机跟随谁
  stiffness: 5,
  lerpTarget: true,
})
follow.snap()

// ============ 主循环 ============
const px = { v: 0 }, pz = { v: 0 }
const SPEED = 9, RADIUS = 0.9, BOUND = 20

const loop = createGameLoop({
  fixedStep: 1/60,
  onFixed: (dt) => {
    if (!sm.is('playing')) return
    timer.update(dt)

    const [ax, az] = input.vector
    px.v += (ax * SPEED - px.v) * Math.min(1, dt * 12)
    pz.v += (az * SPEED - pz.v) * Math.min(1, dt * 12)

    let nx = player.mesh.position.x + px.v * dt
    let nz = player.mesh.position.z + pz.v * dt
    nx = Math.max(-BOUND, Math.min(BOUND, nx))
    nz = Math.max(-BOUND, Math.min(BOUND, nz))
    player.mesh.position.x = nx
    player.mesh.position.z = nz
    player.mesh.position.y = 0.6  // 锁 y, 防浮
    player.mesh.rotation.z -= (px.v / SPEED) * 4 * dt
    player.mesh.rotation.x += (pz.v / SPEED) * 4 * dt

    follow.update(dt)

    // 金币
    const now = performance.now()
    for (const c of coins) {
      if (!c.alive) {
        if (now - c.respawnAt > 2000) spawnCoin(c)
        continue
      }
      c.api.mesh.rotation.z += dt * 3
      c.api.mesh.position.y = 0.6 + Math.sin(now / 500 + c.x) * 0.18
      if (collide2D({ x: c.x, z: c.z }, { x: nx, z: nz }, RADIUS + 0.5)) {
        score.add(10)
        haptics.light()
        animate({ target: c.api.mesh, property: 'scaling',
          from: [1, 1, 1], to: [0, 0, 0], duration: 0.25 })
        c.alive = false
        c.respawnAt = now
        animate({ target: player.mesh, property: 'scaling',
          from: [1.2, 1.2, 1.2], to: [1, 1, 1], duration: 0.2 })
      }
    }
  },
})

// ============ 游戏流程 ============
function startGame() {
  sm.goto('playing')
  score.reset()
  timer.start()
  player.mesh.position.x = 0
  player.mesh.position.z = 0
  player.mesh.position.y = 0.6
  px.v = 0; pz.v = 0
  follow.snap()
  for (const c of coins) spawnCoin(c)
  document.getElementById('end').classList.remove('show')
  loop.start()
}

function endGame() {
  sm.goto('ended')
  const isRecord = score.commit()
  timer.stop()
  loop.stop()
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
  mount(() => Btn({ onClick: startGame }, '再玩一次'), '#end-btn')
  const btn = document.querySelector('#end-btn button')
  if (btn) btn.style.cssText = 'padding:12px 32px;font-size:16px;background:#66ccff;color:#0a0a12;border:0;border-radius:12px;cursor:pointer;font-weight:600'
}

// ============ HUD ============
function StatCard(label, value) {
  return div({ style: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '72px',     // 固定宽度, 数字变化不影响布局
  } },
    div({ style: {
      fontSize: '10px',
      color: '#888',
      letterSpacing: '1px',
      marginBottom: '2px',
    } }, label),
    div({ style: {
      fontSize: '22px',
      fontWeight: '600',
      color: '#66ccff',
      fontVariantNumeric: 'tabular-nums',
      fontFeatureSettings: '"tnum"',
      height: '28px',           // 固定高度
      lineHeight: '28px',
      width: '72px',            // 固定宽度
      willChange: 'contents',   // 独立合成层
      contain: 'layout paint',  // 隔离重排
      textAlign: 'left',
    } }, value),
  )
}
mount(() => Card({ flat: true },
  div({ style: { display: 'flex', gap: '20px', alignItems: 'baseline' } },
    StatCard('SCORE', () => String(score.score())),
    StatCard('TIME', () => String(timer.time())),
    StatCard('BEST', () => String(score.best())),
    StatCard('FPS', () => String(fps())),
  )
), '#hud-top')

mount(() => Card({ flat: true },
  Text({ size: 'sm' },
    span({ style: { color: '#66ccff', fontWeight: 600 } }, 'XuNay'),
    ' × ',
    span({ style: { color: '#fff', fontWeight: 600 } }, 'Collect'),
  )
), '#hud-title')

mount(() => Card({ flat: true },
  Btn({ block: true, onClick: endGame }, '结束'),
), '#hud-btns')

// ============ 性能 ============
fpsMonitor(engine, fps, 1000)
adaptiveScaling(engine, { targetFps: mobile ? 45 : 55 })

// ============ 启动 ============
startGame()

window.__demo = { engine, scene, score, timer, sm, loop, score_sig: score.score }
console.log('[collect v2] 抽象重写 · mobile=' + mobile + ' · ' + dev.orientation)
