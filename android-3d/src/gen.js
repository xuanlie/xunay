import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TPL = path.join(__dirname, 'templates')
const readTpl = (n) => fs.readFileSync(path.join(TPL, n), 'utf8')

const TPL_MAIN = readTpl('MainActivity.java.tpl')
const TPL_SHADER = readTpl('ShaderUtil.java.tpl')
const TPL_RENDERER = readTpl('SceneRenderer.java.tpl')
const TPL_OBJ = readTpl('ObjLoader.java.tpl')

const VS = 'uniform mat4 uMVP; uniform mat4 uModel; attribute vec3 aPos; attribute vec3 aNormal; attribute vec3 aColor; varying vec3 vColor; varying vec3 vNormal; varying vec3 vWorldPos; void main() { vColor = aColor; vNormal = normalize(mat3(uModel) * aNormal); vWorldPos = (uModel * vec4(aPos, 1.0)).xyz; gl_Position = uMVP * vec4(aPos, 1.0); }'
const FS = `precision mediump float;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vWorldPos;
uniform vec3 uLightDir[8];
uniform vec3 uLightColor[8];
uniform float uLightIntensity[8];
uniform int uLightCount;
uniform float uMetalness;
uniform float uRoughness;
uniform vec3 uCamPos;
uniform sampler2D uTex;
uniform float uUseTex;
uniform float uTexScale;
vec3 triplanar(sampler2D t, vec3 p, vec3 n, float sc) {
    vec3 an = abs(n);
    vec3 tx = texture2D(t, p.yz * sc).rgb;
    vec3 ty = texture2D(t, p.xz * sc).rgb;
    vec3 tz = texture2D(t, p.xy * sc).rgb;
    float sum = an.x + an.y + an.z + 0.0001;
    return (tx * an.x + ty * an.y + tz * an.z) / sum;
}
void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    vec3 albedo = vColor;
    if (uUseTex > 0.5) albedo = triplanar(uTex, vWorldPos, N, uTexScale);
    float metal = clamp(uMetalness, 0.0, 1.0);
    float rough = clamp(uRoughness, 0.05, 1.0);
    float shininess = mix(128.0, 4.0, rough);
    vec3 F0 = mix(vec3(0.04), albedo, metal);
    vec3 col = albedo * 0.08 * (1.0 - metal);
    for (int i = 0; i < 8; i++) {
        if (i >= uLightCount) break;
        vec3 L = normalize(-uLightDir[i]);
        vec3 H = normalize(L + V);
        float NdotL = max(dot(N, L), 0.0);
        float NdotH = max(dot(N, H), 0.0);
        vec3 lc = uLightColor[i] * uLightIntensity[i];
        vec3 diffuse = albedo * (1.0 - metal) * NdotL;
        float spec = pow(NdotH, shininess);
        vec3 specular = F0 * spec * NdotL * (1.0 - rough * 0.7);
        col += (diffuse + specular) * lc;
    }
    col = col / (col + vec3(1.0));
    gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}`

const MANIFEST = '<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application android:label="xunay-3d" android:theme="@android:style/Theme.Material.Light.NoActionBar">\n        <activity android:name=".MainActivity" android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN"/>\n                <category android:name="android.intent.category.LAUNCHER"/>\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>\n'

const BUILD_GRADLE = "plugins { id 'com.android.application' version '8.6.0' }\nandroid {\n    namespace 'com.xunay.gl'\n    compileSdk 35\n    defaultConfig { applicationId 'com.xunay.gl'; minSdk 24; targetSdk 35; versionCode 1; versionName \"1.0\" }\n    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }\n}\n"
const SETTINGS_GRADLE = "pluginManagement {\n    repositories { google(); mavenCentral(); gradlePluginPortal() }\n}\ndependencyResolutionManagement {\n    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)\n    repositories { google(); mavenCentral() }\n}\nrootProject.name = 'xunay-3d'\ninclude ':app'\n"
const GRADLE_PROPS = 'android.useAndroidX=true\norg.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8\n'

