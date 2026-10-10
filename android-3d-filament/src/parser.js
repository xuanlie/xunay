import { parse as acornParse } from 'acorn'

function nodeValue(node) {
  if (!node) return null
  if (node.type === 'Literal') return node.value
  if (node.type === 'UnaryExpression' && node.operator === '-') {
    const v = nodeValue(node.argument)
    return typeof v === 'number' ? -v : null
  }
  if (node.type === 'ArrayExpression') return node.elements.map(e => nodeValue(e))
  if (node.type === 'ObjectExpression') {
    const o = {}
    for (const p of node.properties) {
      const k = p.key.name || p.key.value
      o[k] = nodeValue(p.value)
    }
    return o
  }
  return null
}

export function parseScene(src) {
  const ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' })
  const ir = {
    version: 1,
    scene: { bg: '#0a0a1a', autoRotate: true, toneMapping: 'aces', antiAliasing: 'fxaa' },
    camera: { distance: 0, fov: 45, target: [0, 0, 0] },
    lights: [],
    audios: [],
    nodes: [],
  }

  for (const stmt of ast.body) {
    if (stmt.type !== 'ExpressionStatement') continue
    const call = stmt.expression
    if (call.type !== 'CallExpression' || call.callee.type !== 'Identifier') continue
    const name = call.callee.name
    const props = call.arguments[0] ? nodeValue(call.arguments[0]) : {}

    if (name === 'scene') {
      if (props.bg) ir.scene.bg = props.bg
      if (props.autoRotate !== undefined) ir.scene.autoRotate = props.autoRotate
      if (props.toneMapping) ir.scene.toneMapping = props.toneMapping
      if (props.ibl !== undefined) ir.scene.ibl = props.ibl
      if (props.shadows !== undefined) ir.scene.shadows = props.shadows
      if (props.bloom !== undefined) ir.scene.bloom = props.bloom
      if (props.ssao !== undefined) ir.scene.ssao = props.ssao
      if (props.aa !== undefined) ir.scene.aa = props.aa
      if (props.tonemap !== undefined) ir.scene.tonemap = props.tonemap
      if (props.antiAliasing) ir.scene.antiAliasing = props.antiAliasing
      if (props.camera) {
        if (props.camera.distance !== undefined) ir.camera.distance = props.camera.distance
        if (props.camera.fov !== undefined) ir.camera.fov = props.camera.fov
        if (props.camera.center !== undefined) ir.camera.center = props.camera.center
      }
      if (Array.isArray(props.lights)) ir.lights = props.lights
    } else if (name === 'audio') {
      ir.audios.push({
        name: props.name || ('audio' + ir.audios.length),
        src: props.src,
        loop: !!props.loop,
        autoplay: !!props.autoplay,
        volume: props.volume !== undefined ? props.volume : 1.0
      })
    } else if (name === 'particles') {
      ir.nodes.push({
        id: 'n' + ir.nodes.length,
        geometry: {
          kind: 'particles',
          count: props.count || 50,
          spread: props.spread || 5,
          spreadY: props.spreadY || 5,
          size: props.size || 0.1,
          gravity: props.gravity !== undefined ? props.gravity : -9.8,
          speed: props.speed || 3,
          life: props.life || 3
        },
        material: {
          color: props.color || '#ffffff',
          metalness: 0, roughness: 0.4,
          texture: null, texScale: 1
        },
        transform: { position: props.position || [0, 0, 0], rotation: [0, 0, 0] }
      })
    } else if (name === 'model') {
      ir.nodes.push({
        id: 'n' + ir.nodes.length,
        geometry: { kind: 'model', src: props.src, count: props.count, spread: props.spread, spreadY: props.spreadY, normalize: !!props.normalize, targetSize: props.targetSize || 2 },
        anim: (props.anim !== undefined) ? props.anim : 0,
        animSpeed: (props.animSpeed !== undefined) ? props.animSpeed : 1,
        material: {
          color: props.color || '#ffffff',
          metalness: props.metalness !== undefined ? props.metalness : 0,
          roughness: props.roughness !== undefined ? props.roughness : 0.5,
          texture: props.texture || null,
          texScale: props.texScale !== undefined ? props.texScale : 1,
        },
        transform: {
          position: props.position || [0, 0, 0],
          rotation: props.rotate || [0, 0, 0],
          scale: props.scale || [1, 1, 1],
          spin: props.spin || null,
          bob: props.bob || null,
        },
      })
    } else if (['cube', 'sphere', 'plane', 'cylinder', 'cone', 'torus', 'pyramid'].includes(name)) {
      ir.nodes.push({
        id: 'n' + ir.nodes.length,
        geometry: Object.assign({ kind: name }, props),
        material: {
          color: props.color || '#ff6600',
          metalness: props.metalness !== undefined ? props.metalness : 0,
          roughness: props.roughness !== undefined ? props.roughness : 0.5,
          texture: props.texture || null,
          texScale: props.texScale !== undefined ? props.texScale : 1,
        },
        transform: {
          position: props.position || [0, 0, 0],
          rotation: props.rotate || [0, 0, 0],
          spin: props.spin || null,
          bob: props.bob || null,
        },
      })
    }
  }
  return ir
}