import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGltf } from './gen-gltf.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TPL_MAIN = fs.readFileSync(path.join(__dirname, 'templates/MainActivity.java.tpl'), 'utf8')

const MANIFEST = [
  '<?xml version="1.0" encoding="utf-8"?>',
  '<manifest xmlns:android="http://schemas.android.com/apk/res/android">',
  '    <uses-feature android:glEsVersion="0x00030000" android:required="true" />',
  '    <application android:label="xunay-filament" android:theme="@android:style/Theme.Material.NoActionBar" android:configChanges="uiMode|orientation|screenSize|keyboardHidden">',
  '        <activity android:name=".MainActivity" android:exported="true">',
  '            <intent-filter>',
  '                <action android:name="android.intent.action.MAIN"/>',
  '                <category android:name="android.intent.category.LAUNCHER"/>',
  '            </intent-filter>',
  '        </activity>',
  '    </application>',
  '</manifest>',
].join('\n')

const BUILD_GRADLE = [
  "plugins { id 'com.android.application' }",
  'android {',
  "    namespace 'com.xunay.filament'",
  '    compileSdk 35',
  "    defaultConfig { applicationId 'com.xunay.filament'; minSdk 24; targetSdk 35; versionCode 1; versionName \"1.0\" }",
  '    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }',
  '}',
  'dependencies {',
  "    implementation 'com.google.android.filament:filament-android:1.51.6'",
  "    implementation 'com.google.android.filament:filament-utils-android:1.51.6'",
  "    implementation 'com.google.android.filament:gltfio-android:1.51.6'",
  "    implementation 'com.google.android.filament:filamat-android:1.51.6'",
  "    implementation 'org.jetbrains.kotlin:kotlin-stdlib:1.9.24'",
  '}',
].join('\n')

const SETTINGS_GRADLE = [
  'pluginManagement {',
  '    repositories { google(); mavenCentral(); gradlePluginPortal() }',
  '}',
  'dependencyResolutionManagement {',
  '    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)',
  '    repositories { google(); mavenCentral() }',
  '}',
  "rootProject.name = 'xunay-filament'",
  "include ':app'",
].join('\n')

const ROOT_BUILD_GRADLE = [
  'plugins {',
  "    id 'com.android.application' version '8.6.0' apply false",
  '}',
].join('\n')

const GRADLE_PROPS = ['android.useAndroidX=true', 'org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8', ''].join('\n')

function hexToRgb(hex) {
  hex = String(hex).replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ]
}
function f(v) {
  const n = Number(v)
  if (Number.isInteger(n)) return n.toFixed(1)
  return n.toFixed(6)
}

