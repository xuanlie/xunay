#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';

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

function xunayList(count) {
  const c = new Array(count);
  for (let i = 0; i < count; i++) c[i] = xLi(null, `Item ${i}`);
  return xUl(null, ...c);
}
function PreactList({ count }) {
  const c = new Array(count);
  for (let i = 0; i < count; i++) c[i] = h('li', { key: i }, `Item ${i}`);
  return h('ul', null, ...c);
}

function stats(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const lo = Math.floor(s.length * 0.1), hi = Math.ceil(s.length * 0.9);
  const trim = s.slice(lo, hi);
  return {
    avg: trim.reduce((a, b) => a + b, 0) / trim.length,
    min: s[0], max: s[s.length - 1],
    median: s[Math.floor(s.length / 2)],
    p90: s[Math.floor(s.length * 0.9)]
  };
}

async function measure(fn, count, warmup = 3, rounds = 15) {
  for (let r = 0; r < warmup; r++) {
    document.body.innerHTML = '';
    const root = document.createElement('div'); root.id = 'app';
    document.body.appendChild(root);
    fn(count, root);
    await new Promise(res => setTimeout(res, 20));
  }
  const results = [];
  for (let r = 0; r < rounds; r++) {
    document.body.innerHTML = '';
    const root = document.createElement('div'); root.id = 'app';
    document.body.appendChild(root);
    await new Promise(res => setTimeout(res, 10));
    const t0 = performance.now();
    fn(count, root);
    await new Promise(res => setTimeout(res, 10));
    results.push(performance.now() - t0);
    await new Promise(res => setTimeout(res, 30));
  }
  return stats(results);
}

console.log('=== ⚔️  稳定版对比 (3 预热 + 15 轮，去掉首尾 10%) ===');
console.log('Node:', process.version);
console.log('');

const xunayRun = (count, root) => { root.id = 'app'; xMount(() => xunayList(count), '#app'); };
const preactRun = (count, root) => { pRender(h(PreactList, { count }), root); };

for (const count of [100, 1000, 5000]) {
  console.log(`--- ${count} 项 ---`);
  const x = await measure(xunayRun, count);
  const p = await measure(preactRun, count);
  console.log(`  XuNay  | 中位 ${x.median.toFixed(2).padStart(7)} | 平均 ${x.avg.toFixed(2).padStart(7)} | p90 ${x.p90.toFixed(2).padStart(7)} | 最快 ${x.min.toFixed(2).padStart(7)} | 最慢 ${x.max.toFixed(2).padStart(7)} ms`);
  console.log(`  Preact | 中位 ${p.median.toFixed(2).padStart(7)} | 平均 ${p.avg.toFixed(2).padStart(7)} | p90 ${p.p90.toFixed(2).padStart(7)} | 最快 ${p.min.toFixed(2).padStart(7)} | 最慢 ${p.max.toFixed(2).padStart(7)} ms`);
  const ratio = x.median / p.median;
  console.log(`  中位比率 | XuNay / Preact = ${ratio.toFixed(2)}x ${ratio < 0.95 ? '✅ XuNay 快' : ratio > 1.05 ? '⚠️ Preact 快' : '≈ 打平'}`);
  console.log('');
}
console.log('✅ 稳定版完成');
