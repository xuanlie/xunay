// XuNay ↔ Babylon.js 全量集成
// 设计原则:
//   1. 所有属性值支持 signal (函数) → 自动 effect 订阅
//   2. 简写: position/rotation/scaling 数组, color '#hex', 自动转换
//   3. 和 XuNay 的 div({...}) 风格一致
//   4. Babylon 从 window.BABYLON 拿 (CDN), 不打包

import { effect, untrack } from './core.js'

// ============================================================
// 0. 加载
// ============================================================
let BJS = null
export function loadBabylon() {
  if (BJS) return BJS
  if (typeof window !== 'undefined' && window.BABYLON) { BJS = window.BABYLON; return BJS }
  throw new Error('[xunay/babylon] window.BABYLON 未找到. 先加载 https://cdn.babylonjs.com/babylon.js')
}

// ============================================================
// 1. 值转换
// ============================================================
const _isFn = v => typeof v === 'function' && v.length === 0
const _r = v => _isFn(v) ? v() : v

function _vec2(B, v) {
  if (v instanceof B.Vector2) return v
  if (Array.isArray(v)) return new B.Vector2(v[0] ?? 0, v[1] ?? 0)
  if (typeof v === 'number') return new B.Vector2(v, v)
  return new B.Vector2(0, 0)
}
function _vec3(B, v) {
  if (v instanceof B.Vector3) return v
  if (Array.isArray(v)) return new B.Vector3(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0)
  if (typeof v === 'number') return new B.Vector3(v, v, v)
  return B.Vector3.Zero()
}
function _color3(B, v) {
  if (v instanceof B.Color3) return v
  if (Array.isArray(v)) return new B.Color3(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0)
  if (typeof v === 'string') {
    let h = v.replace('#','')
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    if (h.length >= 6)
      return new B.Color3(parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255)
  }
  return new B.Color3(1,1,1)
}
function _color4(B, v) {
  if (v instanceof B.Color4) return v
  if (Array.isArray(v)) return new B.Color4(v[0] ?? 0, v[1] ?? 0, v[2] ?? 0, v[3] ?? 1)
  if (typeof v === 'string') {
    let h = v.replace('#','')
    if (h.length === 3) h = h.split('').map(c => c + c).join('') + 'ff'
    if (h.length === 6) h += 'ff'
    if (h.length === 8)
      return new B.Color4(parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255,
                          parseInt(h.slice(4,6),16)/255, parseInt(h.slice(6,8),16)/255)
  }
  return new B.Color4(0,0,0,1)
}

// 通用属性赋值 (支持 vector/color 特殊处理)
function _assign(B, target, key, val) {
  val = _r(val)
  if (val === undefined || val === null) return

  if (key === 'position' || key === 'rotation' || key === 'scaling') {
    const a = Array.isArray(val) ? val : (typeof val === 'number' ? [val,val,val] : null)
    if (a) {
      if (target[key] && target[key].set) target[key].set(a[0] ?? 0, a[1] ?? 0, a[2] ?? 0)
      else target[key] = _vec3(B, a)
    }
    return
  }
  if (key === 'rotationQuaternion') {
    if (Array.isArray(val) && val.length === 4) {
      if (!target.rotationQuaternion) target.rotationQuaternion = new B.Quaternion(...val)
      else target.rotationQuaternion.set(val[0], val[1], val[2], val[3])
    }
    return
  }
  if (key === 'color' || key === 'diffuseColor' || key === 'albedoColor'
      || key === 'emissiveColor' || key === 'specularColor' || key === 'ambientColor') {
    const c = _color3(B, val)
    if (target[key] && target[key].copyFrom) target[key].copyFrom(c)
    else target[key] = c
    return
  }
  if (key === 'alpha') { target.visibility = val; return }
  if (key === 'target' || key === 'direction') {
    const vv = _vec3(B, val)
    if (target[key] && target[key].copyFrom) target[key].copyFrom(vv)
    else target[key] = vv
    return
  }

  target[key] = val
}

// 对 props 做响应式绑定
function _bindAll(B, target, props, skip = []) {
  const stops = []
  for (const [k, v] of Object.entries(props)) {
    if (skip.includes(k)) continue
    if (_isFn(v)) stops.push(effect(() => _assign(B, target, k, v())))
    else _assign(B, target, k, v)
  }
  return () => stops.forEach(s => s())
}

// ============================================================
// 2. 上下文
// ============================================================
let _ctx = null
export function getCtx() { return _ctx }

