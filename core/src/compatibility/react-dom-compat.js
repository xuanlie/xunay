/**
 * xunay/react-dom —— react-dom / react-dom/client 兼容入口
 * 用户代码里 `import ... from 'react-dom'` 或 `'react-dom/client'`
 * 会被 alias 到本模块。
 */

export {
  createRoot,
  hydrateRoot,
  render,
  unmountComponentAtNode,
  findDOMNode,
  createPortal,
  flushSync,
  unstable_batchedUpdates,
  unstable_renderSubtreeIntoContainer,
  version,
} from './react-compat.js'

import * as _compat from './react-compat.js'
export default _compat
