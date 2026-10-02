# XuNay Benchmark

## 快速跑

### Node 版（无浏览器）
    node bench/node.mjs              # 人类可读
    node bench/node.mjs --json       # 机器可读（CI 用）
    node bench/diag.mjs              # subs 累积诊断

### 浏览器版（需 HTTP）
    cd /root/xunay
    python3 -m http.server 12341 --bind 0.0.0.0
    # 访问 http://<IP>:12341/bench/

## 文件说明

### 基准测试
| 文件 | 用途 |
|---|---|
| node.mjs | Node 核心基准（signal/computed/effect/batch + 包体积） |
| index.html | 浏览器主基准（render/mount/list/SSR + JSON 导出） |
| realistic.html | 真实场景（首挂 1000 span / 更新 100 次 / list 对比） |
| fine-grain.html | 细粒度对比（共享 signal vs 各读各的） |

### 实验 / 诊断
| 文件 | 用途 |
|---|---|
| exp-merge.html | 合并优化 A/B/C 对照 |
| exp-merge-stable.html | 同上，3 次取中位 |
| micro.html | DOM 单操作微基准 |
| diag.mjs | subs 累积诊断（Node） |
| diag2.html | effect 计数 + subs 监控（浏览器） |
| throw-test.html | 异常保护回归 |

## 关键数字（2026-10-02，Node v20.19.2 / Android Chrome 135 / 8 核）

| 场景 | 优化前 | 优化后 |
|---|---|---|
| signal.read | — | 0.14 us / 6.9M ops/s |
| signal.write（无订阅） | — | 0.09 us / 11M ops/s |
| 1000 动态·共享 signal·首挂 | ~400 ms | 18.6 ms |
| 1000 动态·共享 signal·更新 | 704 us | 393 us |
| 1000 动态·各读各·只改 1 个 | 304 us | 2.0 us |
| 1000 动态·各读各·全改 | 106 ms | 1.2 ms |
| xunay.esm.js gzip | 4.5 KB | 5.0 KB |

## 注意

- render(1000 动态) 不是主路径，真实场景该用 list() 做 keyed 复用
- 看单次耗时，不看总耗时（iters 会骗人）
- 单次测量噪声大，至少跑 3 次取中位

## 已知未解决

- subs 每次 render 都累积（effect 不 dispose），长会话会变慢
- 依赖 mount() 返回的 unmount() 手动清理，用户容易忘