function hexToRgb(hex) {
  hex = String(hex).replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('')
  return [parseInt(hex.slice(0,2),16)/255, parseInt(hex.slice(2,4),16)/255, parseInt(hex.slice(4,6),16)/255]
}
function f(v) {
  if (v === null || v === undefined) return '0f'
  if (Number.isInteger(v)) return v + 'f'
  return Number(v).toFixed(4) + 'f'
}
function fpos(p) { return p && p.length >= 3 ? [p[0]||0, p[1]||0, p[2]||0] : [0, 0, 0] }
function frot(r) { return r && r.length >= 3 ? [r[0]||0, r[1]||0, r[2]||0] : [0, 0, 0] }
function fspin(s) {
  if (!s) return [0, 0, 1, 0]
  const sp = typeof s.speed === 'number' ? s.speed : 0
  const ax = s.axis && s.axis.length >= 3 ? s.axis : [0, 1, 0]
  return [sp, ax[0]||0, ax[1]||0, ax[2]||0]
}
function fbob(b) {
  if (!b) return [0, 0]
  return [b.amp || 0, b.speed || 2]
}
function commit(obj) {
  const [px, py, pz] = fpos(obj.position)
  const [rx, ry, rz] = frot(obj.rotate)
  const [sp, sax, say, saz] = fspin(obj.spin)
  const [bAmp, bSpeed] = fbob(obj.bob)
  const metal = obj.metalness || 0
  const rough = obj.roughness || 0
  const texIdx = obj.textureAsset ? (globalThis.__texMap[obj.textureAsset] ?? -1) : -1
  const texScale = obj.texScale || 1
  return '        __commit(' + f(px) + ', ' + f(py) + ', ' + f(pz) + ', ' + f(rx) + ', ' + f(ry) + ', ' + f(rz) + ', ' + f(sp) + ', ' + f(sax) + ', ' + f(say) + ', ' + f(saz) + ', ' + f(bAmp) + ', ' + f(bSpeed) + ', ' + f(metal) + ', ' + f(rough) + ', ' + texIdx + ', ' + f(texScale) + ');'
}