// ============================================================
// 3. 场景
// ============================================================
export function createScene(opts = {}) {
  const B = loadBabylon()
  let canvas = opts.canvas
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;outline:none;touch-action:none'
    ;(opts.mount || document.body).appendChild(canvas)
  }
  const engine = new B.Engine(canvas, opts.antialias !== false, {
    adaptToDeviceRatio: opts.adaptToDeviceRatio !== false,
    powerPreference: opts.powerPreference || 'high-performance',
    preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
    stencil: opts.stencil !== false,
  })
  if (opts.hardwareScaling !== undefined) engine.setHardwareScalingLevel(opts.hardwareScaling)

  const scene = new B.Scene(engine)
  scene.clearColor = _color4(B, opts.clearColor || [0.02, 0.02, 0.04, 1])
  scene.ambientColor = _color3(B, opts.ambientColor || [0.2, 0.2, 0.25])
  if (opts.fog) {
    scene.fogMode = B.Scene.FOGMODE_EXP
    scene.fogColor = _color3(B, opts.fog.color || [0.1, 0.1, 0.15])
    scene.fogDensity = opts.fog.density ?? 0.01
  }
  if (opts.collisions) scene.collisionsEnabled = true

  // 建 ctx (先设 _ctx, 让 createCamera/createLight 能用)
  const ctx = {
    canvas, engine, scene, B, camera: null, lights: [],
    _frames: new Set(), _before: new Set(), _after: new Set(),
    onFrame(fn) { ctx._frames.add(fn); return () => ctx._frames.delete(fn) },
    beforeRender(fn) { ctx._before.add(fn); return () => ctx._before.delete(fn) },
    afterRender(fn) { ctx._after.add(fn); return () => ctx._after.delete(fn) },
    resize() { engine.resize() },
    dispose() {
      window.removeEventListener('resize', _onResize)
      engine.stopRenderLoop(); scene.dispose(); engine.dispose()
      if (_ctx === ctx) _ctx = null
    },
  }
  _ctx = ctx

  const _onResize = () => engine.resize()
  window.addEventListener('resize', _onResize)

  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000
    for (const fn of ctx._before) { try { fn(dt) } catch (e) { console.error(e) } }
    for (const fn of ctx._frames) { try { fn(dt, scene) } catch (e) { console.error(e) } }
    scene.render()
    for (const fn of ctx._after) { try { fn(dt) } catch (e) { console.error(e) } }
  })

  // 相机 (可关)
  if (opts.camera !== false) {
    createCamera(opts.camera === true ? {} : (opts.camera || {}))
  }
  // 默认光 (可关)
  if (opts.light !== false) {
    createLight({
      type: opts.lightType || 'hemi',
      intensity: opts.lightIntensity ?? 1,
      direction: opts.lightDirection || [0,1,0],
      groundColor: opts.groundColor || [0.08, 0.08, 0.12],
      shadows: opts.shadows,
    })
  }
  return ctx
}

// ============================================================
// 3.5 移动端触摸手势 (单指拖拽 / 双指缩放 / 双指旋转)
// ============================================================
export function setupTouchGestures(canvas, camera, opts = {}) {
  const ctx = _ctx
  if (!ctx) throw new Error('[xunay/babylon] setupTouchGestures: 需要先 createScene')
  const { B, engine, scene } = ctx
  camera = camera || ctx.camera
  if (!camera) return () => {}

  // 关闭相机自带的控制 (arc 相机 attachControl 会和手势冲突)
  if (opts.detachBuiltin !== false && camera.detachControl) {
    camera.detachControl(canvas)
  }

  const state = {
    touches: new Map(),
    pinchStart: 0,
    radiusStart: 0,
    rotStart: 0,
    alphaStart: 0,
    lastMove: 0,
  }
  const speed = opts.speed ?? 1.0
  const pinchSpeed = opts.pinchSpeed ?? 1.0
  const minRadius = opts.minRadius ?? 3
  const maxRadius = opts.maxRadius ?? 50
  const damping = opts.damping ?? 0.85

  function getCenter() {
    const arr = [...state.touches.values()]
    if (arr.length === 0) return null
    if (arr.length === 1) return arr[0]
    return {
      x: (arr[0].x + arr[1].x) / 2,
      y: (arr[0].y + arr[1].y) / 2,
    }
  }
  function getPinchDist() {
    const arr = [...state.touches.values()]
    if (arr.length < 2) return 0
    const dx = arr[0].x - arr[1].x
    const dy = arr[0].y - arr[1].y
    return Math.sqrt(dx * dx + dy * dy)
  }
  function getAngle() {
    const arr = [...state.touches.values()]
    if (arr.length < 2) return 0
    return Math.atan2(arr[1].y - arr[0].y, arr[1].x - arr[0].x)
  }

  function onStart(e) {
    for (const t of e.changedTouches) {
      state.touches.set(t.identifier, { x: t.clientX, y: t.clientY })
    }
    if (state.touches.size === 2) {
      state.pinchStart = getPinchDist()
      state.radiusStart = camera.radius || 10
      state.rotStart = getAngle()
      state.alphaStart = camera.alpha || 0
    }
    e.preventDefault()
  }

  function onMove(e) {
    if (state.touches.size === 0) return
    const prev = state.touches.size === 1 ? [...state.touches.values()][0] : null

    for (const t of e.changedTouches) {
      state.touches.set(t.identifier, { x: t.clientX, y: t.clientY })
    }

    if (state.touches.size === 1 && prev) {
      // 单指旋转
      const cur = [...state.touches.values()][0]
      const dx = cur.x - prev.x
      const dy = cur.y - prev.y
      if (camera.alpha !== undefined) camera.alpha -= dx * 0.008 * speed
      if (camera.beta !== undefined) {
        camera.beta -= dy * 0.008 * speed
        camera.beta = Math.max(0.1, Math.min(Math.PI - 0.1, camera.beta))
      } else if (camera.position) {
        // follow/free 相机: 用 setTarget 旋转
        const r = camera.radius || 10
        camera.alpha = (camera.alpha || 0) - dx * 0.008 * speed
      }
    } else if (state.touches.size === 2) {
      // 双指缩放
      const dist = getPinchDist()
      if (state.pinchStart > 0 && camera.radius !== undefined) {
        const scale = state.pinchStart / dist
        let nr = state.radiusStart * scale
        nr = Math.max(minRadius, Math.min(maxRadius, nr))
        camera.radius = nr
      }
      // 双指旋转
      const a = getAngle()
      if (camera.alpha !== undefined) {
        camera.alpha = state.alphaStart - (a - state.rotStart)
      }
    }
    e.preventDefault()
  }

  function onEnd(e) {
    for (const t of e.changedTouches) {
      state.touches.delete(t.identifier)
    }
    if (state.touches.size < 2) {
      state.pinchStart = 0
    }
  }

  canvas.addEventListener('touchstart', onStart, { passive: false })
  canvas.addEventListener('touchmove', onMove, { passive: false })
  canvas.addEventListener('touchend', onEnd, { passive: false })
  canvas.addEventListener('touchcancel', onEnd, { passive: false })

  // 禁页面滚动 / 双击缩放
  const preventScroll = (e) => e.preventDefault()
  document.body.addEventListener('touchmove', preventScroll, { passive: false })
  canvas.addEventListener('dblclick', (e) => e.preventDefault())

  return () => {
    canvas.removeEventListener('touchstart', onStart)
    canvas.removeEventListener('touchmove', onMove)
    canvas.removeEventListener('touchend', onEnd)
    canvas.removeEventListener('touchcancel', onEnd)
    document.body.removeEventListener('touchmove', preventScroll)
  }
}

