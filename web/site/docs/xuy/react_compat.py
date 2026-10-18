# docs/xuy/react_compat.py
# 分组：React 兼容

GROUP = 'React 兼容'
DOCS = [
    ('api-react-compat', 'React Compat', [
      ('H1', 'React Compat'),
      ('P', 'XuNay 提供 React 风格的 API 兼容层，入口为 xunay/compat。它将 React 风格的元素、组件和 Hooks 转换为 XuNay 自身的 DOM 渲染流程。兼容层不是 React 本体，也不代表所有 React API 和运行时语义都已完整实现。'),

      ('H2', '引入方式'),
      ('Code', "import React, {\\n  createElement,\\n  useState, useEffect, useMemo, useCallback, useRef,\\n  createRoot,\\n} from 'xunay/compat'\\n\\nfunction Counter() {\\n  const [count, setCount] = useState(0)\\n  useEffect(() => {\\n    document.title = 'Count: ' + count\\n  }, [count])\\n\\n  return React.createElement(\\n    'button',\\n    { onClick: () => setCount(n => n + 1) },\\n    'Count: ', count\\n  )\\n}\\n\\nconst root = createRoot(document.getElementById('app'))\\nroot.render(React.createElement(Counter))", 'js'),

      ('H2', '元素与 JSX Runtime'),
      ('Table', ['API', '用途'], [
        ['createElement', '创建 React 风格元素'],
        ['cloneElement', '复制元素并合并属性'],
        ['isValidElement', '判断是否为兼容层元素'],
        ['Fragment', '片段标记'],
        ['Children', 'map、forEach、count、only、toArray'],
        ['jsx / jsxs / jsxDEV', '供自动 JSX Runtime 调用'],
        ['createFactory', '创建元素工厂'],
      ]),
      ('P', '使用 JSX 时，构建工具必须配置与 xunay/compat 匹配的 JSX 转换入口。jsx、jsxs 和 jsxDEV 的导出存在，不代表所有 React 编译器插件和开发工具都自动兼容。'),

      ('H2', '函数组件 Hooks'),
      ('Table', ['API', '用途与注意事项'], [
        ['useState', '状态与函数式更新'],
        ['useEffect', '普通副作用及清理函数'],
        ['useLayoutEffect', '布局阶段副作用'],
        ['useInsertionEffect', '当前实现复用布局 effect 机制，不等同于 React 原生语义'],
        ['useMemo / useCallback', '缓存计算结果或回调'],
        ['useRef', '保存跨渲染引用'],
        ['useReducer', 'reducer 风格状态更新'],
        ['useContext', '读取兼容层 Context'],
        ['useImperativeHandle', '设置命令式 ref'],
        ['useId', '生成 ID'],
        ['useDebugValue', '调试辅助 API'],
        ['useSyncExternalStore', '订阅外部状态并读取快照，边界行为需单独验证'],
        ['useTransition / useDeferredValue', '简化的延迟更新 API，不提供 React 并发渲染语义'],
        ['useOptimistic', '简化的乐观状态 API'],
      ]),

      ('H2', 'Context 与组件包装'),
      ('Table', ['API', '说明'], [
        ['createContext', '创建兼容层 Context'],
        ['memo', '通过 props、ref 和 Context 比较尝试跳过组件渲染'],
        ['forwardRef', '转发 ref'],
        ['lazy', '延迟加载组件'],
        ['Suspense', '兼容层提供的简化组件接口，不能据此认定完整支持 React Suspense'],
        ['StrictMode', '兼容层导出项，不应假定具有 React 开发模式的全部检查行为'],
      ]),

      ('H2', '类组件'),
      ('Table', ['API', '说明'], [
        ['Component', '基础类组件与 setState、forceUpdate'],
        ['PureComponent', '继承 Component，并通过 props 和 state 的浅比较跳过不必要的更新；forceUpdate 可强制更新'],
        ['componentDidMount', '通过 effect 队列处理'],
        ['componentDidUpdate', '在更新渲染后调度'],
        ['componentWillUnmount', '卸载时清理'],
      ]),
      ('Warn', '当前 setState 会直接合并状态并调度更新；回调时序、批处理、错误边界、生命周期完整性及 shouldComponentUpdate 等行为，应通过兼容性测试确认。'),

      ('H2', 'DOM、Portal 与 Root'),
      ('Table', ['API', '说明'], [
        ['createRoot', '创建兼容层根对象，提供 render 和 unmount'],
        ['render / unmountComponentAtNode', '旧式根渲染接口'],
        ['hydrateRoot', '当前实现走普通渲染流程，不是真正的服务端 HTML hydration'],
        ['createPortal', '将子节点渲染到指定容器；应重点验证更新和卸载清理'],
        ['findDOMNode', '从元素或实例的 _el 字段尝试获取 DOM'],
        ['flushSync', '同步刷新辅助 API'],
        ['unstable_batchedUpdates', '批量更新辅助 API'],
        ['unstable_renderSubtreeIntoContainer', '当前为简化接口，不能视为完整实现'],
      ]),
      ('P', '原生 DOM 支持包含常见属性、事件、style 和部分 SVG 属性。表单受控状态、属性移除、事件监听器生命周期、SVG 边界和 Portal 卸载行为需要专项测试。'),

      ('H2', '其他导出'),
      ('Table', ['API', '当前定位'], [
        ['startTransition', '通过 requestAnimationFrame 延迟执行回调的简化实现'],
        ['act', '简化测试辅助函数，不保证自动等待全部渲染与 effect 队列'],
        ['version', '兼容层版本标识'],
        ['默认导出 React', '集合导出常用兼容 API；命名导出和默认导出应分别验证'],
      ]),

      ('H2', '已知限制'),
      ('Ul',
        '不是 React 的完整替代品，不保证所有第三方 React 库可直接运行',
        '不应将简化的 Transition、Suspense、StrictMode、act 或 hydration 描述为 React 原生等价实现',
        '需要验证 Hook 调用顺序、依赖变化、effect 清理、组件复用和卸载',
        '需要验证 ref 回调、类组件生命周期、Context 更新、受控表单和事件处理',
        'Portal、lazy、异步状态及复杂组件库应通过独立测试后再宣称支持'
      ),

      ('H2', '建议验证'),
      ('Code', "node --test core/test/react-compat.full.test.js\\nnode --check core/src/compatibility/react-compat.js\\nnode --check core/src/compatibility/react-dom-compat.js", 'bash'),
      ('P', '建议为每个公开 API 建立独立测试，并使用真实依赖组件做集成测试。文档中的“已导出”仅代表存在对应接口，不代表其行为已达到 React 的兼容标准。'),
    ]),
]
