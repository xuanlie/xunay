// 文件树
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("文件树"),
    P("递归组件——可折叠的文件树。"),
    H2("代码"),
    Code("import { div, span, signal, list, show, mount } from 'xunay'\n\nconst tree = {\n  name: 'root', type: 'dir', children: [\n    { name: 'src', type: 'dir', children: [\n      { name: 'main.js', type: 'file', size: 1024 },\n      { name: 'utils.js', type: 'file', size: 512 },\n      { name: 'components', type: 'dir', children: [\n        { name: 'Button.js', type: 'file', size: 800 },\n        { name: 'Modal.js', type: 'file', size: 1200 }\n      ]}\n    ]},\n    { name: 'README.md', type: 'file', size: 2048 }\n  ]\n}\n\nfunction TreeNode({ node, depth = 0 }) {\n  const open = signal(depth < 2)\n\n  if (node.type === 'file') {\n    return div({ class: 'tree-node file', style: 'padding-left: ' + (depth * 16 + 20) + 'px' },\n      span({ class: 'tree-icon' }, '📄'),\n      span({ class: 'tree-name' }, node.name),\n      span({ class: 'tree-size' }, (node.size / 1024).toFixed(1) + ' KB')\n    )\n  }\n\n  return div({ class: 'tree-dir' },\n    div({\n      class: 'tree-node dir',\n      style: 'padding-left: ' + (depth * 16 + 4) + 'px',\n      on: { click: () => open(!open()) }\n    },\n      span({ class: 'tree-toggle' }, () => open() ? '▼' : '▶'),\n      span({ class: 'tree-icon' }, '📁'),\n      span({ class: 'tree-name' }, node.name),\n      span({ class: 'tree-count' }, node.children.length)\n    ),\n    show(open, () =>\n      div(null, list(node.children, c => c.name, c => TreeNode({ node: c, depth: depth + 1 })))\n    )\n  )\n}\n\nmount(() => div({ class: 'file-tree' },\n  div({ class: 'tree-header' }, '项目文件'),\n  TreeNode({ node: tree, depth: 0 })\n), '#app')", "xuy"),
    H2("学习点"),
    Ul("递归组件","signal 独立——每个目录一个 open 状态","tree 结构用 list 递归渲染"),
  )
}
