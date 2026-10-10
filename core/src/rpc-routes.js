// 自动生成，请勿手改
// 源：shared/routes.json
// 用 node bin/sync-routes.js 同步

export const ROUTES = [
  { name: "token", method: "GET", path: "/rpc/token", auth: false },
  { name: "getTodos", method: "GET", path: "/rpc/getTodos", auth: true },
  { name: "addTodo", method: "POST", path: "/rpc/addTodo", auth: true },
  { name: "toggleTodo", method: "POST", path: "/rpc/toggleTodo", auth: true },
  { name: "deleteTodo", method: "POST", path: "/rpc/deleteTodo", auth: true },
]
