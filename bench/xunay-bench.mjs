#!/usr/bin/env node
// XuNay 性能基准测试 —— 与 Preact 版对齐
// 运行: node bench/xunay-bench.mjs

import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';

// ========== JSDOM 环境 ==========
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);

// ========== 加载 xunay ==========
const _T0 = performance.now();

const { runtime } = await import('../core/src/runtime.js');
runtime.dev = false;

const { mount } = await import('../core/src/index.js');
const { div, li, ul } = await import('../core/src/element.js');

const loadDone = performance.now();

// ========== 测试组件（与 Preact 版对齐） ==========
function ListItem(index) {
  return li({ style: { padding: '2px 0' } }, `Item ${index}`);
}

function HeavyList(count) {
  const children = new Array(count);
  for (let i = 0; i < count; i++) children[i] = ListItem(i);
  return ul({ style: { listStyle: 'none', padding: 0 } }, ...children);
}

// ========== 渲染性能 ==========
async function measureRender(count, rounds = 5) {
  const results = [];

  for (let r = 0; r < rounds; r++) {
    document.body.innerHTML = '';
    const root = document.createElement('div');
    root.id = 'app';
    document.body.appendChild(root);

    await new Promise(res => setTimeout(res, 20));

    const start = performance.now();
    mount(() => HeavyList(count), '#app');
    await new Promise(res => setTimeout(res, 20));
    const end = performance.now();

    results.push(end - start);
    await new Promise(res => setTimeout(res, 50));
  }

  const sorted = [...results].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;

  return { avg, min: sorted[0], max: sorted[sorted.length - 1], rounds: results };
}

// ========== 首帧 ==========
async function measureFirstFrame() {
  document.body.innerHTML = '';
  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);
  await new Promise(res => setTimeout(res, 20));

  const t0 = performance.now();
  mount(() => HeavyList(100), '#app');
  await new Promise(res => setTimeout(res, 20));
  return performance.now() - t0;
}

// ========== 内存 ==========
function snapMemory() {
  if (global.gc) global.gc();
  const m = process.memoryUsage();
  return {
    rss: m.rss / 1048576,
    heapUsed: m.heapUsed / 1048576,
  };
}

// ========== 主流程 ==========
async function main() {
  console.log('=== ⚡ XuNay 性能基准测试 ===');
  console.log('Node:', process.version);
  console.log(`模块加载耗时: ${(loadDone - _T0).toFixed(2)} ms\n`);

  // 首帧
  const firstFrame = await measureFirstFrame();
  console.log('=== 🚀 首帧时间 ===');
  console.log(`  100 项首次挂载: ${firstFrame.toFixed(2)} ms\n`);

  // 渲染性能
  console.log('=== ⚡ 渲染性能 ===');
  for (const count of [100, 1000, 5000]) {
    const r = await measureRender(count, 5);
    console.log(`  ${String(count).padStart(5)} 项 | 平均 ${r.avg.toFixed(2).padStart(7)} ms | 最快 ${r.min.toFixed(2).padStart(7)} ms | 最慢 ${r.max.toFixed(2).padStart(7)} ms`);
    console.log(`          各轮: [${r.rounds.map(x => x.toFixed(2)).join(', ')}]`);
  }
  console.log('');

  // 内存
  console.log('=== 🧠 内存占用 ===');
  const before = snapMemory();

  document.body.innerHTML = '';
  const root = document.createElement('div');
  root.id = 'app';
  document.body.appendChild(root);
  await new Promise(res => setTimeout(res, 20));
  mount(() => HeavyList(5000), '#app');
  await new Promise(res => setTimeout(res, 100));

  const after = snapMemory();
  console.log(`  5000 项挂载前: heapUsed ${before.heapUsed.toFixed(2)} MB`);
  console.log(`  5000 项挂载后: heapUsed ${after.heapUsed.toFixed(2)} MB`);
  console.log(`  增量: ${(after.heapUsed - before.heapUsed).toFixed(2)} MB`);

  console.log('\n✅ 测试完成！');
}

main().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
