#!/usr/bin/env node
// XuNay 编译产物 vs XuNay runtime vs Preact —— 全维度对比
import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);

const { runtime } = await import('../core/src/runtime.js');
runtime.dev = false;
const { mount: xMount } = await import('../core/src/index.js');
const { ul: xUl, li: xLi } = await import('../core/src/element.js');
const { h, render: pRender } = await import('preact');

const SIZES = [100, 1000, 5000];
const OUT_DIR = 'bench/gen';
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ========== 1. 生成 .xuy 文件并编译 ==========
console.log('=== 📦 生成并编译 .xuy 文件 ===');
const compiledFns = {};

for (const n of SIZES) {
  const xuyPath = `${OUT_DIR}/list-${n}.xuy`;
  const outDir = `${OUT_DIR}/out-${n}`;

  let src = 'const { app } = __rt__\n\napp(() => ul(null';
  for (let i = 0; i < n; i++) src += `,\n  li(null, "Item ${i}")`;
  src += '\n), "#app")\n';
  writeFileSync(xuyPath, src);

  process.stdout.write(`  ${String(n).padStart(5)} 项 → 编译中... `);
  const t0 = performance.now();
  try {
    execSync(`node bin/xuyc3.js build ${xuyPath} --out ${outDir} --mode compiled`, { stdio: 'pipe' });
    const compileMs = performance.now() - t0;
    const code = readFileSync(`${outDir}/app.js`, 'utf8');
    const fn = new Function(code);
    compiledFns[n] = { fn, codeLen: code.length, compileMs };
    console.log(`✅ ${compileMs.toFixed(0)}ms, 产物 ${(code.length / 1024).toFixed(1)}KB`);
  } catch (e) {
    console.log(`❌ ${e.message.slice(0, 80)}`);
  }
}
console.log('');

// ========== 2. 三种实现 ==========
function xunayRuntimeList(count) {
  const c = new Array(count);
  for (let i = 0; i < count; i++) c[i] = xLi(null, `Item ${i}`);
  return xUl(null, ...c);
}
function PreactList({ count }) {
  const c = new Array(count);
  for (let i = 0; i < count; i++) c[i] = h('li', { key: i }, `Item ${i}`);
  return h('ul', null, ...c);
}

// ========== 3. 测量 ==========
function stats(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const lo = Math.floor(s.length * 0.1), hi = Math.ceil(s.length * 0.9);
  const trim = s.slice(lo, hi);
  return {
    avg: trim.reduce((a, b) => a + b, 0) / trim.length,
    median: s[Math.floor(s.length / 2)],
    min: s[0], max: s[s.length - 1],
    p90: s[Math.floor(s.length * 0.9)],
  };
}

async function measure(fn, warmup = 3, rounds = 15) {
  for (let r = 0; r < warmup; r++) {
    document.body.innerHTML = '';
    const root = document.createElement('div'); root.id = 'app';
    document.body.appendChild(root);
    fn(root);
    await new Promise(res => setTimeout(res, 20));
  }
  const results = [];
  for (let r = 0; r < rounds; r++) {
    document.body.innerHTML = '';
    const root = document.createElement('div'); root.id = 'app';
    document.body.appendChild(root);
    await new Promise(res => setTimeout(res, 10));
    const t0 = performance.now();
    fn(root);
    await new Promise(res => setTimeout(res, 10));
    results.push(performance.now() - t0);
    await new Promise(res => setTimeout(res, 30));
  }
  return stats(results);
}

console.log('=== ⚔️  三方对比 (3 预热 + 15 轮，去掉首尾 10%) ===');
console.log('Node:', process.version);
console.log('');

const summary = [];

for (const count of SIZES) {
  console.log(`--- ${count} 项 ---`);

  const xr = await measure((root) => { root.id = 'app'; xMount(() => xunayRuntimeList(count), '#app'); });
  const p = await measure((root) => { pRender(h(PreactList, { count }), root); });
  const c = compiledFns[count]
    ? await measure(() => { compiledFns[count].fn(); })
    : null;

  console.log(`  XuNay runtime   | 中位 ${xr.median.toFixed(1).padStart(7)} | p90 ${xr.p90.toFixed(1).padStart(7)} | 平均 ${xr.avg.toFixed(1).padStart(7)} ms`);
  console.log(`  XuNay compiled  | ${c ? `中位 ${c.median.toFixed(1).padStart(7)} | p90 ${c.p90.toFixed(1).padStart(7)} | 平均 ${c.avg.toFixed(1).padStart(7)} ms` : 'N/A'}`);
  console.log(`  Preact          | 中位 ${p.median.toFixed(1).padStart(7)} | p90 ${p.p90.toFixed(1).padStart(7)} | 平均 ${p.avg.toFixed(1).padStart(7)} ms`);

  if (c) {
    const r1 = c.median / xr.median;
    const r2 = c.median / p.median;
    console.log(`  编译 vs runtime : ${r1.toFixed(2)}x ${r1 < 0.95 ? '✅ 编译快' : r1 > 1.05 ? '⚠️ 编译慢' : '≈ 打平'}`);
    console.log(`  编译 vs Preact  : ${r2.toFixed(2)}x ${r2 < 0.95 ? '✅ 编译快' : r2 > 1.05 ? '⚠️ Preact 快' : '≈ 打平'}`);
  }
  console.log('');
  summary.push({ count, xr: xr.median, c: c?.median, p: p.median, codeLen: compiledFns[count]?.codeLen });
}

console.log('=== 📊 汇总表 (中位数 ms) ===');
console.log('规模    | runtime | compiled | Preact  | 编译 vs runtime');
for (const s of summary) {
  const r1 = s.c ? (s.c / s.xr).toFixed(2) + 'x' : '-';
  console.log(`${String(s.count).padStart(5)} 项 | ${s.xr.toFixed(1).padStart(7)} | ${s.c ? s.c.toFixed(1).padStart(8) : '     N/A'} | ${s.p.toFixed(1).padStart(7)} | ${r1}`);
}

console.log('\n✅ 全部完成');