export function genFilament(ir, assets) {
  assets = assets || {}
  const { json: gltfJson0, bin: gltfBin } = buildGltf(ir)
  const gltfJson = JSON.stringify(gltfJson0)

  const lights = (ir.lights && ir.lights.length)
    ? ir.lights
    : [{ dir: [0.3, -1.0, -0.3], color: '#ffffff', intensity: 1.0 }]

  const lightLines = lights.map((L) => {
    const [r, g, b] = hexToRgb(L.color || '#ffffff')
    const d = L.dir || [0, -1, 0]
    const inten = (L.intensity !== undefined ? L.intensity : 1.0) * 100000
    return '        addLight(engine, modelViewer.getScene(), ' +
      f(r) + 'f, ' + f(g) + 'f, ' + f(b) + 'f, ' + f(inten) + 'f, ' +
      f(d[0]) + 'f, ' + f(d[1]) + 'f, ' + f(d[2]) + 'f);'
  }).join('\n')

  let java = TPL_MAIN
  java = java.replace('__LIGHTS__', lightLines)

  // 动画节点
  const animNodes = ir.nodes.map((n, i) => {
    const t = n.transform || {}
    const sp = t.spin
    const bb = t.bob
    const pos = t.position || [0, 0, 0]
    return {
      name: (n.geometry && n.geometry.kind === 'model') ? ('m' + i) : ('n' + i),
      px: pos[0], py: pos[1], pz: pos[2],
      spinX: sp ? (sp.axis ? sp.axis[0] : 0) : 0,
      spinY: sp ? (sp.axis ? sp.axis[1] : 0) : 0,
      spinZ: sp ? (sp.axis ? sp.axis[2] : 0) : 0,
      spinSpeed: sp ? (sp.speed || 0) : 0,
      bobAmp: bb ? (bb.amp || 0) : 0,
      bobSpeed: bb ? (bb.speed || 0) : 0,
      hasAnim: !!(sp || bb),
    }
  }).filter(a => a.hasAnim)

  const animCode = animNodes.length === 0
    ? 'new AnimNode[0]'
    : 'new AnimNode[]{\n            ' +
      animNodes.map(a =>
        'new AnimNode("' + a.name + '", ' +
        f(a.px) + 'f, ' + f(a.py) + 'f, ' + f(a.pz) + 'f, ' +
        f(a.spinX) + 'f, ' + f(a.spinY) + 'f, ' + f(a.spinZ) + 'f, ' + f(a.spinSpeed) + 'f, ' +
        f(a.bobAmp) + 'f, ' + f(a.bobSpeed) + 'f)'
      ).join(',\n            ') + '\n        }'

  java = java.replace('__ANIMS__', animCode)
  java = java.replace('__AUTO_ROTATE__', (ir.scene && ir.scene.autoRotate) ? 'true' : 'false')
  // 有 normalize 的 model：直接用它算相机 bbox（跳过 accessors）
  const __modelNodeN = (ir.nodes || []).find(n => n.geometry && n.geometry.kind === 'model' && n.geometry.normalize)
  let bboxMin, bboxMax
  if (__modelNodeN) {
    const __ts = Number(__modelNodeN.geometry.targetSize) || 2
    const __pos = (__modelNodeN.transform && __modelNodeN.transform.position) || [0, 0, 0]
    bboxMin = [__pos[0] - __ts / 2, __pos[1] - __ts / 2, __pos[2] - __ts / 2]
    bboxMax = [__pos[0] + __ts / 2, __pos[1] + __ts / 2, __pos[2] + __ts / 2]
  } else {
    bboxMin = [Infinity, Infinity, Infinity]
    bboxMax = [-Infinity, -Infinity, -Infinity]
    for (const a of gltfJson0.accessors || []) {
      if (a.type === 'VEC3' && a.min && a.max) {
        for (let k = 0; k < 3; k++) {
          if (a.min[k] < bboxMin[k]) bboxMin[k] = a.min[k]
          if (a.max[k] > bboxMax[k]) bboxMax[k] = a.max[k]
        }
      }
    }
  }
  const hasBbox = isFinite(bboxMin[0])
  const autoRadius = hasBbox ? Math.sqrt(
    Math.pow((bboxMax[0] - bboxMin[0]) / 2, 2) +
    Math.pow((bboxMax[1] - bboxMin[1]) / 2, 2) +
    Math.pow((bboxMax[2] - bboxMin[2]) / 2, 2)
  ) : 3
  const autoDist = Math.max(autoRadius * 2.5, 6)
  const autoCx = hasBbox ? (bboxMin[0] + bboxMax[0]) / 2 : 0
  const autoCy = hasBbox ? (bboxMin[1] + bboxMax[1]) / 2 : 0
  const autoCz = hasBbox ? (bboxMin[2] + bboxMax[2]) / 2 : 0

  const camDist = (ir.camera && ir.camera.distance > 0) ? ir.camera.distance : autoDist
  const camCx = (ir.camera && ir.camera.center) ? ir.camera.center[0] : autoCx
  const camCy = (ir.camera && ir.camera.center) ? ir.camera.center[1] : autoCy
  const camCz = (ir.camera && ir.camera.center) ? ir.camera.center[2] : autoCz

  java = java.replace('__CAM_DIST__', String(camDist))
  java = java.replace('__IBL_INTENSITY__', String(ir.scene && ir.scene.ibl !== undefined ? ir.scene.ibl : 30000))
  java = java.replace(/__SHADOWS__/g, (ir.scene && ir.scene.shadows) ? 'true' : 'false')
  const bloomCfg = (ir.scene && ir.scene.bloom) || null
  const bloomEnabled = !!bloomCfg
  const bloomStrength = (bloomCfg && typeof bloomCfg === 'object' && bloomCfg.strength !== undefined) ? bloomCfg.strength : 0.3
  java = java.replace('__BLOOM_ENABLED__', bloomEnabled ? 'true' : 'false')
  const ssaoCfg = (ir.scene && ir.scene.ssao) || null
  const aaCfg = (ir.scene && ir.scene.aa) || 'fxaa'
  const tmCfg = (ir.scene && ir.scene.tonemap) || 'aces'
  java = java.replace('__SSAO_ENABLED__', ssaoCfg ? 'true' : 'false')
  java = java.replace('__SSAO_RADIUS__', String((ssaoCfg && ssaoCfg.radius) || 0.3))
  java = java.replace('__SSAO_INTENSITY__', String((ssaoCfg && ssaoCfg.intensity) || 1.0))
  java = java.replace('__AA_MODE__', JSON.stringify(String(aaCfg).toLowerCase()))
  java = java.replace('__TONEMAP__', JSON.stringify(String(tmCfg).toLowerCase()))
  java = java.replace('__BLOOM_STRENGTH__', String(bloomStrength))
  java = java.replace('__ANIM_INDEX__', String((ir.nodes && ir.nodes[0] && ir.nodes[0].anim) || 0))
  java = java.replace('__ANIM_SPEED__', String((ir.nodes && ir.nodes[0] && ir.nodes[0].animSpeed) || 1))
  const __modelNode = (ir.nodes || []).find(n => n.geometry && n.geometry.kind === 'model') || {}
  const __instCount = (__modelNode.geometry && __modelNode.geometry.count) || 1
  const __instSpread = (__modelNode.geometry && __modelNode.geometry.spread) || 0
  const __instSpreadY = (__modelNode.geometry && __modelNode.geometry.spreadY) || 0
  java = java.replace('__INST_COUNT__', String(__instCount))
  const audios = ir.audios || []
  java = java.replace('__AUDIO_ENABLED__', audios.length > 0 ? 'true' : 'false')
  if (audios.length > 0) {
    const lines = audios.map(a => {
      const n = JSON.stringify(String(a.name))
      const p = JSON.stringify('audios/' + path.basename(String(a.src || '')))
      const lp = a.loop ? 'true' : 'false'
      const ap = a.autoplay ? 'true' : 'false'
      const v = String(Number(a.volume) || 1.0)
      return '            new String[]{' + n + ', ' + p + ', "' + lp + '", "' + ap + '", "' + v + '"}'
    }).join(',\n')
    java = java.replace('__AUDIO_LIST__', 'new String[][]{\n' + lines + '\n        }')
  } else {
    java = java.replace('__AUDIO_LIST__', 'new String[0][]')
  }
  const __pnode = (ir.nodes || []).find(n => n.geometry && n.geometry.kind === 'particles')
  const __pg = __pnode ? __pnode.geometry : null
  java = java.replace(/__PARTICLE_ENABLED__/g, __pg ? 'true' : 'false')
  java = java.replace('__PARTICLE_COUNT__', String(__pg ? (__pg.count || 50) : 0))
  java = java.replace('__PARTICLE_SPREAD__', String(__pg ? (__pg.spread || 5) : 5))
  java = java.replace('__PARTICLE_SPREAD_Y__', String(__pg ? (__pg.spreadY || 5) : 5))
  java = java.replace('__PARTICLE_GRAVITY__', String(__pg ? (__pg.gravity !== undefined ? __pg.gravity : -9.8) : -9.8))
  java = java.replace('__PARTICLE_SPEED__', String(__pg ? (__pg.speed || 3) : 3))
  java = java.replace('__PARTICLE_LIFE__', String(__pg ? (__pg.life || 3) : 3))
  java = java.replace('__INST_SPREAD__', String(__instSpread))
  java = java.replace('__INST_SPREAD_Y__', String(__instSpreadY))
  java = java.replace('__CAM_CENTER_X__', String(camCx))
  java = java.replace('__CAM_CENTER_Y__', String(camCy))
  java = java.replace('__CAM_CENTER_Z__', String(camCz))

  const files = {
    'app/src/main/java/com/xunay/filament/MainActivity.java': java,
      'app/src/main/assets/scene.gltf': gltfJson,
      'app/src/main/assets/scene.bin': gltfBin,
      'app/src/main/AndroidManifest.xml': MANIFEST,
      'app/build.gradle': BUILD_GRADLE,
      'build.gradle': ROOT_BUILD_GRADLE,
      'settings.gradle': SETTINGS_GRADLE,
      'gradle.properties': GRADLE_PROPS,
  }
  for (const [rel, buf] of Object.entries(assets)) {
    files['app/src/main/assets/' + rel] = buf
  }
  return { files }
}