// 自动检测移动端
export function isMobile() {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window && window.innerWidth < 1024)
}

// 移动端性能预设: 低分辨率 + 关阴影 + 关抗锯齿
export function mobilePreset(engine, opts = {}) {
  if (!isMobile()) return
  // 降低渲染分辨率 50%
  engine.setHardwareScalingLevel(opts.scale ?? 2)
  // 降低物理更新频率
  engine.getDeltaTime() // 初始化
  if (opts.shadows === 'off') {
    const { scene } = _ctx || {}
    if (scene) {
      scene.lights.forEach(l => {
        if (l._shadowGenerator) l._shadowGenerator.getShadowMap().renderList = []
      })
    }
  }
}

// ============================================================
// 4. 相机 (5 种)
// ============================================================
export function createCamera(opts = {}) {
  const ctx = _ctx
  if (!ctx) throw new Error('[xunay/babylon] createCamera: 需要先 createScene')
  const { B, scene, canvas } = ctx
  const type = opts.type || 'arc'
  const name = opts.name || 'camera'
  const pos = _vec3(B, opts.position || [0, 0, -10])
  const target = _vec3(B, opts.target || [0, 0, 0])
  let cam

  switch (type) {
    case 'free':
      cam = new B.FreeCamera(name, pos, scene); cam.setTarget(target); break
    case 'universal':
      cam = new B.UniversalCamera(name, pos, scene); cam.setTarget(target); break
    case 'follow':
      cam = new B.FollowCamera(name, pos, scene)
      if (opts.lockedTarget) cam.lockedTarget = opts.lockedTarget.mesh || opts.lockedTarget
      cam.radius = opts.radius ?? 10
      cam.heightOffset = opts.heightOffset ?? 4
      cam.rotationOffset = opts.rotationOffset ?? 0
      break
    case 'target': case 'targetcam':
      cam = new B.TargetCamera(name, pos, scene); cam.setTarget(target); break
    case 'arc': default:
      cam = new B.ArcRotateCamera(name,
        opts.alpha ?? -Math.PI/2,
        opts.beta ?? Math.PI/2.6,
        opts.radius ?? 10, target, scene)
      if (opts.cameraLimits !== false) {
        cam.lowerRadiusLimit = opts.minRadius ?? 2
        cam.upperRadiusLimit = opts.maxRadius ?? 50
      }
      break
  }

  if (opts.attach !== false && cam.attachControl) cam.attachControl(canvas, true)
  if (opts.speed !== undefined) cam.speed = opts.speed
  if (opts.inertia !== undefined && cam.inertia !== undefined) cam.inertia = opts.inertia
  if (opts.fov !== undefined && cam.fov !== undefined) cam.fov = opts.fov
  if (opts.minZ !== undefined) cam.minZ = opts.minZ
  if (opts.maxZ !== undefined) cam.maxZ = opts.maxZ
  if (opts.wheelPrecision !== undefined) cam.wheelPrecision = opts.wheelPrecision
  if (opts.pinchPrecision !== undefined) cam.pinchPrecision = opts.pinchPrecision

  ctx.camera = cam
  return cam
}

