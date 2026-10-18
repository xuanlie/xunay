// compiler4/builtins —— 内置 sdu 模板
// 编译期直接展开成 vnode 代码，零运行时依赖

const wrap = (cls, ...children) => `div({ class: '${cls}' }${children.filter(c => c && String(c).trim()).length ? ', ' + children.filter(c => c && String(c).trim()).join(', ') : ''})`

export const BUILTINS = {
  // ── 导航栏 ──
  NavBar: (obj) => `${wrap('sdu-navbar',
    `div({ class: 'sdu-navbar-brand' }, ${obj.brand || "''"})`,
    obj.search ? `div({ class: 'sdu-navbar-search' }, ${obj.search})` : '',
    obj.ops ? `div({ class: 'sdu-navbar-ops' }, ...(${obj.ops}).map(_op => span({ class: 'sdu-navbar-op' }, _op.ico || _op.text || '')))` : ''
  )}`,

  // ── Hero 轮播 ──
  Hero: (obj) => `(function(){ var _sl = (${obj.slides || '[]'})[${obj.index || 0}] || {}; return ${wrap('sdu-hero',
    `div({ class: 'sdu-hero-title' }, _sl.title || '')`,
    `div({ class: 'sdu-hero-sub' }, _sl.sub || '')`
  )} })()`,

  // ── 分类网格 ──
  CateGrid: (obj) => `${wrap('sdu-categrid',
    `...(${obj.items || '[]'}).map(_c => div({ class: 'sdu-cate' },
      div({ class: 'sdu-cate-ico' }, _c.icon || _c.ico || ''),
      div({ class: 'sdu-cate-nm' }, _c.name || _c.nm || '')
    ))`
  )}`,

  // ── 商品卡 ──
  GoodsCard: (obj) => `${wrap('sdu-goods-card',
    `div({ class: 'sdu-goods-img' }, ${obj.item ? `(${obj.item}).img ? img({ src: (${obj.item}).img }) : ''` : "''"})`,
    `div({ class: 'sdu-goods-nm' }, ${obj.item ? `(${obj.item}).name || ''` : "''"})`,
    `div({ class: 'sdu-goods-pr' }, '¥' + (${obj.item ? `(${obj.item}).price || 0` : '0'}))`
  )}`,

  // ── 商品列表 ──
  GoodsList: (obj) => `${wrap('sdu-goods-list',
    `...(${obj.items || '[]'}).map(_g => div({ class: 'sdu-goods-card' },
      _g.img ? img({ class: 'sdu-goods-img', src: _g.img }) : null,
      div({ class: 'sdu-goods-nm' }, _g.name || ''),
      div({ class: 'sdu-goods-pr' }, '¥' + (_g.price || 0)),
      div({ class: 'sdu-goods-sale' }, (_g.sales || 0) + ' 人已买')
    ))`
  )}`,

  // ── 秒杀条 ──
  SeckillBar: (obj) => `${wrap('sdu-seckill',
    `span({ class: 'sdu-seckill-title' }, ${obj.title || "'🔥 限时秒杀'"})`,
    obj.sec ? `span({ class: 'sdu-seckill-timer' }, String(${obj.sec}))` : '',
    `span({ class: 'sdu-seckill-more' }, '更多 ›')`
  )}`,

  // ── 页脚 ──
  Footer: (obj) => `${wrap('sdu-footer',
    obj.cols ? `...(${obj.cols}).map(_c => div({ class: 'sdu-footer-col' },
      div({ class: 'sdu-footer-title' }, _c.title || ''),
      ...(_c.links || []).map(_l => a({ class: 'sdu-footer-link', href: '#' }, _l))
    ))` : '',
    `div({ class: 'sdu-footer-copy' }, ${obj.copy || "''"})`
  )}`,

  // ── 侧边浮窗 ──
  SideBar: (obj) => `${wrap('sdu-sidebar',
    `...(${obj.items || '[]'}).map(_i => div({ class: 'sdu-sidebar-btn' }, _i.ico || _i.text || ''))`
  )}`,

  // ── 统计卡 ──
  StatCard: (obj) => `${wrap('sdu-stat card',
    `div({ class: 'sdu-stat-lbl' }, ${obj.label || "''"})`,
    `div({ class: 'sdu-stat-val' }, String(${obj.value || "''"}))`
  )}`,

  // ── 统计行 ──
  StatRow: (obj) => `${wrap('sdu-statrow',
    `...(${obj.items || '[]'}).map(_s => div({ class: 'sdu-stat card' },
      div({ class: 'sdu-stat-lbl' }, _s.label || ''),
      div({ class: 'sdu-stat-val' }, String(_s.value || ''))
    ))`
  )}`,

  // ── 用户卡 ──
  UserCard: (obj) => `${wrap('sdu-usercard card',
    `div({ class: 'sdu-user-avatar' }, ${obj.item ? `((${obj.item}).name || '?')[0]` : "'?'"})`,
    `div({ class: 'sdu-user-info' },
      div({ class: 'sdu-user-name' }, ${obj.item ? `(${obj.item}).name || ''` : "''"}),
      div({ class: 'sdu-user-role' }, ${obj.item ? `(${obj.item}).role || ''` : "''"})
    )`
  )}`,

  // ── 用户行 ──
  UserRow: (obj) => `${wrap('sdu-userrow',
    `span({ class: 'sdu-user-name' }, ${obj.item ? `(${obj.item}).name || ''` : "''"})`,
    `span({ class: 'sdu-user-role' }, ${obj.item ? `(${obj.item}).role || ''` : "''"})`
  )}`,

  // ── 通用列表项 ──
  ListItem: (obj) => `${wrap('sdu-list-item',
    obj.icon ? `span({ class: 'sdu-list-icon' }, ${obj.icon})` : '',
    `div({ class: 'sdu-list-body' },
      div({ class: 'sdu-list-title' }, ${obj.title || "''"}),
      div({ class: 'sdu-list-desc' }, ${obj.desc || "''"})
    )`
  )}`,

  // ── Tabs ──
  Tabs: (obj) => `${wrap('sdu-tabs',
    `...(${obj.items || '[]'}).map(_t => div({ class: 'sdu-tab' + ((_t.k || _t) === ${obj.model || 'null'} ? ' on' : '') }, _t.l || _t))`
  )}`,

  // ── 面包屑 ──
  Breadcrumb: (obj) => `${wrap('sdu-breadcrumb',
    `...(${obj.items || '[]'}).map((_b, _i) => span({ class: 'sdu-bc' },
      _i > 0 ? span({ class: 'sdu-bc-sep' }, ' / ') : '',
      span(null, _b)
    ))`
  )}`,

  // ── 空状态 ──
  Empty: (obj) => `${wrap('sdu-empty',
    `div({ class: 'sdu-empty-icon' }, ${obj.icon || "'📭'"})`,
    `div({ class: 'sdu-empty-text' }, ${obj.text || "'暂无数据'"})`
  )}`,

  // ── 加载中 ──
  Loading: (obj) => `${wrap('sdu-loading',
    `div({ class: 'sdu-loading-spinner' })`,
    `div({ class: 'sdu-loading-text' }, ${obj.text || "'加载中...'"})`
  )}`,

  // ── 表格 ──
  Table: (obj) => `${wrap('sdu-table',
    `div({ class: 'sdu-table-head' },
      ...(${obj.cols || '[]'}).map(_c => div({ class: 'sdu-table-cell' }, _c))
    )`,
    `...(${obj.rows || '[]'}).map(_r => div({ class: 'sdu-table-row' },
      ...(${obj.cols || '[]'}).map(_c => div({ class: 'sdu-table-cell' }, _r[_c] || ''))
    ))`
  )}`,

  // ── 弹窗 ──
  Modal: (obj) => `((${obj.open || 'false'}) ? div({ class: 'sdu-modal-mask' },
    div({ class: 'sdu-modal' },
      div({ class: 'sdu-modal-title' }, ${obj.title || "''"})
    )
  ) : null)`,

  // ── 表单 ──
  Form: (obj) => `${wrap('sdu-form',
    `...(${obj.fields || '[]'}).map(_f => div({ class: 'sdu-form-field' },
      div({ class: 'sdu-form-label' }, _f.label || _f),
      input({ class: 'sdu-form-input', placeholder: _f.ph || '' })
    ))`
  )}`,
}