function cubeCode(obj) {
  const size = obj.size || 1
  const [r, g, b] = hexToRgb(obj.color || '#ff6600')
  const s = size / 2
  const L = []
  L.push('        {')
  L.push('            float s = ' + f(s) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            float[][] corners = {{-s,-s,-s},{s,-s,-s},{s,s,-s},{-s,s,-s},{-s,-s,s},{s,-s,s},{s,s,s},{-s,s,s}};')
  L.push('            int[][] faces = {{0,1,2,0,2,3},{4,6,5,4,7,6},{0,4,5,0,5,1},{3,2,6,3,6,7},{0,3,7,0,7,4},{1,5,6,1,6,2}};')
  L.push('            float[][] normals = {{0,0,-1},{0,0,1},{0,-1,0},{0,1,0},{-1,0,0},{1,0,0}};')
  L.push('            for (int fi = 0; fi < 6; fi++) {')
  L.push('                for (int k = 0; k < 6; k++) {')
  L.push('                    int ci = faces[fi][k];')
  L.push('                    data.add(corners[ci][0]); data.add(corners[ci][1]); data.add(corners[ci][2]);')
  L.push('                    data.add(normals[fi][0]); data.add(normals[fi][1]); data.add(normals[fi][2]);')
  L.push('                    data.add(r); data.add(g); data.add(b);')
  L.push('                }')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function sphereCode(obj) {
  const radius = (obj.size || 1) / 2
  const [r, g, b] = hexToRgb(obj.color || '#00ccff')
  const seg = obj.segments || 12
  const L = []
  L.push('        {')
  L.push('            float rad = ' + f(radius) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            int seg = ' + seg + ';')
  L.push('            for (int i = 0; i < seg; i++) {')
  L.push('                double th1 = Math.PI * i / seg;')
  L.push('                double th2 = Math.PI * (i + 1) / seg;')
  L.push('                for (int j = 0; j < seg; j++) {')
  L.push('                    double ph1 = 2 * Math.PI * j / seg;')
  L.push('                    double ph2 = 2 * Math.PI * (j + 1) / seg;')
  L.push('                    float[] p1 = {(float)(Math.sin(th1)*Math.cos(ph1)), (float)Math.cos(th1), (float)(Math.sin(th1)*Math.sin(ph1))};')
  L.push('                    float[] p2 = {(float)(Math.sin(th2)*Math.cos(ph1)), (float)Math.cos(th2), (float)(Math.sin(th2)*Math.sin(ph1))};')
  L.push('                    float[] p3 = {(float)(Math.sin(th2)*Math.cos(ph2)), (float)Math.cos(th2), (float)(Math.sin(th2)*Math.sin(ph2))};')
  L.push('                    float[] p4 = {(float)(Math.sin(th1)*Math.cos(ph2)), (float)Math.cos(th1), (float)(Math.sin(th1)*Math.sin(ph2))};')
  L.push('                    float[][] tri1 = {p1, p2, p3};')
  L.push('                    float[][] tri2 = {p1, p3, p4};')
  L.push('                    for (float[][] tri : new float[][][]{tri1, tri2}) {')
  L.push('                        for (float[] p : tri) {')
  L.push('                            data.add(p[0]*rad); data.add(p[1]*rad); data.add(p[2]*rad);')
  L.push('                            data.add(p[0]); data.add(p[1]); data.add(p[2]);')
  L.push('                            data.add(r); data.add(g); data.add(b);')
  L.push('                        }')
  L.push('                    }')
  L.push('                }')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function planeCode(obj) {
  const size = obj.size || 2
  const [r, g, b] = hexToRgb(obj.color || '#888888')
  const s = size / 2
  const L = []
  L.push('        {')
  L.push('            float s = ' + f(s) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            float[][] v = {{-s,0,-s},{s,0,-s},{s,0,s},{-s,0,s}};')
  L.push('            int[] idx = {0,1,2,0,2,3};')
  L.push('            for (int k = 0; k < 6; k++) {')
  L.push('                int i = idx[k];')
  L.push('                data.add(v[i][0]); data.add(v[i][1]); data.add(v[i][2]);')
  L.push('                data.add(0f); data.add(1f); data.add(0f);')
  L.push('                data.add(r); data.add(g); data.add(b);')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function cylinderCode(obj) {
  const radius = (obj.size || 1) / 2
  const hh = (obj.height || obj.size || 1) / 2
  const [r, g, b] = hexToRgb(obj.color || '#00ccff')
  const seg = obj.segments || 16
  const L = []
  L.push('        {')
  L.push('            float rad = ' + f(radius) + ', hh = ' + f(hh) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            int seg = ' + seg + ';')
  L.push('            for (int i = 0; i < seg; i++) {')
  L.push('                double a1 = 2 * Math.PI * i / seg;')
  L.push('                double a2 = 2 * Math.PI * (i + 1) / seg;')
  L.push('                float x1 = (float)(Math.cos(a1)*rad), z1 = (float)(Math.sin(a1)*rad);')
  L.push('                float x2 = (float)(Math.cos(a2)*rad), z2 = (float)(Math.sin(a2)*rad);')
  L.push('                float nx1 = (float)Math.cos(a1), nz1 = (float)Math.sin(a1);')
  L.push('                float nx2 = (float)Math.cos(a2), nz2 = (float)Math.sin(a2);')
  L.push('                data.add(x1); data.add(-hh); data.add(z1); data.add(nx1); data.add(0f); data.add(nz1); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(-hh); data.add(z2); data.add(nx2); data.add(0f); data.add(nz2); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(hh); data.add(z2); data.add(nx2); data.add(0f); data.add(nz2); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x1); data.add(-hh); data.add(z1); data.add(nx1); data.add(0f); data.add(nz1); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(hh); data.add(z2); data.add(nx2); data.add(0f); data.add(nz2); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x1); data.add(hh); data.add(z1); data.add(nx1); data.add(0f); data.add(nz1); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(0f); data.add(hh); data.add(0f); data.add(0f); data.add(1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x1); data.add(hh); data.add(z1); data.add(0f); data.add(1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(hh); data.add(z2); data.add(0f); data.add(1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(0f); data.add(-hh); data.add(0f); data.add(0f); data.add(-1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(-hh); data.add(z2); data.add(0f); data.add(-1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x1); data.add(-hh); data.add(z1); data.add(0f); data.add(-1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function coneCode(obj) {
  const radius = (obj.size || 1) / 2
  const hh = obj.height || obj.size || 1
  const [r, g, b] = hexToRgb(obj.color || '#ff6600')
  const seg = obj.segments || 16
  const L = []
  L.push('        {')
  L.push('            float rad = ' + f(radius) + ', hh = ' + f(hh) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            int seg = ' + seg + ';')
  L.push('            for (int i = 0; i < seg; i++) {')
  L.push('                double a1 = 2 * Math.PI * i / seg;')
  L.push('                double a2 = 2 * Math.PI * (i + 1) / seg;')
  L.push('                float x1 = (float)(Math.cos(a1)*rad), z1 = (float)(Math.sin(a1)*rad);')
  L.push('                float x2 = (float)(Math.cos(a2)*rad), z2 = (float)(Math.sin(a2)*rad);')
  L.push('                float sl = (float)Math.sqrt(rad*rad + hh*hh);')
  L.push('                float nx1 = (float)(Math.cos(a1) * hh / sl), ny1 = (float)(rad / sl), nz1 = (float)(Math.sin(a1) * hh / sl);')
  L.push('                float nx2 = (float)(Math.cos(a2) * hh / sl), ny2 = ny1, nz2 = (float)(Math.sin(a2) * hh / sl);')
  L.push('                data.add(x1); data.add(-hh/2); data.add(z1); data.add(nx1); data.add(ny1); data.add(nz1); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(-hh/2); data.add(z2); data.add(nx2); data.add(ny2); data.add(nz2); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(0f); data.add(hh/2); data.add(0f); data.add(0f); data.add(1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(0f); data.add(-hh/2); data.add(0f); data.add(0f); data.add(-1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x2); data.add(-hh/2); data.add(z2); data.add(0f); data.add(-1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('                data.add(x1); data.add(-hh/2); data.add(z1); data.add(0f); data.add(-1f); data.add(0f); data.add(r); data.add(g); data.add(b);')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function torusCode(obj) {
  const R = obj.radius || 1
  const t = obj.tube || 0.3
  const [r, g, b] = hexToRgb(obj.color || '#ff00ff')
  const seg = obj.segments || 16
  const segT = obj.segments || 12
  const L = []
  L.push('        {')
  L.push('            float R = ' + f(R) + ', t = ' + f(t) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            int seg = ' + seg + ', segT = ' + segT + ';')
  L.push('            for (int i = 0; i < seg; i++) {')
  L.push('                double a1 = 2 * Math.PI * i / seg;')
  L.push('                double a2 = 2 * Math.PI * (i + 1) / seg;')
  L.push('                for (int j = 0; j < segT; j++) {')
  L.push('                    double b1 = 2 * Math.PI * j / segT;')
  L.push('                    double b2 = 2 * Math.PI * (j + 1) / segT;')
  L.push('                    float x1 = (float)((R + t*Math.cos(b1))*Math.cos(a1));')
  L.push('                    float y1 = (float)(t*Math.sin(b1));')
  L.push('                    float z1 = (float)((R + t*Math.cos(b1))*Math.sin(a1));')
  L.push('                    float x2 = (float)((R + t*Math.cos(b1))*Math.cos(a2));')
  L.push('                    float y2 = y1;')
  L.push('                    float z2 = (float)((R + t*Math.cos(b1))*Math.sin(a2));')
  L.push('                    float x3 = (float)((R + t*Math.cos(b2))*Math.cos(a2));')
  L.push('                    float y3 = (float)(t*Math.sin(b2));')
  L.push('                    float z3 = (float)((R + t*Math.cos(b2))*Math.sin(a2));')
  L.push('                    float x4 = (float)((R + t*Math.cos(b2))*Math.cos(a1));')
  L.push('                    float y4 = y3;')
  L.push('                    float z4 = (float)((R + t*Math.cos(b2))*Math.sin(a1));')
  L.push('                    float[][] quad = {{x1,y1,z1},{x2,y2,z2},{x3,y3,z3},{x4,y4,z4}};')
  L.push('                    int[] idx = {0,1,2,0,2,3};')
  L.push('                    for (int k = 0; k < 6; k++) {')
  L.push('                        float[] p = quad[idx[k]];')
  L.push('                        data.add(p[0]); data.add(p[1]); data.add(p[2]);')
  L.push('                        float nx = p[0], ny = p[1], nz = p[2];')
  L.push('                        float nl = (float)Math.sqrt(nx*nx+ny*ny+nz*nz);')
  L.push('                        if (nl > 0) { nx /= nl; ny /= nl; nz /= nl; }')
  L.push('                        data.add(nx); data.add(ny); data.add(nz);')
  L.push('                        data.add(r); data.add(g); data.add(b);')
  L.push('                    }')
  L.push('                }')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function pyramidCode(obj) {
  const s = (obj.size || 1) / 2
  const h = (obj.height || 1.5) / 2
  const [r, g, b] = hexToRgb(obj.color || '#ffff00')
  const L = []
  L.push('        {')
  L.push('            float s = ' + f(s) + ', h = ' + f(h) + ';')
  L.push('            float r = ' + f(r) + ', g = ' + f(g) + ', b = ' + f(b) + ';')
  L.push('            float[][] verts = {{0,h,0},{-s,-h,-s},{s,-h,-s},{s,-h,s},{-s,-h,s}};')
  L.push('            int[][] faces = {{0,1,2},{0,2,3},{0,3,4},{0,4,1}};')
  L.push('            for (int[] face : faces) {')
  L.push('                float[] p0 = verts[face[0]], p1 = verts[face[1]], p2 = verts[face[2]];')
  L.push('                float ux = p1[0]-p0[0], uy = p1[1]-p0[1], uz = p1[2]-p0[2];')
  L.push('                float vx = p2[0]-p0[0], vy = p2[1]-p0[1], vz = p2[2]-p0[2];')
  L.push('                float nx = uy*vz - uz*vy, ny = uz*vx - ux*vz, nz = ux*vy - uy*vx;')
  L.push('                float nl = (float)Math.sqrt(nx*nx+ny*ny+nz*nz);')
  L.push('                if (nl > 0) { nx /= nl; ny /= nl; nz /= nl; }')
  L.push('                for (int vi : face) {')
  L.push('                    float[] p = verts[vi];')
  L.push('                    data.add(p[0]); data.add(p[1]); data.add(p[2]);')
  L.push('                    data.add(nx); data.add(ny); data.add(nz);')
  L.push('                    data.add(r); data.add(g); data.add(b);')
  L.push('                }')
  L.push('            }')
  L.push('            int[][] base = {{1,3,2},{1,4,3}};')
  L.push('            for (int[] face : base) {')
  L.push('                for (int vi : face) {')
  L.push('                    float[] p = verts[vi];')
  L.push('                    data.add(p[0]); data.add(p[1]); data.add(p[2]);')
  L.push('                    data.add(0f); data.add(-1f); data.add(0f);')
  L.push('                    data.add(r); data.add(g); data.add(b);')
  L.push('                }')
  L.push('            }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

function modelCode(obj) {
  const [r, g, b] = hexToRgb(obj.color || '#ff6600')
  const scale = obj.scale || 1.0
  const asset = obj.assetName || 'model.obj'
  const L = []
  L.push('        {')
  L.push('            try {')
  L.push('                java.io.InputStream in = assets.open("' + asset + '");')
  L.push('                float[] m = ObjLoader.load(in, ' + f(r) + ', ' + f(g) + ', ' + f(b) + ', ' + f(scale) + ');')
  L.push('                for (int k = 0; k < m.length; k += 9) {')
  L.push('                    data.add(m[k]); data.add(m[k+1]); data.add(m[k+2]);')
  L.push('                    data.add(m[k+3]); data.add(m[k+4]); data.add(m[k+5]);')
  L.push('                    data.add(m[k+6]); data.add(m[k+7]); data.add(m[k+8]);')
  L.push('                }')
  L.push('            } catch (Exception e) { e.printStackTrace(); }')
  L.push('        }')
  L.push(commit(obj))
  return L.join('\n')
}

export function genAndroid3D(scene, assets) {
  assets = assets || {}
  const buildLines = []
  for (const obj of scene.objects) {
    if (obj.type === 'cube') buildLines.push(cubeCode(obj))
    else if (obj.type === 'sphere') buildLines.push(sphereCode(obj))
    else if (obj.type === 'plane') buildLines.push(planeCode(obj))
    else if (obj.type === 'cylinder') buildLines.push(cylinderCode(obj))
    else if (obj.type === 'cone') buildLines.push(coneCode(obj))
    else if (obj.type === 'torus') buildLines.push(torusCode(obj))
    else if (obj.type === 'pyramid') buildLines.push(pyramidCode(obj))
    else if (obj.type === 'model') buildLines.push(modelCode(obj))
  }
  const [bgR, bgG, bgB] = hexToRgb(scene.bg)
  const texNames = []
  globalThis.__texMap = {}
  for (const obj of scene.objects) {
    if (obj.textureAsset && globalThis.__texMap[obj.textureAsset] == null) {
      globalThis.__texMap[obj.textureAsset] = texNames.length
      texNames.push(obj.textureAsset)
    }
  }
  let lights = scene.lights
  if (!lights || lights.length === 0) {
    lights = [{ dir: [0.7, 1.0, 0.5], color: '#ffffff', intensity: 1 }]
  }
  if (lights.length > 8) lights = lights.slice(0, 8)
  const lightCount = lights.length
  const dirArr = []
  const colArr = []
  const intArr = []
  for (const L of lights) {
    const d = L.dir || [0, 1, 0]
    const [lr, lg, lb] = hexToRgb(L.color || '#ffffff')
    dirArr.push(f(d[0]||0), f(d[1]||0), f(d[2]||0))
    colArr.push(f(lr), f(lg), f(lb))
    intArr.push(f(L.intensity == null ? 1 : L.intensity))
  }
  for (let i = lights.length; i < 8; i++) {
    dirArr.push('0f', '1f', '0f')
    colArr.push('0f', '0f', '0f')
    intArr.push('0f')
  }
  let renderer = TPL_RENDERER
  renderer = renderer.replace('__TEX_NAMES__', texNames.length ? texNames.map(n => '"' + n + '"').join(', ') : '""')
  renderer = renderer.replace('__LIGHT_COUNT__', String(lightCount))
  renderer = renderer.replace('__LIGHT_DIR__', dirArr.join(', '))
  renderer = renderer.replace('__LIGHT_COLOR__', colArr.join(', '))
  renderer = renderer.replace('__LIGHT_INTENSITY__', intArr.join(', '))
  renderer = renderer.replace('__VS__', VS.replace(/\n/g, '\\n'))
  renderer = renderer.replace('__FS__', FS.replace(/\n/g, '\\n'))
  renderer = renderer.replace('__BGR__', f(bgR))
  renderer = renderer.replace('__BGG__', f(bgG))
  renderer = renderer.replace('__BGB__', f(bgB))
  renderer = renderer.replace('__CAM__', f(scene.camera.distance))
  renderer = renderer.replace('__FOV__', f(scene.camera.fov))
  renderer = renderer.replace('__AR__', scene.autoRotate ? 'true' : 'false')
  renderer = renderer.replace('__BUILD__', buildLines.join('\n'))
  const files = {
    'app/src/main/java/com/xunay/gl/MainActivity.java': TPL_MAIN,
    'app/src/main/java/com/xunay/gl/SceneRenderer.java': renderer,
    'app/src/main/java/com/xunay/gl/ShaderUtil.java': TPL_SHADER,
    'app/src/main/java/com/xunay/gl/ObjLoader.java': TPL_OBJ,
    'app/src/main/AndroidManifest.xml': MANIFEST,
    'app/build.gradle': BUILD_GRADLE,
    'settings.gradle': SETTINGS_GRADLE,
    'gradle.properties': GRADLE_PROPS,
  }
  for (const [name, content] of Object.entries(assets)) {
    files['app/src/main/assets/' + name] = content
  }
  return { files }
}
