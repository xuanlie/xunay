// XuNay ↔ Howler.js 音频集成
// Howler 走 CDN: <script src="https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js">
// 设计: signal 驱动音量, 分组总线 (master / bgm / sfx)
import { signal, effect } from './core.js'

let _Howl = null
let _Howler = null

export function loadHowler() {
  if (_Howl) return { Howl: _Howl, Howler: _Howler }
  if (typeof window === 'undefined') throw new Error('[xunay/audio] 非浏览器环境')
  if (!window.Howl) {
    throw new Error('[xunay/audio] window.Howl 未找到. 请先加载 https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js')
  }
  _Howl = window.Howl
  _Howler = window.Howler
  return { Howl: _Howl, Howler: _Howler }
}

// ============================================================
// 1. 全局音频管理器
// ============================================================
let _globalAudio = null

export function createAudio(opts = {}) {
  const { Howl, Howler } = loadHowler()
  const sounds = new Map()      // name -> { howl, kind, bus }
  const buses = { master: 1, bgm: 0.6, sfx: 1.0 }

  // 音量 signal (三方)
  const volume = signal(opts.volume ?? 1.0)   // master
  const muted = signal(false)

  // master 音量响应式
  effect(() => {
    Howler.volume(muted() ? 0 : volume() * buses.master)
  })

  // 注册音效/音乐
  // kind: 'sfx' | 'bgm'
  function register(name, src, cfg = {}) {
    const kind = cfg.kind || 'sfx'
    const bus = cfg.bus || kind
    const howl = new Howl({
      src: Array.isArray(src) ? src : [src],
      loop: cfg.loop ?? (kind === 'bgm'),
      preload: cfg.preload ?? (kind === 'bgm'),
      html5: cfg.html5 ?? (kind === 'bgm'),  // BGM 用 streaming
      volume: (cfg.volume ?? 1.0) * buses[bus],
      sprite: cfg.sprite,
      onload: cfg.onload,
      onloaderror: cfg.onError,
      onplayerror: cfg.onError,
      onend: cfg.onEnd,
    })
    sounds.set(name, { howl, kind, bus, baseVolume: cfg.volume ?? 1.0 })
    return howl
  }

  // 播放
  function play(name, opts = {}) {
    const entry = sounds.get(name)
    if (!entry) { console.warn(`[audio] 未注册: ${name}`); return null }
    // BGM: 先停之前的
    if (entry.kind === 'bgm' && opts.single !== false) stop(name)
    const id = entry.howl.play()
    if (id == null) return null
    if (opts.fade) {
      const target = (opts.volume ?? 1.0) * buses[entry.bus] * entry.baseVolume
      entry.howl.volume(0, id)
      entry.howl.fade(0, target, opts.fade, id)
    } else if (opts.volume !== undefined) {
      entry.howl.volume(opts.volume * buses[entry.bus] * entry.baseVolume, id)
    }
    if (opts.rate) entry.howl.rate(opts.rate, id)
    if (opts.seek) entry.howl.seek(opts.seek, id)
    return id
  }

  function stop(name, id) {
    const entry = sounds.get(name)
    if (!entry) return
    if (id != null) entry.howl.stop(id)
    else entry.howl.stop()
  }

  function pause(name, id) {
    const entry = sounds.get(name)
    if (entry) entry.howl.pause(id)
  }

  function fade(name, from, to, ms, id) {
    const entry = sounds.get(name)
    if (entry) entry.howl.fade(from, to, ms, id)
  }

  function setBusVolume(bus, v) {
    buses[bus] = v
    // 重设所有在这个 bus 上的音量
    for (const [name, entry] of sounds) {
      if (entry.bus === bus) {
        const target = entry.baseVolume * v * (muted() ? 0 : volume())
        entry.howl.volume(target)
      }
    }
  }

  function getBusVolume(bus) { return buses[bus] }

  function stopAll() { for (const { howl } of sounds.values()) howl.stop() }
  function pauseAll() { for (const { howl } of sounds.values()) howl.pause() }
  function unload(name) {
    const e = sounds.get(name)
    if (e) { e.howl.unload(); sounds.delete(name) }
  }
  function unloadAll() {
    for (const { howl } of sounds.values()) howl.unload()
    sounds.clear()
  }

  // 移动端解锁 (必须在用户交互后调用)
  function unlock() {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume()
    }
    // 空播放一个静音, 触发解锁
    Howler.mute(true)
    const t = setTimeout(() => Howler.mute(muted()), 50)
  }

  // 自动检测移动端并挂解锁
  if (opts.autoUnlock !== false && typeof document !== 'undefined') {
    const handler = () => {
      unlock()
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('click', handler)
    }
    document.addEventListener('touchstart', handler, { once: true })
    document.addEventListener('click', handler, { once: true })
  }

  const api = {
    volume, muted,
    register, play, stop, pause, fade,
    setBusVolume, getBusVolume,
    stopAll, pauseAll, unload, unloadAll, unlock,
    get Howl() { return Howl },
    get Howler() { return Howler },
    get sounds() { return sounds },
    dispose() {
      unloadAll()
      if (_globalAudio === api) _globalAudio = null
    },
  }
  _globalAudio = api
  return api
}