// ============================================================
// 5. 光 (4 种 + 阴影)
// ============================================================
export function createLight(opts = {}) {
  const ctx = _ctx
  if (!ctx) throw new Error('[xunay/babylon] createLight: 需要先 createScene')
  const { B, scene } = ctx
  const type = opts.type || 'hemi'
  const name = opts.name || ('light_' + Math.random().toString(36).slice(2,6))
  const pos = _vec3(B, opts.position || [0, 1, 0])
  let light

  switch (type) {
    case 'directional': case 'dir':
      light = new B.DirectionalLight(name, _vec3(B, opts.direction || [0, -1, 0]), scene); break
    case 'point':
      light = new B.PointLight(name, pos, scene); break
    case 'spot':
      light = new B.SpotLight(name, pos, _vec3(B, opts.direction || [0, -1, 0]),
        opts.angle ?? Math.PI/3, opts.exponent ?? 2, scene); break
    case 'hemi': default:
      light = new B.HemisphericLight(name, _vec3(B, opts.direction || [0, 1, 0]), scene); break
  }

  if (opts.intensity !== undefined) light.intensity = opts.intensity
  if (opts.diffuse) light.diffuse = _color3(B, opts.diffuse)
  if (opts.specular) light.specular = _color3(B, opts.specular)
  if (opts.groundColor && light.groundColor) light.groundColor = _color3(B, opts.groundColor)
  if (opts.range !== undefined && light.range !== undefined) light.range = opts.range
  if (opts.position && light.position) light.position = pos
  if (opts.direction && light.direction) light.direction = _vec3(B, opts.direction)

  // 阴影
  if (opts.shadows) {
    const sg = new B.ShadowGenerator(opts.shadowMapSize || 1024, light)
    if (opts.shadowBlur !== false) {
      sg.useBlurExponentialShadowMap = true
      sg.blurKernel = opts.shadowBlurKernel || 32
    } else {
      sg.useExponentialShadowMap = true
    }
    if (opts.shadowDarkness !== undefined) sg.darkness = opts.shadowDarkness
    light._shadowGenerator = sg
  }

  ctx.lights.push(light)
  return light
}

// ============================================================
// 6. Mesh 工厂 — 统一模板
// ============================================================
const _MESH_SKIP = ['name','type','parent','material','color','metallic','roughness',
  'emissiveColor','albedoColor','alpha','castShadow','receiveShadow','onPointer',
  'billboardMode','doubleSided','updatable','sideOrientation']

function _makeMesh(type, builderFn) {
  return (opts = {}) => {
    const ctx = _ctx
    if (!ctx) throw new Error(`[xunay/babylon] ${type} 需要先 createScene`)
    const { B, scene } = ctx
    const name = opts.name || (type.toLowerCase() + '_' + Math.random().toString(36).slice(2, 7))
    const mesh = builderFn(B, scene, name, opts)
    if (!mesh) throw new Error(`[xunay/babylon] ${type} 创建失败`)

    // 材质
    let mat = null
    const wantsMat = opts.color !== undefined || opts.material !== undefined
      || opts.metallic !== undefined || opts.roughness !== undefined
      || opts.emissiveColor !== undefined || opts.albedoColor !== undefined
    if (wantsMat) {
      if (opts.material && typeof opts.material === 'object' && opts.material.albedoColor) {
        mat = opts.material
      } else if (opts.material === 'standard') {
        mat = new B.StandardMaterial(name + '_mat', scene)
        if (opts.color !== undefined) mat.diffuseColor = _color3(B, _r(opts.color))
        if (opts.emissiveColor) mat.emissiveColor = _color3(B, _r(opts.emissiveColor))
      } else {
        mat = new B.PBRMaterial(name + '_mat', scene)
        mat.metallic = opts.metallic ?? 0.7
        mat.roughness = opts.roughness ?? 0.3
        if (opts.color !== undefined) mat.albedoColor = _color3(B, _r(opts.color))
        if (opts.albedoColor !== undefined) mat.albedoColor = _color3(B, _r(opts.albedoColor))
        if (opts.emissiveColor) mat.emissiveColor = _color3(B, _r(opts.emissiveColor))
      }
      mesh.material = mat
    }

    // 父节点
    if (opts.parent) mesh.parent = opts.parent.mesh || opts.parent

    // Billboard
    if (opts.billboardMode !== undefined) {
      mesh.billboardMode = opts.billboardMode === true
        ? B.Mesh.BILLBOARDMODE_ALL : opts.billboardMode
    }

    // 响应式
    const meshStops = _bindAll(B, mesh, opts, _MESH_SKIP)
    let matStops = () => {}
    if (mat) matStops = _bindAll(B, mat, opts,
      ['name','type','parent','position','rotation','scaling','visibility','isVisible'])

    // 阴影
    if (opts.castShadow) for (const l of ctx.lights) if (l._shadowGenerator) l._shadowGenerator.addShadowCaster(mesh)
    if (opts.receiveShadow) mesh.receiveShadows = true

    // 交互
    let offPtr = null
    if (opts.onPointer) offPtr = onPointer({ mesh, ...opts.onPointer })

    const api = {
      mesh, material: mat, name,
      onFrame(fn) { return ctx.onFrame(dt => fn(api, dt)) },
      dispose() { offPtr?.(); meshStops(); matStops(); mesh.dispose() },
    }
    return api
  }
}

