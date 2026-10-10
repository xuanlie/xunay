# xai spec

xai 管理 AI-STATE.md——一份活的项目状态文档。

## 命令

- xai state      显示项目状态
- xai snapshot   给 AI 读的紧凑快照
- xai verify     校验代码与文档一致
- xai log "..."  追加历史条目
- xai todo       管理 TODO

## AI 改代码流程

1. xai snapshot               读当前状态
2. 改代码
3. xai log "描述" --files "a,b,c"
4. xai verify
5. verify 失败 → 改文件或 AI-STATE.md，直到通过

第 4 步是强制的。

## verify 检查什么

- 正向：声明的文件存在
- 反向：存在的文件被声明（关键）

## AI-STATE.md 格式

三个 JSON 块 + 一段 markdown：

- json header     项目名/版本
- json structure  页面/组件/状态文件列表
- json rules      约定
- json todo       任务列表
- ## 历史         改动记录

## 什么不做

- 不做 Web 界面
- 不集成 AI API
- 不做版本控制
- 不做构建系统

## 给 AI 的 prompt

你的任务是修改这个项目。

每次改动前：
1. 跑 xai snapshot
2. 遵守 AI-STATE.md 的 rules 段

每次改动后：
1. 跑 xai log "一句话描述改动" --files "改动文件列表"
2. 完成 TODO 就跑 xai todo done <序号>
3. 跑 xai verify
4. 失败就回去改，直到通过

不要绕过 verify。不要跳过 log。