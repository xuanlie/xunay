// XuNay 游戏通用抽象
// 所有游戏都会重复做的事: 主循环 / 相机跟随 / 输入 / 状态机 / 计时 / 计分 / 对象池
// 抽出来, 下一个游戏 30 行起步.
import { signal, effect, untrack } from './core.js'

// ============================================================
// 1. 主循环 — 固定步长 + 变步长渲染
// ============================================================
export function createGameLoop(opts = {}) {
  const fixedStep = opts.fixedStep ?? 1/60
  const maxDelta = opts.maxDelta ?? 0.1
  const fixed = opts.onFixed
  const variable = opts.onRender
  let running = false
  let acc = 0
  let last = 0
  let raf = 0
  let elapsed = 0

  function tick(now) {
    if (!running) return
    raf = requestAnimationFrame(tick)
    const dt = Math.min((now - last) / 1000, maxDelta)
    last = now
    elapsed += dt
    if (fixed) {
      acc += dt
      while (acc >= fixedStep) {
        try { fixed(fixedStep, elapsed) } catch (e) { console.error('[loop] fixed err', e) }
        acc -= fixedStep
      }
    }
    if (variable) {
      try { variable(dt, elapsed) } catch (e) { console.error('[loop] render err', e) }
    }
  }

  return {
    start() {
      if (running) return
      running = true
      last = performance.now()
      acc = 0
      raf = requestAnimationFrame(tick)
    },
    stop() {
      running = false
      cancelAnimationFrame(raf)
    },
    get running() { return running },
    get elapsed() { return elapsed },
  }
}

// ============================================================
// 2. 相机跟随 — 平滑跟随目标
// ============================================================
export function createFollowCamera(camera, opts = {}) {
  const stiffness = opts.stiffness ?? 5
  const offset = opts.offset || [0, 0, 0]
  const lerpTarget = opts.lerpTarget !== false
  const node = opts.node // { position: {x,y,z} }

  const state = { x: 0, y: 0, z: 0 }

  return {
    snap() {
      if (!node) return
      const p = node.position
      state.x = p.x + offset[0]
      state.y = p.y + offset[1]
      state.z = p.z + offset[2]
      if (lerpTarget && camera.target && camera.target.set) {
        camera.target.set(p.x, p.y, p.z)
      } else if (camera.setTarget) {
        camera.setTarget({ x: p.x, y: p.y, z: p.z })
      }
    },
    update(dt) {
      if (!node) return
      const p = node.position
      const tx = p.x + offset[0]
      const ty = p.y + offset[1]
      const tz = p.z + offset[2]
      const k = Math.min(1, dt * stiffness)
      state.x += (tx - state.x) * k
      state.y += (ty - state.y) * k
      state.z += (tz - state.z) * k
      if (lerpTarget && camera.target && camera.target.set) {
        camera.target.set(state.x, state.y, state.z)
      } else if (camera.setTarget) {
        camera.setTarget({ x: state.x, y: state.y, z: state.z })
      }
    },
  }
}

// ============================================================
// 3. 输入 — 键盘 + 触摸 + 摇杆统一
// ============================================================
export function createInput(opts = {}) {
  const keys = {}
  const keyVec = opts.keyMap || {
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    arrowup: [0, -1], arrowdown: [0, 1], arrowleft: [-1, 0], arrowright: [1, 0],
  }
  const joystick = opts.joystick || signal([0, 0])
  const deadzone = opts.deadzone ?? 0.1

  if (opts.listenKeyboard !== false && typeof window !== 'undefined') {
    window.addEventListener('keydown', e => {
      keys[e.key.toLowerCase()] = true
      if (opts.preventDefault !== false) e.preventDefault()
    })
    window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false })
    window.addEventListener('blur', () => { for (const k in keys) keys[k] = false })
  }

  return {
    keys,
    get vector() {
      let x = 0, z = 0
      for (const k in keys) if (keys[k] && keyVec[k]) { x += keyVec[k][0]; z += keyVec[k][1] }
      const [jx, jz] = joystick()
      x += jx; z += jz
      const l = Math.hypot(x, z)
      if (l > 1) { x /= l; z /= l }
      return [Math.abs(x) < deadzone ? 0 : x, Math.abs(z) < deadzone ? 0 : z]
    },
    isDown(k) { return !!keys[k] },
  }
}

// ============================================================
// 4. 状态机 — 菜单 / 游戏中 / 暂停 / 结束
// ============================================================
export function createStateMachine(initial, transitions = {}) {
  const state = signal(initial)
  const history = [initial]
  const onEnter = {}, onExit = {}

  function register(map, key, fn) { if (fn) { map[key] = map[key] || []; map[key].push(fn) } }
  for (const [name, cfg] of Object.entries(transitions)) {
    register(onEnter, name, cfg.enter)
    register(onExit, name, cfg.exit)
  }

  function goto(next) {
    const prev = state()
    if (prev === next) return
    if (onExit[prev]) for (const fn of onExit[prev]) fn(next, prev)
    history.push(next)
    state(next)
    if (onEnter[next]) for (const fn of onEnter[next]) fn(prev, next)
  }

  return {
    state,
    get: () => state(),
    is: (s) => state() === s,
    goto,
    on(evt, fn) { register(onEnter, '#' + evt, fn); return () => {} },
    history: () => [...history],
  }
}

