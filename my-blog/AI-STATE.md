# AI-STATE

## 项目

```json header
{
  "name": "个人博客",
  "version": "1.1.0",
  "framework": "xunay",
  "updated": "2026-10-09"
}
```

## 结构

```json structure
{
  "pages": [
    { "path": "pages/Home.xuy",  "export": "Doc", "desc": "首页" },
    { "path": "pages/Post.xuy",  "export": "Doc", "desc": "文章详情" },
    { "path": "pages/About.xuy", "export": "Doc", "desc": "关于页" }
  ],
  "components": [
    { "path": "components/Header.xuy" },
    { "path": "components/Footer.xuy" },
    { "path": "components/Comment.xuy", "added": "2026-10-10" }
  ],
  "store": [
    { "path": "store.xuy", "exports": ["posts", "currentPost", "comments"] }
  ]
}
```

## 约定

```json rules
[
  "每个 page 文件必须 export 名为 Doc 的函数",
  "组件只从 store import signal，不直接创建 signal",
  "所有路由必须在 router.xuy 里声明",
  "新增 page 必须同时改 router.xuy"
]
```

## TODO

```json todo
[
  {
    "text": "评论持久化到 localStorage",
    "done": false
  },
  {
    "text": "加评论功能",
    "done": false
  },
  {
    "text": "文章分页",
    "done": false
  },
  {
    "text": "搜索功能",
    "done": false
  },
  {
    "text": "hfgcn",
    "done": true
  },
  {
    "text": "89",
    "done": false
  }
]
```

## 历史

### 2026-10-09 · 测试全局命令

- 修改 pages/Home.xuy
- 修改 AI-STATE.md
### 2026-10-09 · 加评论功能

- 修改 components/Comment.xuy
- 修改 pages/Post.xuy
- 修改 store.xuy
- 修改 AI-STATE.md
### 2026-10-10 · 加评论功能

- 新增 components/Comment.xuy
- 修改 pages/Post.xuy
- 修改 store.xuy（新增 comments signal）

### 2026-10-08 · 初始版本

- 建立项目骨架
- 3 个页面：Home / Post / About
- 2 个组件：Header / Footer
