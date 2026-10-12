import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;

const code = readFileSync('bench/gen/out-5000/app.js', 'utf8');
console.log('产物大小:', (code.length / 1024).toFixed(1), 'KB');

// 1. 编译成本
const t0 = performance.now();
const fn = new Function(code);
const t1 = performance.now();
console.log('new Function 编译成本:', (t1 - t0).toFixed(1), 'ms');

// 2. 执行成本（每次都重建 #app）
function ensureApp() {
  document.body.innerHTML = '<div id="app"></div>';
}

// 预热
for (let r = 0; r < 3; r++) { ensureApp(); fn(); }

const times = [];
for (let r = 0; r < 7; r++) {
  ensureApp();
  const t = performance.now();
  fn();
  times.push(performance.now() - t);
}
times.sort((a, b) => a - b);
console.log('执行中位:', times[3].toFixed(1), 'ms');
console.log('各轮:', times.map(x => x.toFixed(1)).join(', '));

// 3. 对比：同样 5000 个 li，用循环建
console.log('\n=== 对照：循环建 5000 个 li ===');
function loopBuild() {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.getElementById('app');
  const ul = document.createElement('ul');
  for (let i = 0; i < 5000; i++) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode('Item ' + i));
    ul.appendChild(li);
  }
  app.appendChild(ul);
}
for (let r = 0; r < 3; r++) loopBuild();
const t2 = [];
for (let r = 0; r < 7; r++) {
  const t = performance.now();
  loopBuild();
  t2.push(performance.now() - t);
}
t2.sort((a, b) => a - b);
console.log('循环建中位:', t2[3].toFixed(1), 'ms');
console.log('各轮:', t2.map(x => x.toFixed(1)).join(', '));
