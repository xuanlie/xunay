// IR (xunay scene) -> glTF 2.0 JSON
// 支持: cube / plane / sphere / cylinder / cone / torus / pyramid / model

function hexToRgb(hex) {
  hex = String(hex).replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}

function cubeGeo(w, h, d) {
  const hw = w / 2, hh = h / 2, hd = d / 2
  const P = [], N = [], U = [], I = []
  const faces = [
    { n: [0, 0, 1],  v: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]] },
    { n: [0, 0, -1], v: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]] },
    { n: [1, 0, 0],  v: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]] },
    { n: [-1, 0, 0], v: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]] },
    { n: [0, 1, 0],  v: [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]] },
    { n: [0, -1, 0], v: [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]] },
  ]
  for (const f of faces) {
    const base = P.length / 3
    for (const v of f.v) { P.push(v[0], v[1], v[2]); N.push(f.n[0], f.n[1], f.n[2]) }
    U.push(0, 0, 1, 0, 1, 1, 0, 1)
    I.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  return { P, N, U, I }
}

function planeGeo(w, d) {
  const hw = w / 2, hd = d / 2
  return {
    P: [-hw, 0, hd, hw, 0, hd, hw, 0, -hd, -hw, 0, -hd],
    N: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    U: [0, 0, 1, 0, 1, 1, 0, 1],
    I: [0, 1, 2, 0, 2, 3],
  }
}

