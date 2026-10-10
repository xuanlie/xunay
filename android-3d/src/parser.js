import { parse as acornParse } from 'acorn'

function parsePropObject(node) {
  const out = {}
  if (!node || node.type !== 'ObjectExpression') return out
  for (const p of node.properties) {
    const k = p.key.name || p.key.value
    out[k] = p.value
  }
  return out
}

function nodeValue(node) {
  if (!node) return null
  if (node.type === 'Literal') return node.value
  if (node.type === 'UnaryExpression' && node.operator === '-') {
    const v = nodeValue(node.argument)
    return typeof v === 'number' ? -v : null
  }
  if (node.type === 'ArrayExpression') return node.elements.map(e => nodeValue(e))
  return null
}

export function parseScene(src) {
  const ast = acornParse(src, { ecmaVersion: 2022, sourceType: 'module' })
  const scene = {
    bg: '#000000',
    autoRotate: true,
    camera: { distance: 5, fov: 45 },
    objects: [],
  }
  for (const stmt of ast.body) {
    if (stmt.type !== 'ExpressionStatement') continue
    const call = stmt.expression
    if (call.type !== 'CallExpression' || call.callee.type !== 'Identifier') continue
    const name = call.callee.name
    const props = parsePropObject(call.arguments[0])
    if (name === 'scene') {
      if (props.bg) scene.bg = nodeValue(props.bg)
      if (props.autoRotate) scene.autoRotate = nodeValue(props.autoRotate)
      if (props.lights && props.lights.type === 'ArrayExpression') {
        scene.lights = props.lights.elements.map(el => {
          if (el.type !== 'ObjectExpression') return null
          const L = {}
          for (const lp of el.properties) {
            const k = lp.key.name || lp.key.value
            L[k] = nodeValue(lp.value)
          }
          return L
        }).filter(Boolean)
      }
      if (props.camera && props.camera.type === 'ObjectExpression') {
        const c = parsePropObject(props.camera)
        if (c.distance) scene.camera.distance = nodeValue(c.distance)
        if (c.fov) scene.camera.fov = nodeValue(c.fov)
      }
    } else if (name === 'cube' || name === 'sphere' || name === 'model' || name === 'plane' || name === 'cylinder' || name === 'cone' || name === 'torus' || name === 'pyramid') {
      const obj = { type: name }
      if (props.color) obj.color = nodeValue(props.color)
      if (props.size) obj.size = nodeValue(props.size)
      if (props.position) obj.position = nodeValue(props.position)
      if (props.segments) obj.segments = nodeValue(props.segments)
      if (props.src) obj.src = nodeValue(props.src)
      if (props.texture) obj.texture = nodeValue(props.texture)
      if (props.scale) obj.scale = nodeValue(props.scale)
      if (props.rotate) obj.rotate = nodeValue(props.rotate)
      if (props.metalness !== undefined) obj.metalness = nodeValue(props.metalness)
      if (props.roughness !== undefined) obj.roughness = nodeValue(props.roughness)
      scene.objects.push(obj)
    }
  }
  return scene
}