// -------------------- 全部 Mesh 类型 --------------------
export const Box = _makeMesh('Box', (B, scene, name, o) =>
  B.MeshBuilder.CreateBox(name, { size: o.size ?? 1, width: o.width, height: o.height, depth: o.depth }, scene))

export const Sphere = _makeMesh('Sphere', (B, scene, name, o) =>
  B.MeshBuilder.CreateSphere(name, { diameter: o.diameter ?? o.size ?? 1, segments: o.segments ?? 16 }, scene))

export const Ground = _makeMesh('Ground', (B, scene, name, o) =>
  B.MeshBuilder.CreateGround(name, { width: o.width ?? 10, height: o.height ?? 10, subdivisions: o.subdivisions ?? 1 }, scene))

export const Cylinder = _makeMesh('Cylinder', (B, scene, name, o) =>
  B.MeshBuilder.CreateCylinder(name, { height: o.height ?? 2, diameter: o.diameter ?? 1, tessellation: o.tessellation ?? 24 }, scene))

export const Torus = _makeMesh('Torus', (B, scene, name, o) =>
  B.MeshBuilder.CreateTorus(name, { diameter: o.diameter ?? 2, thickness: o.thickness ?? 0.4, tessellation: o.tessellation ?? 32 }, scene))

export const TorusKnot = _makeMesh('TorusKnot', (B, scene, name, o) =>
  B.MeshBuilder.CreateTorusKnot(name, { radius: o.radius ?? 1, tube: o.tube ?? 0.3, radialSegments: o.radialSegments ?? 64, tubularSegments: o.tubularSegments ?? 12 }, scene))

export const Plane = _makeMesh('Plane', (B, scene, name, o) =>
  B.MeshBuilder.CreatePlane(name, { size: o.size ?? 1, width: o.width, height: o.height,
    sideOrientation: o.doubleSided ? B.Mesh.DOUBLESIDE : B.Mesh.FRONTSIDE }, scene))

export const Disc = _makeMesh('Disc', (B, scene, name, o) =>
  B.MeshBuilder.CreateDisc(name, { radius: o.radius ?? 0.5, tessellation: o.tessellation ?? 32 }, scene))

export const IcoSphere = _makeMesh('IcoSphere', (B, scene, name, o) =>
  B.MeshBuilder.CreateIcoSphere(name, { radius: o.radius ?? 0.5, subdivisions: o.subdivisions ?? 4 }, scene))

export const Capsule = _makeMesh('Capsule', (B, scene, name, o) =>
  B.MeshBuilder.CreateCapsule(name, { height: o.height ?? 2, radius: o.radius ?? 0.5, tessellation: o.tessellation ?? 16 }, scene))

export const Polyhedron = _makeMesh('Polyhedron', (B, scene, name, o) =>
  B.MeshBuilder.CreatePolyhedron(name, { type: o.polyType ?? 1, size: o.size ?? 1 }, scene))

export const Lathe = _makeMesh('Lathe', (B, scene, name, o) =>
  B.MeshBuilder.CreateLathe(name, { shape: o.shape || [], radius: o.radius ?? 1,
    tessellation: o.tessellation ?? 32, sideOrientation: o.doubleSided ? B.Mesh.DOUBLESIDE : B.Mesh.FRONTSIDE }, scene))

export const Tube = _makeMesh('Tube', (B, scene, name, o) =>
  B.MeshBuilder.CreateTube(name, { path: o.path || [], radius: o.radius ?? 0.3,
    tessellation: o.tessellation ?? 16, cap: o.cap ?? B.Mesh.CAP_ALL }, scene))

export const Lines = _makeMesh('Lines', (B, scene, name, o) =>
  B.MeshBuilder.CreateLines(name, { points: o.points || [], colors: o.colors, updatable: !!o.updatable }, scene))

export const DashedLines = _makeMesh('DashedLines', (B, scene, name, o) =>
  B.MeshBuilder.CreateDashedLines(name, { points: o.points || [], dashSize: o.dashSize ?? 3,
    gapSize: o.gapSize ?? 1, dashNb: o.dashNb ?? 200 }, scene))

export const Ribbon = _makeMesh('Ribbon', (B, scene, name, o) =>
  B.MeshBuilder.CreateRibbon(name, { pathArray: o.pathArray || [], closeArray: !!o.closeArray,
    closePath: !!o.closePath, sideOrientation: o.doubleSided ? B.Mesh.DOUBLESIDE : B.Mesh.FRONTSIDE }, scene))

