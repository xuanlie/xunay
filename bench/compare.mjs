#!/usr/bin/env node
// XuNay vs Preact —— 同一 Node + JSDOM 环境对比

import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);

// XuNay
const { runtime } = await import('../core/src/runtime.js');
runtime.dev = false;
const { mount: xMount } = await import('../core/src/index.js');
const { ul: xUl, li: xLi } = await import('../core/src/element.js');

// Preact
const { h, render: pRender } = await import('preact');

// 组件定义
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

async function measure(fn, count, rounds = 5) {
  const results = [];
  for (let r = 0; r < rounds; r++) {
    document.body.innerHTML = '';
    const root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);
    await new Promise(res => setTimeout(res, 10));

    const t0 = performance.now();
    fn(count, root);
    await new Promise(res => setTimeout(res, 10));
    results.push(performance.now() - t0);

    await new Promise(res => setTimeout(res, 20));
  }
  const sorted = [...results].sort((a, b) => a - b);
  return {
    avg: sorted.slice(1, -1).reduce((a, b) => a + b, 0) / (sorted.length - 2),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

async function main() {
  console.log('=== ⚔️  XuNay vs Preact —— 同环境对比 (Node + JSDOM) ===');
  console.log('Node:', process.version);
  console.log('');

  const xunayRun = (count, root) => {
    root.id = 'app';
    xMount(() => xunayList(count), '#app');
  };

  const preactRun = (count, root) => {
    pRender(h(PreactList, { count }), root);
  };

  for (const count of [100, 1000, 5000]) {
    console.log(`--- ${count} 项 ---`);
    const x = await measure(xunayRun, count);
    const p = await measure(preactRun, count);
    console.log(`  XuNay  | 平均 ${x.avg.toFixed(2).padStart(8)} ms | 最快 ${x.min.toFixed(2).padStart(8)} ms | 最慢 ${x.max.toFixed(2).padStart(8)} ms`);
    console.log(`  Preact | 平均 ${p.avg.toFixed(2).padStart(8)} ms | 最快 ${p.min.toFixed(2).padStart(8)} ms | 最慢 ${p.max.toFixed(2).padStart(8)} ms`);
    const ratio = x.avg / p.avg;
    console.log(`  比率   | XuNay / Preact = ${ratio.toFixed(2)}x ${ratio < 1 ? '✅ XuNay 快' : '⚠️ XuNay 慢'}`);
    console.log('');
  }

  console.log('✅ 完成');
}

main().catch(err => { console.error('❌', err); process.exit(1); });
