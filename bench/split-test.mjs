import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;

// 单函数建 N 个
function single(n) {
  const ul = document.createElement('ul');
  for (let i = 0; i < n; i++) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode('Item ' + i));
    ul.appendChild(li);
  }
  return ul;
}

// 分 10 段建
function split(n, parts = 10) {
  const ul = document.createElement('ul');
  const per = n / parts;
  for (let p = 0; p < parts; p++) {
    for (let i = 0; i < per; i++) {
      const li = document.createElement('li');
      li.appendChild(document.createTextNode('Item ' + (p * per + i)));
      ul.appendChild(li);
    }
  }
  return ul;
}

function bench(fn, n, rounds = 7) {
  for (let r = 0; r < 2; r++) { document.body.innerHTML=''; fn(n); }
  const times = [];
  for (let r = 0; r < rounds; r++) {
    document.body.innerHTML = '';
    const t0 = performance.now();
    fn(n);
    times.push(performance.now() - t0);
  }
  times.sort((a,b)=>a-b);
  return times[Math.floor(times.length/2)];
}

console.log('=== 循环创建（对照组） ===');
for (const n of [100, 1000, 5000]) {
  console.log(`  ${n} 项: ${bench(single, n).toFixed(1)} ms`);
}
console.log('=== 拆分创建（10 段）===');
for (const n of [100, 1000, 5000]) {
  console.log(`  ${n} 项: ${bench(split, n).toFixed(1)} ms`);
}