export const ExtrudeShape = _makeMesh('ExtrudeShape', (B, scene, name, o) =>
  B.MeshBuilder.ExtrudeShape(name, { shape: o.shape || [], path: o.path || [], scale: o.extrudeScale ?? 1,
    sideOrientation: o.doubleSided ? B.Mesh.DOUBLESIDE : B.Mesh.FRONTSIDE }, scene))

export const Polygon = _makeMesh('Polygon', (B, scene, name, o) =>
  B.MeshBuilder.CreatePolygon(name, { shape: o.shape || [], depth: o.depth ?? 0,
    sideOrientation: o.doubleSided ? B.Mesh.DOUBLESIDE : B.Mesh.FRONTSIDE }, scene))

export const GroundFromHeightMap = _makeMesh('GroundFromHeightMap', (B, scene, name, o) =>
  B.MeshBuilder.CreateGroundFromHeightMap(name, o.url, { width: o.width ?? 10, height: o.height ?? 10,
    subdivisions: o.subdivisions ?? 32, minHeight: o.minHeight ?? 0, maxHeight: o.maxHeight ?? 1 }, scene))

export const TiledPlane = _makeMesh('TiledPlane', (B, scene, name, o) =>
  B.MeshBuilder.CreateTiledPlane(name, { size: o.size ?? 1, tileSize: o.tileSize ?? 1,
    pattern: o.pattern ?? B.MeshBuilder.TILED_PLANE_PATTERN_CIRCLE }, scene))

// 通用: 任意 MeshBuilder 类型
export function Mesh(type, opts = {}) {
  return _makeMesh(type, (B, scene, name, o) => {
    const fn = B.MeshBuilder['Create' + type] || B.MeshBuilder[type]
    if (!fn) throw new Error(`[xunay/babylon] MeshBuilder.${type} 不存在`)
    const args = { ...o }
    for (const k of _MESH_SKIP) delete args[k]
    return fn.call(B.MeshBuilder, name, args, scene)
  })(opts)
}

// 3D 文字 (需 earcut + 字体数据, 用户可选)
export const Text3D = _makeMesh('Text3D', (B, scene, name, o) => {
  if (!B.CreateText) { console.warn('[xunay/babylon] Text3D 需要 earcut + 字体数据'); return null }
  return B.CreateText(name, o.text || 'Text', {
    size: o.size ?? 1, depth: o.depth ?? 0.1,
    fontData: o.font, resolution: o.resolution ?? 32,
  }, scene)
})

// ============================================================
// 7. 材质工厂
// ============================================================
export function PBRMaterial(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const mat = new B.PBRMaterial(opts.name || 'pbrMat', scene)
  _bindAll(B, mat, opts, ['name'])
  return mat
}

export function StandardMaterial(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const mat = new B.StandardMaterial(opts.name || 'stdMat', scene)
  _bindAll(B, mat, opts, ['name'])
  return mat
}

export function GridMaterial(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  if (!B.GridMaterial) throw new Error('GridMaterial 未加载 (需 materialsLibrary)')
  const mat = new B.GridMaterial(opts.name || 'gridMat', scene)
  _bindAll(B, mat, opts, ['name'])
  return mat
}

export function GradientMaterial(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  if (!B.GradientMaterial) throw new Error('GradientMaterial 未加载')
  const mat = new B.GradientMaterial(opts.name || 'gradMat', scene)
  _bindAll(B, mat, opts, ['name'])
  return mat
}

export function NormalMaterial(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  if (!B.NormalMaterial) throw new Error('NormalMaterial 未加载')
  const mat = new B.NormalMaterial(opts.name || 'normMat', scene)
  _bindAll(B, mat, opts, ['name'])
  return mat
}

export function ShaderMaterial(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  return new B.ShaderMaterial(opts.name || 'shaderMat', scene, {
    vertexSource: opts.vertex,
    fragmentSource: opts.fragment,
    attributes: opts.attributes || ['position', 'normal', 'uv'],
    uniforms: opts.uniforms || ['world', 'worldView', 'worldViewProjection'],
    needAlphaBlending: !!opts.alpha,
  })
}

// ============================================================
// 8. 纹理
// ============================================================
export function Texture(url, opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  return new B.Texture(url, scene,
    opts.noMipmap || false,
    opts.invertY !== false,
    opts.samplingMode,
    opts.onLoad, opts.onError)
}

export function DynamicTexture(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const w = opts.width ?? 512
  const h = opts.height ?? 512
  return new B.DynamicTexture(opts.name || 'dynTex', { width: w, height: h }, scene,
    opts.generateMipMaps !== false)
}

export function CubeTexture(urls, opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  return new B.CubeTexture(urls, scene, opts.noMipmap || false, opts.invertY !== false)
}