function sphereGeo(r, seg) {
  seg = seg || 16
  const P = [], N = [], U = [], I = []
  for (let i = 0; i <= seg; i++) {
    const th = Math.PI * i / seg
    const st = Math.sin(th), ct = Math.cos(th)
    for (let j = 0; j <= seg; j++) {
      const ph = 2 * Math.PI * j / seg
      const x = st * Math.cos(ph), y = ct, z = st * Math.sin(ph)
      P.push(x * r, y * r, z * r)
      N.push(x, y, z)
      U.push(j / seg, i / seg)
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j
    const b = a + 1, c = a + seg + 1, d = c + 1
    I.push(a, c, b, b, c, d)
  }
  return { P, N, U, I }
}

function cylinderGeo(r, h, seg) {
  seg = seg || 16
  const P = [], N = [], U = [], I = []
  const hh = h / 2
  for (let i = 0; i <= seg; i++) {
    const ph = 2 * Math.PI * i / seg
    const x = Math.cos(ph), z = Math.sin(ph)
    P.push(x * r, -hh, z * r); N.push(x, 0, z); U.push(i / seg, 0)
    P.push(x * r, hh, z * r); N.push(x, 0, z); U.push(i / seg, 1)
  }
  for (let i = 0; i < seg; i++) { const a = i * 2; I.push(a, a + 1, a + 2, a + 2, a + 1, a + 3) }
  const top = P.length / 3
  P.push(0, hh, 0); N.push(0, 1, 0); U.push(0.5, 0.5)
  for (let i = 0; i <= seg; i++) {
    const ph = 2 * Math.PI * i / seg
    const c = Math.cos(ph), s = Math.sin(ph)
    P.push(c * r, hh, s * r); N.push(0, 1, 0); U.push(0.5 + c / 2, 0.5 + s / 2)
  }
  for (let i = 0; i < seg; i++) I.push(top, top + 1 + i, top + 2 + i)
  const bot = P.length / 3
  P.push(0, -hh, 0); N.push(0, -1, 0); U.push(0.5, 0.5)
  for (let i = 0; i <= seg; i++) {
    const ph = 2 * Math.PI * i / seg
    const c = Math.cos(ph), s = Math.sin(ph)
    P.push(c * r, -hh, s * r); N.push(0, -1, 0); U.push(0.5 + c / 2, 0.5 - s / 2)
  }
  for (let i = 0; i < seg; i++) I.push(bot, bot + 2 + i, bot + 1 + i)
  return { P, N, U, I }
}

function coneGeo(r, h, seg) {
  seg = seg || 16
  const P = [], N = [], U = [], I = []
  const hh = h / 2
  for (let i = 0; i < seg; i++) {
    const ph1 = 2 * Math.PI * i / seg
    const ph2 = 2 * Math.PI * (i + 1) / seg
    const mx = (ph1 + ph2) / 2
    const nx = Math.cos(mx), nz = Math.sin(mx), ny = r / h
    const nl = Math.hypot(nx, ny, nz) || 1
    const base = P.length / 3
    P.push(0, hh, 0); N.push(nx / nl, ny / nl, nz / nl)
    P.push(Math.cos(ph1) * r, -hh, Math.sin(ph1) * r); N.push(nx / nl, ny / nl, nz / nl)
    P.push(Math.cos(ph2) * r, -hh, Math.sin(ph2) * r); N.push(nx / nl, ny / nl, nz / nl)
    U.push(0.5, 1, i / seg, 0, (i + 1) / seg, 0)
    I.push(base, base + 1, base + 2)
  }
  const bot = P.length / 3
  P.push(0, -hh, 0); N.push(0, -1, 0); U.push(0.5, 0.5)
  for (let i = 0; i <= seg; i++) {
    const ph = 2 * Math.PI * i / seg
    const c = Math.cos(ph), s = Math.sin(ph)
    P.push(c * r, -hh, s * r); N.push(0, -1, 0); U.push(0.5 + c / 2, 0.5 - s / 2)
  }
  for (let i = 0; i < seg; i++) I.push(bot, bot + 2 + i, bot + 1 + i)
  return { P, N, U, I }
}

function torusGeo(R, t, seg, tubeSeg) {
  seg = seg || 24; tubeSeg = tubeSeg || 12
  const P = [], N = [], U = [], I = []
  for (let i = 0; i <= seg; i++) {
    const u = 2 * Math.PI * i / seg
    const cu = Math.cos(u), su = Math.sin(u)
    for (let j = 0; j <= tubeSeg; j++) {
      const v = 2 * Math.PI * j / tubeSeg
      const cv = Math.cos(v), sv = Math.sin(v)
      P.push((R + t * cv) * cu, t * sv, (R + t * cv) * su)
      N.push(cv * cu, sv, cv * su)
      U.push(i / seg, j / tubeSeg)
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < tubeSeg; j++) {
    const a = i * (tubeSeg + 1) + j
    const b = a + 1, c = a + tubeSeg + 1, d = c + 1
    I.push(a, c, b, b, c, d)
  }
  return { P, N, U, I }
}

function pyramidGeo(size, h) {
  const hs = size / 2, hh = h / 2
  const apex = [0, hh, 0]
  const b4 = [[-hs, -hh, hs], [hs, -hh, hs], [hs, -hh, -hs], [-hs, -hh, -hs]]
  const P = [], N = [], U = [], I = []
  for (let i = 0; i < 4; i++) {
    const p1 = b4[i], p2 = b4[(i + 1) % 4]
    const e1 = [p1[0] - apex[0], p1[1] - apex[1], p1[2] - apex[2]]
    const e2 = [p2[0] - apex[0], p2[1] - apex[1], p2[2] - apex[2]]
    const nx = e1[1] * e2[2] - e1[2] * e2[1]
    const ny = e1[2] * e2[0] - e1[0] * e2[2]
    const nz = e1[0] * e2[1] - e1[1] * e2[0]
    const nl = Math.hypot(nx, ny, nz) || 1
    const base = P.length / 3
    P.push(apex[0], apex[1], apex[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2])
    for (let k = 0; k < 3; k++) N.push(nx / nl, ny / nl, nz / nl)
    U.push(0.5, 1, 0, 0, 1, 0)
    I.push(base, base + 1, base + 2)
  }
  const bot = P.length / 3
  for (const v of b4) { P.push(v[0], v[1], v[2]); N.push(0, -1, 0) }
  U.push(0, 0, 1, 0, 1, 1, 0, 1)
  I.push(bot, bot + 2, bot + 1, bot, bot + 3, bot + 2)
  return { P, N, U, I }
}

function geometryFor(shape) {
  const k = shape.kind
  if (k === 'cube')     return cubeGeo(shape.size || 1, shape.size || 1, shape.size || 1)
  if (k === 'plane')    return planeGeo(shape.size || 2, shape.size || 2)
  if (k === 'sphere')   return sphereGeo((shape.size || 1) / 2, shape.segments)
  if (k === 'cylinder') return cylinderGeo((shape.size || 1) / 2, shape.height || 1, shape.segments)
  if (k === 'cone')     return coneGeo((shape.size || 1) / 2, shape.height || 1, shape.segments)
  if (k === 'torus')    return torusGeo(shape.radius || 0.5, shape.tube || 0.2, shape.segments, shape.tubeSegments)
  if (k === 'pyramid')  return pyramidGeo(shape.size || 1, shape.height || 1)
  return cubeGeo(1, 1, 1)
}

function eulerToQuat(rot) {
  const [rx, ry, rz] = rot
  const cx = Math.cos(rx / 2), sx = Math.sin(rx / 2)
  const cy = Math.cos(ry / 2), sy = Math.sin(ry / 2)
  const cz = Math.cos(rz / 2), sz = Math.sin(rz / 2)
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ]
}

export function buildGltf(ir) {
  const parts = []
  let off = 0
  const views = [], accessors = [], meshes = [], materials = [], nodes = []
  const images = [], textures = []
  const animations = []
  const samplers = [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }]
  const texNameToIdx = {}
  const topLevel = []
  const usedExts = new Set(['KHR_texture_transform'])
  const requiredExts = new Set()

  function ensureTexture(assetPath) {
    if (texNameToIdx[assetPath] !== undefined) return texNameToIdx[assetPath]
    const imgIdx = images.length
    images.push({ uri: assetPath })
    const texIdx = textures.length
    textures.push({ source: imgIdx, sampler: 0 })
    texNameToIdx[assetPath] = texIdx
    return texIdx
  }

  function addView(typed, target) {
    while (off % 4 !== 0) { parts.push(Buffer.from([0])); off++ }
    const buf = Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength)
    parts.push(buf)
    views.push({ buffer: 0, byteOffset: off, byteLength: buf.length, target })
    off += buf.length
    return views.length - 1
  }

  function addAccessor(view, ct, count, type, min, max) {
    const a = { bufferView: view, componentType: ct, count, type }
    if (min) a.min = min
    if (max) a.max = max
    accessors.push(a)
    return accessors.length - 1
  }

  function mergeExternal(n, ext) {
    const bufViewOffset = views.length
    const accessorOffset = accessors.length
    const meshOffset = meshes.length
    const matOffset = materials.length
    const imgOffset = images.length
    const texOffset = textures.length
    const samplerOffset = samplers.length
    const nodeOffset = nodes.length

    for (const e of ext.json.extensionsUsed || []) usedExts.add(e)
    for (const e of ext.json.extensionsRequired || []) requiredExts.add(e)

    while (off % 4 !== 0) { parts.push(Buffer.from([0])); off++ }
    const extBinStart = off
    if (ext.bin && ext.bin.length > 0) { parts.push(ext.bin); off += ext.bin.length }

    for (const bv of ext.json.bufferViews || []) {
      const nbv = { buffer: 0, byteLength: bv.byteLength }
      nbv.byteOffset = (bv.byteOffset || 0) + extBinStart
      if (bv.byteStride !== undefined) nbv.byteStride = bv.byteStride
      if (bv.target !== undefined) nbv.target = bv.target
      views.push(nbv)
    }

    for (const ac of ext.json.accessors || []) {
      const nac = { componentType: ac.componentType, count: ac.count, type: ac.type }
      if (ac.bufferView !== undefined) nac.bufferView = ac.bufferView + bufViewOffset
      if (ac.byteOffset !== undefined) nac.byteOffset = ac.byteOffset
      if (ac.min) nac.min = ac.min
      if (ac.max) nac.max = ac.max
      if (ac.normalized) nac.normalized = ac.normalized
      accessors.push(nac)
    }

    for (const img of ext.json.images || []) {
      const nimg = { ...img }
      if (nimg.bufferView !== undefined) nimg.bufferView += bufViewOffset
      images.push(nimg)
    }
    for (const sp of ext.json.samplers || []) samplers.push({ ...sp })

    for (const tex of ext.json.textures || []) {
      const ntex = {}
      if (tex.source !== undefined) ntex.source = tex.source + imgOffset
      if (tex.sampler !== undefined) ntex.sampler = tex.sampler + samplerOffset
      textures.push(ntex)
    }

    function offsetTexRef(ref) { if (ref && ref.index !== undefined) ref.index += texOffset }

    for (const mat of ext.json.materials || []) {
      const nmat = JSON.parse(JSON.stringify(mat))
      if (nmat.pbrMetallicRoughness) {
        offsetTexRef(nmat.pbrMetallicRoughness.baseColorTexture)
        offsetTexRef(nmat.pbrMetallicRoughness.metallicRoughnessTexture)
      }
      offsetTexRef(nmat.normalTexture)
      offsetTexRef(nmat.occlusionTexture)
      offsetTexRef(nmat.emissiveTexture)
      materials.push(nmat)
    }

    for (const mesh of ext.json.meshes || []) {
      const nmesh = { primitives: [] }
      for (const p of mesh.primitives || []) {
        const np = { attributes: {}, mode: p.mode !== undefined ? p.mode : 4 }
        for (const [k, v] of Object.entries(p.attributes || {})) np.attributes[k] = v + accessorOffset
        if (p.indices !== undefined) np.indices = p.indices + accessorOffset
        if (p.material !== undefined) np.material = p.material + matOffset
        if (p.extensions) {
          np.extensions = JSON.parse(JSON.stringify(p.extensions))
          const draco = np.extensions.KHR_draco_mesh_compression
          if (draco && draco.bufferView !== undefined) draco.bufferView = draco.bufferView + bufViewOffset
        }
        nmesh.primitives.push(np)
      }
      if (mesh.name) nmesh.name = mesh.name
      meshes.push(nmesh)
    }

    for (const nd of ext.json.nodes || []) {
      const nnd = {}
      if (nd.mesh !== undefined) nnd.mesh = nd.mesh + meshOffset
      if (nd.children) nnd.children = nd.children.map(c => c + nodeOffset)
      if (nd.translation) nnd.translation = nd.translation
      if (nd.rotation) nnd.rotation = nd.rotation
      if (nd.scale) nnd.scale = nd.scale
      if (nd.matrix) nnd.matrix = nd.matrix
      if (nd.name) nnd.name = 'ext_' + nd.name
      nodes.push(nnd)
    }

    for (const anim of ext.json.animations || []) {
      const nanim = { channels: [], samplers: [] }
      for (const ch of anim.channels || []) {
        const nch = { sampler: ch.sampler, target: Object.assign({}, ch.target) }
        if (nch.target.node !== undefined) nch.target.node += nodeOffset
        nanim.channels.push(nch)
      }
      for (const sp of anim.samplers || []) {
        const nsp = Object.assign({}, sp)
        if (nsp.input !== undefined) nsp.input += accessorOffset
        if (nsp.output !== undefined) nsp.output += accessorOffset
        nanim.samplers.push(nsp)
      }
      if (anim.name) nanim.name = anim.name
      animations.push(nanim)
    }

    const extScenes = ext.json.scenes || []
    const extSceneIdx = ext.json.scene !== undefined ? ext.json.scene : 0
    const extScene = extScenes[extSceneIdx] || { nodes: [] }
    const rootChildren = (extScene.nodes || []).map(i => i + nodeOffset)

    const p = n.transform.position || [0, 0, 0]
    const rot = n.transform.rotation || [0, 0, 0]
    const scale = n.transform.scale || [1, 1, 1]
    const wrap = { translation: p, children: rootChildren }
    if (rot[0] || rot[1] || rot[2]) wrap.rotation = eulerToQuat(rot)
    if (scale[0] !== 1 || scale[1] !== 1 || scale[2] !== 1) wrap.scale = scale
    nodes.push(wrap)
    return nodes.length - 1
  }

  for (let i = 0; i < ir.nodes.length; i++) {
    const n = ir.nodes[i]

    if (n.geometry.kind === 'particles') {
      const __pc = Math.max(1, Math.floor(Number(n.geometry.count) || 50))
      const __psp = Number(n.geometry.spread) || 5
      const __psy = Number(n.geometry.spreadY) || 5
      const __psz = Number(n.geometry.size) || 0.1
      const __pos = n.transform.position || [0, 0, 0]
      const __g = sphereGeo(__psz / 2, 6)
      const __pPos = new Float32Array(__g.P)
      const __pNor = new Float32Array(__g.N)
      const __pIdx = new Uint32Array(__g.I)
      let __pmn = [Infinity, Infinity, Infinity], __pmx = [-Infinity, -Infinity, -Infinity]
      for (let __k = 0; __k < __pPos.length; __k += 3) {
        for (let __c = 0; __c < 3; __c++) {
          if (__pPos[__k+__c] < __pmn[__c]) __pmn[__c] = __pPos[__k+__c]
          if (__pPos[__k+__c] > __pmx[__c]) __pmx[__c] = __pPos[__k+__c]
        }
      }
      const __pvP = addView(__pPos, 34962)
      const __pvN = addView(__pNor, 34962)
      const __pvI = addView(__pIdx, 34963)
      const __paP = addAccessor(__pvP, 5126, __pPos.length / 3, 'VEC3', __pmn, __pmx)
      const __paN = addAccessor(__pvN, 5126, __pNor.length / 3, 'VEC3')
      const __paI = addAccessor(__pvI, 5125, __pIdx.length, 'SCALAR')
      let __paU = null
      if (__g.U && __g.U.length > 0) {
        const __puv = new Float32Array(__g.U)
        const __pvU = addView(__puv, 34962)
        __paU = addAccessor(__pvU, 5126, __puv.length / 2, 'VEC2')
      }
      const [__pr, __pg, __pb] = hexToRgb(n.material.color || '#ffffff')
      const __pmat = {
        pbrMetallicRoughness: {
          baseColorFactor: [__pr, __pg, __pb, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.4
        },
        doubleSided: false
      }
      materials.push(__pmat)
      const __pmI = materials.length - 1
      const __pprim = { attributes: { POSITION: __paP, NORMAL: __paN }, indices: __paI, material: __pmI }
      if (__paU !== null) __pprim.attributes.TEXCOORD_0 = __paU
      meshes.push({ primitives: [__pprim] })
      const __pmeshIdx = meshes.length - 1

      let __seed = 1337
      const __rand = () => { __seed = (__seed * 1664525 + 1013904223) >>> 0; return __seed / 4294967296 }
      for (let __i = 0; __i < __pc; __i++) {
        const __px = __pos[0] + (__rand() - 0.5) * __psp
        const __py = __pos[1] + (__rand() - 0.5) * __psy
        const __pz = __pos[2] + (__rand() - 0.5) * __psp
        nodes.push({ mesh: __pmeshIdx, translation: [__px, __py, __pz], name: 'p_' + __i })
        topLevel.push(nodes.length - 1)
      }
      continue
    }

    if (n.geometry.kind === 'model') {
      if (!n.externalGltf) { console.warn('model node missing externalGltf:', n.geometry.src); continue }
      const __cnt = Math.max(1, Math.floor(Number(n.geometry.count) || 1))
      const __spread = Number(n.geometry.spread) || 0
      const __spreadY = n.geometry.spreadY !== undefined ? Number(n.geometry.spreadY) : 0

      let __seed = 42
      const __rand = () => { __seed = (__seed * 1664525 + 1013904223) >>> 0; return __seed / 4294967296 }

      const __nodesStart = nodes.length
      const __animsStart = animations.length
      const __firstWrap = mergeExternal(n, n.externalGltf)
      const __nodesEnd = nodes.length
      const __animsEnd = animations.length

      const __base = n.transform.position || [0, 0, 0]
      const __rot = n.transform.rotation || [0, 0, 0]
      const __scale = n.transform.scale || [1, 1, 1]

      // normalize: 按 bbox 自动缩放
      let __normScale = 1
      if (n.geometry.normalize) {
        let __bmn = [Infinity, Infinity, Infinity]
        let __bmx = [-Infinity, -Infinity, -Infinity]
        for (let __vi = 0; __vi < views.length; __vi++) {
          const __ac = accessors.find(x => x.bufferView === __vi && x.type === 'VEC3')
        }
        for (const __ac of accessors) {
          if (__ac.type !== 'VEC3' || !__ac.min || !__ac.max) continue
          if (__ac.min.length !== 3) continue
          for (let __c = 0; __c < 3; __c++) {
            if (__ac.min[__c] < __bmn[__c]) __bmn[__c] = __ac.min[__c]
            if (__ac.max[__c] > __bmx[__c]) __bmx[__c] = __ac.max[__c]
          }
        }
        if (isFinite(__bmn[0])) {
          const __sx = __bmx[0] - __bmn[0]
          const __sy = __bmx[1] - __bmn[1]
          const __sz = __bmx[2] - __bmn[2]
          const __maxDim = Math.max(__sx, __sy, __sz) || 1
          const __targetSize = Number(n.geometry.targetSize) || 2
          __normScale = __targetSize / __maxDim
          // 模型中心
          const __cx = (__bmn[0] + __bmx[0]) / 2
          const __cy = (__bmn[1] + __bmx[1]) / 2
          const __cz = (__bmn[2] + __bmx[2]) / 2
          // 把 wrap node 的子节点整体平移 -center，然后 scale
          const __wrapChildren = nodes[__firstWrap].children || []
          for (const __ci of __wrapChildren) {
            const __cn = nodes[__ci]
            const __tp = __cn.translation || [0, 0, 0]
            __cn.translation = [__tp[0] - __cx, __tp[1] - __cy, __tp[2] - __cz]
          }
          // wrap 加 scale
          const __origScale = nodes[__firstWrap].scale ? nodes[__firstWrap].scale.slice() : [1, 1, 1]
          nodes[__firstWrap].scale = [
            __origScale[0] * __normScale,
            __origScale[1] * __normScale,
            __origScale[2] * __normScale
          ]
          console.log('[filament] normalize: bbox=' + __maxDim.toFixed(2) + ' scale=' + __normScale.toFixed(6) + ' target=' + __targetSize)
        }
      }

      if (__cnt > 1 || __spread > 0 || __spreadY > 0) {
        nodes[__firstWrap].translation = [
          __base[0] + (__rand() - 0.5) * __spread,
          __base[1] + (__rand() - 0.5) * __spreadY,
          __base[2] + (__rand() - 0.5) * __spread
        ]
        if (__rot[0] || __rot[1] || __rot[2]) nodes[__firstWrap].rotation = eulerToQuat(__rot)
        if (__scale[0] !== 1 || __scale[1] !== 1 || __scale[2] !== 1) nodes[__firstWrap].scale = __scale
      }
      topLevel.push(__firstWrap)

      const __firstWrapChildren = (nodes[__firstWrap].children || []).slice()
      const __firstWrapRot = nodes[__firstWrap].rotation ? nodes[__firstWrap].rotation.slice() : null
      const __firstWrapScale = nodes[__firstWrap].scale ? nodes[__firstWrap].scale.slice() : null

      for (let __c = 1; __c < __cnt; __c++) {
        const __baseNew = nodes.length
        const __delta = __baseNew - __nodesStart
        for (let __k = __nodesStart; __k < __nodesEnd - 1; __k++) {
          const __src = nodes[__k]
          const __cp = {}
          if (__src.mesh !== undefined) __cp.mesh = __src.mesh
          if (__src.children) __cp.children = __src.children.map(ch => ch + __delta)
          if (__src.translation) __cp.translation = __src.translation.slice()
          if (__src.rotation) __cp.rotation = __src.rotation.slice()
          if (__src.scale) __cp.scale = __src.scale.slice()
          if (__src.matrix) __cp.matrix = __src.matrix.slice()
          if (__src.name) __cp.name = __src.name
          nodes.push(__cp)
        }
        for (let __k = __animsStart; __k < __animsEnd; __k++) {
          const __srcA = animations[__k]
          const __cpA = { channels: [], samplers: __srcA.samplers.map(sp => Object.assign({}, sp)) }
          for (const __ch of __srcA.channels) {
            const __nch = { sampler: __ch.sampler, target: Object.assign({}, __ch.target) }
            if (__nch.target.node !== undefined) __nch.target.node += __delta
            __cpA.channels.push(__nch)
          }
          if (__srcA.name) __cpA.name = __srcA.name
          animations.push(__cpA)
        }
        const __wrap = {
          translation: [
            __base[0] + (__rand() - 0.5) * __spread,
            __base[1] + (__rand() - 0.5) * __spreadY,
            __base[2] + (__rand() - 0.5) * __spread
          ],
          children: __firstWrapChildren.map(ch => ch + __delta)
        }
        if (__firstWrapRot) __wrap.rotation = __firstWrapRot.slice()
        if (__firstWrapScale) __wrap.scale = __firstWrapScale.slice()
        const __wrapIdx = nodes.length
        nodes.push(__wrap)
        topLevel.push(__wrapIdx)
      }
      continue
    }

    const g = geometryFor(n.geometry)
    const pos = new Float32Array(g.P)
    const nor = new Float32Array(g.N)
    const idx = new Uint32Array(g.I)
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity]
    for (let k = 0; k < pos.length; k += 3) {
      for (let c = 0; c < 3; c++) {
        const v = pos[k + c]
        if (v < mn[c]) mn[c] = v
        if (v > mx[c]) mx[c] = v
      }
    }
    const vP = addView(pos, 34962)
    const vN = addView(nor, 34962)
    const vI = addView(idx, 34963)
    const aP = addAccessor(vP, 5126, pos.length / 3, 'VEC3', mn, mx)
    const aN = addAccessor(vN, 5126, nor.length / 3, 'VEC3')
    const aI = addAccessor(vI, 5125, idx.length, 'SCALAR')

    let aU = null
    if (g.U && g.U.length > 0) {
      const uv = new Float32Array(g.U)
      const vU = addView(uv, 34962)
      aU = addAccessor(vU, 5126, uv.length / 2, 'VEC2')
    }

    const [r, gg, b] = hexToRgb(n.material.color || '#ff6600')
    const mat = {
      pbrMetallicRoughness: {
        baseColorFactor: [r, gg, b, 1.0],
        metallicFactor: n.material.metalness === undefined ? 0.1 : n.material.metalness,
        roughnessFactor: n.material.roughness === undefined ? 0.5 : n.material.roughness,
      },
      doubleSided: false,
    }
    if (n.material.textureAsset) {
      const texIdx = ensureTexture(n.material.textureAsset)
      const bct = { index: texIdx }
      const sc = n.material.texScale
      if (sc && sc !== 1) bct.extensions = { KHR_texture_transform: { scale: [sc, sc], offset: [0, 0] } }
      mat.pbrMetallicRoughness.baseColorTexture = bct
    }
    materials.push(mat)
    const mI = materials.length - 1

    const prim = { attributes: { POSITION: aP, NORMAL: aN }, indices: aI, material: mI }
    if (aU !== null) prim.attributes.TEXCOORD_0 = aU
    meshes.push({ primitives: [prim] })

    const p = n.transform.position || [0, 0, 0]
    const rot = n.transform.rotation || [0, 0, 0]
    const node = { mesh: meshes.length - 1, translation: p, name: 'n' + i }
    if (rot[0] || rot[1] || rot[2]) node.rotation = eulerToQuat(rot)
    nodes.push(node)
    topLevel.push(nodes.length - 1)
  }

  const total = Buffer.concat(parts)
  const json = {
    asset: { version: '2.0', generator: 'xunay-filament' },
    scene: 0,
    scenes: [{ nodes: topLevel }],
    nodes, meshes, materials, accessors,
    bufferViews: views,
    buffers: [{ byteLength: total.length, uri: 'scene.bin' }],
  }
  if (images.length) {
    json.images = images
    json.textures = textures
    json.samplers = samplers
  }
  if (animations.length > 0) json.animations = animations
  json.extensionsUsed = [...usedExts]
  if (requiredExts.size > 0) json.extensionsRequired = [...requiredExts]
  return { json, bin: total }
}