// 内置 CSS —— 编译时自动注入
export const BUILTIN_CSS = `
.sdu-navbar { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #fff; border-bottom: 1px solid #e5e7eb; }
.sdu-navbar-brand { font-size: 18px; font-weight: 800; }
.sdu-navbar-search { flex: 1; max-width: 500px; padding: 8px 14px; background: #f3f4f6; border-radius: 20px; color: #666; font-size: 14px; }
.sdu-navbar-ops { display: flex; gap: 12px; margin-left: auto; }
.sdu-navbar-op { font-size: 20px; cursor: pointer; }
.sdu-hero { padding: 60px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border-radius: 12px; margin: 16px 0; }
.sdu-hero-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
.sdu-hero-sub { font-size: 16px; opacity: 0.9; }
.sdu-goods-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; padding: 16px; }
.sdu-goods-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; transition: all .2s; }
.sdu-goods-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.08); transform: translateY(-2px); }
.sdu-goods-img { width: 100%; aspect-ratio: 1; background: #f3f4f6; border-radius: 8px; margin-bottom: 8px; object-fit: cover; }
.sdu-goods-nm { font-size: 14px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; }
.sdu-goods-pr { font-size: 18px; font-weight: 700; color: #dc2626; }
.sdu-goods-sale { font-size: 12px; color: #999; margin-top: 4px; }
.sdu-footer { padding: 30px 20px; background: #1a1a1a; color: #999; text-align: center; margin-top: 20px; border-radius: 12px; }
.sdu-footer-copy { font-size: 13px; }
.sdu-footer-col { display: inline-block; margin: 0 20px; text-align: left; vertical-align: top; }
.sdu-footer-title { font-weight: 600; color: #fff; margin-bottom: 8px; }
.sdu-footer-link { display: block; color: #999; font-size: 13px; margin: 4px 0; text-decoration: none; }
.sdu-footer-link:hover { color: #fff; }
.sdu-sidebar { position: fixed; right: 20px; bottom: 80px; display: flex; flex-direction: column; gap: 12px; }
.sdu-sidebar-btn { width: 44px; height: 44px; border-radius: 50%; background: #fff; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.sdu-stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center; }
.sdu-stat-lbl { font-size: 13px; color: #666; margin-bottom: 6px; }
.sdu-stat-val { font-size: 24px; font-weight: 700; color: #1a1a1a; }
.sdu-statrow { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; padding: 16px; }
.sdu-categrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px; padding: 16px; }
.sdu-cate { text-align: center; cursor: pointer; }
.sdu-cate-ico { font-size: 32px; margin-bottom: 6px; }
.sdu-cate-nm { font-size: 13px; color: #666; }
.sdu-empty { padding: 60px 20px; text-align: center; color: #999; }
.sdu-empty-icon { font-size: 48px; margin-bottom: 12px; }
.sdu-empty-text { font-size: 14px; }
.sdu-loading { padding: 40px; text-align: center; color: #999; }
.sdu-loading-spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; margin: 0 auto 12px; animation: sdu-spin 0.8s linear infinite; }
@keyframes sdu-spin { to { transform: rotate(360deg); } }
.sdu-usercard { display: flex; gap: 12px; align-items: center; padding: 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
.sdu-user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
.sdu-user-name { font-size: 15px; font-weight: 600; }
.sdu-user-role { font-size: 12px; color: #999; }
.sdu-tabs { display: flex; gap: 4px; padding: 8px; border-bottom: 1px solid #e5e7eb; }
.sdu-tab { padding: 8px 14px; font-size: 14px; cursor: pointer; border-radius: 6px; color: #666; }
.sdu-tab:hover { background: #f3f4f6; }
.sdu-tab.on { background: #eff6ff; color: #2563eb; font-weight: 600; }
.sdu-breadcrumb { display: flex; align-items: center; padding: 12px 20px; font-size: 13px; color: #666; }
.sdu-bc-sep { color: #ccc; margin: 0 4px; }
.sdu-modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.sdu-modal { background: #fff; border-radius: 12px; padding: 20px; min-width: 300px; }
.sdu-modal-title { font-size: 17px; font-weight: 600; }
.sdu-form { padding: 16px; }
.sdu-form-field { margin-bottom: 14px; }
.sdu-form-label { font-size: 13px; color: #666; margin-bottom: 6px; }
.sdu-form-input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; }
.sdu-table { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.sdu-table-head, .sdu-table-row { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; }
.sdu-table-head { background: #f9fafb; font-weight: 600; font-size: 13px; }
.sdu-table-row { border-top: 1px solid #e5e7eb; font-size: 14px; }
.sdu-table-cell { padding: 10px 12px; }
.sdu-list-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; align-items: center; }
.sdu-list-icon { font-size: 20px; }
.sdu-list-title { font-size: 14px; font-weight: 500; }
.sdu-list-desc { font-size: 12px; color: #999; }
.sdu-seckill { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #fff5f5; border-radius: 8px; margin: 16px; }
.sdu-seckill-title { font-weight: 700; color: #dc2626; }
.sdu-seckill-timer { font-family: ui-monospace; font-weight: 700; color: #dc2626; }
.sdu-seckill-more { margin-left: auto; font-size: 13px; color: #666; cursor: pointer; }
`