// ============================================================
// 9. 资源加载 (glTF / GLB / OBJ / STL)
// ============================================================
export function importMesh(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const ctx = _ctx; if (!ctx) return reject(new Error('需要 createScene'))
    const { B, scene } = ctx
    const parts = url.split('/')
    const fileName = opts.fileName || parts.pop()
    const rootUrl = opts.rootUrl || (parts.length ? parts.join('/') + '/' : '')
    B.SceneLoader.ImportMesh(
      opts.meshNames || '',
      rootUrl, fileName, scene,
      (meshes, ps, skeletons, animGroups, transformNodes, geometries, lights, sprites) =>
        resolve({ meshes, particleSystems: ps, skeletons, animationGroups: animGroups, transformNodes, geometries, lights, spriteManagers: sprites }),
      opts.onProgress,
      (scene, msg, ex) => reject(ex || new Error(msg)),
      opts.plugin
    )
  })
}

// ============================================================
// 10. 动画
// ============================================================
export function animate(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const {
    target, property, from, to, duration = 1, loop = false,
    easing, fps = 60, speed = 1, onEnd, autoplay = true,
  } = opts
  const t = target?.mesh || target
  if (!t) throw new Error('animate: target 无效')

  const isVec = property === 'position' || property === 'rotation' || property === 'scaling'
  const isColor = property.includes('olor')
  const type = isVec ? B.Animation.ANIMATIONTYPE_VECTOR3
    : isColor ? B.Animation.ANIMATIONTYPE_COLOR3
    : B.Animation.ANIMATIONTYPE_FLOAT

  const anim = new B.Animation(
    'anim_' + Math.random().toString(36).slice(2,6),
    property, fps, type,
    loop ? B.Animation.ANIMATIONLOOPMODE_CYCLE : B.Animation.ANIMATIONLOOPMODE_CONSTANT
  )
  const f0 = isVec ? _vec3(B, from) : isColor ? _color3(B, from) : from
  const f1 = isVec ? _vec3(B, to) : isColor ? _color3(B, to) : to
  anim.setKeys([{ frame: 0, value: f0 }, { frame: duration * fps, value: f1 }])

  if (easing && B[easing]) anim.setEasingFunction(new B[easing]())
  if (opts.pingPong) anim.enableBlending = true

  t.animations = t.animations || []
  t.animations.push(anim)

  const runner = () => scene.beginAnimation(t, 0, duration * fps, loop, speed, onEnd)
  if (autoplay) runner()

  return { anim, target: t, start: runner, stop: () => scene.stopAnimation(t) }
}

export function animationGroup(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const group = new B.AnimationGroup(opts.name || 'group', scene)
  return group
}

// ============================================================
// 11. 粒子
// ============================================================
export function Particles(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const ps = new B.ParticleSystem(opts.name || 'particles', opts.capacity || 500, scene)
  ps.emitter = opts.emitter ? (opts.emitter.mesh || opts.emitter) : B.Vector3.Zero()
  if (opts.texture) ps.particleTexture = opts.texture
  ps.color1 = _color4(B, opts.color1 || [1,1,1,1])
  ps.color2 = _color4(B, opts.color2 || [1,1,1,1])
  ps.colorDead = _color4(B, opts.colorDead || [0,0,0,0])
  ps.minSize = opts.minSize ?? 0.1
  ps.maxSize = opts.maxSize ?? 0.5
  ps.minLifeTime = opts.minLifeTime ?? 0.3
  ps.maxLifeTime = opts.maxLifeTime ?? 1.5
  ps.emitRate = opts.emitRate ?? 100
  ps.blendMode = opts.additive !== false ? B.ParticleSystem.BLENDMODE_ONEONE : B.ParticleSystem.BLENDMODE_STANDARD
  ps.gravity = _vec3(B, opts.gravity || [0, -9.8, 0])
  ps.direction1 = _vec3(B, opts.direction1 || [-1, 1, -1])
  ps.direction2 = _vec3(B, opts.direction2 || [1, 1, 1])
  ps.minEmitBox = _vec3(B, opts.minEmitBox || [0, 0, 0])
  ps.maxEmitBox = _vec3(B, opts.maxEmitBox || [0, 0, 0])
  ps.minEmitPower = opts.minEmitPower ?? 1
  ps.maxEmitPower = opts.maxEmitPower ?? 3
  ps.updateSpeed = opts.updateSpeed ?? 0.01
  if (opts.start !== false) ps.start()
  return ps
}

// ============================================================
// 12. 交互
// ============================================================
export function onPointer(opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const mesh = opts.mesh || opts.meshTarget
  const cleanups = []

  if (opts.click) {
    const o = scene.onPointerObservable.add(info => {
      if (info.type === B.PointerEventTypes.POINTERPICK && info.pickInfo?.pickedMesh === mesh)
        opts.click(info)
    })
    cleanups.push(() => scene.onPointerObservable.remove(o))
  }
  if (opts.down) {
    const o = scene.onPointerObservable.add(info => {
      if (info.type === B.PointerEventTypes.POINTERDOWN && info.pickInfo?.pickedMesh === mesh)
        opts.down(info)
    })
    cleanups.push(() => scene.onPointerObservable.remove(o))
  }
  if (opts.up) {
    const o = scene.onPointerObservable.add(info => {
      if (info.type === B.PointerEventTypes.POINTERUP && info.pickInfo?.pickedMesh === mesh)
        opts.up(info)
    })
    cleanups.push(() => scene.onPointerObservable.remove(o))
  }
  if (opts.enter || opts.leave) {
    mesh.actionManager = mesh.actionManager || new B.ActionManager(scene)
    if (opts.enter) {
      const a = new B.ExecuteCodeAction({ trigger: B.ActionManager.OnPointerOverTrigger }, () => opts.enter({ mesh }))
      mesh.actionManager.registerAction(a)
      cleanups.push(() => { try { mesh.actionManager.unregisterAction(a) } catch(e){} })
    }
    if (opts.leave) {
      const a = new B.ExecuteCodeAction({ trigger: B.ActionManager.OnPointerOutTrigger }, () => opts.leave({ mesh }))
      mesh.actionManager.registerAction(a)
      cleanups.push(() => { try { mesh.actionManager.unregisterAction(a) } catch(e){} })
    }
  }
  return () => cleanups.forEach(fn => fn())
}