// ============================================================
// 2. 便捷: 一次性音效 (点击/碰撞等短音)
// ============================================================
export function createSfx(src, opts = {}) {
  const { Howl } = loadHowler()
  const pool = []
  const size = opts.pool ?? 4
  for (let i = 0; i < size; i++) {
    pool.push(new Howl({
      src: Array.isArray(src) ? src : [src],
      preload: true,
      volume: opts.volume ?? 1.0,
    }))
  }
  let idx = 0
  return {
    play(v) {
      const h = pool[idx = (idx + 1) % size]
      if (v !== undefined) h.volume(v)
      return h.play()
    },
    dispose() { pool.forEach(h => h.unload()); pool.length = 0 },
  }
}

// ============================================================
// 3. 便捷: 背景音乐 (循环 + 淡入淡出)
// ============================================================
export function createBgm(src, opts = {}) {
  const { Howl } = loadHowler()
  const volume = signal(opts.volume ?? 0.6)
  const playing = signal(false)
  const howl = new Howl({
    src: Array.isArray(src) ? src : [src],
    loop: opts.loop !== false,
    html5: true,        // 大文件走 streaming
    preload: 'metadata',
    volume: volume(),
    onplay: () => playing(true),
    onpause: () => playing(false),
    onstop: () => playing(false),
    onend: () => playing(false),
  })

  // 音量响应式
  effect(() => howl.volume(volume()))

  return {
    volume, playing,
    howl,
    play(fade = 0) {
      if (playing()) return
      howl.play()
      if (fade > 0) {
        howl.volume(0)
        howl.fade(0, volume(), fade)
      }
    },
    stop(fade = 0) {
      if (!playing()) return
      if (fade > 0) {
        howl.fade(volume(), 0, fade)
        setTimeout(() => howl.stop(), fade)
      } else {
        howl.stop()
      }
    },
    toggle() { playing() ? this.stop(300) : this.play(300) },
    dispose() { howl.unload() },
  }
}

// ============================================================
// 4. 3D 空间音效 (配合 Babylon 场景)
// ============================================================
export function createSpatialSfx(src, opts = {}) {
  const { Howl, Howler } = loadHowler()
  // Howler 的 3D 需要用户提供位置
  const howl = new Howl({
    src: Array.isArray(src) ? src : [src],
    volume: opts.volume ?? 1.0,
    loop: opts.loop || false,
  })
  let id = null

  return {
    howl,
    attach(listener, emitter) {
      // listener/emitter: { position: {x,y,z} }
      const update = () => {
        if (!id) return
        const dx = emitter.position.x - listener.position.x
        const dy = emitter.position.y - listener.position.y
        const dz = emitter.position.z - listener.position.z
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        const maxDist = opts.maxDistance ?? 30
        const v = Math.max(0, 1 - dist / maxDist) * (opts.volume ?? 1.0)
        howl.volume(v, id)
        if (Howler.ctx && Howler.ctx.listener) {
          const l = Howler.ctx.listener
          if (l.setPosition) l.setPosition(listener.position.x, listener.position.y, listener.position.z)
          else if (l.positionX) {
            l.positionX.value = listener.position.x
            l.positionY.value = listener.position.y
            l.positionZ.value = listener.position.z
          }
        }
        if (howl._sounds && howl._sounds[0]) {
          const s = howl._sounds[0]
          if (s._pannerAttr) {
            // 简化: 只调音量
          }
        }
      }
      return { update, play: () => { id = howl.play(); return id }, stop: () => { if (id) howl.stop(id) } }
    },
    dispose() { howl.unload() },
  }
}

export default { loadHowler, createAudio, createSfx, createBgm, createSpatialSfx }
