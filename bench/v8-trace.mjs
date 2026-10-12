import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;

// 1. 分析产物结构
const code = readFileSync('bench/gen/out-5000/app.js', 'utf8');
console.log('=== 📦 产物分析 ===');
console.log('文件大小:', (code.length / 1024).toFixed(1), 'KB');

// 找 app(() => 那行
const appMatch = code.match(/app\(\(\) => \(\(\) => \{([\s\S]*?)\}\)\(\)/);
if (appMatch) {
  console.log('闭包函数体大小:', (appMatch[1].length / 1024).toFixed(1), 'KB');
  console.log('createElement 次数:', (appMatch[1].match(/createElement/g) || []).length);
  console.log('变量声明次数:', (appMatch[1].match(/const _li/g) || []).length);
}

// 2. 检查 V8 是否优化
console.log('\n=== 🔬 V8 优化状态 ===');
const fn = new Function(code);

// 预热：让 V8 有机会优化
for (let i = 0; i < 20; i++) {
  document.body.innerHTML = '<div id="app"></div>';
  fn();
}

// 检查优化状态（需要 --allow-natives-syntax）
const hasNativeSyntax = typeof globalThis['%GetOptimizationStatus'] !== 'undefined';
if (hasNativeSyntax) {
  const status = globalThis['%GetOptimizationStatus'](fn);
  console.log('主函数优化状态位:', status);
} else {
  console.log('提示：用 --allow-natives-syntax 重跑可看详细状态');
}

// 3. 分规模测，取最小值（最抗 GC 噪声）
function build(n) {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.getElementById('app');
  const ul = document.createElement('ul');
  for (let i = 0; i < n; i++) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode('Item ' + i));
    ul.appendChild(li);
  }
  app.appendChild(ul);
}

function bench(fn, rounds = 20) {
  const times = [];
  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now();
    fn();
    times.push(performance.now() - t0);
  }
  times.sort((a, b) => a - b);
  return { min: times[0], median: times[Math.floor(times.length / 2)] };
}

console.log('\n=== ⚡ 循环建 DOM (取最小值抗 GC) ===');
for (const n of [100, 1000, 5000]) {
  for (let w = 0; w < 3; w++) build(n);
  const r = bench(() => build(n));
  console.log(`  ${String(n).padStart(5)} 项 | 最快 ${r.min.toFixed(1).padStart(7)} | 中位 ${r.median.toFixed(1).padStart(7)} ms`);
}

console.log('\n=== ⚡ 编译产物执行 (取最小值) ===');
function runCompiled() {
  document.body.innerHTML = '<div id="app"></div>';
  fn();
}
for (let w = 0; w < 3; w++) runCompiled();
const r = bench(runCompiled);
console.log(`  5000 项 | 最快 ${r.min.toFixed(1).padStart(7)} | 中位 ${r.median.toFixed(1).padStart(7)} ms`);