export function raycast(scene) {
  const ctx = _ctx
  return scene.pick(scene.pointerX, scene.pointerY)
}

// ============================================================
// 13. Sprite
// ============================================================
export function SpriteManager(url, opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B, scene } = ctx
  const sm = new B.SpriteManager(opts.name || 'sprites', opts.capacity || 64,
    { width: opts.cellWidth || 64, height: opts.cellHeight || 64 }, scene,
    new B.Texture(url, scene))
  return sm
}

export function Sprite(manager, opts = {}) {
  const ctx = _ctx; if (!ctx) throw new Error('需要 createScene')
  const { B } = ctx
  const sp = new B.Sprite(opts.name || 'sprite', manager)
  if (opts.position) sp.position = _vec3(B, opts.position)
  if (opts.cellIndex !== undefined) sp.cellIndex = opts.cellIndex
  if (opts.size !== undefined) sp.size = opts.size
  if (opts.color) sp.color = _color3(B, opts.color)
  return sp
}

// ============================================================
// 14. 响应式绑定 (低层)
// ============================================================
export function bind(sig, target, prop, opts = {}) {
  const map = opts.map || (v => v)
  return effect(() => { target[prop] = map(sig()) })
}

export function bindSet(sigs, setter) {
  const arr = Array.isArray(sigs) ? sigs : [sigs]
  return effect(() => setter(...arr.map(s => s())))
}

export function bindTwoWay(sig, target, prop, opts = {}) {
  let guard = false
  const stop1 = effect(() => {
    const v = sig(); if (guard) return
    if (target[prop] !== v) target[prop] = v
  })
  const timer = setInterval(() => {
    const cur = target[prop]
    if (cur !== sig()) { guard = true; try { sig(cur) } finally { guard = false } }
  }, opts.interval ?? 50)
  return () => { stop1(); clearInterval(timer) }
}

export function bindColor(sig, target, prop, Color3Class) {
  return effect(() => {
    const c = sig()
    const B = _ctx?.B || { Color3: Color3Class }
    const cc = _color3(B, c)
    if (target[prop] && target[prop].copyFrom) target[prop].copyFrom(cc)
    else target[prop] = cc
  })
}

// ============================================================
// 15. 性能工具
// ============================================================
export function adaptiveScaling(engine, opts = {}) {
  const target = opts.targetFps || 55, min = opts.minScale || 1.0, max = opts.maxScale || 4
  let cur = engine.getHardwareScalingLevel()
  return setInterval(() => {
    const fps = engine.getFps()
    if (fps < target * 0.8 && cur < max) cur += 0.1
    else if (fps > target * 0.95 && cur > min) cur -= 0.05
    engine.setHardwareScalingLevel(cur)
  }, 1000)
}

export function fpsMonitor(engine, sig, interval = 500) {
  return setInterval(() => sig(Math.round(engine.getFps())), interval)
}

// ============================================================
// 16. 兼容别名
// ============================================================
export { createScene as createGame }

// ============================================================
// 17. 默认导出 (全量)
// ============================================================
export default {
  // 场景
  createScene, createCamera, createLight, loadBabylon,
  // Mesh
  Box, Sphere, Ground, Cylinder, Torus, TorusKnot, Plane, Disc,
  IcoSphere, Capsule, Polyhedron, Lathe, Tube, Lines, DashedLines,
  Ribbon, ExtrudeShape, Polygon, GroundFromHeightMap, TiledPlane,
  Text3D, Mesh,
  // 材质
  PBRMaterial, StandardMaterial, GridMaterial, GradientMaterial,
  NormalMaterial, ShaderMaterial,
  // 纹理
  Texture, DynamicTexture, CubeTexture,
  // 资源
  importMesh,
  // 动画
  animate, animationGroup,
  // 粒子
  Particles,
  // 交互
  onPointer, raycast,
  // Sprite
  SpriteManager, Sprite,
  // 响应式
  bind, bindSet, bindTwoWay, bindColor,
  // 性能
  adaptiveScaling, fpsMonitor,
  // 移动端
  setupTouchGestures, isMobile, mobilePreset,
}
