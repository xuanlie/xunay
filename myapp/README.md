# myapp

用 XuNay 构建。

## 目录

    myapp/
    ├── app.xuy              入口（mount + 路由）
    └── src/
        ├── router.xuy       路由
        ├── store/app.xuy    全局状态
        ├── components/      可复用组件
        ├── pages/           页面
        └── api/client.xuy   RPC 客户端（可选）

## 开发

    npm install
    npm run dev

打开 http://localhost:8080

## 构建

    npm run build

产物在 dist/。

## 路径别名

`@/` 指向 `src/`，配置在 package.json 的 `xunay.alias`：

    import { Header } from '@/components/Header.xuy'
    import { route } from '@/router.xuy'

## 加页面

1. 在 `src/pages/` 新建 `Foo.xuy`
2. 在 `app.xuy` 的 `pages` 映射里注册
3. 在 `src/components/Header.xuy` 加导航链接