// ============================================================
// 5. 计时器 — 倒计时 / 累计
// ============================================================
export function createTimer(opts = {}) {
  const duration = opts.duration ?? 60
  const countdown = opts.countdown !== false
  const time = signal(countdown ? duration : 0)
  const running = signal(false)
  const onEnd = opts.onEnd

  let tickHandler = null
  return {
    time,
    running,
    start() {
      time(countdown ? duration : 0)
      running(true)
      if (tickHandler) clearInterval(tickHandler)
      const startAt = performance.now()
      tickHandler = setInterval(() => {
        if (!running()) return
        const elapsed = (performance.now() - startAt) / 1000
        if (countdown) {
          const left = Math.max(0, duration - elapsed)
          time(Math.ceil(left))
          if (left <= 0) { running(false); clearInterval(tickHandler); onEnd?.() }
        } else {
          time(Math.floor(elapsed))
        }
      }, 500)
    },
    stop() { running(false); if (tickHandler) clearInterval(tickHandler) },
    reset() { time(countdown ? duration : 0); running(false) },
    update(dt) {
      if (!running()) return
      if (countdown) {
        const t = time() - dt
        if (t <= 0) { time(0); running(false); onEnd?.() }
        else time(t)
      } else time(time() + dt)
    },
  }
}

// ============================================================
// 6. 计分 — 分数 + 最高分 (localStorage)
// ============================================================
export function createScore(opts = {}) {
  const key = opts.key || 'xunay_score'
  const initial = opts.initial ?? 0
  let saved = initial
  try { saved = +(localStorage.getItem(key + '_best') || 0) } catch {}
  const score = signal(initial)
  const best = signal(Math.max(saved, initial))

  return {
    score, best,
    add(n) { score(score() + n) },
    set(n) { score(n) },
    reset() { score(0) },
    commit() {
      if (score() > best()) {
        best(score())
        try { localStorage.setItem(key + '_best', String(best())) } catch {}
        return true // new record
      }
      return false
    },
  }
}

// ============================================================
// 7. 对象池 — 复用对象, 减少 GC
// ============================================================
export function createPool(opts = {}) {
  const factory = opts.factory
  const reset = opts.reset || ((o) => o)
  const size = opts.size ?? 32
  const free = []
  const active = new Set()

  for (let i = 0; i < size; i++) free.push(factory())

  return {
    acquire() {
      let obj = free.pop()
      if (!obj) obj = factory()
      reset(obj)
      active.add(obj)
      return obj
    },
    release(obj) {
      if (!active.has(obj)) return
      active.delete(obj)
      free.push(obj)
    },
    get activeCount() { return active.size },
    get freeCount() { return free.length },
    forEach(fn) { active.forEach(fn) },
    clear() { active.forEach(o => free.push(o)); active.clear() },
  }
}

// ============================================================
// 8. 生成器 — 定时/条件触发
// ============================================================
export function createSpawner(opts = {}) {
  const interval = opts.interval ?? 1
  const max = opts.max ?? 8
  const spawn = opts.spawn
  const despawn = opts.despawn
  const active = []
  let acc = 0

  return {
    update(dt) {
      acc += dt
      if (acc >= interval && active.length < max) {
        acc -= interval
        const item = spawn()
        if (item != null) active.push(item)
      }
    },
    remove(item) {
      const i = active.indexOf(item)
      if (i >= 0) { active.splice(i, 1); despawn?.(item) }
    },
    get list() { return active },
    reset() { active.forEach(o => despawn?.(o)); active.length = 0; acc = 0 },
  }
}

// ============================================================
// 9. 碰撞 — 2D 距离检测 (XZ 平面)
// ============================================================
export function collide2D(a, b, radius) {
  const dx = a.x - b.x
  const dz = a.z - b.z
  const r = radius || 0.5
  return dx * dx + dz * dz < r * r
}

// ============================================================
// 10. 加载流程 — 分步进度
// ============================================================
export function createLoading(opts = {}) {
  const steps = opts.steps || []
  const progress = signal(0)
  const current = signal('')
  const done = signal(false)

  return {
    progress, current, done,
    async run() {
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i]
        current(typeof s === 'string' ? s : s.label)
        if (typeof s === 'function') await s()
        else if (s.run) await s.run()
        progress(Math.round(((i + 1) / steps.length) * 100))
      }
      done(true)
    },
    bindDOM(barId, textId) {
      if (typeof document === 'undefined') return
      effect(() => {
        const bar = document.getElementById(barId)
        if (bar) bar.style.width = progress() + '%'
      })
      effect(() => {
        const t = document.getElementById(textId)
        if (t) t.textContent = done() ? '就绪' : (current() || '加载中')
      })
    },
  }
}

export default {
  createGameLoop, createFollowCamera, createInput, createStateMachine,
  createTimer, createScore, createPool, createSpawner, collide2D, createLoading,
}
